import knex from "knex";
import config from "../knexfile";

export const dbConnection = knex(config);
