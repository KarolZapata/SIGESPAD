const express = require("express");
const router = express.Router();

const conexion = require("../db");

const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");


// =====================================================
// GET - OBTENER TODAS LAS VENTAS
// ADMINISTRADOR Y VENDEDOR
// =====================================================
router.get(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const sql = `
            SELECT
                v.id_venta,
                v.id_usuario,
                u.nombre AS usuario,
                v.fecha_venta,
                v.total,
                v.estado
            FROM ventas v
            INNER JOIN usuarios u
                ON v.id_usuario = u.id_usuario
            ORDER BY v.id_venta DESC
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {
                console.error(
                    "Error al consultar ventas:",
                    error.message
                );

                return res.status(500).json({
                    error: "Error al obtener las ventas"
                });
            }

            res.json(resultados);
        });
    }
);


// =====================================================
// GET - OBTENER UNA VENTA POR ID
// ADMINISTRADOR Y VENDEDOR
// =====================================================
router.get(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const { id } = req.params;

        const sqlVenta = `
            SELECT
                v.id_venta,
                v.id_usuario,
                u.nombre AS usuario,
                v.fecha_venta,
                v.total,
                v.estado
            FROM ventas v
            INNER JOIN usuarios u
                ON v.id_usuario = u.id_usuario
            WHERE v.id_venta = ?
        `;

        conexion.query(
            sqlVenta,
            [id],
            (error, ventas) => {

                if (error) {
                    console.error(
                        "Error al consultar venta:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener la venta"
                    });
                }

                if (ventas.length === 0) {
                    return res.status(404).json({
                        error: "Venta no encontrada"
                    });
                }

                const sqlDetalle = `
                    SELECT
                        d.id_detalle,
                        d.id_producto,
                        p.nombre AS producto,
                        d.cantidad,
                        d.precio_unitario,
                        d.subtotal
                    FROM detalle_venta d
                    INNER JOIN productos p
                        ON d.id_producto = p.id_producto
                    WHERE d.id_venta = ?
                `;

                conexion.query(
                    sqlDetalle,
                    [id],
                    (error, detalles) => {

                        if (error) {
                            console.error(
                                "Error al consultar detalle:",
                                error.message
                            );

                            return res.status(500).json({
                                error:
                                    "Error al obtener el detalle de la venta"
                            });
                        }

                        res.json({
                            venta: ventas[0],
                            detalles: detalles
                        });
                    }
                );
            }
        );
    }
);


// =====================================================
// POST - CREAR UNA VENTA
// ADMINISTRADOR Y VENDEDOR
// =====================================================
router.post(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const { detalles } = req.body;

        // El usuario sale del token JWT
        const id_usuario = req.usuario.id_usuario;

        if (
            !Array.isArray(detalles) ||
            detalles.length === 0
        ) {
            return res.status(400).json({
                error:
                    "Debe indicar al menos un producto"
            });
        }

        const sqlUsuario = `
            SELECT id_usuario
            FROM usuarios
            WHERE id_usuario = ?
            AND estado = 1
        `;

        conexion.query(
            sqlUsuario,
            [id_usuario],
            (error, usuarios) => {

                if (error) {
                    console.error(
                        "Error al verificar usuario:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al verificar el usuario"
                    });
                }

                if (usuarios.length === 0) {
                    return res.status(400).json({
                        error:
                            "El usuario no existe o está inactivo"
                    });
                }

                conexion.beginTransaction((error) => {

                    if (error) {
                        console.error(
                            "Error al iniciar transacción:",
                            error.message
                        );

                        return res.status(500).json({
                            error:
                                "No se pudo iniciar la venta"
                        });
                    }

                    let total = 0;
                    let procesados = 0;

                    const detallesProcesados = [];

                    let respondido = false;

                    const rollback = (
                        mensaje,
                        status = 400
                    ) => {

                        if (respondido) return;

                        respondido = true;

                        conexion.rollback(() => {
                            return res.status(status).json({
                                error: mensaje
                            });
                        });
                    };


                    detalles.forEach((detalle) => {

                        const {
                            id_producto,
                            cantidad
                        } = detalle;


                        // Validar cantidad
                        if (
                            !id_producto ||
                            !cantidad ||
                            Number(cantidad) <= 0
                        ) {
                            return rollback(
                                "Cada producto debe tener un ID válido y una cantidad mayor que cero"
                            );
                        }


                        const sqlProducto = `
                            SELECT
                                id_producto,
                                nombre,
                                precio,
                                stock,
                                estado
                            FROM productos
                            WHERE id_producto = ?
                            FOR UPDATE
                        `;


                        conexion.query(
                            sqlProducto,
                            [id_producto],
                            (error, productos) => {

                                if (error) {
                                    return rollback(
                                        "Error al consultar el producto",
                                        500
                                    );
                                }


                                if (
                                    productos.length === 0
                                ) {
                                    return rollback(
                                        `El producto ${id_producto} no existe`
                                    );
                                }


                                const producto =
                                    productos[0];


                                if (
                                    producto.estado !== 1
                                ) {
                                    return rollback(
                                        `El producto "${producto.nombre}" está inactivo`
                                    );
                                }


                                if (
                                    Number(producto.stock) <
                                    Number(cantidad)
                                ) {
                                    return rollback(
                                        `Stock insuficiente para "${producto.nombre}". Stock disponible: ${producto.stock}`
                                    );
                                }


                                const subtotal =
                                    Number(producto.precio) *
                                    Number(cantidad);


                                total += subtotal;


                                detallesProcesados.push({
                                    id_producto:
                                        producto.id_producto,

                                    cantidad:
                                        Number(cantidad),

                                    precio_unitario:
                                        Number(producto.precio),

                                    subtotal:
                                        subtotal
                                });


                                procesados++;


                                if (
                                    procesados ===
                                    detalles.length
                                ) {

                                    const sqlVenta = `
                                        INSERT INTO ventas
                                        (
                                            id_usuario,
                                            total,
                                            estado
                                        )
                                        VALUES
                                        (?, ?, 'COMPLETADA')
                                    `;


                                    conexion.query(
                                        sqlVenta,
                                        [
                                            id_usuario,
                                            total
                                        ],
                                        (
                                            error,
                                            resultadoVenta
                                        ) => {

                                            if (error) {
                                                return rollback(
                                                    "Error al crear la venta",
                                                    500
                                                );
                                            }


                                            const idVenta =
                                                resultadoVenta.insertId;


                                            let insertados = 0;


                                            detallesProcesados.forEach(
                                                (item) => {

                                                    const sqlDetalle = `
                                                        INSERT INTO detalle_venta
                                                        (
                                                            id_venta,
                                                            id_producto,
                                                            cantidad,
                                                            precio_unitario,
                                                            subtotal
                                                        )
                                                        VALUES
                                                        (?, ?, ?, ?, ?)
                                                    `;


                                                    conexion.query(
                                                        sqlDetalle,
                                                        [
                                                            idVenta,
                                                            item.id_producto,
                                                            item.cantidad,
                                                            item.precio_unitario,
                                                            item.subtotal
                                                        ],
                                                        (error) => {

                                                            if (error) {
                                                                return rollback(
                                                                    "Error al crear el detalle de la venta",
                                                                    500
                                                                );
                                                            }


                                                            const sqlStock = `
                                                                UPDATE productos
                                                                SET stock =
                                                                    stock - ?
                                                                WHERE id_producto = ?
                                                            `;


                                                            conexion.query(
                                                                sqlStock,
                                                                [
                                                                    item.cantidad,
                                                                    item.id_producto
                                                                ],
                                                                (error) => {

                                                                    if (error) {
                                                                        return rollback(
                                                                            "Error al actualizar el stock",
                                                                            500
                                                                        );
                                                                    }


                                                                    insertados++;


                                                                    if (
                                                                        insertados ===
                                                                        detallesProcesados.length
                                                                    ) {

                                                                        conexion.commit(
                                                                            (error) => {

                                                                                if (error) {
                                                                                    return rollback(
                                                                                        "Error al confirmar la venta",
                                                                                        500
                                                                                    );
                                                                                }


                                                                                res.status(
                                                                                    201
                                                                                ).json({
                                                                                    mensaje:
                                                                                        "Venta creada correctamente",

                                                                                    id_venta:
                                                                                        idVenta,

                                                                                    id_usuario:
                                                                                        id_usuario,

                                                                                    total:
                                                                                        total
                                                                                });
                                                                            }
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            }
                        );
                    });
                });
            }
        );
    }
);


// =====================================================
// PUT - ACTUALIZAR ESTADO DE UNA VENTA
// SOLO ADMINISTRADOR
// =====================================================
router.put(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;
        const { estado } = req.body;

        const estadosPermitidos = [
            "PENDIENTE",
            "COMPLETADA",
            "CANCELADA"
        ];

        if (
            !estado ||
            !estadosPermitidos.includes(estado)
        ) {
            return res.status(400).json({
                error: "Estado no válido"
            });
        }


        const sqlBuscar = `
            SELECT
                id_venta,
                estado
            FROM ventas
            WHERE id_venta = ?
        `;


        conexion.query(
            sqlBuscar,
            [id],
            (error, ventas) => {

                if (error) {
                    return res.status(500).json({
                        error:
                            "Error al consultar la venta"
                    });
                }


                if (ventas.length === 0) {
                    return res.status(404).json({
                        error:
                            "Venta no encontrada"
                    });
                }


                const estadoAnterior =
                    ventas[0].estado;


                // Si se cancela una venta completada,
                // devolver el stock.
                if (
                    estado === "CANCELADA" &&
                    estadoAnterior === "COMPLETADA"
                ) {

                    conexion.beginTransaction(
                        (error) => {

                            if (error) {
                                return res.status(500).json({
                                    error:
                                        "No se pudo iniciar la operación"
                                });
                            }


                            const sqlDetalles = `
                                SELECT
                                    id_producto,
                                    cantidad
                                FROM detalle_venta
                                WHERE id_venta = ?
                            `;


                            conexion.query(
                                sqlDetalles,
                                [id],
                                (error, detalles) => {

                                    if (error) {
                                        return conexion.rollback(
                                            () => {
                                                res.status(500).json({
                                                    error:
                                                        "Error al obtener los productos de la venta"
                                                });
                                            }
                                        );
                                    }


                                    let actualizados = 0;


                                    if (
                                        detalles.length === 0
                                    ) {
                                        actualizarEstado();
                                        return;
                                    }


                                    detalles.forEach(
                                        (detalle) => {

                                            const sqlStock = `
                                                UPDATE productos
                                                SET stock =
                                                    stock + ?
                                                WHERE id_producto = ?
                                            `;


                                            conexion.query(
                                                sqlStock,
                                                [
                                                    detalle.cantidad,
                                                    detalle.id_producto
                                                ],
                                                (error) => {

                                                    if (error) {
                                                        return conexion.rollback(
                                                            () => {
                                                                res.status(500).json({
                                                                    error:
                                                                        "Error al devolver el stock"
                                                                });
                                                            }
                                                        );
                                                    }


                                                    actualizados++;


                                                    if (
                                                        actualizados ===
                                                        detalles.length
                                                    ) {
                                                        actualizarEstado();
                                                    }
                                                }
                                            );
                                        }
                                    );


                                    function actualizarEstado() {

                                        const sqlUpdate = `
                                            UPDATE ventas
                                            SET estado = ?
                                            WHERE id_venta = ?
                                        `;


                                        conexion.query(
                                            sqlUpdate,
                                            [
                                                estado,
                                                id
                                            ],
                                            (error) => {

                                                if (error) {
                                                    return conexion.rollback(
                                                        () => {
                                                            res.status(500).json({
                                                                error:
                                                                    "Error al actualizar la venta"
                                                            });
                                                        }
                                                    );
                                                }


                                                conexion.commit(
                                                    (error) => {

                                                        if (error) {
                                                            return conexion.rollback(
                                                                () => {
                                                                    res.status(500).json({
                                                                        error:
                                                                            "Error al confirmar la operación"
                                                                    });
                                                                }
                                                            );
                                                        }


                                                        res.json({
                                                            mensaje:
                                                                "Venta actualizada correctamente"
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );

                } else {

                    const sqlUpdate = `
                        UPDATE ventas
                        SET estado = ?
                        WHERE id_venta = ?
                    `;


                    conexion.query(
                        sqlUpdate,
                        [
                            estado,
                            id
                        ],
                        (error) => {

                            if (error) {
                                return res.status(500).json({
                                    error:
                                        "Error al actualizar la venta"
                                });
                            }


                            res.json({
                                mensaje:
                                    "Venta actualizada correctamente"
                            });
                        }
                    );
                }
            }
        );
    }
);


// =====================================================
// DELETE - CANCELAR UNA VENTA
// SOLO ADMINISTRADOR
// =====================================================
router.delete(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;


        const sqlBuscar = `
            SELECT estado
            FROM ventas
            WHERE id_venta = ?
        `;


        conexion.query(
            sqlBuscar,
            [id],
            (error, ventas) => {

                if (error) {
                    return res.status(500).json({
                        error:
                            "Error al consultar la venta"
                    });
                }


                if (ventas.length === 0) {
                    return res.status(404).json({
                        error:
                            "Venta no encontrada"
                    });
                }


                if (
                    ventas[0].estado ===
                    "CANCELADA"
                ) {
                    return res.status(400).json({
                        error:
                            "La venta ya está cancelada"
                    });
                }


                const sqlDetalles = `
                    SELECT
                        id_producto,
                        cantidad
                    FROM detalle_venta
                    WHERE id_venta = ?
                `;


                conexion.beginTransaction(
                    (error) => {

                        if (error) {
                            return res.status(500).json({
                                error:
                                    "No se pudo iniciar la operación"
                            });
                        }


                        conexion.query(
                            sqlDetalles,
                            [id],
                            (error, detalles) => {

                                if (error) {
                                    return conexion.rollback(
                                        () => {
                                            res.status(500).json({
                                                error:
                                                    "Error al consultar los detalles"
                                            });
                                        }
                                    );
                                }


                                let actualizados = 0;


                                if (
                                    detalles.length === 0
                                ) {
                                    cancelarVenta();
                                    return;
                                }


                                detalles.forEach(
                                    (detalle) => {

                                        const sqlStock = `
                                            UPDATE productos
                                            SET stock =
                                                stock + ?
                                            WHERE id_producto = ?
                                        `;


                                        conexion.query(
                                            sqlStock,
                                            [
                                                detalle.cantidad,
                                                detalle.id_producto
                                            ],
                                            (error) => {

                                                if (error) {
                                                    return conexion.rollback(
                                                        () => {
                                                            res.status(500).json({
                                                                error:
                                                                    "Error al devolver el stock"
                                                            });
                                                        }
                                                    );
                                                }


                                                actualizados++;


                                                if (
                                                    actualizados ===
                                                    detalles.length
                                                ) {
                                                    cancelarVenta();
                                                }
                                            }
                                        );
                                    }
                                );


                                function cancelarVenta() {

                                    const sqlCancelar = `
                                        UPDATE ventas
                                        SET estado = 'CANCELADA'
                                        WHERE id_venta = ?
                                    `;


                                    conexion.query(
                                        sqlCancelar,
                                        [id],
                                        (error) => {

                                            if (error) {
                                                return conexion.rollback(
                                                    () => {
                                                        res.status(500).json({
                                                            error:
                                                                "Error al cancelar la venta"
                                                        });
                                                    }
                                                );
                                            }


                                            conexion.commit(
                                                (error) => {

                                                    if (error) {
                                                        return conexion.rollback(
                                                            () => {
                                                                res.status(500).json({
                                                                    error:
                                                                        "Error al confirmar la cancelación"
                                                                });
                                                            }
                                                        );
                                                    }


                                                    res.json({
                                                        mensaje:
                                                            "Venta cancelada correctamente"
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            }
                        );
                    }
                );
            }
        );
    }
);


module.exports = router;