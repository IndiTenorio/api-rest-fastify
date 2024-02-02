import { FastifyInstance } from "fastify";
import { FastifyRequest } from "fastify/types/request";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { dbConnection } from "../../db/dbConnection";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply) => {
      const sessionId = request.cookies.sessionId;

      const transactions = await dbConnection("transactions")
        .select("")
        .where("session_id", sessionId);
      return {
        transactions,
      };
    }
  );

  server.get(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const params = getTransactionParamsSchema.safeParse(request.params);

      const sessionId = request.cookies.sessionId;

      if (params.success) {
        const transaction = await dbConnection("transactions")
          .select("")
          .where("id", params.data.id)
          .andWhere("session_id", sessionId)
          .first();

        return transaction ? reply.send(transaction) : reply.code(404).send();
      }

      return reply.code(400).send(params.error.formErrors.fieldErrors);
    }
  );

  server.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest) => {
      const sessionId = request.cookies.sessionId;

      const summary = await dbConnection("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();
      return { summary };
    }
  );

  server.post("/", async (request, reply) => {
    const createTransaction = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const body = createTransaction.safeParse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    if (body.success) {
      await dbConnection("transactions").insert({
        amount:
          body.data.type === "credit"
            ? body.data.amount
            : body.data.amount * -1,
        id: randomUUID(),
        title: body.data.title,
        session_id: sessionId,
      });

      return reply.status(201).send();
    }

    return reply.status(400).send(body.error.formErrors.fieldErrors);
  });
}
