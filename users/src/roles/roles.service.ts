import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { role, user, user_role } from '@prisma/client';
import { isUUID } from 'class-validator';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { RoleStatusDto } from './dto/status-role.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserRoles } from 'src/utils/types';
import { AuditLogService } from 'src/providers/audit-log/audit-log.service';
import { AuditConstants } from 'src/providers/audit-log/audit-contants';

@Injectable()
export class RolesService {
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly errorLogger = new Logger()
  
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private readonly auditLogService: AuditLogService
  ) {}

  async create(createRoleDto: CreateRoleDto, userId: string) {
    if (!createRoleDto.requestUserId) {
      createRoleDto.requestUserId = '0f3c5449-9192-452e-aeb9-503778709f3e'
    }

    if (!isUUID(userId)) {
      this.auditLogService.create(AuditConstants.createRolesBadRequest({statusCode: 400, userId, meta: createRoleDto}))
      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    const { rolesToAdd } = createRoleDto;
    const roles: user_role[] = []

    const hasAdminRole = await this.checkRole(userId, ['ADMIN'])
    const containsAdminRoleToAdd = rolesToAdd.includes('ADMIN')

    if (
      hasAdminRole ||
      containsAdminRoleToAdd
      && rolesToAdd.length > 1
    ) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao criar papel de usuário: usuário admin não pode ter outros papéis',
          meta: {
            target: userId,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        'Admin user cannot have other roles',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      if (rolesToAdd && rolesToAdd.length > 0) {
        for (const role of rolesToAdd) {
          roles.push(
            await this.prisma.user_role.create({
              data: {
                user: { connect: { id: userId } },
                role: { connect: { name: role } }
              },
              include: {
                role: true
              }
            })
          )
        }
      }

      this.sendLogWhenCreateRolesOk(userId, createRoleDto);

    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao criar papel de usuário: conflito com registro existente',
            meta: {
              target: error.meta.target,
              statusCode: 409
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          `Already exists: ${error.meta.target}`,
          HttpStatus.CONFLICT
        );
      } else if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao criar papel de usuário: usuário não encontrado',
            meta: {
              target: userId,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao criar papel de usuário: erro interno, verificar logs de erro do serviço',
            meta: {
              target: userId,
              statusCode: 500
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error.response);

        throw new HttpException(
          "Can't create user",
          HttpStatus.FORBIDDEN
        );
      }
    }

    if (containsAdminRoleToAdd) {
      await this.prisma.user_role.updateMany({
        where: {
          user_id: userId,
          role_id: {
            not: 1
          }
        },
        data: {
          active: false
        }
      })
    }

    return roles;
  }

  async sendLogWhenCreateRolesOk(userId: string, createRoleDto: CreateRoleDto) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, active: true } })
    const author = await this.prisma.user.findFirst({ where: { id: createRoleDto.requestUserId, active: true } })

    const roles = createRoleDto.rolesToAdd.map((role) => role.toLowerCase()).join(', ')

    this.auditLogService.create(AuditConstants.createRolesOk(user.name, author.name, roles, createRoleDto));
  }

  async findRoles() {
    try {
      return await this.prisma.role.findMany();
    } catch (error) {
      //this.auditLogService.create(AuditConstants.findDocumentTypesError({statusCode: 500}))
      throw new HttpException("Can't get role types", HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async findAll(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao listar papéis de usuário: id inválido',
          meta: {
            target: id,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    let userRoles: UserRoles[]

    try {
      userRoles = await this.prisma.user_role.findMany({
        where: { user_id: id, active: true },
        include: {
          role: true
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao listar papéis de usuário: usuário não encontrado',
            meta: {
              target: id,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      }
    }

    const roles = userRoles.map((userRole) => userRole.role.name);
    
    return { roles };
  }

  async checkRole(id: string, roles: string[]) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao verificar papel de usuário: id inválido',
          meta: {
            target: id,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    let user: user & { user_role: user_role[] }

    try {
      user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: {
          user_role: {
            where: { active: true },
            include: {
              role: true
            }
          }
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha verificar papel de usuário: usuário não encontrado',
            meta: {
              target: id,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      }
    }

    const userRoles: any = user.user_role
    const hasRole = userRoles.some((userRole: any) => roles.includes(userRole.role.name))

    return hasRole
  }

  async changeStatus(userId: string, roleId: string, roleStatusDto: RoleStatusDto) {
    if (!roleStatusDto.requestUserId) {
      roleStatusDto.requestUserId = '0f3c5449-9192-452e-aeb9-503778709f3e'
    }

    if (!isUUID(userId) || !isUUID(roleId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao alterar status de papel de usuário: id inválido',
          meta: {
            target: userId,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.prisma.user.findFirstOrThrow({ where: { id: userId } })

      const role = await this.prisma.user_role.update({
        where: { 
          id: roleId, 
          user_id: user.id 
        },
        data: { active: roleStatusDto.status },
        select: {
          role: true,
          active: true,
          user_id: true
        }
      })

      this.sendLogWhenChangeStatusOk(userId, roleId, role.role.name, roleStatusDto);

      return role;
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao alterar status de papel de usuário: usuário ou papel não encontrado',
            meta: {
              target: [userId, roleId],
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'User or role not found',
          HttpStatus.NOT_FOUND
        );
      }
    }
  }

  async sendLogWhenChangeStatusOk(userId: string, roleId: string, role: string, roleStatusDto: RoleStatusDto) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, active: true } })
    const author = await this.prisma.user.findFirst({ where: { id: roleStatusDto.requestUserId, active: true } })

    this.auditLogService.create(AuditConstants.updateRoleStatusOk(user.name, author.name, role, {...roleStatusDto, roleId}));
  }

  async remove(userId: string, deleteRoleDto: DeleteRoleDto) {
    if (!deleteRoleDto.requestUserId) {
      deleteRoleDto.requestUserId = '0f3c5449-9192-452e-aeb9-503778709f3e'
    }

    if (!isUUID(userId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao remover papel de usuário: id inválido',
          meta: {
            target: userId,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      })

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }
    
    const { rolesToDelete } = deleteRoleDto;
    const roles: user_role[] = []

    const hasAdminRole = await this.checkRole(userId, ['ADMIN'])
    if (hasAdminRole) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao remover papel de usuário: usuário admin não pode ter seu papel removido',
          meta: {
            target: userId,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      })

      throw new HttpException(
        'Cannot remove a role from an admin user',
        HttpStatus.BAD_REQUEST
      );
    }
    
    try {
      const user = await this.prisma.user.findFirstOrThrow({ 
        where: { id: userId },
        include: {
          _count: {
            select: {
              user_role: true
            }
          }
        }
      })

      if (user._count.user_role === 1) {
        throw new HttpException(
          'User cannot be without roles',
          HttpStatus.BAD_REQUEST
        );
      }

      if (rolesToDelete && rolesToDelete.length > 0) {
        for (const role of rolesToDelete) {
          let currentRole = await this.prisma.role.findFirst({ where: { name: role } })

          roles.push(
            await this.prisma.user_role.delete({
              where: {
                user_role_user_id_role_id_unique: {
                  user_id: user.id,
                  role_id: currentRole.id
                }
              }
            })
          )
        }
      }
    } catch (error) {
      if (error.status === 400) {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao remover papel de usuário: usuário não pode ficar sem papéis',
            meta: {
              target: userId,
              statusCode: 400
            }
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        })

        throw new HttpException(
          'User cannot be without roles',
          HttpStatus.BAD_REQUEST
        );
      } else if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao remover papel de usuário: usuário ou papel não encontrado',
            meta: {
              target: [userId, rolesToDelete],
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        })

        throw new HttpException(
          'User or role not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao remover papel de usuário: erro interno, verificar logs de erro do serviço',
            meta: {
              target: userId,
              statusCode: 500
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        })

        this.errorLogger.error('Falha do sistema (500)', error.response);

        throw new HttpException(
          "Can't delete user roles",
          HttpStatus.FORBIDDEN
        );
      }
    }

    return roles;
  }

  async sendLogWhenDeleteRolesOk(userId: string, deleteRoleDto: DeleteRoleDto) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, active: true } })
    const author = await this.prisma.user.findFirst({ where: { id: deleteRoleDto.requestUserId, active: true } })

    const roles = deleteRoleDto.rolesToDelete.map((role) => role.toLowerCase()).join(', ')

    this.auditLogService.create(AuditConstants.deleteRolesOk(user.name, author.name, roles, deleteRoleDto));
  }
}
