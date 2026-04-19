require("dotenv").config();
const mysql = require("mysql2");

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
