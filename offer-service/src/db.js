const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'offer-db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'offerdb'
});

async function ensureSchema() {
    const create = `
  CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    price NUMERIC DEFAULT 0,
    location TEXT,
    image TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  );
  `;
    await pool.query(create);
}

module.exports = { pool, ensureSchema };