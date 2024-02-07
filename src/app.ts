import fastify from "fastify";
import { transactionsRoutes } from "./routes/transactions";
import cookie from "@fastify/cookie";
import { logSession } from "./middlewares/session-log";

export const server = fastify();

server.register(cookie);

server.addHook("preHandler", logSession);

server.register(transactionsRoutes, {
  prefix: "transactions",
});
