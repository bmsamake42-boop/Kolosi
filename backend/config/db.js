const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const configuration = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Activer SSL uniquement lorsque cela est demandé
if (process.env.DB_SSL === "true") {
    const caPath =
        process.env.DB_CA_PATH ||
        path.join(__dirname, "../certificates/ca.pem");

    configuration.ssl = {
        ca: fs.readFileSync(caPath, "utf8"),
        rejectUnauthorized: true
    };
}

const pool = mysql.createPool(configuration);

module.exports = pool;