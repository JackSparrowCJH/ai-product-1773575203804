import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DB_URL });

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL DEFAULT '游客',
      merit BIGINT NOT NULL DEFAULT 0,
      last_sync_merit BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      delta BIGINT NOT NULL,
      merit_before BIGINT NOT NULL,
      merit_after BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
