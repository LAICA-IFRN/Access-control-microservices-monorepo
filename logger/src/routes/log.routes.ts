import { FastifyInstance } from "fastify";
import { CreateLog, Log } from "../interfaces/log.interface";
import { DatabaseManagerService } from "../services/database-manager.service";
import { Database } from "sqlite3";

export async function LogRoutes(fastify: FastifyInstance): Promise<void> {
  const databaseManagerService = new DatabaseManagerService();

  fastify.post('/', async (request, reply) => {
    const body: CreateLog = request.body as CreateLog;
    const { userId } = body;
    let db: Database | null = null;
    try {
      db = await databaseManagerService.connectToDatabase(userId);
    } catch (error) {
      console.log(error);
    }

    try {
      await databaseManagerService.insertLog(db, body);
    } catch (error) {
      console.log(error);
    }
    db?.close();
    return reply.send({ message: "Ok" });
  });

  fastify.get('/', async (request, reply) => {
    let { userId, order, previous, pageSize } = request.query as any;
    if (order !== 'desc' && order !== 'asc') {
      order = 'desc'
    }
    previous = parseInt(previous)
    pageSize = parseInt(pageSize)
    const offset = previous * pageSize;

    let db: Database | null = null;
    try {
      db = await databaseManagerService.connectToDatabase(userId);
    } catch (error) {
      return reply.status(500).send({ message: "Error connecting to database" });
    }

    let result;
    try {
      result = await databaseManagerService.selectLogs(db, userId, offset, pageSize, order);
    } catch (error) {
      console.log(error);

      return reply.status(500).send({ message: "Error selecting logs" });
    }
    db?.close();

    return reply.send({
      previous: previous,
      next: previous + 1,
      pageSize: pageSize,
      total: result[1],
      data: result[0],
    });
  });
} 