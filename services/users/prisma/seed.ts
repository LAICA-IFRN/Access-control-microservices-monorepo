import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const roundsOfHashing = 10;

async function createDocumentTypes() {
  await prisma.document_type.create({
    data:{
      name: 'REGISTRATION',
    },
  });

  await prisma.document_type.create({
    data:{
      name: 'CPF',
    },
  });

  await prisma.document_type.create({
    data:{
      name: 'CNPJ',
    },
  });

  await prisma.document_type.create({
    data:{
      name: 'PASSPORT',
    },
  });
}

async function createRoles() {

  await prisma.role.create({
    data: {
      name: 'ADMIN',
    },
  });

  await prisma.role.create({
    data: {
      name: 'FREQUENTER',
    },
  });

  await prisma.role.create({
    data: {
      name: 'ENVIRONMENT_MANAGER',
    },
  });
}


async function createAdmins() {
  await prisma.user.create({
    data: {
      email: 'ivanilson.junior@ifrn.edu.br',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Ivanilson Junior',
      document: '2568824',
      document_type_id: 1,
      active: true,
    },
  })

  const admin1 = await prisma.user.findUnique({
    where: {
      email: 'ivanilson.junior@ifrn.edu.br',
    },
  })

  await prisma.user_role.create({
    data: {
      user_id: admin1.id,
      role_id: 1,
    },
  });

  await prisma.user_image.create({
    data: {
      user_id: admin1.id,
      encoded: ""
    }
  })
}

createDocumentTypes().catch((error) => {console.error(error); process.exit(1);})
createRoles().catch((error) => {console.error(error);process.exit(1);})
// createAdmins().catch((error) => {console.error(error);process.exit(1);})
