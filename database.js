const mysql = require("mysql2");

console.log("=== DATABASE CONFIG ===");
console.log("DB_HOST:", process.env.DB_HOST || "localhost (DEFAULT)");
console.log("DB_PORT:", process.env.DB_PORT || "3306 (DEFAULT)");
console.log("DB_USER:", process.env.DB_USER || "root (DEFAULT)");
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD ? "***SET***" : "EMPTY (DEFAULT)",
);
console.log("DB_NAME:", process.env.DB_NAME || "URL_Shortner (DEFAULT)");
console.log("=======================");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "URL_Shortner",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to mysql database server", error);
  } else {
    console.log("Connected to MySQL Dabatabse!");
  }
});

module.exports = connection;
