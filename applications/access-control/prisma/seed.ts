import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.microcontroller_type.create({
            data: {
                name: 'ESP8266'
            }
        });

        await prisma.microcontroller_type.create({
            data: {
                name: 'ESP32'
            }
        });

        const microcontrollerTypes = await prisma.microcontroller_type.findMany();
        console.log(microcontrollerTypes);
    } catch (error) {
        console.error(error);
    }
}

main().catch((error) => { console.error(error); process.exit(1); })

