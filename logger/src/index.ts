import fastify from "fastify";
import { LogConfigRoutes } from "./routes/log-config.routes";
import { LogRoutes } from "./routes/log.routes";

const app = fastify({ logger: true });

app.register(LogConfigRoutes, { prefix: "/config" });
app.register(LogRoutes, { prefix: "/log" });

app.listen(
  { port: 6003 },
  (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`logger apliccation started ${new Date().toISOString()}`);
  }
);
