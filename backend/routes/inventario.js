
const express = require("express");
const router = express.Router();
const conexion = require("../db");

const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");

// =====================================================
// GET - Consultar existencias de productos
// USUARIO AUTENTICADO
// =====================================================
router.get("/", verificarToken, (req, res) => {
    const sql = `
        SELECT
            id_producto,
            codigo,
            nombre,
            categoria,
            stock,
            stock_minimo,
            estado,
            CASE
                WHEN stock <= stock_minimo THEN 1
                ELSE 0
            END AS stock_bajo
        FROM productos
        ORDER BY nombre ASC
    `;

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al consultar inventario:", error.message);
            return res.status(500).json({
                error: "Error al consultar el inventario"
            });
        }

        res.json(resultados);
    });
});

// =====================================================
// GET - Consultar historial de movimientos
// USUARIO AUTENTICADO
// =====================================================
router.get("/movimientos", verificarToken, (req, res) => {
    const sql = `
        SELECT
            m.id_movimiento,
            m.id_producto,
            p.codigo,
            p.nombre AS producto,
            m.tipo,
            m.cantidad,
            m.stock_anterior,
            m.stock_nuevo,
            m.motivo,
            m.fecha_movimiento,
            m.id_venta
        FROM movimientos_inventario m
        INNER JOIN productos p
            ON m.id_producto = p.id_producto
        ORDER BY m.fecha_movimiento DESC,
                 m.id_movimiento DESC
    `;

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al consultar movimientos:", error.message);
            return res.status(500).json({
                error: "Error al consultar los movimientos"
            });
        }

        res.json(resultados);
    });
});

// =====================================================
// POST - Registrar entrada o salida manual
// SOLO ADMINISTRADOR
// =====================================================
router.post(
    "/movimientos",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {
        const {
            id_producto,
            tipo,
            cantidad,
            motivo
        } = req.body;

        const idProducto = Number(id_producto);
        const cantidadMovimiento = Number(cantidad);

        if (
            !Number.isInteger(idProducto) ||
            idProducto <= 0
        ) {
            return res.status(400).json({
                error: "El producto seleccionado no es válido"
            });
        }

        if (!["ENTRADA", "SALIDA"].includes(tipo)) {
            return res.status(400).json({
                error: "El tipo debe ser ENTRADA o SALIDA"
            });
        }

        if (
            !Number.isInteger(cantidadMovimiento) ||
            cantidadMovimiento <= 0
        ) {
            return res.status(400).json({
                error: "La cantidad debe ser un entero mayor que cero"
            });
        }

        conexion.beginTransaction((error) => {
            if (error) {
                return res.status(500).json({
                    error: "No se pudo iniciar la operación"
                });
            }

            // Bloquear el registro mientras se actualiza
            const sqlProducto = `
                SELECT stock
                FROM productos
                WHERE id_producto = ?
                AND estado = 1
                FOR UPDATE
            `;

            conexion.query(
                sqlProducto,
                [idProducto],
                (error, resultados) => {
                    if (error) {
                        return conexion.rollback(() => {
                            res.status(500).json({
                                error: "Error al consultar el producto"
                            });
                        });
                    }

                    if (resultados.length === 0) {
                        return conexion.rollback(() => {
                            res.status(404).json({
                                error: "Producto no encontrado o inactivo"
                            });
                        });
                    }

                    const stockAnterior = Number(resultados[0].stock);

                    const stockNuevo =
                        tipo === "ENTRADA"
                            ? stockAnterior + cantidadMovimiento
                            : stockAnterior - cantidadMovimiento;

                    if (stockNuevo < 0) {
                        return conexion.rollback(() => {
                            res.status(400).json({
                                error: "No hay existencias suficientes para esta salida"
                            });
                        });
                    }

                    const sqlActualizar = `
                        UPDATE productos
                        SET stock = ?
                        WHERE id_producto = ?
                    `;

                    conexion.query(
                        sqlActualizar,
                        [stockNuevo, idProducto],
                        (error) => {
                            if (error) {
                                return conexion.rollback(() => {
                                    res.status(500).json({
                                        error: "No se pudo actualizar el stock"
                                    });
                                });
                            }

                            const sqlMovimiento = `
                                INSERT INTO movimientos_inventario
                                (
                                    id_producto,
                                    tipo,
                                    cantidad,
                                    stock_anterior,
                                    stock_nuevo,
                                    motivo
                                )
                                VALUES (?, ?, ?, ?, ?, ?)
                            `;

                            conexion.query(
                                sqlMovimiento,
                                [
                                    idProducto,
                                    tipo,
                                    cantidadMovimiento,
                                    stockAnterior,
                                    stockNuevo,
                                    motivo?.trim() || null
                                ],
                                (error, resultado) => {
                                    if (error) {
                                        return conexion.rollback(() => {
                                            res.status(500).json({
                                                error: "No se pudo guardar el movimiento"
                                            });
                                        });
                                    }

                                    conexion.commit((error) => {
                                        if (error) {
                                            return conexion.rollback(() => {
                                                res.status(500).json({
                                                    error: "No se pudo completar el movimiento"
                                                });
                                            });
                                        }

                                        res.status(201).json({
                                            mensaje: "Movimiento registrado correctamente",
                                            id_movimiento: resultado.insertId,
                                            id_producto: idProducto,
                                            tipo,
                                            cantidad: cantidadMovimiento,
                                            stock_anterior: stockAnterior,
                                            stock_nuevo: stockNuevo
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    }
);

module.exports = router;