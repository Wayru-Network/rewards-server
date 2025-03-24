import { Pool } from 'pg';
import { ENV } from '@/config/env/env';

const pool = new Pool({
  host: ENV.DATABASE_HOST,
  port: parseInt(ENV.DATABASE_PORT || '5432'),
  database: ENV.DATABASE_NAME,
  user: ENV.DATABASE_USERNAME,
  password: ENV.DATABASE_PASSWORD,
  ssl: ENV.DATABASE_SSL == true
});

export default pool;