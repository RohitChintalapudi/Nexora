import { getSQL } from '../config/db.js';

export const ProjectMetadataModel = {
  /**
   * Upsert project metadata for a repository (enforces clean idempotency)
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async upsert({
    repositoryId,
    userId,
    frameworks = [],
    languages = {},
    packageManager = null,
    runtime = null,
    dependencies = {},
    scripts = {},
    entryPoints = [],
    databaseIndicators = [],
    architecturalRoles = []
  }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      INSERT INTO project_metadata (
        repository_id,
        user_id,
        frameworks,
        languages,
        package_manager,
        runtime,
        dependencies,
        scripts,
        entry_points,
        database_indicators,
        architectural_roles,
        created_at,
        updated_at
      )
      VALUES (
        ${repositoryId},
        ${userId},
        ${JSON.stringify(frameworks)}::jsonb,
        ${JSON.stringify(languages)}::jsonb,
        ${packageManager},
        ${runtime},
        ${JSON.stringify(dependencies)}::jsonb,
        ${JSON.stringify(scripts)}::jsonb,
        ${JSON.stringify(entryPoints)}::jsonb,
        ${JSON.stringify(databaseIndicators)}::jsonb,
        ${JSON.stringify(architecturalRoles)}::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (repository_id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        frameworks = EXCLUDED.frameworks,
        languages = EXCLUDED.languages,
        package_manager = EXCLUDED.package_manager,
        runtime = EXCLUDED.runtime,
        dependencies = EXCLUDED.dependencies,
        scripts = EXCLUDED.scripts,
        entry_points = EXCLUDED.entry_points,
        database_indicators = EXCLUDED.database_indicators,
        architectural_roles = EXCLUDED.architectural_roles,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return rows[0];
  },

  /**
   * Find project metadata for a repository with strict multi-tenant authorization
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT *
      FROM project_metadata
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      LIMIT 1;
    `;

    return rows[0] || null;
  },

  /**
   * Delete project metadata for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async deleteByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const deleted = await sql`
      DELETE FROM project_metadata
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      RETURNING id;
    `;

    return deleted.length;
  }
};
