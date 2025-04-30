const mysql = require('mysql2');
require('dotenv').config();

// ✅ Create connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Rupas@1234',
  database: 'online_voting'
});

// ✅ Connect and handle errors
db.connect((err) => {
  if (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL DB');
});

module.exports = db;
