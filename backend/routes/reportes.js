const express = require("express");
const router = express.Router();

const conexion = require("../db");

const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");


// =====================================================
// GET - RESUMEN GENERAL
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/resumen",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const sql = `
            SELECT
                (SELECT COUNT(*)
                 FROM usuarios
                 WHERE estado = 1) AS usuarios_activos,

                (SELECT COUNT(*)
                 FROM productos
                 WHERE estado = 1) AS productos_activos,

                (SELECT COUNT(*)
                 FROM categorias
                 WHERE estado = 1) AS categorias_activas,

                (SELECT COUNT(*)
                 FROM ventas) AS total_ventas,

                (SELECT COALESCE(SUM(total), 0)
                 FROM ventas
                 WHERE estado = 'COMPLETADA') AS ingresos_totales,

                (SELECT COUNT(*)
                 FROM productos
                 WHERE estado = 1
                 AND stock <= stock_minimo) AS productos_stock_bajo
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {
                console.error(
                    "Error al obtener resumen:",
                    error.message
                );

                return res.status(500).json({
                    error: "Error al obtener el resumen general"
                });
            }

            res.json(resultados[0]);
        });
    }
);


// =====================================================
// GET - VENTAS POR PERÍODO
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/ventas",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const {
            fecha_inicio,
            fecha_fin
        } = req.query;

        let sql = `
            SELECT
                DATE(v.fecha_venta) AS fecha,
                COUNT(v.id_venta) AS cantidad_ventas,
                COALESCE(SUM(v.total), 0) AS total_ventas
            FROM ventas v
            WHERE v.estado = 'COMPLETADA'
        `;

        const parametros = [];

        if (fecha_inicio) {
            sql += ` AND DATE(v.fecha_venta) >= ?`;
            parametros.push(fecha_inicio);
        }

        if (fecha_fin) {
            sql += ` AND DATE(v.fecha_venta) <= ?`;
            parametros.push(fecha_fin);
        }

        sql += `
            GROUP BY DATE(v.fecha_venta)
            ORDER BY fecha DESC
        `;

        conexion.query(
            sql,
            parametros,
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar ventas:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al obtener el reporte de ventas"
                    });
                }

                res.json(resultados);
            }
        );
    }
);


// =====================================================
// GET - PRODUCTOS CON STOCK BAJO
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/stock-bajo",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
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

        conexion.query(sql, (error, resultados) => {

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
        });
    }
);


// =====================================================
// GET - PRODUCTOS MÁS VENDIDOS
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/productos-mas-vendidos",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const sql = `
            SELECT
                p.id_producto,
                p.nombre,
                p.categoria,
                SUM(d.cantidad) AS cantidad_vendida,
                SUM(d.subtotal) AS total_generado
            FROM detalle_venta d

            INNER JOIN productos p
                ON d.id_producto = p.id_producto

            INNER JOIN ventas v
                ON d.id_venta = v.id_venta

            WHERE v.estado = 'COMPLETADA'

            GROUP BY
                p.id_producto,
                p.nombre,
                p.categoria

            ORDER BY cantidad_vendida DESC

            LIMIT 10
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {
                console.error(
                    "Error al consultar productos vendidos:",
                    error.message
                );

                return res.status(500).json({
                    error:
                        "Error al obtener productos más vendidos"
                });
            }

            res.json(resultados);
        });
    }
);


// =====================================================
// GET - VENTAS POR MÉTODO DE PAGO
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/pagos",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const sql = `
            SELECT
                p.tipo_pago,
                COUNT(p.id_pago) AS cantidad_pagos,
                COALESCE(SUM(p.monto), 0) AS total_recaudado
            FROM pagos p

            INNER JOIN ventas v
                ON p.id_venta = v.id_venta

            WHERE p.estado = 'CONFIRMADO'
            AND v.estado = 'COMPLETADA'

            GROUP BY p.tipo_pago

            ORDER BY total_recaudado DESC
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {
                console.error(
                    "Error al consultar pagos:",
                    error.message
                );

                return res.status(500).json({
                    error:
                        "Error al obtener el reporte de pagos"
                });
            }

            res.json(resultados);
        });
    }
);


// =====================================================
// GET - VENTAS POR VENDEDOR
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/vendedores",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const sql = `
            SELECT
                u.id_usuario,
                u.nombre AS vendedor,
                COUNT(v.id_venta) AS cantidad_ventas,
                COALESCE(SUM(v.total), 0) AS total_vendido
            FROM usuarios u

            INNER JOIN ventas v
                ON u.id_usuario = v.id_usuario

            WHERE u.rol = 'VENDEDOR'
            AND v.estado = 'COMPLETADA'

            GROUP BY
                u.id_usuario,
                u.nombre

            ORDER BY total_vendido DESC
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {
                console.error(
                    "Error al consultar ventas por vendedor:",
                    error.message
                );

                return res.status(500).json({
                    error:
                        "Error al obtener ventas por vendedor"
                });
            }

            res.json(resultados);
        });
    }
);


module.exports = router;