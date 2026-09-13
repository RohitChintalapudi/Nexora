import { getSQL } from '../config/db.js';

export const AnalysisJobModel = {
  /**
   * Create a new analysis job in PostgreSQL
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create({ repositoryId, userId, status = 'QUEUED', currentStage = 'QUEUED' }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      INSERT INTO analysis_jobs (
        repository_id,
        user_id,
        status,
        current_stage,
        created_at,
        updated_at
      )
      VALUES (
        ${repositoryId},
        ${userId},
        ${status},
        ${currentStage},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING 
        id,
        repository_id,
        user_id,
        status,
        current_stage,
        error_message,
        started_at,
        completed_at,
        created_at,
        updated_at;
    `;
    return rows[0];
  },

  /**
   * Find an active analysis job (QUEUED or PROCESSING) for a repository and user
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findActiveByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id,
        repository_id,
        user_id,
        status,
        current_stage,
        error_message,
        started_at,
        completed_at,
        created_at,
        updated_at
      FROM analysis_jobs
      WHERE repository_id = ${repositoryId} 
        AND user_id = ${userId}
        AND status IN ('QUEUED', 'PROCESSING')
      ORDER BY id DESC
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  /**
   * Find an analysis job by ID with strict multi-tenant authorization
   * @param {number|string} id
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findByIdAndUserId(id, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        j.id,
        j.repository_id,
        j.user_id,
        j.status,
        j.current_stage,
        j.error_message,
        j.files_scanned,
        j.files_included,
        j.files_ignored,
        j.total_size_bytes,
        j.symbols_count,
        j.relationships_count,
        j.routes_count,
        j.started_at,
        j.completed_at,
        j.created_at,
        j.updated_at,
        r.name as repository_name,
        r.full_name as repository_full_name,
        r.default_branch,
        r.language,
        r.private
      FROM analysis_jobs j
      JOIN repositories r ON j.repository_id = r.id
      WHERE j.id = ${id} AND j.user_id = ${userId}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  /**
   * Find internal analysis job by ID (used by worker)
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id,
        repository_id,
        user_id,
        status,
        current_stage,
        error_message,
        files_scanned,
        files_included,
        files_ignored,
        total_size_bytes,
        symbols_count,
        relationships_count,
        routes_count,
        started_at,
        completed_at,
        created_at,
        updated_at
      FROM analysis_jobs
      WHERE id = ${id}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  /**
   * Find the most recent analysis job for a repository and user
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findLatestByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id,
        repository_id,
        user_id,
        status,
        current_stage,
        error_message,
        files_scanned,
        files_included,
        files_ignored,
        total_size_bytes,
        symbols_count,
        relationships_count,
        routes_count,
        started_at,
        completed_at,
        created_at,
        updated_at
      FROM analysis_jobs
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      ORDER BY id DESC
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  /**
   * Update an analysis job's stage, status, timestamps, stats, or error message
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async updateStage({
    id,
    status,
    currentStage,
    filesScanned = null,
    filesIncluded = null,
    filesIgnored = null,
    totalSizeBytes = null,
    symbolsCount = null,
    relationshipsCount = null,
    routesCount = null,
    startedAt = null,
    completedAt = null,
    errorMessage = null
  }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      UPDATE analysis_jobs
      SET
        status = COALESCE(${status}, status),
        current_stage = COALESCE(${currentStage}, current_stage),
        files_scanned = COALESCE(${filesScanned}, files_scanned),
        files_included = COALESCE(${filesIncluded}, files_included),
        files_ignored = COALESCE(${filesIgnored}, files_ignored),
        total_size_bytes = COALESCE(${totalSizeBytes}, total_size_bytes),
        symbols_count = COALESCE(${symbolsCount}, symbols_count),
        relationships_count = COALESCE(${relationshipsCount}, relationships_count),
        routes_count = COALESCE(${routesCount}, routes_count),
        started_at = COALESCE(${startedAt}, started_at),
        completed_at = COALESCE(${completedAt}, completed_at),
        error_message = ${errorMessage},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id,
        repository_id,
        user_id,
        status,
        current_stage,
        error_message,
        files_scanned,
        files_included,
        files_ignored,
        total_size_bytes,
        symbols_count,
        relationships_count,
        routes_count,
        started_at,
        completed_at,
        created_at,
        updated_at;
    `;
    return rows[0];
  }
};
