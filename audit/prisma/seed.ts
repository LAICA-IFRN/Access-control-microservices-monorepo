// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const today = new Date();
//   today.setHours(0,0,0,0);

//   const access = await prisma.access.findMany({
//     where: {
//       OR: [
//         {
//           message: {
//             contains: 'acesso'
//           }
//         },
//         {
//           message: {
//             contains: 'accessou'
//           }
//         }
//       ],
//       AND: {
//         created_at: {
//           gte: today.toISOString()
//         }
//       }
//     },
//     take: 5
//   });

//   console.log(access);
// }

// main().catch((error) => {console.error(error); process.exit(1);})

