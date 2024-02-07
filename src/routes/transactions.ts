import { FastifyInstance } from "fastify";
import { FastifyRequest } from "fastify/types/request";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { dbConnection } from "../../db/dbConnection";
import { checkParamsId } from "../utils/check-params-id";

export async function transactionsRoutes(server: FastifyInstance) {
  server.get("/", async (request: FastifyRequest, reply) => {
    const sessionId = request.cookies.sessionId;

    const transactions = await dbConnection("transactions")
      .select("")
      .where("session_id", sessionId);
    return transactions;
  });

  server.get("/:id", { preHandler: checkParamsId }, async (request, reply) => {
    const sessionId = request.cookies.sessionId;

    const transaction = await dbConnection("transactions")
      .select("")
      .where("id", request.id)
      .andWhere("session_id", sessionId)
      .first();

    return transaction ? reply.send(transaction) : reply.code(404).send();
  });

  server.get("/summary", async (request: FastifyRequest) => {
    const sessionId = request.cookies.sessionId;

    const summary = await dbConnection("transactions")
      .where("session_id", sessionId)
      .sum("amount", { as: "amount" })
      .first();
    return { summary };
  });

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

  server.put("/:id", { preHandler: checkParamsId }, async (request, reply) => {
    const createTransaction = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const sessionId = request.cookies.sessionId;

    const body = createTransaction.safeParse(request.body);

    if (body.success) {
      await dbConnection("transactions")
        .where("session_id", sessionId)
        .andWhere("id", request.id)
        .update({
          amount:
            body.data.type === "credit"
              ? body.data.amount
              : body.data.amount * -1,
          title: body.data.title,
        });
    }

    return reply.code(204).send();
  });

  server.delete(
    "/:id",
    { preHandler: checkParamsId },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;

      const removeTransaction = await dbConnection("transactions")
        .where("id", request.id)
        .andWhere("session_id", sessionId)
        .del();

      if (removeTransaction > 0) {
        return reply.code(204).send();
      }
      return reply.code(404).send();
    }
  );
}
