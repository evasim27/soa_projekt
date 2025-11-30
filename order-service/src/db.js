const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'order-db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'orderdb'
});

async function ensureSchema() {
    const create = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    qr_image TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  );
  `;
    await pool.query(create);
}

module.exports = { pool, ensureSchema };