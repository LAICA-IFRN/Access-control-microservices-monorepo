import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.environment.create({
    data: {
      name: 'Laica ITNC',
      description: 'Laboratório de robótica campus CNAT',
      created_by: '8ffa136c-2055-4c63-b255-b876d0a2accf',
      latitude: -5.8115828,
      longitude: -35.2025893,
    },
  });

  // await prisma.environment.create({
  //   data: {
  //     name: 'Laica SGA',
  //     description: 'Laboratório de robótica campus São Gonçalo dos Amarantes',
  //     created_by: '',
  //   },0
  // });

  // await prisma.environment.create({
  //   data: {
  //     name: 'Exemplo GoRN',
  //     description: 'Ambiente de exemplo para o GoRN',
  //     created_by: '',
  //   },
  // });
}

async function createEnvironmentUser() {
  const environment = await prisma.environment.findFirst({
    where: {
      name: 'Laica ITNC'
    }
  });

  await prisma.environment_user.create({
    data: {
      start_period: new Date("2023/11/20"),
      end_period: new Date("2023/12/20"),
      user_id: '',
      environment_id: environment.id,
      created_by: environment.created_by,
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

async function getEnvUsers() {
  const environment = await prisma.environment.delete({
    where: {
      id: 'f1fe2cc1-d8da-4c44-b5f6-8561e2d36415'
    }
  });
  console.log(environment);
}
//getEnvUsers().catch((error) => {console.error(error);process.exit(1);})

//main().catch((error) => {console.error(error);process.exit(1);})
//createEnvironmentUser().catch((error) => {console.error(error);process.exit(1);})
