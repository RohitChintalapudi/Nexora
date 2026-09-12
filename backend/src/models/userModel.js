import { getSQL } from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');
    
    const rows = await sql`
      SELECT id, name, email, password, created_at
      FROM users
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  async findById(id) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    const rows = await sql`
      SELECT id, name, email, created_at
      FROM users
      WHERE id = ${id}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  async create({ name, email, password }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    const rows = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name.trim()}, ${email.trim().toLowerCase()}, ${password})
      RETURNING id, name, email, created_at;
    `;
    return rows[0];
  }
};
