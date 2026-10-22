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
                v.estado,
                v.canal
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
    "/mis-compras",
    verificarToken,
    verificarRol("CLIENTE"),
    (req, res) => {

        const id_usuario = req.usuario.id_usuario;

        const sql = `
            SELECT
                v.id_venta,
                v.fecha_venta,
                v.total,
                v.estado,
                v.canal
            FROM ventas v
            WHERE v.id_usuario = ?
            ORDER BY v.fecha_venta DESC
        `;

        conexion.query(
            sql,
            [id_usuario],
            (error, ventas) => {

                if (error) {
                    console.error(
                        "Error al consultar mis compras:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener las compras"
                    });
                }

                res.json(ventas);
            }
        );
    }
);


router.get(
    "/mis-compras/:id",
    verificarToken,
    verificarRol("CLIENTE"),
    async (req, res) => {
        try {
            const idUsuario = Number(req.usuario.id_usuario);
            const idVenta = Number(req.params.id);

            if (!Number.isSafeInteger(idVenta) || idVenta <= 0) {
                return res.status(400).json({
                    error: "Identificador de compra no válido"
                });
            }

            const [ventas] = await conexion.promise().query(
                `SELECT
                    v.id_venta,
                    v.id_usuario,
                    u.nombre AS usuario,
                    v.fecha_venta,
                    v.total,
                    v.estado,
                    v.canal
                 FROM ventas v
                 INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
                 WHERE v.id_venta = ?
                   AND v.id_usuario = ?
                 LIMIT 1`,
                [idVenta, idUsuario]
            );

            if (!ventas.length) {
                return res.status(404).json({
                    error: "Compra no encontrada"
                });
            }

            const [detalles] = await conexion.promise().query(
                `SELECT
                    d.id_detalle,
                    d.id_producto,
                    p.nombre AS producto,
                    d.cantidad,
                    d.precio_unitario,
                    d.subtotal
                 FROM detalle_venta d
                 INNER JOIN productos p
                    ON p.id_producto = d.id_producto
                 WHERE d.id_venta = ?`,
                [idVenta]
            );

            return res.json({
                venta: ventas[0],
                detalles
            });
        } catch (error) {
            console.error("Error consultando compra del cliente:", error.message);
            return res.status(500).json({
                error: "No fue posible consultar la compra"
            });
        }
    }
);


/* =====================================================
   PEDIDOS POR DESPACHAR
   ADMINISTRADOR Y VENDEDOR
===================================================== */
router.get(
    "/despachos",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    async (req, res) => {
        try {
            const [pedidos] = await conexion.promise().query(`
                SELECT
                    e.id_entrega,
                    e.id_venta,
                    e.tipo_entrega,
                    e.ciudad,
                    e.direccion,
                    e.costo,
                    e.estado_despacho,
                    e.fecha_envio,
                    e.fecha_entrega,
                    e.observaciones,
                    v.fecha_venta,
                    v.total,
                    v.estado AS estado_pago_venta,
                    u.nombre AS cliente
                FROM entregas e
                INNER JOIN ventas v ON v.id_venta = e.id_venta
                INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
                WHERE v.canal = 'WEB'
                AND v.estado = 'COMPLETADA'
                AND e.estado_despacho <> 'ENTREGADO'
                ORDER BY v.fecha_venta ASC
            `);

            res.json(pedidos);
        } catch (error) {
            console.error("Error consultando despachos:", error.message);
            res.status(500).json({
                error: "No fue posible consultar los despachos"
            });
        }
    }
);

/* =====================================================
   ACTUALIZAR ESTADO DEL DESPACHO
   ADMINISTRADOR Y VENDEDOR
===================================================== */
router.put(
    "/despachos/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    async (req, res) => {
        const idEntrega = Number(req.params.id);
        const { estado_despacho, observaciones } = req.body;

        const estadosPermitidos = [
            "PENDIENTE",
            "PREPARANDO",
            "ENVIADO",
            "LISTO_RECOGER",
            "ENTREGADO"
        ];

        if (
            !Number.isSafeInteger(idEntrega) ||
            idEntrega <= 0 ||
            !estadosPermitidos.includes(estado_despacho)
        ) {
            return res.status(400).json({
                error: "El identificador o el estado no son válidos"
            });
        }

        try {
            const [resultado] = await conexion.promise().query(
                `UPDATE entregas e
                 INNER JOIN ventas v ON v.id_venta = e.id_venta
                 SET
                    e.estado_despacho = ?,
                    e.observaciones = ?,
                    e.fecha_envio = CASE
                        WHEN ? = 'ENVIADO'
                        THEN COALESCE(e.fecha_envio, UTC_TIMESTAMP())
                        ELSE e.fecha_envio
                    END,
                    e.fecha_entrega = CASE
                        WHEN ? = 'ENTREGADO'
                        THEN COALESCE(e.fecha_entrega, UTC_TIMESTAMP())
                        ELSE e.fecha_entrega
                    END
                 WHERE e.id_entrega = ?
                   AND v.canal = 'WEB'
                   AND v.estado = 'COMPLETADA'`,
                [
                    estado_despacho,
                    observaciones || null,
                    estado_despacho,
                    estado_despacho,
                    idEntrega
                ]
            );

            if (!resultado.affectedRows) {
                return res.status(404).json({
                    error: "No se encontró el despacho o la compra no está pagada"
                });
            }

            res.json({
                mensaje: "Estado del despacho actualizado correctamente"
            });
        } catch (error) {
            console.error("Error actualizando despacho:", error.message);
            res.status(500).json({
                error: "No fue posible actualizar el despacho"
            });
        }
    }
);


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
                v.estado,
                v.canal
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
    async (req, res) => {

        const { detalles } = req.body;
        const id_usuario = req.usuario.id_usuario;

        if (!Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                error: "Debe indicar al menos un producto"
            });
        }

        for (const detalle of detalles) {
            if (
                !detalle.id_producto ||
                !Number.isInteger(Number(detalle.cantidad)) ||
                Number(detalle.cantidad) <= 0
            ) {
                return res.status(400).json({
                    error:
                        "Cada producto debe tener un ID válido y una cantidad entera mayor que cero"
                });
            }
        }

        let connection;
        let transaccionIniciada = false;

        try {
            // Obtener una conexión individual del pool.
            connection = await conexion.promise().getConnection();

            await connection.beginTransaction();
            transaccionIniciada = true;

            // Verificar que el usuario esté activo.
            const [usuarios] = await connection.query(
                `SELECT id_usuario
                 FROM usuarios
                 WHERE id_usuario = ?
                 AND estado = 1`,
                [id_usuario]
            );

            if (usuarios.length === 0) {
                const error = new Error(
                    "El usuario no existe o está inactivo"
                );
                error.status = 400;
                throw error;
            }

            let total = 0;
            const detallesProcesados = [];

            // Consultar productos y bloquear sus filas.
            for (const detalle of detalles) {
                const id_producto = Number(detalle.id_producto);
                const cantidad = Number(detalle.cantidad);

                const [productos] = await connection.query(
                    `SELECT
                        id_producto,
                        nombre,
                        precio,
                        precio_mayorista,
                        stock,
                        estado
                     FROM productos
                     WHERE id_producto = ?
                     FOR UPDATE`,
                    [id_producto]
                );

                if (productos.length === 0) {
                    const error = new Error(
                        `El producto ${id_producto} no existe`
                    );
                    error.status = 400;
                    throw error;
                }

                const producto = productos[0];

                if (Number(producto.estado) !== 1) {
                    const error = new Error(
                        `El producto "${producto.nombre}" está inactivo`
                    );
                    error.status = 400;
                    throw error;
                }

                const [reservas] = await connection.query(
                    `SELECT COALESCE(SUM(cantidad), 0) AS reservado
                    FROM reservas_inventario
                    WHERE id_producto = ?
                    AND estado = 'ACTIVA'
                    AND fecha_expiracion > UTC_TIMESTAMP()`,
                    [id_producto]
                );

                const reservado = Number(reservas[0].reservado);
                const disponible = Math.max(0, Number(producto.stock) - reservado);

                if (disponible < cantidad) {
                    const error = new Error(
                        `Stock insuficiente para "${producto.nombre}". ` +
                        `Disponible para venta: ${disponible}`
                    );
                    error.status = 400;
                    throw error;
                }

                // Precio normal de 1 a 5 unidades.
                // Precio mayorista desde 6 unidades.
                const precioUnitario =
                    cantidad >= 6 &&
                    producto.precio_mayorista !== null
                        ? Number(producto.precio_mayorista)
                        : Number(producto.precio);

                const subtotal = precioUnitario * cantidad;
                total += subtotal;

                detallesProcesados.push({
                    id_producto: Number(producto.id_producto),
                    nombre: producto.nombre,
                    cantidad,
                    precio_unitario: precioUnitario,
                    subtotal
                });
            }

            // Crear el registro principal de la venta.
            const [resultadoVenta] = await connection.query(
                `INSERT INTO ventas
                    (id_usuario, total, estado)
                 VALUES (?, ?, 'COMPLETADA')`,
                [id_usuario, total]
            );

            const idVenta = resultadoVenta.insertId;

            // Guardar detalle, descontar stock y registrar movimientos.
            for (const item of detallesProcesados) {

                await connection.query(
                    `INSERT INTO detalle_venta
                        (
                            id_venta,
                            id_producto,
                            cantidad,
                            precio_unitario,
                            subtotal
                        )
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        idVenta,
                        item.id_producto,
                        item.cantidad,
                        item.precio_unitario,
                        item.subtotal
                    ]
                );

                const [resultadoStock] = await connection.query(
                    `UPDATE productos
                     SET stock = stock - ?
                     WHERE id_producto = ?
                     AND stock >= ?`,
                    [
                        item.cantidad,
                        item.id_producto,
                        item.cantidad
                    ]
                );

                if (resultadoStock.affectedRows !== 1) {
                    const error = new Error(
                        `No fue posible actualizar el stock de "${item.nombre}"`
                    );
                    error.status = 400;
                    throw error;
                }

                // Registrar la salida en el historial de inventario.
                await connection.query(
                    `INSERT INTO movimientos_inventario
                        (
                            id_producto,
                            tipo,
                            cantidad,
                            stock_anterior,
                            stock_nuevo,
                            motivo,
                            id_venta
                        )
                     SELECT
                        ?,
                        'SALIDA',
                        ?,
                        stock + ?,
                        stock,
                        'Venta',
                        ?
                     FROM productos
                     WHERE id_producto = ?`,
                    [
                        item.id_producto,
                        item.cantidad,
                        item.cantidad,
                        idVenta,
                        item.id_producto
                    ]
                );
            }

            // Confirmar la venta y todos sus cambios.
            await connection.commit();
            transaccionIniciada = false;

            return res.status(201).json({
                mensaje: "Venta creada correctamente",
                id_venta: idVenta,
                id_usuario,
                total
            });

        } catch (error) {

            if (connection && transaccionIniciada) {
                try {
                    await connection.rollback();
                } catch (errorRollback) {
                    console.error(
                        "Error al deshacer la venta:",
                        errorRollback.message
                    );
                }
            }

            console.error(
                "Error al registrar venta:",
                error.message
            );

            return res.status(error.status || 500).json({
                error: error.status
                    ? error.message
                    : "No fue posible registrar la venta"
            });

        } finally {

            // Liberar la conexión para devolverla al pool.
            if (connection) {
                connection.release();
            }
        }
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
                estado,
                canal
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

                // BLOQUE NUEVO: proteger las ventas web
                if (ventas[0].canal === "WEB") {
                    return res.status(409).json({
                        error: "Las ventas web deben gestionarse mediante la integración de pagos."
                    });
                }

                const estadoAnterior =
                    ventas[0].estado;


                // Si se cancela una venta completada,
                // devolver el stock y registrar los movimientos.
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


                                    // Procesar los detalles uno por uno
                                    // para registrar correctamente el stock.
                                    function procesarDetalle(indice) {

                                        if (
                                            indice >= detalles.length
                                        ) {
                                            actualizarEstado();
                                            return;
                                        }


                                        const detalle =
                                            detalles[indice];


                                        const sqlStock = `
                                            UPDATE productos
                                            SET stock = stock + ?
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


                                                // Registrar la entrada
                                                // correspondiente a la cancelación.
                                                const sqlMovimiento = `
                                                    INSERT INTO movimientos_inventario (
                                                        id_producto,
                                                        tipo,
                                                        cantidad,
                                                        stock_anterior,
                                                        stock_nuevo,
                                                        motivo,
                                                        id_venta
                                                    )
                                                    SELECT
                                                        id_producto,
                                                        'ENTRADA',
                                                        ?,
                                                        stock - ?,
                                                        stock,
                                                        'Cancelación de venta',
                                                        ?
                                                    FROM productos
                                                    WHERE id_producto = ?
                                                `;


                                                conexion.query(
                                                    sqlMovimiento,
                                                    [
                                                        detalle.cantidad,
                                                        detalle.cantidad,
                                                        id,
                                                        detalle.id_producto
                                                    ],
                                                    (error) => {

                                                        if (error) {
                                                            return conexion.rollback(
                                                                () => {
                                                                    res.status(500).json({
                                                                        error:
                                                                            "Error al registrar el movimiento de inventario"
                                                                    });
                                                                }
                                                            );
                                                        }


                                                        // Continuar con el siguiente producto.
                                                        procesarDetalle(
                                                            indice + 1
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }


                                    // Iniciar el procesamiento.
                                    procesarDetalle(0);


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
            SELECT estado, canal
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

                // BLOQUE NUEVO: proteger las ventas web
                if (ventas[0].canal === "WEB") {
                    return res.status(409).json({
                        error: "Las ventas web deben gestionarse mediante la integración de pagos."
                    });
                }

                const estadoActual = ventas[0].estado;


                if (estadoActual === "CANCELADA") {
                    return res.status(400).json({
                        error:
                            "La venta ya está cancelada"
                    });
                }


                // Si la venta está pendiente, se cancela
                // sin devolver stock porque no se había descontado.
                if (estadoActual === "PENDIENTE") {

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
                                return res.status(500).json({
                                    error:
                                        "Error al cancelar la venta"
                                });
                            }


                            res.json({
                                mensaje:
                                    "Venta cancelada correctamente"
                            });
                        }
                    );

                    return;
                }


                // Si la venta está completada,
                // devolver stock y registrar movimientos.
                if (estadoActual === "COMPLETADA") {

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
                                                        "Error al consultar los detalles"
                                                });
                                            }
                                        );
                                    }


                                    // Procesar los detalles uno por uno
                                    // para mantener el orden de las operaciones.
                                    function procesarDetalle(indice) {

                                        if (
                                            indice >= detalles.length
                                        ) {
                                            cancelarVenta();
                                            return;
                                        }


                                        const detalle =
                                            detalles[indice];


                                        const sqlStock = `
                                            UPDATE productos
                                            SET stock = stock + ?
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


                                                // Registrar la entrada
                                                // por cancelación de la venta.
                                                const sqlMovimiento = `
                                                    INSERT INTO movimientos_inventario (
                                                        id_producto,
                                                        tipo,
                                                        cantidad,
                                                        stock_anterior,
                                                        stock_nuevo,
                                                        motivo,
                                                        id_venta
                                                    )
                                                    SELECT
                                                        id_producto,
                                                        'ENTRADA',
                                                        ?,
                                                        stock - ?,
                                                        stock,
                                                        'Cancelación de venta',
                                                        ?
                                                    FROM productos
                                                    WHERE id_producto = ?
                                                `;


                                                conexion.query(
                                                    sqlMovimiento,
                                                    [
                                                        detalle.cantidad,
                                                        detalle.cantidad,
                                                        id,
                                                        detalle.id_producto
                                                    ],
                                                    (error) => {

                                                        if (error) {
                                                            return conexion.rollback(
                                                                () => {
                                                                    res.status(500).json({
                                                                        error:
                                                                            "Error al registrar el movimiento de inventario"
                                                                    });
                                                                }
                                                            );
                                                        }


                                                        // Continuar con el siguiente detalle.
                                                        procesarDetalle(
                                                            indice + 1
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }


                                    // Iniciar el procesamiento de productos.
                                    procesarDetalle(0);


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

                    return;
                }


                // Si el estado no es reconocido, no realizar cambios.
                return res.status(400).json({
                    error:
                        "No se puede cancelar una venta con este estado"
                });
            }
        );
    }
);


module.exports = router;