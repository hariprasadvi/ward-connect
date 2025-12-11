const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

if (!connectionString) {
    console.error("Error: DB_CONNECTION_STRING is missing in .env");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
