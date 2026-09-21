require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const conexion = require("./db");
const productosRoutes = require("./routes/productos");
const usuariosRoutes = require("./routes/usuarios");
const ventasRoutes = require("./routes/ventas");
const pagosRoutes = require("./routes/pagos");
const categoriasRoutes = require("./routes/categorias");
const reportesRoutes = require("./routes/reportes");
const inventarioRoutes = require("./routes/inventario");

const {
    verificarToken,
    verificarRol
} = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =====================================================
// IMÁGENES DE PRODUCTOS
// =====================================================
app.use(
    "/imagenes-productos",
    express.static(
        path.join(__dirname, "../Catalogo/imagenes_productos")
    )
);

// =====================================================
// RUTAS DE LA API
// =====================================================
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/inventario", inventarioRoutes);

app.get("/", (req, res) => {
    res.json({
        mensaje: "Backend de SIGESPAD funcionando correctamente"
    });
});

// =====================================================
// RUTA DE PRUEBA - Usuario autenticado
// =====================================================
app.get(
    "/api/auth/verificar",
    verificarToken,
    (req, res) => {
        res.json({
            mensaje: "Autenticación correcta",
            usuario: req.usuario
        });
    }
);

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

// =====================================================
// INICIAR SERVIDOR
// =====================================================
app.listen(PORT, () => {
    console.log(
        `Servidor SIGESPAD ejecutándose en http://localhost:${PORT}`
    );
});