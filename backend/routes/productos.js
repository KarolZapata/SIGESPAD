const express = require("express");
const router = express.Router();

const conexion = require("../db");

const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");


// =====================================================
// GET - Obtener todos los productos
// USUARIO AUTENTICADO
// =====================================================
router.get(
    "/",
    verificarToken,
    (req, res) => {

        const sql = `
            SELECT *
            FROM productos
            ORDER BY id_producto DESC
        `;

        conexion.query(
            sql,
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar productos:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener los productos"
                    });
                }

                res.json(resultados);
            }
        );
    }
);

// =====================================================
// GET - PRODUCTOS PÚBLICOS
// No requiere autenticación
// =====================================================
router.get(
    "/publicos",
    (req, res) => {

        const sql = `
            SELECT
                id_producto,
                nombre,
                descripcion,
                categoria,
                precio,
                precio_mayorista,
                stock,
                estado
            FROM productos
            WHERE estado = 1
            ORDER BY nombre ASC
        `;

        conexion.query(
            sql,
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al obtener productos públicos:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al obtener los productos"
                    });
                }

                res.json(resultados);
            }
        );
    }
);

// =====================================================
// GET - Obtener producto por ID
// USUARIO AUTENTICADO
// =====================================================
router.get(
    "/:id",
    verificarToken,
    (req, res) => {

        const { id } = req.params;

        const sql = `
            SELECT *
            FROM productos
            WHERE id_producto = ?
        `;

        conexion.query(
            sql,
            [id],
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar producto:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener el producto"
                    });
                }

                if (resultados.length === 0) {
                    return res.status(404).json({
                        error: "Producto no encontrado"
                    });
                }

                res.json(resultados[0]);
            }
        );
    }
);


// =====================================================
// POST - Crear producto
// SOLO ADMINISTRADOR
// =====================================================
router.post(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const {
            nombre,
            descripcion,
            categoria,
            precio,
            stock,
            stock_minimo
        } = req.body;


        // Validar nombre y precio
        if (!nombre || precio === undefined) {
            return res.status(400).json({
                error: "El nombre y el precio son obligatorios"
            });
        }


        // Validar precio
        if (Number(precio) < 0) {
            return res.status(400).json({
                error: "El precio no puede ser negativo"
            });
        }


        // Validar stock
        if (
            stock !== undefined &&
            Number(stock) < 0
        ) {
            return res.status(400).json({
                error: "El stock no puede ser negativo"
            });
        }


        // Validar stock mínimo
        if (
            stock_minimo !== undefined &&
            Number(stock_minimo) < 0
        ) {
            return res.status(400).json({
                error: "El stock mínimo no puede ser negativo"
            });
        }


        const sql = `
            INSERT INTO productos
            (
                nombre,
                descripcion,
                categoria,
                precio,
                stock,
                stock_minimo
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;


        const valores = [
            nombre,
            descripcion || null,
            categoria || null,
            Number(precio),
            stock !== undefined
                ? Number(stock)
                : 0,
            stock_minimo !== undefined
                ? Number(stock_minimo)
                : 5
        ];


        conexion.query(
            sql,
            valores,
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al crear producto:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al crear el producto"
                    });
                }


                res.status(201).json({
                    mensaje:
                        "Producto creado correctamente",
                    id_producto:
                        resultado.insertId
                });
            }
        );
    }
);


// =====================================================
// PUT - Actualizar producto
// SOLO ADMINISTRADOR
// =====================================================
router.put(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;

        const {
            nombre,
            descripcion,
            categoria,
            precio,
            stock,
            stock_minimo
        } = req.body;


        // Validar campos obligatorios
        if (!nombre || precio === undefined) {
            return res.status(400).json({
                error:
                    "El nombre y el precio son obligatorios"
            });
        }


        // Validar precio
        if (Number(precio) < 0) {
            return res.status(400).json({
                error:
                    "El precio no puede ser negativo"
            });
        }


        // Validar stock
        if (
            stock === undefined ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                error:
                    "El stock no puede ser negativo"
            });
        }


        // Validar stock mínimo
        if (
            stock_minimo === undefined ||
            Number(stock_minimo) < 0
        ) {
            return res.status(400).json({
                error:
                    "El stock mínimo no puede ser negativo"
            });
        }


        const sql = `
            UPDATE productos
            SET
                nombre = ?,
                descripcion = ?,
                categoria = ?,
                precio = ?,
                stock = ?,
                stock_minimo = ?
            WHERE id_producto = ?
        `;


        const valores = [
            nombre,
            descripcion || null,
            categoria || null,
            Number(precio),
            Number(stock),
            Number(stock_minimo),
            id
        ];


        conexion.query(
            sql,
            valores,
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al actualizar producto:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al actualizar el producto"
                    });
                }


                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        error:
                            "Producto no encontrado"
                    });
                }


                res.json({
                    mensaje:
                        "Producto actualizado correctamente"
                });
            }
        );
    }
);


// =====================================================
// DELETE - Desactivar producto
// SOLO ADMINISTRADOR
// =====================================================
router.delete(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;


        const sql = `
            UPDATE productos
            SET estado = 0
            WHERE id_producto = ?
        `;


        conexion.query(
            sql,
            [id],
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al desactivar producto:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al desactivar el producto"
                    });
                }


                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        error:
                            "Producto no encontrado"
                    });
                }


                res.json({
                    mensaje:
                        "Producto desactivado correctamente"
                });
            }
        );
    }
);


// =====================================================
// PUT - Activar producto
// SOLO ADMINISTRADOR
// =====================================================
router.put(
    "/:id/activar",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;


        const sql = `
            UPDATE productos
            SET estado = 1
            WHERE id_producto = ?
        `;


        conexion.query(
            sql,
            [id],
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al activar producto:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al activar el producto"
                    });
                }


                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        error:
                            "Producto no encontrado"
                    });
                }


                res.json({
                    mensaje:
                        "Producto activado correctamente"
                });
            }
        );
    }
);


// =====================================================
// GET - Productos con stock bajo
// USUARIO AUTENTICADO
// =====================================================
router.get(
    "/inventario/stock-bajo",
    verificarToken,
    (req, res) => {

        const sql = `
            SELECT
                id_producto,
                nombre,
                categoria,
                precio,
                stock,
                stock_minimo,
                estado
            FROM productos
            WHERE estado = 1
            AND stock <= stock_minimo
            ORDER BY stock ASC
        `;


        conexion.query(
            sql,
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar stock bajo:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al obtener productos con stock bajo"
                    });
                }


                res.json(resultados);
            }
        );
    }
);


module.exports = router;