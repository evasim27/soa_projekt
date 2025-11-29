const pool = require("../db/db.js");

const PaymentModel = {
  create: async (paymentData) => {
    const {
      order_id,
      user_id,
      amount,
      currency,
      status,
      card_brand,
      card_last_four,
      expiry_month,
      expiry_year,
      validation_result,
      metadata
    } = paymentData;

    const query = `
      INSERT INTO payments 
      (order_id, user_id, amount, currency, status, card_brand, card_last_four, 
       expiry_month, expiry_year, validation_result, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      order_id || null,
      user_id || null,
      amount,
      currency || "EUR",
      status || "pending",
      card_brand || null,
      card_last_four || null,
      expiry_month || null,
      expiry_year || null,
      validation_result ? JSON.stringify(validation_result) : null,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  getById: async (id) => {
    const query = "SELECT * FROM payments WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  getByOrderId: async (orderId) => {
    const query = "SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [orderId]);
    return result.rows;
  },

  getByUserId: async (userId, limit = 50, offset = 0) => {
    const query = `
      SELECT * FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }

    if (updates.validation_result !== undefined) {
      fields.push(`validation_result = $${paramIndex++}`);
      values.push(JSON.stringify(updates.validation_result));
    }

    if (updates.metadata !== undefined) {
      fields.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(updates.metadata));
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE payments 
      SET ${fields.join(", ")} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

module.exports = PaymentModel;