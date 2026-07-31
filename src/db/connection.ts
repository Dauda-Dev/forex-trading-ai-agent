import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

function getConfig(): DbConfig {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const u = new URL(url);
      return {
        host: u.hostname,
        port: parseInt(u.port || '5432', 10),
        database: u.pathname.replace(/^\//, ''),
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        ssl: u.searchParams.get('sslmode') === 'require',
      };
    } catch { /* fall through to individual vars */ }
  }
  return {
    host: process.env.KIT_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.KIT_DB_PORT || process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.KIT_DB_NAME || process.env.POSTGRES_DB || 'kit',
    user: process.env.KIT_DB_USER || process.env.POSTGRES_USER || 'kit',
    password: process.env.KIT_DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'kit',
    ssl: process.env.KIT_DB_SSL === 'true' || process.env.POSTGRES_SSL === 'true',
  };
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    const config = getConfig();
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => console.error('[DB] Pool error:', err.message));
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const d = getDb();
    await d.execute('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
