import { getSQL } from '../config/db.js';

export const GithubAccountModel = {
  /**
   * Find GitHub account details associated with a NEXORA user ID
   * @param {number|string} userId
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id, 
        user_id, 
        github_user_id, 
        username, 
        access_token, 
        refresh_token, 
        token_expires_at, 
        scopes, 
        created_at, 
        updated_at
      FROM github_accounts
      WHERE user_id = ${userId}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  /**
   * Securely upsert GitHub authorization record for an authenticated user
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async upsert({
    userId,
    githubUserId,
    username,
    accessToken,
    refreshToken = null,
    tokenExpiresAt = null,
    scopes = 'repo,read:user,user:email'
  }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      INSERT INTO github_accounts (
        user_id,
        github_user_id,
        username,
        access_token,
        refresh_token,
        token_expires_at,
        scopes,
        updated_at
      )
      VALUES (
        ${userId},
        ${String(githubUserId)},
        ${username},
        ${accessToken},
        ${refreshToken},
        ${tokenExpiresAt},
        ${scopes},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        github_user_id = EXCLUDED.github_user_id,
        username = EXCLUDED.username,
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, github_accounts.refresh_token),
        token_expires_at = COALESCE(EXCLUDED.token_expires_at, github_accounts.token_expires_at),
        scopes = EXCLUDED.scopes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, github_user_id, username, scopes, created_at, updated_at;
    `;

    return rows[0];
  },

  /**
   * Remove GitHub connection record for an authenticated user
   * @param {number|string} userId
   * @returns {Promise<boolean>}
   */
  async deleteByUserId(userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const result = await sql`
      DELETE FROM github_accounts
      WHERE user_id = ${userId}
      RETURNING id;
    `;

    return result.length > 0;
  }
};
