const express = require("express");
const router = express.Router();
const conexion = require("../db");
const uploadImagenes = require("../middleware/uploadImagenes");
const fs = require("fs");
const path = require("path");
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
                p.id_producto,
                p.codigo,
                p.nombre,
                p.descripcion,
                p.categoria,
                p.precio,
                p.precio_mayorista,
                p.stock,
                p.estado,
                pi.nombre_imagen,
                pi.orden
            FROM productos p
            LEFT JOIN producto_imagenes pi
                ON p.id_producto = pi.id_producto
            WHERE p.estado = 1
            ORDER BY p.nombre ASC, pi.orden ASC
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

                const productos = [];

                resultados.forEach((fila) => {

                    let producto = productos.find(
                        (p) =>
                            p.id_producto === fila.id_producto
                    );

                    if (!producto) {

                        producto = {
                            id_producto: fila.id_producto,
                            codigo: fila.codigo,
                            nombre: fila.nombre,
                            descripcion: fila.descripcion,
                            categoria: fila.categoria,
                            precio: fila.precio,
                            precio_mayorista:
                                fila.precio_mayorista,
                            stock: fila.stock,
                            estado: fila.estado,
                            imagenes: []
                        };

                        productos.push(producto);
                    }

                    if (fila.nombre_imagen) {
                        producto.imagenes.push({
                            nombre: fila.nombre_imagen,
                            orden: fila.orden
                        });
                    }
                });

                res.json(productos);
            }
        );
    }
);

// =====================================================
// GET - Producto público por ID
// No requiere autenticación
// =====================================================
router.get("/publicos/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            p.id_producto,
            p.codigo,
            p.nombre,
            p.descripcion,
            p.categoria,
            p.precio,
            p.precio_mayorista,
            p.stock,
            p.estado,
            pi.nombre_imagen,
            pi.orden
        FROM productos p
        LEFT JOIN producto_imagenes pi
            ON p.id_producto = pi.id_producto
        WHERE p.id_producto = ?
        AND p.estado = 1
        ORDER BY pi.orden ASC
    `;

    conexion.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(
                "Error al obtener el producto público:",
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

        const producto = {
            id_producto: resultados[0].id_producto,
            codigo: resultados[0].codigo,
            nombre: resultados[0].nombre,
            descripcion: resultados[0].descripcion,
            categoria: resultados[0].categoria,
            precio: resultados[0].precio,
            precio_mayorista: resultados[0].precio_mayorista,
            stock: resultados[0].stock,
            estado: resultados[0].estado,
            imagenes: resultados
                .filter(fila => fila.nombre_imagen)
                .map(fila => ({
                    nombre: fila.nombre_imagen,
                    orden: fila.orden
                }))
        };

        res.json(producto);
    });
});

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
// POST - Crear producto con imágenes
// SOLO ADMINISTRADOR
// =====================================================
router.post(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    uploadImagenes.array("imagenes", 10),
    (req, res) => {

        const {
            codigo,
            nombre,
            descripcion,
            categoria,
            precio,
            precio_mayorista,
            stock,
            stock_minimo
        } = req.body;

        const archivos = req.files || [];

        // Validar campos obligatorios
        if (
            !codigo ||
            !nombre ||
            precio === undefined ||
            precio === ""
        ) {
            eliminarArchivosSubidos(archivos);

            return res.status(400).json({
                error: "El código, nombre y precio son obligatorios"
            });
        }

        // Validar precios
        if (
            !Number.isFinite(Number(precio)) ||
            Number(precio) < 0
        ) {
            eliminarArchivosSubidos(archivos);

            return res.status(400).json({
                error: "El precio debe ser un número válido y no negativo"
            });
        }

        if (
            precio_mayorista !== undefined &&
            precio_mayorista !== "" &&
            (
                !Number.isFinite(Number(precio_mayorista)) ||
                Number(precio_mayorista) < 0
            )
        ) {
            eliminarArchivosSubidos(archivos);

            return res.status(400).json({
                error: "El precio mayorista debe ser válido y no negativo"
            });
        }

        const cantidadStock = stock === undefined || stock === ""
            ? 0
            : Number(stock);

        const minimoStock = stock_minimo === undefined || stock_minimo === ""
            ? 5
            : Number(stock_minimo);

        if (
            !Number.isInteger(cantidadStock) ||
            cantidadStock < 0 ||
            !Number.isInteger(minimoStock) ||
            minimoStock < 0
        ) {
            eliminarArchivosSubidos(archivos);

            return res.status(400).json({
                error: "El stock y el stock mínimo deben ser enteros no negativos"
            });
        }

        const sqlProducto = `
            INSERT INTO productos
            (
                codigo,
                nombre,
                descripcion,
                categoria,
                precio,
                precio_mayorista,
                stock,
                stock_minimo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valoresProducto = [
            codigo.trim(),
            nombre.trim(),
            descripcion || null,
            categoria || null,
            Number(precio),
            precio_mayorista === undefined || precio_mayorista === ""
                ? null
                : Number(precio_mayorista),
            cantidadStock,
            minimoStock
        ];

        conexion.beginTransaction((error) => {
            if (error) {
                eliminarArchivosSubidos(archivos);

                return res.status(500).json({
                    error: "No se pudo iniciar la operación"
                });
            }

            conexion.query(
                sqlProducto,
                valoresProducto,
                (error, resultado) => {

                    if (error) {
                        return conexion.rollback(() => {
                            eliminarArchivosSubidos(archivos);

                            if (error.code === "ER_DUP_ENTRY") {
                                return res.status(409).json({
                                    error: "Ya existe un producto con ese código"
                                });
                            }

                            console.error("Error al crear producto:", error.message);

                            return res.status(500).json({
                                error: "Error al crear el producto"
                            });
                        });
                    }

                    const idProducto = resultado.insertId;

                    if (archivos.length === 0) {
                        return conexion.commit((errorCommit) => {
                            if (errorCommit) {
                                return conexion.rollback(() => {
                                    res.status(500).json({
                                        error: "No se pudo guardar el producto"
                                    });
                                });
                            }

                            res.status(201).json({
                                mensaje: "Producto creado correctamente",
                                id_producto: idProducto
                            });
                        });
                    }

                    const valoresImagenes = archivos.map((archivo, indice) => [
                        idProducto,
                        archivo.filename,
                        indice + 1
                    ]);

                    const sqlImagenes = `
                        INSERT INTO producto_imagenes
                        (id_producto, nombre_imagen, orden)
                        VALUES ?
                    `;

                    conexion.query(
                        sqlImagenes,
                        [valoresImagenes],
                        (errorImagenes) => {

                            if (errorImagenes) {
                                return conexion.rollback(() => {
                                    eliminarArchivosSubidos(archivos);

                                    console.error(
                                        "Error al guardar imágenes:",
                                        errorImagenes.message
                                    );

                                    res.status(500).json({
                                        error: "No se pudieron guardar las imágenes"
                                    });
                                });
                            }

                            conexion.commit((errorCommit) => {
                                if (errorCommit) {
                                    return conexion.rollback(() => {
                                        eliminarArchivosSubidos(archivos);

                                        res.status(500).json({
                                            error: "No se pudo completar el registro"
                                        });
                                    });
                                }

                                res.status(201).json({
                                    mensaje: "Producto e imágenes creados correctamente",
                                    id_producto: idProducto,
                                    imagenes: archivos.map(
                                        archivo => archivo.filename
                                    )
                                });
                            });
                        }
                    );
                }
            );
        });
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
            precio_mayorista,
            stock,
            stock_minimo
        } = req.body;

        // Validar campos obligatorios
        if (
            !nombre ||
            precio === undefined ||
            precio === ""
        ) {
            return res.status(400).json({
                error: "El nombre y el precio son obligatorios"
            });
        }

        // Validar precio de venta
        if (
            !Number.isFinite(Number(precio)) ||
            Number(precio) < 0
        ) {
            return res.status(400).json({
                error: "El precio debe ser un número válido y no negativo"
            });
        }

        // Validar precio mayorista, si se envía
        if (
            precio_mayorista !== undefined &&
            precio_mayorista !== "" &&
            (
                !Number.isFinite(Number(precio_mayorista)) ||
                Number(precio_mayorista) < 0
            )
        ) {
            return res.status(400).json({
                error: "El precio mayorista debe ser válido y no negativo"
            });
        }

        // Validar stock
        if (
            stock === undefined ||
            stock === "" ||
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                error: "El stock debe ser un entero no negativo"
            });
        }

        // Validar stock mínimo
        if (
            stock_minimo === undefined ||
            stock_minimo === "" ||
            !Number.isInteger(Number(stock_minimo)) ||
            Number(stock_minimo) < 0
        ) {
            return res.status(400).json({
                error: "El stock mínimo debe ser un entero no negativo"
            });
        }

        // Actualizar los datos del producto
        const sql = `
            UPDATE productos
            SET
                nombre = ?,
                descripcion = ?,
                categoria = ?,
                precio = ?,
                precio_mayorista = ?,
                stock = ?,
                stock_minimo = ?
            WHERE id_producto = ?
        `;

        const valores = [
            nombre.trim(),
            descripcion || null,
            categoria || null,
            Number(precio),
            precio_mayorista === undefined || precio_mayorista === ""
                ? null
                : Number(precio_mayorista),
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

                    // Código duplicado, si aplica alguna restricción
                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            error: "Ya existe un producto con esos datos"
                        });
                    }

                    return res.status(500).json({
                        error: "Error al actualizar el producto"
                    });
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Producto no encontrado"
                    });
                }

                res.json({
                    mensaje: "Producto actualizado correctamente"
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

function eliminarArchivosSubidos(archivos) {
    const carpetaImagenes = path.join(
        __dirname,
        "../../Catalogo/imagenes_productos"
    );

    archivos.forEach((archivo) => {
        const rutaArchivo = path.join(
            carpetaImagenes,
            path.basename(archivo.filename)
        );

        if (fs.existsSync(rutaArchivo)) {
            fs.unlink(rutaArchivo, (error) => {
                if (error) {
                    console.error(
                        "No se pudo eliminar el archivo:",
                        error.message
                    );
                }
            });
        }
    });
}

module.exports = router;