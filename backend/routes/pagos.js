const express = require("express");
const router = express.Router();

const conexion = require("../db");

const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");


// ======================================================
// GET - OBTENER TODOS LOS PAGOS
// ADMINISTRADOR Y VENDEDOR
// ======================================================
router.get(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const sql = `
            SELECT
                p.id_pago,
                p.id_venta,
                u.nombre AS usuario,
                p.tipo_pago,
                p.monto,
                p.estado,
                p.fecha_pago
            FROM pagos p
            INNER JOIN ventas v
                ON p.id_venta = v.id_venta
            INNER JOIN usuarios u
                ON v.id_usuario = u.id_usuario
            ORDER BY p.id_pago DESC
        `;

        conexion.query(
            sql,
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar pagos:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener los pagos"
                    });
                }

                res.json(resultados);
            }
        );
    }
);


// ======================================================
// GET - OBTENER UN PAGO POR ID
// ADMINISTRADOR Y VENDEDOR
// ======================================================
router.get(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const idPago = req.params.id;

        const sql = `
            SELECT
                p.id_pago,
                p.id_venta,
                u.nombre AS usuario,
                p.tipo_pago,
                p.monto,
                p.estado,
                p.fecha_pago
            FROM pagos p
            INNER JOIN ventas v
                ON p.id_venta = v.id_venta
            INNER JOIN usuarios u
                ON v.id_usuario = u.id_usuario
            WHERE p.id_pago = ?
        `;

        conexion.query(
            sql,
            [idPago],
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar pago:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener el pago"
                    });
                }

                if (resultados.length === 0) {
                    return res.status(404).json({
                        error: "Pago no encontrado"
                    });
                }

                res.json(resultados[0]);
            }
        );
    }
);


// ======================================================
// GET - OBTENER PAGOS DE UNA VENTA
// ADMINISTRADOR Y VENDEDOR
// ======================================================
router.get(
    "/venta/:idVenta",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const idVenta = req.params.idVenta;

        const sql = `
            SELECT
                id_pago,
                id_venta,
                tipo_pago,
                monto,
                estado,
                fecha_pago
            FROM pagos
            WHERE id_venta = ?
            ORDER BY id_pago DESC
        `;

        conexion.query(
            sql,
            [idVenta],
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar pagos de la venta:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al obtener los pagos de la venta"
                    });
                }

                res.json(resultados);
            }
        );
    }
);


// ======================================================
// POST - REGISTRAR UN PAGO
// ADMINISTRADOR Y VENDEDOR
// ======================================================
router.post(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const {
            id_venta,
            tipo_pago,
            monto
        } = req.body;

        const tiposPermitidos = [
            "EFECTIVO",
            "TARJETA",
            "TRANSFERENCIA",
            "NEQUI",
            "DAVIPLATA"
        ];

        // --------------------------------------------------
        // Validaciones
        // --------------------------------------------------

        if (
            !id_venta ||
            !tipo_pago ||
            monto === undefined
        ) {
            return res.status(400).json({
                error:
                    "Debe indicar la venta, el tipo de pago y el monto"
            });
        }

        if (!tiposPermitidos.includes(tipo_pago)) {
            return res.status(400).json({
                error: "Tipo de pago no válido"
            });
        }

        if (Number(monto) <= 0) {
            return res.status(400).json({
                error:
                    "El monto debe ser mayor que cero"
            });
        }


        // --------------------------------------------------
        // Verificar venta
        // --------------------------------------------------

        const sqlVenta = `
            SELECT
                id_venta,
                total,
                estado
            FROM ventas
            WHERE id_venta = ?
        `;

        conexion.query(
            sqlVenta,
            [id_venta],
            (error, ventas) => {

                if (error) {
                    console.error(
                        "Error al consultar venta:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al verificar la venta"
                    });
                }

                if (ventas.length === 0) {
                    return res.status(404).json({
                        error:
                            "La venta no existe"
                    });
                }

                const venta = ventas[0];

                if (
                    venta.estado === "CANCELADA"
                ) {
                    return res.status(400).json({
                        error:
                            "No se puede registrar un pago para una venta cancelada"
                    });
                }


                // --------------------------------------------------
                // Consultar pagos existentes
                // --------------------------------------------------

                const sqlPagos = `
                    SELECT
                        COALESCE(SUM(monto), 0)
                        AS total_pagado
                    FROM pagos
                    WHERE id_venta = ?
                    AND estado = 'CONFIRMADO'
                `;

                conexion.query(
                    sqlPagos,
                    [id_venta],
                    (error, pagos) => {

                        if (error) {
                            console.error(
                                "Error al consultar pagos existentes:",
                                error.message
                            );

                            return res.status(500).json({
                                error:
                                    "Error al consultar los pagos existentes"
                            });
                        }

                        const totalPagado =
                            Number(
                                pagos[0].total_pagado
                            );

                        const totalVenta =
                            Number(venta.total);

                        const nuevoMonto =
                            Number(monto);

                        const saldoPendiente =
                            totalVenta -
                            totalPagado;


                        // --------------------------------------------------
                        // Validar que no se pague más de lo pendiente
                        // --------------------------------------------------

                        if (
                            nuevoMonto >
                            saldoPendiente
                        ) {
                            return res.status(400).json({
                                error:
                                    "El monto del pago supera el valor pendiente de la venta",
                                total_venta:
                                    totalVenta,
                                total_pagado:
                                    totalPagado,
                                saldo_pendiente:
                                    saldoPendiente
                            });
                        }


                        // --------------------------------------------------
                        // Registrar pago
                        // --------------------------------------------------

                        const sqlInsertar = `
                            INSERT INTO pagos
                            (
                                id_venta,
                                tipo_pago,
                                monto,
                                estado
                            )
                            VALUES
                            (?, ?, ?, 'CONFIRMADO')
                        `;

                        conexion.query(
                            sqlInsertar,
                            [
                                id_venta,
                                tipo_pago,
                                nuevoMonto
                            ],
                            (error, resultado) => {

                                if (error) {
                                    console.error(
                                        "Error al registrar pago:",
                                        error.message
                                    );

                                    return res.status(500).json({
                                        error:
                                            "Error al registrar el pago"
                                    });
                                }


                                const nuevoTotalPagado =
                                    totalPagado +
                                    nuevoMonto;


                                // --------------------------------------------------
                                // Actualizar estado de la venta
                                // --------------------------------------------------

                                const nuevoEstadoVenta =
                                    nuevoTotalPagado >=
                                    totalVenta
                                        ? "COMPLETADA"
                                        : "PENDIENTE";


                                const sqlActualizarVenta = `
                                    UPDATE ventas
                                    SET estado = ?
                                    WHERE id_venta = ?
                                `;

                                conexion.query(
                                    sqlActualizarVenta,
                                    [
                                        nuevoEstadoVenta,
                                        id_venta
                                    ],
                                    (error) => {

                                        if (error) {
                                            console.error(
                                                "Error al actualizar estado de venta:",
                                                error.message
                                            );

                                            return res.status(500).json({
                                                error:
                                                    "Pago registrado, pero no se pudo actualizar la venta"
                                            });
                                        }


                                        res.status(201).json({
                                            mensaje:
                                                "Pago registrado correctamente",

                                            id_pago:
                                                resultado.insertId,

                                            id_venta:
                                                id_venta,

                                            tipo_pago:
                                                tipo_pago,

                                            monto:
                                                nuevoMonto,

                                            total_venta:
                                                totalVenta,

                                            total_pagado:
                                                nuevoTotalPagado,

                                            saldo_pendiente:
                                                totalVenta -
                                                nuevoTotalPagado,

                                            estado_venta:
                                                nuevoEstadoVenta
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);


// ======================================================
// PUT - ACTUALIZAR ESTADO DE UN PAGO
// SOLO ADMINISTRADOR
// ======================================================
router.put(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const idPago = req.params.id;
        const { estado } = req.body;

        const estadosPermitidos = [
            "PENDIENTE",
            "CONFIRMADO",
            "ANULADO"
        ];

        if (
            !estado ||
            !estadosPermitidos.includes(estado)
        ) {
            return res.status(400).json({
                error:
                    "Estado de pago no válido"
            });
        }


        const sqlBuscar = `
            SELECT
                id_pago,
                id_venta,
                monto,
                estado
            FROM pagos
            WHERE id_pago = ?
        `;

        conexion.query(
            sqlBuscar,
            [idPago],
            (error, pagos) => {

                if (error) {
                    console.error(
                        "Error al consultar pago:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al consultar el pago"
                    });
                }

                if (pagos.length === 0) {
                    return res.status(404).json({
                        error:
                            "Pago no encontrado"
                    });
                }


                const sqlActualizar = `
                    UPDATE pagos
                    SET estado = ?
                    WHERE id_pago = ?
                `;

                conexion.query(
                    sqlActualizar,
                    [
                        estado,
                        idPago
                    ],
                    (error) => {

                        if (error) {
                            console.error(
                                "Error al actualizar pago:",
                                error.message
                            );

                            return res.status(500).json({
                                error:
                                    "Error al actualizar el pago"
                            });
                        }

                        res.json({
                            mensaje:
                                "Pago actualizado correctamente"
                        });
                    }
                );
            }
        );
    }
);


// ======================================================
// DELETE - ANULAR UN PAGO
// SOLO ADMINISTRADOR
// ======================================================
router.delete(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const idPago = req.params.id;

        const sqlBuscar = `
            SELECT
                id_pago,
                id_venta,
                monto,
                estado
            FROM pagos
            WHERE id_pago = ?
        `;

        conexion.query(
            sqlBuscar,
            [idPago],
            (error, pagos) => {

                if (error) {
                    console.error(
                        "Error al consultar pago:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al consultar el pago"
                    });
                }

                if (pagos.length === 0) {
                    return res.status(404).json({
                        error:
                            "Pago no encontrado"
                    });
                }

                if (
                    pagos[0].estado ===
                    "ANULADO"
                ) {
                    return res.status(400).json({
                        error:
                            "El pago ya está anulado"
                    });
                }


                const sqlAnular = `
                    UPDATE pagos
                    SET estado = 'ANULADO'
                    WHERE id_pago = ?
                `;

                conexion.query(
                    sqlAnular,
                    [idPago],
                    (error) => {

                        if (error) {
                            console.error(
                                "Error al anular pago:",
                                error.message
                            );

                            return res.status(500).json({
                                error:
                                    "Error al anular el pago"
                            });
                        }

                        res.json({
                            mensaje:
                                "Pago anulado correctamente"
                        });
                    }
                );
            }
        );
    }
);


module.exports = router;