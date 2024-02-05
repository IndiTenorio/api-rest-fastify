import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function checkParamsId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const getTransactionParamsSchema = z.object({
    id: z.string().uuid(),
  });
  const params = getTransactionParamsSchema.safeParse(request.params);

  if (!params.success) {
    return reply.code(400).send(params.error.formErrors.fieldErrors);
  }

  request.id = params.data.id;
}
