const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const referenceTable = require("./referenceTable");

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

module.exports = async (app, db) => {
  console.log("BASE_URL:", BASE_URL);
  
  // Middlewares
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cors({ origin: "*" }));
  app.use(express.static(__dirname + "/public"));

  // GET /:hashValue — redirect to original URL
  app.get("/chotakar/:hashValue", (req, res) => {
    const shortUrl = BASE_URL + "/chotakar/" + req.params.hashValue;

    db.query(
      "SELECT longUrl FROM Container WHERE shortUrl = ?",
      [shortUrl],
      (err, rows) => {
        if (err) {
          console.error("DB error on redirect:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        if (!rows || rows.length === 0) {
          return res.status(404).json({ message: "Short URL not found" });
        }
        res.redirect(rows[0].longUrl);
      }
    );
  });

  // POST /postUrl — shorten a new URL
  app.post("/chotakar/postUrl", (req, res) => {
    const ogUrl = req.body.url;

    if (!ogUrl) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Check if this URL has already been shortened
    db.query(
      "SELECT shortUrl FROM Container WHERE longUrl = ?",
      [ogUrl],
      (err, rows) => {
        if (err) {
          console.error("DB error on SELECT:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (rows.length > 0) {
          // Already exists — return the existing short URL
          return res.status(200).json({
            message: "URL already shortified!",
            shortUrl: rows[0].shortUrl,
            longUrl: ogUrl,
          });
        }

        // Generate a new short URL
        const uuid = uuidv4();
        var numericID = 1;
        for (let i = 0; i < uuid.length; i++) {
          let ch = uuid[i];
          let val = ch.charCodeAt(0);
          if (val >= 48 && val <= 57) {
            numericID += val - 48;
          } else if (val >= 65 && val <= 90) {
            numericID += val - 65 + 11;
          } else if (val >= 97 && val <= 122) {
            numericID += val - 97 + 73;
          }
        }
        const salt = Math.ceil(Math.random() * 100) * 23 * 7;
        numericID = numericID * salt;

        // Base62 conversion
        var genHashVal = "";
        let dummyId = numericID;
        while (dummyId > 0) {
          const rem = dummyId % 62;
          genHashVal += referenceTable[rem];
          dummyId = Math.floor(dummyId / 62);
        }

        const shortUrl = BASE_URL + "/chotakar/" + genHashVal;

        // Insert into DB
        db.query(
          "INSERT INTO Container (longUrl, shortUrl) VALUES (?)",
          [[ogUrl, shortUrl]],
          (err) => {
            if (err) {
              console.error("DB error on INSERT:", err);
              return res.status(500).json({ message: "Failed to save URL" });
            }
            return res.status(200).json({
              message: "Inserted the new URL",
              shortUrl: shortUrl,
              longUrl: ogUrl,
            });
          }
        );
      }
    );
  });
};
