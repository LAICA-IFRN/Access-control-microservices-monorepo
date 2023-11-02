import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.environment.create({
    data: {
      name: 'Laica NIT',
      description: 'Laboratório de robótica campus CNAT',
      created_by: '',
    },
  });

  await prisma.environment.create({
    data: {
      name: 'Laica SGA',
      description: 'Laboratório de robótica campus São Gonçalo dos Amarantes',
      created_by: '',
    },
  });

  await prisma.environment.create({
    data: {
      name: 'Exemplo GoRN',
      description: 'Ambiente de exemplo para o GoRN',
      created_by: '',
    },
  });
}

async function createEnvironmentUser() {
  await prisma.environment_user.create({
    data: {
      start_period: new Date("2023/11/02"),
      end_period: new Date("2023/12/02"),
      user_id: '',
      environment_id: '',
      created_by: '',
      environment_user_access_control: {
        create: [
          {
            day: 0,
            start_time: new Date(new Date().toDateString() + ' ' + "07:00:00"),
            end_time: new Date(new Date().toDateString() + ' ' + "22:30:00")
          },
          {
            day: 1,
            start_time: new Date(new Date().toDateString() + ' ' + "07:00:00"),
            end_time: new Date(new Date().toDateString() + ' ' + "22:30:00")
          },
          {
            day: 2,
            start_time: new Date(new Date().toDateString() + ' ' + "07:00:00"),
            end_time: new Date(new Date().toDateString() + ' ' + "22:30:00")
          },
          {
            day: 3,
            start_time: new Date(new Date().toDateString() + ' ' + "07:00:00"),
            end_time: new Date(new Date().toDateString() + ' ' + "22:30:00")
          },
          {
            day: 4,
            start_time: new Date(new Date().toDateString() + ' ' + "07:00:00"),
            end_time: new Date(new Date().toDateString() + ' ' + "22:30:00")
          },
          {
            day: 5,
            start_time: new Date(new Date().toDateString() + ' ' + "07:00:00"),
            end_time: new Date(new Date().toDateString() + ' ' + "22:30:00")
          },
          {
            day: 6,
            start_time: new Date(new Date().toDateString() + ' ' + "07:00:00"),
            end_time: new Date(new Date().toDateString() + ' ' + "22:30:00")
          }
        ]
      }
    }
  });
}

//main().catch((error) => {console.error(error);process.exit(1);})
//createEnvironmentUser().catch((error) => {console.error(error);process.exit(1);})
