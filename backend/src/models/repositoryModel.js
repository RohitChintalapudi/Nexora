import { getSQL } from '../config/db.js';

export const RepositoryModel = {
  /**
   * Find all saved repositories for an authenticated NEXORA user
   * @param {number|string} userId
   * @returns {Promise<Array>}
   */
  async findAllByUserId(userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id,
        user_id,
        github_repository_id,
        name,
        full_name,
        owner,
        description,
        private,
        default_branch,
        language,
        html_url,
        github_updated_at,
        commit_sha,
        file_count,
        source_file_count,
        ignored_file_count,
        total_source_size_bytes,
        ingested_at,
        created_at,
        updated_at
      FROM repositories
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC;
    `;
    return rows;
  },

  /**
   * Find a specific repository by ID, strictly enforcing multi-tenant user ownership
   * @param {number|string} id - Repository internal ID
   * @param {number|string} userId - Authenticated user ID
   * @returns {Promise<Object|null>}
   */
  async findByIdAndUserId(id, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id,
        user_id,
        github_repository_id,
        name,
        full_name,
        owner,
        description,
        private,
        default_branch,
        language,
        html_url,
        github_updated_at,
        commit_sha,
        file_count,
        source_file_count,
        ignored_file_count,
        total_source_size_bytes,
        ingested_at,
        created_at,
        updated_at
      FROM repositories
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  /**
   * Find a specific repository by GitHub repository ID and user ID
   * @param {string|number} githubRepositoryId
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findByGithubIdAndUserId(githubRepositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id,
        user_id,
        github_repository_id,
        name,
        full_name,
        owner,
        description,
        private,
        default_branch,
        language,
        html_url,
        github_updated_at,
        commit_sha,
        file_count,
        source_file_count,
        ignored_file_count,
        total_source_size_bytes,
        ingested_at,
        created_at,
        updated_at
      FROM repositories
      WHERE github_repository_id = ${String(githubRepositoryId)} AND user_id = ${userId}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  /**
   * Securely upsert a repository record for the authenticated user
   * Prevents duplicate repository records and updates metadata if re-selected
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async upsert({
    userId,
    githubRepositoryId,
    name,
    fullName,
    owner,
    description = null,
    isPrivate = false,
    defaultBranch = 'main',
    language = null,
    htmlUrl = null,
    githubUpdatedAt = null
  }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      INSERT INTO repositories (
        user_id,
        github_repository_id,
        name,
        full_name,
        owner,
        description,
        private,
        default_branch,
        language,
        html_url,
        github_updated_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${String(githubRepositoryId)},
        ${name},
        ${fullName},
        ${owner},
        ${description},
        ${isPrivate},
        ${defaultBranch},
        ${language},
        ${htmlUrl},
        ${githubUpdatedAt},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id, github_repository_id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        full_name = EXCLUDED.full_name,
        owner = EXCLUDED.owner,
        description = EXCLUDED.description,
        private = EXCLUDED.private,
        default_branch = EXCLUDED.default_branch,
        language = EXCLUDED.language,
        html_url = EXCLUDED.html_url,
        github_updated_at = EXCLUDED.github_updated_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id,
        user_id,
        github_repository_id,
        name,
        full_name,
        owner,
        description,
        private,
        default_branch,
        language,
        html_url,
        github_updated_at,
        created_at,
        updated_at;
    `;

    return rows[0];
  },

  /**
   * Update repository-level ingestion metrics and commit SHA
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async updateIngestionMetadata({
    id,
    userId,
    commitSha = null,
    fileCount = 0,
    sourceFileCount = 0,
    ignoredFileCount = 0,
    totalSourceSizeBytes = 0
  }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      UPDATE repositories
      SET
        commit_sha = COALESCE(${commitSha}, commit_sha),
        file_count = ${fileCount},
        source_file_count = ${sourceFileCount},
        ignored_file_count = ${ignoredFileCount},
        total_source_size_bytes = ${totalSourceSizeBytes},
        ingested_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *;
    `;

    return rows[0];
  },

  /**
   * Delete a repository belonging to the authenticated user
   * @param {number|string} id
   * @param {number|string} userId
   * @returns {Promise<boolean>}
   */
  async deleteByIdAndUserId(id, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const result = await sql`
      DELETE FROM repositories
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id;
    `;

    return result.length > 0;
  }
};
