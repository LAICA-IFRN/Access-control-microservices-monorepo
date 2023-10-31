import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.environment.create({
    data: {
      name: 'Laica NIT',
      description: 'Laboratório de robótica campus CNAT',
      created_by: 'cea7e1d2-f3ed-4f31-a912-304bf24b11f9',
    },
  });

  await prisma.environment.create({
    data: {
      name: 'Laica SGA',
      description: 'Laboratório de robótica campus São Gonçalo dos Amarantes',
      created_by: 'cea7e1d2-f3ed-4f31-a912-304bf24b11f9',
    },
  });

  await prisma.environment.create({
    data: {
      name: 'Exemplo GoRN',
      description: 'Ambiente de exemplo para o GoRN',
      created_by: 'cea7e1d2-f3ed-4f31-a912-304bf24b11f9',
    },
  });
}

// main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
