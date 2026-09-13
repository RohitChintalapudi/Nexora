import { getSQL } from '../config/db.js';

export const RouteModel = {
  /**
   * Delete all existing routes for a repository (enforces clean idempotency)
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async deleteByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const deleted = await sql`
      DELETE FROM routes
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      RETURNING id;
    `;
    return deleted.length;
  },

  /**
   * Batch insert routes for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Array<Object>} routes
   * @returns {Promise<number>}
   */
  async batchInsert(repositoryId, userId, routes) {
    if (!routes || routes.length === 0) return 0;
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < routes.length; i += batchSize) {
      const chunk = routes.slice(i, i + batchSize);

      for (const route of chunk) {
        await sql`
          INSERT INTO routes (
            repository_id,
            user_id,
            file_id,
            method,
            path,
            handler,
            line_start,
            line_end,
            framework,
            created_at
          )
          VALUES (
            ${repositoryId},
            ${userId},
            ${route.fileId},
            ${route.method},
            ${route.path},
            ${route.handler || null},
            ${route.lineStart || null},
            ${route.lineEnd || null},
            ${route.framework || null},
            CURRENT_TIMESTAMP
          );
        `;
        totalInserted++;
      }
    }

    return totalInserted;
  },

  /**
   * Find routes for a repository with strict multi-tenant authorization
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Array>}
   */
  async findByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    return await sql`
      SELECT 
        r.*,
        f.path as file_path
      FROM routes r
      JOIN repository_files f ON r.file_id = f.id
      WHERE r.repository_id = ${repositoryId} AND r.user_id = ${userId}
      ORDER BY r.path ASC, r.method ASC;
    `;
  },

  /**
   * Get route count for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async countByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const result = await sql`
      SELECT COUNT(*)::int as count
      FROM routes
      WHERE repository_id = ${repositoryId} AND user_id = ${userId};
    `;
    return result[0]?.count || 0;
  }
};
