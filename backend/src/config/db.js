import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

let sql = null;

export const getSQL = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not set in backend/.env. Using mock mode or awaiting database URL.');
    return null;
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
};

export const initDB = async () => {
  try {
    const db = getSQL();
    if (!db) {
      console.warn('⚠️ Skipping DB initialization: DATABASE_URL not configured.');
      return;
    }

    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        google_id VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure columns exist and password is not strictly required for OAuth users
    try {
      await db`ALTER TABLE users ALTER COLUMN password DROP NOT NULL;`;
      await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);`;
      await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(255);`;
      await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`;
    } catch {
      // Ignore migration errors if already configured
    }

    console.log('✅ Neon Database initialized. "users" table is ready for Email + Google + GitHub OAuth.');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
  }
};
