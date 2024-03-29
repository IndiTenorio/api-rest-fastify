import type { Knex } from "knex";
import { env } from "./src/env";

// Update with your config settings.

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === "sqlite"
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,

  migrations: {
    directory: "db/migrations",
    extension: "ts",
  },
  useNullAsDefault: true,
};

export default config;
