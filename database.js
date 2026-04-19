const mysql = require("mysql2");

console.log("=== DATABASE CONFIG ===");
console.log("DB_HOST:", process.env.DB_HOST || "localhost (DEFAULT)");
console.log("DB_PORT:", process.env.DB_PORT || "3306 (DEFAULT)");
console.log("DB_USER:", process.env.DB_USER || "root (DEFAULT)");
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "EMPTY (DEFAULT)");
console.log("DB_NAME:", process.env.DB_NAME || "URL_Shortner (DEFAULT)");
console.log("=======================");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "URL_Shortner",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection on startup
pool.getConnection((error, conn) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error.message);
  } else {
    console.log("Connected to MySQL Database!");
    conn.release();
  }
});

module.exports = pool;
