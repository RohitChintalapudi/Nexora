import { getSQL } from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');
    
    const rows = await sql`
      SELECT id, name, email, password, google_id, github_id, avatar_url, created_at
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
      SELECT id, name, email, password, google_id, github_id, avatar_url, created_at
      FROM users
      WHERE id = ${id}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  async updatePassword(id, hashedPassword) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    const rows = await sql`
      UPDATE users
      SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, google_id, github_id, avatar_url, created_at;
    `;
    return rows[0] || null;
  },

  async findByGoogleId(googleId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    const rows = await sql`
      SELECT id, name, email, avatar_url, google_id, created_at
      FROM users
      WHERE google_id = ${googleId}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  async findByGithubId(githubId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    const rows = await sql`
      SELECT id, name, email, avatar_url, github_id, created_at
      FROM users
      WHERE github_id = ${githubId}
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
  },

  async upsertGoogleUser({ name, email, googleId, avatarUrl }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    // Check if user exists by email
    const existing = await sql`
      SELECT id, name, email, google_id, avatar_url, created_at
      FROM users
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1;
    `;

    if (existing[0]) {
      // Update google_id and avatar if not present
      const updated = await sql`
        UPDATE users
        SET 
          google_id = COALESCE(google_id, ${googleId}),
          avatar_url = COALESCE(avatar_url, ${avatarUrl || null}),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING id, name, email, avatar_url, google_id, created_at;
      `;
      return updated[0];
    }

    // Insert new Google user
    const created = await sql`
      INSERT INTO users (name, email, google_id, avatar_url)
      VALUES (${name.trim()}, ${email.trim().toLowerCase()}, ${googleId}, ${avatarUrl || null})
      RETURNING id, name, email, avatar_url, google_id, created_at;
    `;
    return created[0];
  },

  async upsertGithubUser({ name, email, githubId, avatarUrl }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please set DATABASE_URL.');

    // Check if user exists by email
    const existing = await sql`
      SELECT id, name, email, github_id, avatar_url, created_at
      FROM users
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1;
    `;

    if (existing[0]) {
      // Update github_id and avatar if not present
      const updated = await sql`
        UPDATE users
        SET 
          github_id = COALESCE(github_id, ${githubId}),
          avatar_url = COALESCE(avatar_url, ${avatarUrl || null}),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING id, name, email, avatar_url, github_id, created_at;
      `;
      return updated[0];
    }

    // Insert new GitHub user
    const created = await sql`
      INSERT INTO users (name, email, github_id, avatar_url)
      VALUES (${name.trim()}, ${email.trim().toLowerCase()}, ${githubId}, ${avatarUrl || null})
      RETURNING id, name, email, avatar_url, github_id, created_at;
    `;
    return created[0];
  }
};
