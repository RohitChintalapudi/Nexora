import { getSQL } from '../config/db.js';

export const SymbolModel = {
  /**
   * Delete all existing symbols for a repository (enforces clean idempotency)
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async deleteByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const deleted = await sql`
      DELETE FROM symbols
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      RETURNING id;
    `;
    return deleted.length;
  },

  /**
   * Batch insert symbols for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Array<Object>} symbols
   * @returns {Promise<number>}
   */
  async batchInsert(repositoryId, userId, symbols) {
    if (!symbols || symbols.length === 0) return 0;
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < symbols.length; i += batchSize) {
      const chunk = symbols.slice(i, i + batchSize);

      for (const sym of chunk) {
        await sql`
          INSERT INTO symbols (
            repository_id,
            user_id,
            file_id,
            name,
            type,
            language,
            line_start,
            line_end,
            is_exported,
            created_at,
            updated_at
          )
          VALUES (
            ${repositoryId},
            ${userId},
            ${sym.fileId},
            ${sym.name},
            ${sym.type},
            ${sym.language || null},
            ${sym.lineStart || null},
            ${sym.lineEnd || null},
            ${sym.isExported || false},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          );
        `;
        totalInserted++;
      }
    }

    return totalInserted;
  },

  /**
   * Find symbols by repository ID with strict multi-tenant authorization
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Object} [filter]
   * @returns {Promise<Array>}
   */
  async findByRepositoryId(repositoryId, userId, filter = {}) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const fileId = filter.fileId;
    const type = filter.type;

    if (fileId && type) {
      return await sql`
        SELECT s.*, f.path as file_path
        FROM symbols s
        JOIN repository_files f ON s.file_id = f.id
        WHERE s.repository_id = ${repositoryId} 
          AND s.user_id = ${userId}
          AND s.file_id = ${fileId}
          AND s.type = ${type}
        ORDER BY s.line_start ASC;
      `;
    }

    if (fileId) {
      return await sql`
        SELECT s.*, f.path as file_path
        FROM symbols s
        JOIN repository_files f ON s.file_id = f.id
        WHERE s.repository_id = ${repositoryId} 
          AND s.user_id = ${userId}
          AND s.file_id = ${fileId}
        ORDER BY s.line_start ASC;
      `;
    }

    if (type) {
      return await sql`
        SELECT s.*, f.path as file_path
        FROM symbols s
        JOIN repository_files f ON s.file_id = f.id
        WHERE s.repository_id = ${repositoryId} 
          AND s.user_id = ${userId}
          AND s.type = ${type}
        ORDER BY f.path ASC, s.line_start ASC;
      `;
    }

    return await sql`
      SELECT s.*, f.path as file_path
      FROM symbols s
      JOIN repository_files f ON s.file_id = f.id
      WHERE s.repository_id = ${repositoryId} AND s.user_id = ${userId}
      ORDER BY f.path ASC, s.line_start ASC;
    `;
  },

  /**
   * Get symbol counts grouped by type for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Array>}
   */
  async getCountsByType(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    return await sql`
      SELECT type, COUNT(*)::int as count
      FROM symbols
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      GROUP BY type
      ORDER BY count DESC;
    `;
  }
};
