import { FastifyInstance } from "fastify";
import { DatabaseManagerService } from "../services/database-manager.service";

export async function LogConfigRoutes(fastify: FastifyInstance): Promise<void> {
  const databaseManagerService = new DatabaseManagerService();

  fastify.post('/', async (request, reply) => {
    const body: any = request.body;
    const { userId, createdById, userName } = body;
    await databaseManagerService.createDatabase(userId);
    const db = await databaseManagerService.connectToDatabase(userId);
    await databaseManagerService.createTables(db, userId, userName, createdById);
    db.close();
    return reply.send({ message: "Ok" });
  });

  fastify.get('/', async (request, reply) => {
    let { previous, pageSize, order } = request.query as any;
    if (order !== 'desc' && order !== 'asc') {
      order = 'desc'
    }
    previous = parseInt(previous)
    pageSize = parseInt(pageSize)
    const offset = previous * pageSize;
    const result = await databaseManagerService.selectLogConfigs(offset, pageSize, order);
    return reply.send({
      previous: previous,
      next: previous + 1,
      pageSize: pageSize,
      total: result.total,
      data: result.data,

    });
  });

  fastify.get('/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const db = await databaseManagerService.connectToDatabase(userId);
    const data = await databaseManagerService.selectLogConfig(db);
    return reply.send({ data });
  });
}