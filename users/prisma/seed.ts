import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roundsOfHashing = 10;

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
      UserRoles: {
        create: {
          Role: {
            connect: {
              id: 1,
            },
          },
        },
      }
    },
  });

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
      UserRoles: {
        create: {
          Role: {
            connect: {
              id: 1,
            },
          },
        },
      }
    },
  });

  // crete 2 users com 2 roles each (1 user with 2 roles and 1 user with 1 role) using FREQUENTER and ENVIROMENT_MANAGER in both users
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
      UserRoles: {
        create: [
          {
            roleId: 2,
          },
          {
            roleId: 3,
          },
        ],
      },
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
      UserRoles: {
        create: [
          {
            roleId: 2,
          },
          {
            roleId: 3,
          },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
