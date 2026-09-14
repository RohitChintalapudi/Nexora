import { getSQL } from '../config/db.js';

export const RelationshipModel = {
  /**
   * Delete all existing relationships for a repository (enforces clean idempotency)
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async deleteByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const deleted = await sql`
      DELETE FROM code_relationships
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      RETURNING id;
    `;
    return deleted.length;
  },

  /**
   * Batch insert code relationships for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Array<Object>} relationships
   * @returns {Promise<number>}
   */
  async batchInsert(repositoryId, userId, relationships) {
    if (!relationships || relationships.length === 0) return 0;
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < relationships.length; i += batchSize) {
      const chunk = relationships.slice(i, i + batchSize);

      for (const rel of chunk) {
        const metaJson = JSON.stringify(rel.metadata || {});
        await sql`
          INSERT INTO code_relationships (
            repository_id,
            user_id,
            source_file_id,
            target_file_id,
            relationship_type,
            metadata,
            created_at
          )
          VALUES (
            ${repositoryId},
            ${userId},
            ${rel.sourceFileId},
            ${rel.targetFileId || null},
            ${rel.relationshipType},
            ${metaJson}::jsonb,
            CURRENT_TIMESTAMP
          );
        `;
        totalInserted++;
      }
    }

    return totalInserted;
  },

  /**
   * Find relationships for a repository with strict multi-tenant authorization
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Object} [filter]
   * @returns {Promise<Array>}
   */
  async findByRepositoryId(repositoryId, userId, filter = {}) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const relationshipType = filter.relationshipType;

    if (relationshipType) {
      return await sql`
        SELECT 
          r.*,
          sf.path as source_path,
          tf.path as target_path
        FROM code_relationships r
        JOIN repository_files sf ON r.source_file_id = sf.id
        LEFT JOIN repository_files tf ON r.target_file_id = tf.id
        WHERE r.repository_id = ${repositoryId} 
          AND r.user_id = ${userId}
          AND r.relationship_type = ${relationshipType}
        ORDER BY sf.path ASC;
      `;
    }

    return await sql`
      SELECT 
        r.*,
        sf.path as source_path,
        tf.path as target_path
      FROM code_relationships r
      JOIN repository_files sf ON r.source_file_id = sf.id
      LEFT JOIN repository_files tf ON r.target_file_id = tf.id
      WHERE r.repository_id = ${repositoryId} AND r.user_id = ${userId}
      ORDER BY sf.path ASC;
    `;
  },

  /**
   * Get relationship counts grouped by type for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Array>}
   */
  async getCountsByType(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    return await sql`
      SELECT relationship_type, COUNT(*)::int as count
      FROM code_relationships
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      GROUP BY relationship_type
      ORDER BY count DESC;
    `;
  }
};
