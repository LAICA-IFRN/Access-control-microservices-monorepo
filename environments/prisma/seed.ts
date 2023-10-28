// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const env1 = await prisma.environment.create({
//     data: {
//       name: 'Environment 1',
//       description: 'Environment 1 description',
//       created_by: '7d5db132-ec94-4f08-b9c7-69bea3b6bab8',
//     },
//   });

//   const env2 = await prisma.environment.create({
//     data: {
//       name: 'Environment 2',
//       description: 'Environment 2 description',
//       created_by: '7d5db132-ec94-4f08-b9c7-69bea3b6bab8',
//     },
//   });
// }

// main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
