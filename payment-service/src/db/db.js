const { Pool } = require("pg");
require("dotenv").config();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432
};

const pool = new Pool(config);

async function waitForDB() {
  for (let i = 0; i < 10; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("Connected to PostgreSQL");
      return;
    } catch (err) {
      console.log("DB not ready — retrying in 2 seconds...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  throw new Error("Could not connect to PostgreSQL");
}

waitForDB();

module.exports = pool;