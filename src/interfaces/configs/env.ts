

export type ENV_CONFIG = {
  PORT: number | string,
  DATABASE_HOST: string,
  DATABASE_PORT: string,
  DATABASE_NAME: string,
  DATABASE_USERNAME: string,
  DATABASE_PASSWORD: string,
  DATABASE_SSL: boolean,
  NODE_ENV: string,
  DB_ADMIN_PUBLIC_KEY: string,
  REWARDS_PERIOD: 'mainnet' | 'testnet-2',
  SOLANA_ENV: 'mainnet' | 'devnet',
  NAS_API: string,
  NAS_API_KEY: string,
  RABBIT_USER: string,
  RABBIT_PASS: string,
  RABBIT_HOST: string,
  RABBIT_QUEUES: {
    WUBI_API_QUEUE: string,
    WUBI_API_QUEUE_RESPONSE: string,
  }
};

