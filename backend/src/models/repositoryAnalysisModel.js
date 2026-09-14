import { getSQL } from '../config/db.js';

export const RepositoryAnalysisModel = {
  /**
   * Upsert a structured repository analysis record
   * @param {Object} data
   * @param {number|string} data.repositoryId
   * @param {number|string} data.userId
   * @param {number|string} [data.jobId]
   * @param {string} [data.commitSha]
   * @param {string} data.overview
   * @param {Array} [data.technologyStack]
   * @param {Object} [data.architecture]
   * @param {Array} [data.modules]
   * @param {Array} [data.applicationFlow]
   * @param {Array} [data.entryPoints]
   * @param {Array} [data.importantFiles]
   * @param {Array} [data.dependencies]
   * @param {Object} [data.database]
   * @param {Array} [data.apiStructure]
   * @param {Array} [data.developerQuickStart]
   * @param {Array} [data.uncertainties]
   * @returns {Promise<Object>}
   */
  async upsert({
    repositoryId,
    userId,
    jobId = null,
    commitSha = null,
    overview = '',
    technologyStack = [],
    architecture = {},
    modules = [],
    applicationFlow = [],
    entryPoints = [],
    importantFiles = [],
    dependencies = [],
    database = {},
    apiStructure = [],
    developerQuickStart = [],
    uncertainties = []
  }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      INSERT INTO repository_analyses (
        repository_id,
        user_id,
        job_id,
        commit_sha,
        overview,
        technology_stack,
        architecture,
        modules,
        application_flow,
        entry_points,
        important_files,
        dependencies,
        database,
        api_structure,
        developer_quick_start,
        uncertainties,
        updated_at
      )
      VALUES (
        ${repositoryId},
        ${userId},
        ${jobId},
        ${commitSha},
        ${overview},
        ${JSON.stringify(technologyStack)}::jsonb,
        ${JSON.stringify(architecture)}::jsonb,
        ${JSON.stringify(modules)}::jsonb,
        ${JSON.stringify(applicationFlow)}::jsonb,
        ${JSON.stringify(entryPoints)}::jsonb,
        ${JSON.stringify(importantFiles)}::jsonb,
        ${JSON.stringify(dependencies)}::jsonb,
        ${JSON.stringify(database)}::jsonb,
        ${JSON.stringify(apiStructure)}::jsonb,
        ${JSON.stringify(developerQuickStart)}::jsonb,
        ${JSON.stringify(uncertainties)}::jsonb,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (repository_id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        job_id = EXCLUDED.job_id,
        commit_sha = EXCLUDED.commit_sha,
        overview = EXCLUDED.overview,
        technology_stack = EXCLUDED.technology_stack,
        architecture = EXCLUDED.architecture,
        modules = EXCLUDED.modules,
        application_flow = EXCLUDED.application_flow,
        entry_points = EXCLUDED.entry_points,
        important_files = EXCLUDED.important_files,
        dependencies = EXCLUDED.dependencies,
        database = EXCLUDED.database,
        api_structure = EXCLUDED.api_structure,
        developer_quick_start = EXCLUDED.developer_quick_start,
        uncertainties = EXCLUDED.uncertainties,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return rows[0];
  },

  /**
   * Find analysis for a repository with strict user ownership isolation
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT *
      FROM repository_analyses
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      LIMIT 1;
    `;

    return rows[0] || null;
  },

  /**
   * Find analysis by Job ID with strict user ownership isolation
   * @param {number|string} jobId
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findByJobId(jobId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT *
      FROM repository_analyses
      WHERE job_id = ${jobId} AND user_id = ${userId}
      LIMIT 1;
    `;

    return rows[0] || null;
  },

  /**
   * Delete analysis for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async deleteByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      DELETE FROM repository_analyses
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      RETURNING id;
    `;

    return rows.length;
  }
};

export { RepositoryAnalysisModel as repositoryAnalysisModel };
export default RepositoryAnalysisModel;
