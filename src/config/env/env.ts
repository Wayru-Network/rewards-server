import { ENV_CONFIG } from '@interfaces/configs/env';
import 'dotenv/config';

export const ENV: ENV_CONFIG = {
  PORT: process.env.PORT || 1335,
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: process.env.DATABASE_PORT || '5432',
  DATABASE_NAME: process.env.DATABASE_NAME || 'database',
  DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'user',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'password',
  DATABASE_SSL: process.env.DATABASE_SSL === 'true',
  NODE_ENV: process.env.NODE_ENV || 'develop',
  DB_ADMIN_PUBLIC_KEY: process.env.DB_ADMIN_PUBLIC_KEY || '',
  REWARDS_PERIOD: process.env.REWARDS_PERIOD === 'mainnet' ? 'mainnet' : 'testnet-2',
  SOLANA_ENV: (process.env.SOLANA_ENV as 'mainnet' | 'devnet') || 'devnet',
  NAS_API: process.env.NAS_API || 'https://nas.api.tech',
  NAS_API_KEY: process.env.NAS_API_KEY || '121212',
  RABBIT_USER: process.env.RABBIT_USER || 'guest',
  RABBIT_PASS: process.env.RABBIT_PASS || 'guest',
  RABBIT_HOST: process.env.RABBIT_HOST || 'localhost',
  RABBIT_QUEUES: {
    WUBI_API_QUEUE: process.env.WUBI_API_QUEUE as string,
    WUBI_API_QUEUE_RESPONSE: process.env.WUBI_API_QUEUE_RESPONSE as string,
    WUPI_API_QUEUE: process.env.WUPI_API_QUEUE as string,
    WUPI_API_QUEUE_RESPONSE: process.env.WUPI_API_QUEUE_RESPONSE as string
  },
  SOLANA_API_KEY: process.env.SOLANA_API_KEY || '',
  SOLANA_API_URL: process.env.SOLANA_API_URL || 'https://api.devnet.solana.com',
  SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY || '',
  REWARDS_MODE: process.env.REWARDS_MODE as 'production' | 'test' || 'test',
  ENABLE_ERROR_SIMULATION: process.env.ENABLE_ERROR_SIMULATION === 'true' || false,
};
