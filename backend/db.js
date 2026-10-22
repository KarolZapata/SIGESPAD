
const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const configuracion = {
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306)
};

// SSL para Aiven
if (process.env.DB_SSL === "true") {
    const certificado = process.env.DB_CA_CERT
        ? process.env.DB_CA_CERT.replace(/\\n/g, "\n")
        : fs.readFileSync(
            process.env.DB_CA_PATH ||
            path.join(__dirname, "../database/ca.pem"),
            "utf8"
        );

    configuracion.ssl = {
        ca: certificado,
        rejectUnauthorized: true
    };
}

const conexion = mysql.createConnection(configuracion);

conexion.connect((error) => {
    if (error) {
        console.error("Error al conectar con MySQL:", error.message);
        return;
    }

    console.log("Conexión con MySQL establecida correctamente.");
});

module.exports = conexion;
