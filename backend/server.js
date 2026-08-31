const express = require("express");
const conexion = require("./db");
const productosRoutes = require("./routes/productos");
const usuariosRoutes = require("./routes/usuarios");
const ventasRoutes = require("./routes/ventas");
const pagosRoutes = require("./routes/pagos");
const categoriasRoutes = require("./routes/categorias");

const {
    verificarToken,
    verificarRol
} = require("./middleware/auth");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/categorias", categoriasRoutes);

app.get("/", (req, res) => {
    res.json({
        mensaje: "Backend de SIGESPAD funcionando correctamente"
    });
});

// =====================================================
// RUTA DE PRUEBA - Usuario autenticado
// =====================================================
app.get("/api/auth/verificar", verificarToken, (req, res) => {
    res.json({
        mensaje: "Autenticación correcta",
        usuario: req.usuario
    });
});


// =====================================================
// RUTA DE PRUEBA - Solo administrador
// =====================================================
app.get(
    "/api/auth/admin",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {
        res.json({
            mensaje: "Acceso autorizado para administrador",
            usuario: req.usuario
        });
    }
);

app.listen(PORT, () => {
    console.log(`Servidor SIGESPAD ejecutándose en http://localhost:${PORT}`);
});