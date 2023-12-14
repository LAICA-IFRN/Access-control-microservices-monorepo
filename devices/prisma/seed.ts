import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMicrocontrollerType() {
  await prisma.microcontroller_type.create({
    data: {
      name: 'ESP32',
    },
  });

  await prisma.microcontroller_type.create({
    data: {
      name: 'ESP8266',
    },
  });
}

async function createMicrocontrollers() {
  await prisma.microcontroller.create({
    data: {
      ip: '140.20.71.42',
      mac: '6b:8a:95:33:8c:1f',
      active: true,
      environment_id: '9c7e689d-b56f-4fc1-8b5d-04ab0688476a',
      microcontroller_type_id: 1,
    },
  });

  await prisma.microcontroller.create({
    data: {
      ip: '147.254.119.198',
      mac: '28:85:cb:48:79:26',
      active: true,
      environment_id: '9c7e689d-b56f-4fc1-8b5d-04ab0688476a',
      microcontroller_type_id: 2,
    },
  });
}

async function rfid() {
  await prisma.tag_rfid.create({
    data: {
      tag: '51A25026',
      created_by: '8ffa136c-2055-4c63-b255-b876d0a2accf',
      user_id: '97adb98b-b1e8-4cda-b8cf-8d841251e42d'
    },
  })

  await prisma.tag_rfid.create({
    data: {
      tag: '61A4E026',
      created_by: '8ffa136c-2055-4c63-b255-b876d0a2accf',
      user_id: '8ffa136c-2055-4c63-b255-b876d0a2accf'
    },
  })

  await prisma.tag_rfid.create({
    data: {
      tag: '29B25C21',
      created_by: '8ffa136c-2055-4c63-b255-b876d0a2accf',
      user_id: '2dd748c7-30f7-4174-aa4e-8b97573c74b6'
    },
  })
}

async function main() {
  await prisma.mobile.delete({
    where: {
      user_id: 'c8539e33-8373-4af1-95bb-e31bb9d52885'
    }
  })
}
main().catch((error) => { console.error(error); process.exit(1); })

//createMicrocontrollerType().catch((error) => {console.error(error);process.exit(1);})
//createMicrocontrollers().catch((error) => {console.error(error);process.exit(1);})
//rfid().catch((error) => {console.error(error);process.exit(1);})
