require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
  ssl: false // Explicitly disable SSL to see raw error. Set to true if remote requires it.
});

console.log('Attempting connection with config:');
console.log(`User: ${process.env.DB_USER}`);
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`Password: ${process.env.DB_PASS ? '******' : '(none)'}`);

client.connect()
  .then(() => {
    console.log('Connection successful!');
    client.end();
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    if (err.code) console.error('Error Code:', err.code);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
    client.end();
  });
