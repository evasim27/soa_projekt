const pool = require("../db/db.js");

const UsersModel = {
  getAll: async () => {
    const q = await pool.query("SELECT id, email, name, role FROM users");
    return q.rows;
  },

  getById: async (id) => {
    const q = await pool.query(
      "SELECT id, email, name, role FROM users WHERE id=$1",
      [id]
    );
    return q.rows[0];
  },

  getRole: async (id) => {
    const q = await pool.query(
      "SELECT role FROM users WHERE id=$1",
      [id]
    );
    return q.rows[0];
  },

  findByEmail: async (email) => {
    const q = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    return q.rows[0];
  },

  create: async ({ email, password, name, role }) => {
    const q = await pool.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [email, password, name, role]
    );
    return q.rows[0];
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(data.name);
    }

    if (data.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(data.email);
    }

    if (fields.length === 0) {
        return null; // ali error, če želiš
    }

    const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING id, email, name, role
    `;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  updateRole: async (id, role) => {
    const q = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, email, name, role`,
      [role, id]
    );
    return q.rows[0];
    },

    delete: async (id) => {
    await pool.query(
      "DELETE FROM users WHERE id = $1",
      [id]
    );
    },


};

module.exports = UsersModel;
