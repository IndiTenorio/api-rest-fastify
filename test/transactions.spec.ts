import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { server } from "../src/app";
import { execSync } from "node:child_process";

describe("Transaction Routes", () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    execSync("npm run rollback --all");
    execSync("npm run latest");
  });

  it("should be able to create a new transaction", async () => {
    await request(server.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  it("should return bad request when creating a new transaction with wrong body", async () => {
    await request(server.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credito",
      })
      .expect(400);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(server.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionResponse = await request(server.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionResponse.body).toEqual([
      expect.objectContaining({
        title: "new transaction",
        amount: 5000,
      }),
    ]);
  });

  it("should be able to get a especific transactions", async () => {
    const createTransactionResponse = await request(server.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionResponse = await request(server.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionId = listTransactionResponse.body[0].id;

    const getTransactionResponse = await request(server.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        title: "new transaction",
        amount: 5000,
      })
    );
  });
});
