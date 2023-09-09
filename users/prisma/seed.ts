import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const roundsOfHashing = 10;

async function createDocumentTypes() {
  await prisma.documentType.createMany({
    data: [
      {
        name: 'CPF',
      },
      {
        name: 'REGISTRATION'
      }
    ],
  });
}

async function createRoles() {
  await prisma.role.createMany({
    data: [
      {
        name: 'ADMIN',
      },
      {
        name: 'ENVIRONMENT_MANAGER',
      },
      {
        name: 'FREQUENTER',
      }
    ]
  })
}


async function createAdmins() {
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin1@email.com',
      password: await bcrypt.hash('admin1', roundsOfHashing),
      name: 'Admin 1',
      Document: {
        create: {
          DocumentType: {
            connect: {
              id: 1,
            },
          },
          content: '416.415.950-27',
        },
      },
      // UserRoles: {
      //   create: {
      //     Role: {
      //       connect: {
      //         id: 1,
      //       },
      //     },
      //   },
      // }
    },
  });
}

async function createUsers() {
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@email.cpm',
      password: await bcrypt.hash('admin2', roundsOfHashing),
      name: 'Admin 2',
      Document: {
        create: {
          DocumentType: {
            connect: {
              id: 1,
            },
          },
          content: '898.085.440-45',
        },
      },
      // UserRoles: {
      //   create: {
      //     Role: {
      //       connect: {
      //         id: 1,
      //       },
      //     },
      //   },
      // }
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@email.com',
      password: await bcrypt.hash('user1', roundsOfHashing),
      name: 'User 1',
      Document: {
        create: {
          DocumentType: {
            connect: {
              id: 1,
            }
          },
          content: '882.007.380-35'
        } 
      },
      // UserRoles: {
      //   create: [
      //     {
      //       roleId: 2,
      //     },
      //     {
      //       roleId: 3,
      //     },
      //   ],
      // },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@email.com',
      password: await bcrypt.hash('user2', roundsOfHashing),
      name: 'User 2',
      Document: {
        create: {
          DocumentType: {
            connect: {
              id: 1,
            }
          },
          content: '660.433.060-50'
        }
      },
      // UserRoles: {
      //   create: [
      //     {
      //       roleId: 2,
      //     },
      //     {
      //       roleId: 3,
      //     },
      //   ],
      // },
    },
  });
}

createDocumentTypes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }
);

setTimeout(() => {
  console.log('Creating document types...');
}, 2000);

createRoles()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }
);

setTimeout(() => {
  console.log('Creating roles...');
}, 2000);

createUsers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }
);

setTimeout(() => {
  console.log('Creating users...');
}, 2000);

createAdmins()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }
);

setTimeout(() => {
  console.log('Creating admins...');
}, 2000);
