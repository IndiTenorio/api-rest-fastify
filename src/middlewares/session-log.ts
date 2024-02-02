import { FastifyReply, FastifyRequest } from "fastify";

export async function logSession(request: FastifyRequest, reply: FastifyReply) {
  console.log(`[${request.method}] ${request.url}`);
}
