const express = require("express");
const conexion = require("./db");
const productosRoutes = require("./routes/productos");
const usuariosRoutes = require("./routes/usuarios");
const ventasRoutes = require("./routes/ventas");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ventas", ventasRoutes);

app.get("/", (req, res) => {
    res.json({
        mensaje: "Backend de SIGESPAD funcionando correctamente"
    });
});

app.listen(PORT, () => {
    console.log(`Servidor SIGESPAD ejecutándose en http://localhost:${PORT}`);
});