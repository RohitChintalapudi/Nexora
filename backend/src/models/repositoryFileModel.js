import { getSQL } from '../config/db.js';

export const RepositoryFileModel = {
  /**
   * Delete all existing files for a repository (enforces clean idempotency on re-ingestion)
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async deleteByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const deleted = await sql`
      DELETE FROM repository_files
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      RETURNING id;
    `;
    return deleted.length;
  },

  /**
   * Batch upsert file records for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Array<Object>} files
   * @returns {Promise<number>}
   */
  async batchUpsert(repositoryId, userId, files) {
    if (!files || files.length === 0) return 0;
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < files.length; i += batchSize) {
      const chunk = files.slice(i, i + batchSize);

      for (const file of chunk) {
        await sql`
          INSERT INTO repository_files (
            repository_id,
            user_id,
            path,
            name,
            extension,
            language,
            size_bytes,
            is_binary,
            is_generated,
            is_ignored,
            content,
            created_at,
            updated_at
          )
          VALUES (
            ${repositoryId},
            ${userId},
            ${file.path},
            ${file.name},
            ${file.extension || null},
            ${file.language || null},
            ${file.sizeBytes || 0},
            ${file.isBinary || false},
            ${file.isGenerated || false},
            ${file.isIgnored || false},
            ${file.content || null},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (repository_id, path)
          DO UPDATE SET
            name = EXCLUDED.name,
            extension = EXCLUDED.extension,
            language = EXCLUDED.language,
            size_bytes = EXCLUDED.size_bytes,
            is_binary = EXCLUDED.is_binary,
            is_generated = EXCLUDED.is_generated,
            is_ignored = EXCLUDED.is_ignored,
            content = EXCLUDED.content,
            updated_at = CURRENT_TIMESTAMP;
        `;
        totalInserted++;
      }
    }

    return totalInserted;
  },

  /**
   * Find files for a repository, strictly enforcing user tenant isolation
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Object} [filter]
   * @returns {Promise<Array>}
   */
  async findByRepositoryId(repositoryId, userId, filter = {}) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const onlySource = filter.onlySource ?? false;
    const includeContent = filter.includeContent ?? false;

    if (includeContent && onlySource) {
      return await sql`
        SELECT 
          id,
          repository_id,
          user_id,
          path,
          name,
          extension,
          language,
          size_bytes,
          is_binary,
          is_generated,
          is_ignored,
          content,
          created_at,
          updated_at
        FROM repository_files
        WHERE repository_id = ${repositoryId} 
          AND user_id = ${userId}
          AND is_binary = false
          AND is_ignored = false
        ORDER BY path ASC;
      `;
    }

    if (includeContent) {
      return await sql`
        SELECT 
          id,
          repository_id,
          user_id,
          path,
          name,
          extension,
          language,
          size_bytes,
          is_binary,
          is_generated,
          is_ignored,
          content,
          created_at,
          updated_at
        FROM repository_files
        WHERE repository_id = ${repositoryId} AND user_id = ${userId}
        ORDER BY path ASC;
      `;
    }

    if (onlySource) {
      return await sql`
        SELECT 
          id,
          repository_id,
          user_id,
          path,
          name,
          extension,
          language,
          size_bytes,
          is_binary,
          is_generated,
          is_ignored,
          created_at,
          updated_at
        FROM repository_files
        WHERE repository_id = ${repositoryId} 
          AND user_id = ${userId}
          AND is_binary = false
          AND is_ignored = false
        ORDER BY path ASC;
      `;
    }

    return await sql`
      SELECT 
        id,
        repository_id,
        user_id,
        path,
        name,
        extension,
        language,
        size_bytes,
        is_binary,
        is_generated,
        is_ignored,
        created_at,
        updated_at
      FROM repository_files
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      ORDER BY path ASC;
    `;
  },

  /**
   * Find a single file record by path within a repository with user isolation
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {string} filePath
   * @returns {Promise<Object|null>}
   */
  async findByPath(repositoryId, userId, filePath) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    // Normalize path query
    const normalized = filePath.startsWith('/') ? filePath.slice(1) : filePath;

    const rows = await sql`
      SELECT 
        id,
        repository_id,
        user_id,
        path,
        name,
        extension,
        language,
        size_bytes,
        is_binary,
        is_generated,
        is_ignored,
        content,
        created_at,
        updated_at
      FROM repository_files
      WHERE repository_id = ${repositoryId} 
        AND user_id = ${userId}
        AND (path = ${filePath} OR path = ${normalized} OR path = ${'/' + normalized})
      LIMIT 1;
    `;

    return rows[0] || null;
  },

  /**
   * Get file statistics and language breakdown for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Object>}
   */
  async getStats(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const counts = await sql`
      SELECT 
        COUNT(*)::int as total_files,
        COUNT(CASE WHEN is_binary = false AND is_ignored = false THEN 1 END)::int as source_files,
        COUNT(CASE WHEN is_ignored = true THEN 1 END)::int as ignored_files,
        COUNT(CASE WHEN is_binary = true THEN 1 END)::int as binary_files,
        COALESCE(SUM(CASE WHEN is_binary = false AND is_ignored = false THEN size_bytes ELSE 0 END), 0)::bigint as total_source_size_bytes
      FROM repository_files
      WHERE repository_id = ${repositoryId} AND user_id = ${userId};
    `;

    const languages = await sql`
      SELECT 
        language,
        COUNT(*)::int as count,
        SUM(size_bytes)::bigint as size_bytes
      FROM repository_files
      WHERE repository_id = ${repositoryId} 
        AND user_id = ${userId}
        AND language IS NOT NULL
        AND is_binary = false
        AND is_ignored = false
      GROUP BY language
      ORDER BY count DESC;
    `;

    return {
      ...(counts[0] || {}),
      languages
    };
  }
};
