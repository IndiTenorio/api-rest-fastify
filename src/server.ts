import fastify from "fastify";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";
import cookie from "@fastify/cookie";
import { logSession } from "./middlewares/session-log";

const server = fastify();

server.register(cookie);

server.addHook("preHandler", logSession);

server.register(transactionsRoutes, {
  prefix: "transactions",
});

server.listen({ port: env.PORT }, () => {
  console.log(`listening at http://localhost:${env.PORT}`);
});
