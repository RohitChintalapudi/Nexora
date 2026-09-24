import { getSQL } from '../config/db.js';

export const FeedbackModel = {
  async create({ userId, happiness, feedback, page }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    const rows = await sql`
      INSERT INTO user_feedback (user_id, happiness, feedback, page)
      VALUES (${userId}, ${happiness}, ${feedback}, ${page || 'dashboard'})
      RETURNING id, user_id, happiness, feedback, page, created_at;
    `;
    return rows[0] || null;
  },

  async listByUser(userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    const rows = await sql`
      SELECT id, user_id, happiness, feedback, page, created_at
      FROM user_feedback
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
    return rows;
  }
};