import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const env1 = await prisma.environment.create({
    data: {
      name: 'Environment 1',
      description: 'Environment 1 description',
      created_by: '1554e723-21c0-4fb7-ab23-ca3f57addc7a',
    },
  });

  const env2 = await prisma.environment.create({
    data: {
      name: 'Environment 2',
      description: 'Environment 2 description',
      created_by: '1554e723-21c0-4fb7-ab23-ca3f57addc7a',
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
