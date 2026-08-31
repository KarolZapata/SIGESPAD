const mysql = require("mysql2");

const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "SIGESPAD"
});

conexion.connect((error) => {
    if (error) {
        console.error("Error al conectar con MySQL:", error.message);
        return;
    }

    console.log("Conexión con MySQL establecida correctamente.");
});

module.exports = conexion;