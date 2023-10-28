// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function createMicrocontrollerType() {
//   await prisma.microcontroller_type.create({
//     data: {
//       name: 'ESP32',
//     },
//   });

//   await prisma.microcontroller_type.create({
//     data: {
//       name: 'ESP8266',
//     },
//   });
// }

// async function createMicrocontrollers() {
//   await prisma.microcontroller.create({
//     data: {
//       ip: '140.20.71.42',
//       mac: '6b:8a:95:33:8c:1f',
//       active: true,
//       microcontroller_type: {
//         connect: {
//           id: 1,
//         },
//       },
//     },
//   });

//   await prisma.microcontroller.create({
//     data: {
//       ip: '147.254.119.198',
//       mac: '28:85:cb:48:79:26',
//       active: true,
//       microcontroller_type: {
//         connect: {
//           id: 2,
//         },
//       },
//     },
//   });
// }

// // createMicrocontrollerType()
// //   .catch((error) => {
// //     console.error(error);
// //     process.exit(1);
// //   })
// //   .finally(async () => {
// //     await prisma.$disconnect();
// //   });


// createMicrocontrollers()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
