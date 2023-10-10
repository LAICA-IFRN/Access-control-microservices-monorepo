import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { isValidCPF } from './decorators/cpf-or-cnpj.decorator';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorLogger = new Logger()
  ) {}

  async create(createUserDto: CreateUserDto, file: Express.Multer.File) {
    if (
      createUserDto.roles.includes('ADMIN') 
      && createUserDto.roles.length > 1
    ) {
      try {
        const meta = JSON.stringify({
          roles: createUserDto.roles,
          statusCode: 400
        })

        await this.prisma.log.create({
          data: {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao criar usuário: usuário admin não pode ter outros papéis',
            meta
          }
        })
      } catch (error) {
        this.errorLogger.error('Falha ao criar log', error);
      }

      throw new HttpException(
        'Admin user cannot have other roles',
        HttpStatus.BAD_REQUEST
      );
    }

    const roundsOfHashing = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, roundsOfHashing);
  
    let documentType: string;
  
    if (createUserDto.identifier) {
      documentType = isValidCPF(createUserDto.identifier) ? 'CPF' : 'CNPJ';

      if (!file) {
        try {
          const meta = JSON.stringify({
            target: createUserDto.name,
            statusCode: 400
          })
  
          await this.prisma.log.create({
            data: {
              topic: "Usuários",
              type: "Error",
              message: 'Falha ao criar usuário: foto não enviada',
              meta
            }
          })
        } catch (error) {
          this.errorLogger.error('Falha ao criar log', error);
        }
  
        throw new HttpException('Photo not sent', HttpStatus.BAD_REQUEST);
      }
    } else {
      documentType = 'REGISTRATION';
    }

    let createdUser: User;

    try {
      await this.prisma.$transaction(async (prisma) => {
        createdUser = await prisma.user.create({
          data: {
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashedPassword,
          },
        });
  
        await prisma.document.create({
          data: {
            content: createUserDto.identifier,
            DocumentType: { connect: { name: documentType } },
            User: { connect: { id: createdUser.id } },
          },
        });
      });
    } catch (error) {
      if (error.code === 'P2002') {
        try {
          const meta = JSON.stringify({
            target: error.meta.target,
            statusCode: 409
          })
  
          await this.prisma.log.create({
            data: {
              topic: "Usuários",
              type: "Error",
              message: 'Falha ao criar usuário: conflito com registro existente',
              meta
            }
          })
        } catch (error) {
          this.errorLogger.error('Falha ao criar log', error);
        }

        throw new HttpException(`Already exists: ${error.meta.target}`, HttpStatus.CONFLICT);
      } else {
        try {
          const meta = JSON.stringify({
            context: error,
            statusCode: 500
          })
  
          await this.prisma.log.create({
            data: {
              topic: "Usuários",
              type: "Error",
              message: 'Falha ao criar usuário: erro interno, verificar logs de erro do serviço',
              meta
            }
          })
        } catch (error) {
          this.errorLogger.error('Falha ao criar log', error);
        }

        throw new HttpException("Can't create user", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
