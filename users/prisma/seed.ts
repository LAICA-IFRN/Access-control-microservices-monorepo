// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();
// const roundsOfHashing = 10;

// async function createDocumentTypes() {
//   await prisma.document_type.create({
//     data:{
//       name: 'CPF',
//     },
//   });

//   await prisma.document_type.create({
//     data:{
//       name: 'REGISTRATION',
//     },
//   });
// }

// async function createRoles() {

//   await prisma.role.create({
//     data: {
//       name: 'ADMIN',
//     },
//   });

//   await prisma.role.create({
//     data: {
//       name: 'ENVIRONMENT_MANAGER',
//     },
//   });

//   await prisma.role.create({
//     data: {
//       name: 'FREQUENTER',
//     },
//   });
// }


// async function createAdmins() {
//   await prisma.user.create({
//     data: {
//       email: 'admin1@email.com',
//       password: await bcrypt.hash('admin1', roundsOfHashing),
//       name: 'Admin 1',
//       document: '416.415.950-27',
//       document_type_id: 1,
//       active: true,
//     },
//   })

//   const admin1 = await prisma.user.findUnique({
//     where: {
//       email: 'admin1@email.com',
//     },
//   })

//   await prisma.user_role.create({
//     data: {
//       user_id: admin1.id,
//       role_id: 1,
//     },
//   });

//   await prisma.user_image.create({
//     data: {
//       user_id: admin1.id,
//       encoded: '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'
//     }
//   })
// }

// async function createUsers() {
//   const admin1 = await prisma.user.findUnique({
//     where: {
//       email: 'admin1@email.com'
//     }
//   })

//   // await prisma.user.create({
//   //   data: {
//   //     email: 'user1@email.com',
//   //     password: await bcrypt.hash('user1', roundsOfHashing),
//   //     name: 'User 1',
//   //     document: '973.493.560-72',
//   //     document_type_id: 1,
//   //     active: true,
//   //     created_by: admin1.id,
//   //   },
//   // })

//   // const user1 = await prisma.user.findUnique({
//   //   where: {
//   //     email: 'user1@email.com'
//   //   }
//   // })

//   // await prisma.user_role.create({
//   //   data: {
//   //     user_id: user1.id,
//   //     role_id: 2,
//   //   },
//   // });

//   // await prisma.user_role.create({
//   //   data: {
//   //     user_id: user1.id,
//   //     role_id: 3,
//   //   },
//   // });

//   // await prisma.user_image.create({
//   //   data: {
//   //     user_id: user1.id,
//   //     encoded: 'data:image/jpg;base64,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'
//   //   }
//   // })

//   await prisma.user.create({
//     data: {
//       email: 'user2@email.com',
//       password: await bcrypt.hash('user2', roundsOfHashing),
//       name: 'User 2',
//       document: '20211014040011',
//       document_type_id: 2,
//       active: true,
//       created_by: admin1.id,
//     },
//   })

//   const user2 = await prisma.user.findUnique({
//     where: {
//       email: 'user2@email.com'
//     }
//   })

//   await prisma.user_role.create({
//     data: {
//       user_id: user2.id,
//       role_id: 2,
//     },
//   });

//   await prisma.user.create({
//     data: {
//       email: 'user3@email.com',
//       password: await bcrypt.hash('user3', roundsOfHashing),
//       name: 'User 3',
//       document: '20211014040003',
//       document_type_id: 2,
//       active: true,
//       created_by: admin1.id,
//     },
//   })

//   const user3 = await prisma.user.findUnique({
//     where: {
//       email: 'user3@email.com'
//     }
//   })

//   await prisma.user_role.create({
//     data: {
//       user_id: user2.id,
//       role_id: 2,
//     },
//   });
// }

// // createDocumentTypes()
// //   .catch((error) => {
// //     console.error(error);
// //     process.exit(1);
// //   }
// // );

// // setTimeout(() => {
// //   console.log('Creating document types...');
// // }, 2000);

// // createRoles()
// //   .catch((error) => {
// //     console.error(error);
// //     process.exit(1);
// //   }
// // );

// // setTimeout(() => {
// //   console.log('Creating roles...');
// // }, 2000);

// // createAdmins()
// //   .catch((error) => {
// //     console.error(error);
// //     process.exit(1);
// //   });

// createUsers()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
  
