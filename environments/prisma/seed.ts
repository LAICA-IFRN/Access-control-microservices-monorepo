import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const env1 = await prisma.environment.create({
    data: {
      name: 'Environment 1',
      description: 'Environment 1 description',
      createdBy: 'c603fcc0-dc4d-4d44-ad55-278aa7aad5eb',
    },
  });

  const env2 = await prisma.environment.create({
    data: {
      name: 'Environment 2',
      description: 'Environment 2 description',
      createdBy: '3b56b0a9-95ef-44ce-9640-3535b6fbce86',
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
