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
      await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username VARCHAR(255);`;
      await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS x_username VARCHAR(255);`;
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

    // Ensure repositories table has M5 ingestion metadata columns
    try {
      await db`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS commit_sha VARCHAR(100);`;
      await db`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS file_count INTEGER DEFAULT 0;`;
      await db`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS source_file_count INTEGER DEFAULT 0;`;
      await db`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS ignored_file_count INTEGER DEFAULT 0;`;
      await db`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS total_source_size_bytes BIGINT DEFAULT 0;`;
      await db`ALTER TABLE repositories ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMP WITH TIME ZONE;`;
    } catch {
      // Ignore migration errors if already added
    }

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

    // Ensure pgvector extension is enabled for M7 Semantic Vector Indexing
    try {
      await db`CREATE EXTENSION IF NOT EXISTS vector;`;
    } catch (vecErr) {
      console.warn('⚠️ Could not automatically enable vector extension (may already be active or require superuser):', vecErr.message);
    }

    // Ensure analysis_jobs table has M5, M6 & M7 stats columns
    try {
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS files_scanned INTEGER DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS files_included INTEGER DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS files_ignored INTEGER DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS total_size_bytes BIGINT DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS symbols_count INTEGER DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS relationships_count INTEGER DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS routes_count INTEGER DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS chunks_count INTEGER DEFAULT 0;`;
      await db`ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS embeddings_count INTEGER DEFAULT 0;`;
    } catch {
      // Ignore migration errors if already added
    }

    // Initialize repository_files table for M5 Repository Ingestion
    await db`
      CREATE TABLE IF NOT EXISTS repository_files (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        path TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        extension VARCHAR(50),
        language VARCHAR(100),
        size_bytes INTEGER NOT NULL DEFAULT 0,
        is_binary BOOLEAN NOT NULL DEFAULT false,
        is_generated BOOLEAN NOT NULL DEFAULT false,
        is_ignored BOOLEAN NOT NULL DEFAULT false,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (repository_id, path)
      );
    `;

    // Initialize symbols table for M6 Codebase Intelligence
    await db`
      CREATE TABLE IF NOT EXISTS symbols (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_id INTEGER NOT NULL REFERENCES repository_files(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        language VARCHAR(100),
        line_start INTEGER,
        line_end INTEGER,
        is_exported BOOLEAN DEFAULT false,
        parent_symbol_id INTEGER REFERENCES symbols(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize code_relationships table for M6 Codebase Intelligence
    await db`
      CREATE TABLE IF NOT EXISTS code_relationships (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source_file_id INTEGER NOT NULL REFERENCES repository_files(id) ON DELETE CASCADE,
        target_file_id INTEGER REFERENCES repository_files(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize routes table for M6 Codebase Intelligence
    await db`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_id INTEGER NOT NULL REFERENCES repository_files(id) ON DELETE CASCADE,
        method VARCHAR(20) NOT NULL,
        path TEXT NOT NULL,
        handler VARCHAR(255),
        line_start INTEGER,
        line_end INTEGER,
        framework VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize project_metadata table for M6 Codebase Intelligence
    await db`
      CREATE TABLE IF NOT EXISTS project_metadata (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER UNIQUE NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        frameworks JSONB DEFAULT '[]'::jsonb,
        languages JSONB DEFAULT '{}'::jsonb,
        package_manager VARCHAR(50),
        runtime VARCHAR(100),
        dependencies JSONB DEFAULT '{}'::jsonb,
        scripts JSONB DEFAULT '{}'::jsonb,
        entry_points JSONB DEFAULT '[]'::jsonb,
        database_indicators JSONB DEFAULT '[]'::jsonb,
        architectural_roles JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize code_chunks table for M7 Semantic Vector Indexing
    const EMBEDDING_DIM = parseInt(process.env.EMBEDDING_DIMENSIONS || '384', 10);
    await db`
      CREATE TABLE IF NOT EXISTS code_chunks (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_id INTEGER NOT NULL REFERENCES repository_files(id) ON DELETE CASCADE,
        symbol_id INTEGER REFERENCES symbols(id) ON DELETE SET NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        content_hash VARCHAR(64) NOT NULL,
        chunk_type VARCHAR(50) NOT NULL,
        language VARCHAR(100),
        file_path TEXT NOT NULL,
        start_line INTEGER,
        end_line INTEGER,
        embedding vector(384),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize repository_analyses table for M9 AI Analysis Engine
    await db`
      CREATE TABLE IF NOT EXISTS repository_analyses (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER UNIQUE NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES analysis_jobs(id) ON DELETE SET NULL,
        commit_sha VARCHAR(100),
        overview TEXT NOT NULL,
        technology_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
        architecture JSONB NOT NULL DEFAULT '{}'::jsonb,
        modules JSONB NOT NULL DEFAULT '[]'::jsonb,
        application_flow JSONB NOT NULL DEFAULT '[]'::jsonb,
        entry_points JSONB NOT NULL DEFAULT '[]'::jsonb,
        important_files JSONB NOT NULL DEFAULT '[]'::jsonb,
        dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
        database JSONB NOT NULL DEFAULT '{}'::jsonb,
        api_structure JSONB NOT NULL DEFAULT '[]'::jsonb,
        developer_quick_start JSONB NOT NULL DEFAULT '[]'::jsonb,
        uncertainties JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize user_feedback table for dashboard feedback widget
    await db`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        happiness INTEGER CHECK (happiness >= 1 AND happiness <= 5) NOT NULL,
        feedback TEXT NOT NULL DEFAULT '',
        page VARCHAR(100) DEFAULT 'dashboard',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Migrate pre-existing tables to the 5-star scale
    try {
      await db`ALTER TABLE user_feedback DROP CONSTRAINT IF EXISTS user_feedback_happiness_check;`;
      await db`ALTER TABLE user_feedback
        ADD CONSTRAINT user_feedback_happiness_check
        CHECK (happiness >= 1 AND happiness <= 5);`;
    } catch (migrationError) {
      console.warn('Feedback happiness constraint migration skipped:', migrationError.message);
    }

    // Create performance indexes for M5, M6, M7 & M9 queries
    try {
      await db`CREATE INDEX IF NOT EXISTS idx_repo_files_repo_id ON repository_files(repository_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_repo_files_user_id ON repository_files(user_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_repo_files_language ON repository_files(language);`;
      await db`CREATE INDEX IF NOT EXISTS idx_analysis_jobs_repo_user ON analysis_jobs(repository_id, user_id, status);`;
      
      // M6 Indexes
      await db`CREATE INDEX IF NOT EXISTS idx_symbols_repo_user ON symbols(repository_id, user_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_symbols_file ON symbols(file_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);`;
      await db`CREATE INDEX IF NOT EXISTS idx_symbols_type ON symbols(type);`;

      await db`CREATE INDEX IF NOT EXISTS idx_relationships_repo ON code_relationships(repository_id, user_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_relationships_source ON code_relationships(source_file_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_relationships_target ON code_relationships(target_file_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_relationships_type ON code_relationships(relationship_type);`;

      await db`CREATE INDEX IF NOT EXISTS idx_routes_repo_user ON routes(repository_id, user_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_routes_file ON routes(file_id);`;

      await db`CREATE INDEX IF NOT EXISTS idx_proj_meta_repo ON project_metadata(repository_id, user_id);`;

      // M7 Indexes
      await db`CREATE INDEX IF NOT EXISTS idx_code_chunks_repo_user ON code_chunks(repository_id, user_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_code_chunks_file ON code_chunks(file_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_code_chunks_hash ON code_chunks(repository_id, content_hash);`;
      await db`CREATE INDEX IF NOT EXISTS idx_code_chunks_embedding_cosine ON code_chunks USING hnsw (embedding vector_cosine_ops);`;

      // M9 Indexes
      await db`CREATE INDEX IF NOT EXISTS idx_repo_analyses_repo_user ON repository_analyses(repository_id, user_id);`;
      await db`CREATE INDEX IF NOT EXISTS idx_repo_analyses_job_id ON repository_analyses(job_id);`;
    } catch {
      // Ignore index creation errors if already present
    }

    console.log('✅ Neon Database initialized. "users", "github_accounts", "repositories", "analysis_jobs", "repository_files", "symbols", "code_relationships", "routes", "project_metadata", "code_chunks" (pgvector), and "repository_analyses" tables are ready.');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
  }
};
