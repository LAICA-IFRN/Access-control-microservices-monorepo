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
      email: 'evandro.lima@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Evandro Lima',
      document: '416.415.950-27',
      document_type_id: 2,
      active: true,
    },
  })

  const admin1 = await prisma.user.findUnique({
    where: {
      email: 'evandro.lima@email.com',
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

async function createUsers() {
  const admin1 = await prisma.user.findUnique({
    where: {
      email: 'evandro.lima@email.com',
    },
  })

  await prisma.user.create({
    data: {
      email: 'hilquias.abias@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Hilquias Abias',
      pin: '123456',
      document: '973.493.560-72',
      document_type_id: 2,
      active: true,
      created_by: admin1.id,
    },
  })

  const user1 = await prisma.user.findUnique({
    where: {
      email: 'hilquias.abias@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user1.id,
      role_id: 2,
    },
  });

  await prisma.user_image.create({
    data: {
      user_id: user1.id,
      encoded: ""
    }
  })

  await prisma.user.create({
    data: {
      email: 'maria.helena@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Maria Helena',
      document: '20211014040011',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user2 = await prisma.user.findUnique({
    where: {
      email: 'maria.helena@email.com'
    }
  })

  await prisma.user_image.create({
    data: {
      user_id: user2.id,
      encoded: ""
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user2.id,
      role_id: 3,
    },
  });

  await prisma.user.create({
    data: {
      email: 'pedro.henrique@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Pedro Henrique',
      document: '20211014040004',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user4 = await prisma.user.findUnique({
    where: {
      email: 'pedro.henrique@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user4.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'ana.carolina@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Ana Carolina',
      document: '20211014040005',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user5 = await prisma.user.findUnique({
    where: {
      email: 'ana.carolina@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user5.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'carlos.eduardo@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Carlos Eduardo',
      document: '20211014040006',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user6 = await prisma.user.findUnique({
    where: {
      email: 'carlos.eduardo@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user6.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'joao.paulo@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'João Paulo',
      document: '20211014040007',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user7 = await prisma.user.findUnique({
    where: {
      email: 'joao.paulo@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user7.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'fernanda.beatriz@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Fernanda Beatriz',
      document: '20211014040008',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user8 = await prisma.user.findUnique({
    where: {
      email: 'fernanda.beatriz@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user8.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'lucas.gabriel@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Lucas Gabriel',
      document: '283.230.520-26',
      document_type_id: 2,
      active: true,
      created_by: admin1.id,
    },
  })

  const user9 = await prisma.user.findUnique({
    where: {
      email: 'lucas.gabriel@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user9.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'luiza.manuela@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Luiza Manuela',
      document: '20211014040010',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user10 = await prisma.user.findUnique({
    where: {
      email: 'luiza.manuela@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user10.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'rafaela.vitoria@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Rafaela Vitória',
      document: '20211014040011',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user11 = await prisma.user.findUnique({
    where: {
      email: 'rafaela.vitoria@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user11.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'gabriella.sophia@email.com',
      password: await bcrypt.hash('user12', roundsOfHashing),
      name: 'Gabriela Sophia',
      document: '20211014040012',
      document_type_id: 1,
      active: true,
      created_by: admin1.id,
    },
  })

  const user12 = await prisma.user.findUnique({
    where: {
      email: 'gabriella.sophia@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user12.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'matheus.felipe@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Matheus Felipe',
      document: '154.246.790-05',
      document_type_id: 2,
      active: true,
      created_by: admin1.id,
    },
  })

  const user13 = await prisma.user.findUnique({
    where: {
      email: 'matheus.felipe@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user13.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'heitor.davi@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Heitor Davi',
      document: '795.677.980-44',
      document_type_id: 2,
      active: true,
      created_by: admin1.id,
    },
  })

  const user14 = await prisma.user.findUnique({
    where: {
      email: 'heitor.davi@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user14.id,
      role_id: 2,
    },
  });

  await prisma.user.create({
    data: {
      email: 'laura.isabela@email.com',
      password: await bcrypt.hash('password', roundsOfHashing),
      name: 'Lara Isabela',
      document: '795.677.980-44',
      document_type_id: 2,
      active: true,
      created_by: admin1.id,
    },
  })

  const user15 = await prisma.user.findUnique({
    where: {
      email: 'laura.isabela@email.com'
    }
  })

  await prisma.user_role.create({
    data: {
      user_id: user15.id,
      role_id: 2,
    },
  });
}

createDocumentTypes().catch((error) => {console.error(error); process.exit(1);})
createRoles().catch((error) => {console.error(error);process.exit(1);})
//createAdmins().catch((error) => {console.error(error);process.exit(1);})
//createUsers().catch((error) => {console.error(error);process.exit(1);})
