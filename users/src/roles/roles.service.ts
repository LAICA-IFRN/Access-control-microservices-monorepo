import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserRoles } from '@prisma/client';
import { isUUID } from 'class-validator';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { RoleStatusDto } from './dto/status-role.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RolesService {
  private readonly createAuditLogUrl = 'http://localhost:6004/audit/logs'
  private readonly errorLogger = new Logger()

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  async create(createRoleDto: CreateRoleDto, userId: string) {
    if (!isUUID(userId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao criar papel de usuário: id inválido',
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

    const { rolesToAdd } = createRoleDto;
    const roles: UserRoles[] = []

    const hasAdminRole = await this.checkRole(userId, 'ADMIN')
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
            await this.prisma.userRoles.create({
              data: {
                User: { connect: { id: userId } },
                Role: { connect: { name: role } }
              },
              include: {
                Role: true
              }
            })
          )
        }
      }

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Info",
          message: 'Papel(éis) de usuário criado(s)',
          meta: {
            roles: rolesToAdd,
            target: userId,
            statusCode: 201
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

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
      await this.prisma.userRoles.updateMany({
        where: {
          userId: userId,
          roleId: {
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

    let user: User & { UserRoles: UserRoles[] }

    try {
      user = await this.prisma.user.findFirstOrThrow({
        where: { id, active: true },
        include: {
          UserRoles: {
            include: {
              Role: true
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

    return user.UserRoles;
  }

  async checkRole(id: string, role: string) {
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

    let user: User & { UserRoles: UserRoles[] }

    try {
      user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: {
          UserRoles: {
            where: { active: true },
            include: {
              Role: true
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

    const userRoles: any = user.UserRoles
    const hasRole = userRoles.some((userRole: any) => userRole.Role.name === role)

    return hasRole
  }

  async changeStatus(userId: string, roleId: string, roleStatusDto: RoleStatusDto) {
    console.log(roleStatusDto);
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

      return await this.prisma.userRoles.update({
        where: { 
          id: roleId, 
          userId: user.id 
        },
        data: { active: roleStatusDto.status }
      })
    } catch (error) {
      console.log(error);
      
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

  async remove(userId: string, deleteRoleDto: DeleteRoleDto) {
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
    const roles: UserRoles[] = []

    const hasAdminRole = await this.checkRole(userId, 'ADMIN')
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
              UserRoles: true
            }
          }
        }
      })

      if (user._count.UserRoles === 1) {
        throw new HttpException(
          'User cannot be without roles',
          HttpStatus.BAD_REQUEST
        );
      }

      if (rolesToDelete && rolesToDelete.length > 0) {
        for (const role of rolesToDelete) {
          let currentRole = await this.prisma.role.findFirst({ where: { name: role } })

          roles.push(
            await this.prisma.userRoles.delete({
              where: {
                UserRoles_userId_roleId_unique: {
                  userId: user.id,
                  roleId: currentRole.id
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
}
