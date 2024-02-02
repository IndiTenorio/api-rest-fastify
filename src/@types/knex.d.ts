import { knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    transactions: Transactions;
  }
}

interface Transactions {
  id: string;
  title: string;
  amount: number;
  created_at: string;
  session_id: string;
}
