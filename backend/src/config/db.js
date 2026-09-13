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

    // Initialize github_accounts table for M2 repository authorization
    await db`
      CREATE TABLE IF NOT EXISTS github_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        github_user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at TIMESTAMP WITH TIME ZONE,
        scopes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize repositories table for M3 repository selection & management
    await db`
      CREATE TABLE IF NOT EXISTS repositories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        github_repository_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        owner VARCHAR(255) NOT NULL,
        description TEXT,
        private BOOLEAN DEFAULT false,
        default_branch VARCHAR(255) DEFAULT 'main',
        language VARCHAR(100),
        html_url TEXT,
        github_updated_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, github_repository_id)
      );
    `;

    // Initialize analysis_jobs table for M4 Analysis Job System
    await db`
      CREATE TABLE IF NOT EXISTS analysis_jobs (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
        current_stage VARCHAR(100) NOT NULL DEFAULT 'QUEUED',
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('✅ Neon Database initialized. "users", "github_accounts", "repositories", and "analysis_jobs" tables are ready.');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
  }
};
