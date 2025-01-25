import * as dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY || "",
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || "",
};
