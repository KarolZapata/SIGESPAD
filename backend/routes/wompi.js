
const express = require("express");
const crypto = require("crypto");
const conexion = require("../db");
const { verificarToken, verificarRol } = require("../middleware/auth");

const router = express.Router();

const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const MINUTOS_RESERVA = 10;

function crearFirmaIntegridad(referencia, montoCentavos, expiracion) {
    const contenido =
        `${referencia}${montoCentavos}COP${expiracion}${WOMPI_INTEGRITY_SECRET}`;

    return crypto
        .createHash("sha256")
        .update(contenido)
        .digest("hex");
}

function compararFirmas(a, b) {
    if (
        typeof a !== "string" ||
        typeof b !== "string" ||
        a.length !== b.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(a, "utf8"),
        Buffer.from(b, "utf8")
    );
}

// =====================================================
// POST /api/wompi/iniciar
// Crear venta pendiente y reservar inventario.
// =====================================================
router.post(
    "/iniciar",
    verificarToken,
    verificarRol("CLIENTE"),
    async (req, res) => {
        const idUsuario = Number(req.usuario.id_usuario);
        const {
            detalles,
            tipo_entrega = "RECOGIDA",
            ciudad,
            direccion
        } = req.body;

        if (!["RECOGIDA", "DOMICILIO"].includes(tipo_entrega)) {
            return res.status(400).json({
                error: "El tipo de entrega no es válido"
            });
        }

        if (
            tipo_entrega === "DOMICILIO" &&
            (
                !["Bogotá", "Soacha"].includes(ciudad) ||
                typeof direccion !== "string" ||
                !direccion.trim() ||
                direccion.trim().length > 255
            )
        ) {
            return res.status(400).json({
                error: "Para el domicilio, selecciona Bogotá o Soacha e ingresa una dirección válida"
            });
        }

        const ciudadEntrega =
            tipo_entrega === "DOMICILIO" ? ciudad : null;

        const direccionEntrega =
            tipo_entrega === "DOMICILIO" ? direccion.trim() : null;

        const costoEnvio =
            tipo_entrega === "DOMICILIO" ? 10000 : 0;

        if (!WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_SECRET || !FRONTEND_URL) {
            return res.status(500).json({
                error: "Falta configurar las variables de Wompi en el servidor"
            });
        }

        if (!Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                error: "El carrito está vacío"
            });
        }

        // Consolidar productos repetidos y validar cantidades.
        const cantidades = new Map();

        for (const detalle of detalles) {
            const id = Number(detalle.id_producto);
            const cantidad = Number(detalle.cantidad);

            if (
                !Number.isSafeInteger(id) ||
                id <= 0 ||
                !Number.isSafeInteger(cantidad) ||
                cantidad <= 0
            ) {
                return res.status(400).json({
                    error: "Los productos o las cantidades no son válidos"
                });
            }

            cantidades.set(id, (cantidades.get(id) || 0) + cantidad);
        }

        if (
            [...cantidades.values()].some(
                cantidad => !Number.isSafeInteger(cantidad)
            )
        ) {
            return res.status(400).json({
                error: "La cantidad solicitada es demasiado grande"
            });
        }

        let connection;
        let transaccionIniciada = false;

        try {
            connection = await conexion.promise().getConnection();
            await connection.beginTransaction();
            transaccionIniciada = true;

            const [usuarios] = await connection.query(
                `SELECT id_usuario, estado
                 FROM usuarios
                 WHERE id_usuario = ?
                 FOR UPDATE`,
                [idUsuario]
            );

            if (!usuarios.length || Number(usuarios[0].estado) !== 1) {
                const error = new Error("El usuario no está activo");
                error.status = 403;
                throw error;
            }

            const productos = [];
            let total = 0;

            // Bloquear productos en orden para reducir interbloqueos.
            const ids = [...cantidades.keys()].sort((a, b) => a - b);

            for (const idProducto of ids) {
                const [filas] = await connection.query(
                    `SELECT id_producto, nombre, precio,
                            precio_mayorista, stock, estado
                     FROM productos
                     WHERE id_producto = ?
                     FOR UPDATE`,
                    [idProducto]
                );

                if (!filas.length || Number(filas[0].estado) !== 1) {
                    const error = new Error(
                        `El producto ${idProducto} no existe o está inactivo`
                    );
                    error.status = 400;
                    throw error;
                }

                const producto = filas[0];
                const cantidad = cantidades.get(idProducto);

                // Contar reservas aún vigentes del producto.
                const [reservas] = await connection.query(
                    `SELECT COALESCE(SUM(cantidad), 0) AS reservado
                     FROM reservas_inventario
                     WHERE id_producto = ?
                       AND estado = 'ACTIVA'
                       AND fecha_expiracion > UTC_TIMESTAMP()`,
                    [idProducto]
                );

                const reservado = Number(reservas[0].reservado);
                const disponible = Number(producto.stock) - reservado;

                if (disponible < cantidad) {
                    const error = new Error(
                        `Stock insuficiente para "${producto.nombre}". ` +
                        `Disponible: ${Math.max(0, disponible)}`
                    );
                    error.status = 409;
                    throw error;
                }

                // Aplicar el mismo criterio de precio mayorista
                // que utiliza la venta presencial.
                const precio =
                    cantidad >= 6 && producto.precio_mayorista !== null
                        ? Number(producto.precio_mayorista)
                        : Number(producto.precio);

                const subtotal = Math.round(precio * 100) * cantidad;

                if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
                    const error = new Error(
                        "El precio de un producto no es válido"
                    );
                    error.status = 400;
                    throw error;
                }

                total += subtotal;

                productos.push({
                    id_producto: idProducto,
                    nombre: producto.nombre,
                    cantidad,
                    precio_unitario: precio,
                    subtotal: subtotal / 100
                });
            }

            if (!Number.isSafeInteger(total) || total <= 0) {
                const error = new Error("El total de la compra no es válido");
                error.status = 400;
                throw error;
            }

            // El total está expresado en centavos para Wompi.
            total += costoEnvio * 100;

            if (!Number.isSafeInteger(total)) {
                const error = new Error("El total de la compra es demasiado grande");
                error.status = 400;
                throw error;
            }

            // Crear la venta sin descontar stock todavía.
            const [venta] = await connection.query(
                `INSERT INTO ventas
                    (id_usuario, total, estado, canal)
                 VALUES (?, ?, 'PENDIENTE', 'WEB')`,
                [idUsuario, total / 100]
            );

            const idVenta = venta.insertId;
            const referencia = `SIGESPAD-${idVenta}-${crypto
                .randomBytes(8)
                .toString("hex")}`;

            await connection.query(
                `INSERT INTO entregas
                    (id_venta, tipo_entrega, ciudad, direccion, costo, estado_despacho)
                VALUES (?, ?, ?, ?, ?, 'PENDIENTE')`,
                [
                    idVenta,
                    tipo_entrega,
                    ciudadEntrega,
                    direccionEntrega,
                    costoEnvio
                ]
            );

            const expiracionDate = new Date(Date.now() + MINUTOS_RESERVA * 60000);
            const expiracion = expiracionDate.toISOString();

            for (const item of productos) {
                await connection.query(
                    `INSERT INTO detalle_venta
                        (id_venta, id_producto, cantidad,
                         precio_unitario, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        idVenta,
                        item.id_producto,
                        item.cantidad,
                        item.precio_unitario,
                        item.subtotal
                    ]
                );

                await connection.query(
                    `INSERT INTO reservas_inventario
                        (id_venta, id_producto, cantidad,
                         estado, fecha_expiracion)
                     VALUES (?, ?, ?, 'ACTIVA',
                             DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE))`,
                    [idVenta, item.id_producto, item.cantidad]
                );
            }

            await connection.query(
                `INSERT INTO pagos
                    (id_venta, tipo_pago, monto, estado, referencia_wompi)
                 VALUES (?, 'WOMPI', ?, 'PENDIENTE', ?)`,
                [idVenta, total / 100, referencia]
            );

            const firma = crearFirmaIntegridad(
                referencia,
                total,
                expiracion
            );

            await connection.commit();
            transaccionIniciada = false;

            const checkoutUrl = new URL("https://checkout.wompi.co/p/");
            checkoutUrl.searchParams.set("public-key", WOMPI_PUBLIC_KEY);
            checkoutUrl.searchParams.set("currency", "COP");
            checkoutUrl.searchParams.set("amount-in-cents", String(total));
            checkoutUrl.searchParams.set("reference", referencia);
            checkoutUrl.searchParams.set("signature:integrity", firma);
            checkoutUrl.searchParams.set("expiration-time", expiracion);
            checkoutUrl.searchParams.set(
                "redirect-url",
                `${FRONTEND_URL.replace(/\/$/, "")}/resultado-pago?reference=${encodeURIComponent(referencia)}`
            );

            return res.status(201).json({
                mensaje: "Reserva creada. Completa el pago dentro de 10 minutos.",
                id_venta: idVenta,
                referencia,
                total: total / 100,
                expiracion,
                checkoutUrl: checkoutUrl.toString()
            });
        } catch (error) {
            if (connection && transaccionIniciada) {
                await connection.rollback().catch(() => {});
            }

            console.error("Error al iniciar checkout Wompi:", error.message);

            return res.status(error.status || 500).json({
                error: error.status
                    ? error.message
                    : "No se pudo iniciar el pago"
            });
        } finally {
            if (connection) connection.release();
        }
    }
);


router.get(
    "/estado/:referencia",
    verificarToken,
    verificarRol("CLIENTE"),
    async (req, res) => {
        try {
            const idUsuario = Number(req.usuario.id_usuario);
            const { referencia } = req.params;

            const [resultados] = await conexion.promise().query(
                `SELECT
                    v.id_venta,
                    v.estado AS estado_venta,
                    p.estado AS estado_pago,
                    p.referencia_wompi
                 FROM pagos p
                 INNER JOIN ventas v ON v.id_venta = p.id_venta
                 WHERE p.referencia_wompi = ?
                   AND v.id_usuario = ?
                   AND v.canal = 'WEB'
                 LIMIT 1`,
                [referencia, idUsuario]
            );

            if (!resultados.length) {
                return res.status(404).json({
                    error: "No se encontró la compra"
                });
            }

            return res.json({
                id_venta: resultados[0].id_venta,
                estado_venta: resultados[0].estado_venta,
                estado_pago: resultados[0].estado_pago
            });
        } catch (error) {
            console.error("Error consultando el pago:", error.message);
            return res.status(500).json({
                error: "No fue posible consultar el pago"
            });
        }
    }
);


// =====================================================
// POST /api/wompi/webhook
// Procesar eventos enviados por Wompi.
// =====================================================
router.post("/webhook", async (req, res) => {
    const evento = req.body;

    if (!WOMPI_EVENTS_SECRET) {
        console.error("Falta configurar WOMPI_EVENTS_SECRET");
        return res.status(500).json({ error: "Webhook no configurado" });
    }

    if (
        evento?.event !== "transaction.updated" ||
        !evento?.data?.transaction ||
        !Array.isArray(evento?.signature?.properties) ||
        !evento?.signature?.checksum
    ) {
        return res.status(400).json({ error: "Evento no válido" });
    }

    const entornoEsperado = WOMPI_PUBLIC_KEY.startsWith("pub_test_")
        ? "test"
        : "prod";

    if (evento.environment !== entornoEsperado) {
        return res.status(400).json({
            error: "El evento no corresponde al entorno configurado"
        });
    }

    // Verificar firma según las propiedades indicadas por Wompi.

    const valores = [];

    for (const propiedad of evento.signature.properties) {
        const partes = propiedad.split(".");
        let valor = evento.data;

        for (const parte of partes) {
            valor = valor?.[parte];
        }

        if (valor === undefined || valor === null) {
            return res.status(400).json({
                error: "Falta una propiedad requerida por la firma"
            });
        }

        valores.push(String(valor));
    }


    valores.push(String(evento.timestamp));
    valores.push(WOMPI_EVENTS_SECRET);

    const checksumCalculado = crypto
        .createHash("sha256")
        .update(valores.join(""))
        .digest("hex");

    const checksumRecibido =
        req.get("X-Event-Checksum") || evento.signature.checksum;

    if (
        !compararFirmas(checksumCalculado, evento.signature.checksum) ||
        !compararFirmas(checksumCalculado, checksumRecibido)
    ) {
        return res.status(401).json({ error: "Firma del evento inválida" });
    }

    const transaccion = evento.data.transaction;
    const referencia = transaccion.reference;
    const idTransaccion = transaccion.id;
    const estadoWompi = transaccion.status;

    if (
        !referencia ||
        !idTransaccion ||
        !Number.isSafeInteger(Number(transaccion.amount_in_cents)) ||
        transaccion.currency !== "COP"
    ) {
        return res.status(400).json({
            error: "Datos de transacción incompletos"
        });
    }

    if (!["APPROVED", "DECLINED", "VOIDED", "ERROR", "PENDING"].includes(estadoWompi)) {
        return res.status(400).json({
            error: "Estado de transacción desconocido"
        });
    }

    let connection;
    let transaccionIniciada = false;

    try {
        connection = await conexion.promise().getConnection();
        await connection.beginTransaction();
        transaccionIniciada = true;

        const [pagos] = await connection.query(
            `SELECT p.id_pago, p.id_venta, p.monto, p.estado,
                    p.referencia_wompi, p.id_transaccion_wompi,
                    v.estado AS estado_venta
             FROM pagos p
             INNER JOIN ventas v ON v.id_venta = p.id_venta
             WHERE p.referencia_wompi = ?
             FOR UPDATE`,
            [referencia]
        );

        if (!pagos.length) {
            await connection.rollback();
            transaccionIniciada = false;
            return res.status(404).json({ error: "Pago no encontrado" });
        }

        const pago = pagos[0];
        const montoEsperado = Math.round(Number(pago.monto) * 100);

        if (montoEsperado !== Number(transaccion.amount_in_cents)) {
            await connection.rollback();
            transaccionIniciada = false;
            return res.status(400).json({
                error: "El monto de la transacción no coincide"
            });
        }

        if (
            pago.id_transaccion_wompi &&
            pago.id_transaccion_wompi !== idTransaccion
        ) {
            await connection.rollback();
            transaccionIniciada = false;
            return res.status(409).json({
                error: "La referencia ya está asociada a otra transacción"
            });
        }

        // Si ya se confirmó, no repetir operaciones de inventario.
        if (
            pago.estado === "CONFIRMADO" &&
            pago.id_transaccion_wompi === idTransaccion
        ) {
            await connection.commit();
            transaccionIniciada = false;
            return res.status(200).json({ recibido: true, duplicado: true });
        }

        if (estadoWompi === "PENDING") {
            await connection.commit();
            transaccionIniciada = false;
            return res.status(200).json({ recibido: true });
        }

        if (estadoWompi === "APPROVED") {
            // Nunca confirmar una compra cuyo tiempo de reserva expiró.
            const [reservas] = await connection.query(
                `SELECT id_reserva, id_producto, cantidad, estado,
                        (fecha_expiracion > UTC_TIMESTAMP()) AS vigente
                FROM reservas_inventario
                WHERE id_venta = ?
                FOR UPDATE`,
                [pago.id_venta]
            );


            if (
                !reservas.length ||
                reservas.some(
                    r => r.estado !== "ACTIVA" || Number(r.vigente) !== 1
                )
            ) {
                // Registrar el ID para conciliación. No descontar stock
                // automáticamente ni declarar la venta completada.
                await connection.query(
                    `UPDATE pagos
                     SET id_transaccion_wompi = ?
                     WHERE id_pago = ?`,
                    [idTransaccion, pago.id_pago]
                );

                await connection.commit();
                transaccionIniciada = false;

                console.error(
                    `INCIDENCIA: pago aprobado fuera de reserva. Venta ${pago.id_venta}`
                );

                return res.status(200).json({
                    recibido: true,
                    incidencia: "Pago aprobado fuera del periodo de reserva"
                });
            }

            // Bloquear productos y validar todo el inventario antes
            // de descontar cualquier unidad.
            const idsProductos = [...new Set(
                reservas.map(r => Number(r.id_producto))
            )].sort((a, b) => a - b);

            const stocks = new Map();

            for (const idProducto of idsProductos) {
                const [filas] = await connection.query(
                    `SELECT id_producto, stock
                     FROM productos
                     WHERE id_producto = ?
                     FOR UPDATE`,
                    [idProducto]
                );

                if (!filas.length) {
                    throw new Error(`Producto ${idProducto} no encontrado`);
                }

                stocks.set(idProducto, Number(filas[0].stock));
            }

            for (const reserva of reservas) {
                if (stocks.get(Number(reserva.id_producto)) < Number(reserva.cantidad)) {
                    await connection.query(
                        `UPDATE pagos
                         SET id_transaccion_wompi = ?
                         WHERE id_pago = ?`,
                        [idTransaccion, pago.id_pago]
                    );

                    await connection.commit();
                    transaccionIniciada = false;

                    console.error(
                        `INCIDENCIA: pago aprobado sin stock suficiente. Venta ${pago.id_venta}`
                    );

                    return res.status(200).json({
                        recibido: true,
                        incidencia: "Pago aprobado; requiere conciliación"
                    });
                }
            }

            for (const reserva of reservas) {
                const idProducto = Number(reserva.id_producto);
                const cantidad = Number(reserva.cantidad);

                const [resultado] = await connection.query(
                    `UPDATE productos
                     SET stock = stock - ?
                     WHERE id_producto = ? AND stock >= ?`,
                    [cantidad, idProducto, cantidad]
                );

                if (resultado.affectedRows !== 1) {
                    throw new Error("No fue posible descontar el inventario");
                }

                await connection.query(
                    `INSERT INTO movimientos_inventario
                        (id_producto, tipo, cantidad, stock_anterior,
                         stock_nuevo, motivo, id_venta)
                     SELECT id_producto, 'SALIDA', ?, stock + ?, stock,
                            'Venta web Wompi', ?
                     FROM productos
                     WHERE id_producto = ?`,
                    [cantidad, cantidad, pago.id_venta, idProducto]
                );

                await connection.query(
                    `UPDATE reservas_inventario
                     SET estado = 'CONFIRMADA',
                         fecha_finalizacion = UTC_TIMESTAMP()
                     WHERE id_reserva = ? AND estado = 'ACTIVA'`,
                    [reserva.id_reserva]
                );
            }

            await connection.query(
                `UPDATE ventas
                 SET estado = 'COMPLETADA'
                 WHERE id_venta = ? AND estado = 'PENDIENTE'`,
                [pago.id_venta]
            );

            await connection.query(
                `UPDATE pagos
                 SET estado = 'CONFIRMADO',
                     id_transaccion_wompi = ?
                 WHERE id_pago = ?`,
                [idTransaccion, pago.id_pago]
            );
        } else {
            // Pago rechazado, anulado o con error.
            await connection.query(
                `UPDATE pagos
                 SET estado = 'ANULADO',
                     id_transaccion_wompi = ?
                 WHERE id_pago = ? AND estado = 'PENDIENTE'`,
                [idTransaccion, pago.id_pago]
            );

            await connection.query(
                `UPDATE ventas
                 SET estado = 'CANCELADA'
                 WHERE id_venta = ? AND estado = 'PENDIENTE'`,
                [pago.id_venta]
            );

            await connection.query(
                `UPDATE reservas_inventario
                 SET estado = 'LIBERADA',
                     fecha_finalizacion = UTC_TIMESTAMP()
                 WHERE id_venta = ? AND estado = 'ACTIVA'`,
                [pago.id_venta]
            );
        }

        await connection.commit();
        transaccionIniciada = false;

        return res.status(200).json({ recibido: true });
    } catch (error) {
        if (connection && transaccionIniciada) {
            await connection.rollback().catch(() => {});
        }

        console.error("Error procesando webhook Wompi:", error.message);

        return res.status(500).json({
            error: "No fue posible procesar el evento"
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
