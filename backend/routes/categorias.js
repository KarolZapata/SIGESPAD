const express = require("express");
const router = express.Router();

const conexion = require("../db");

const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");


// =====================================================
// GET - OBTENER TODAS LAS CATEGORÍAS
// ADMINISTRADOR Y VENDEDOR
// =====================================================
router.get(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const sql = `
            SELECT
                id_categoria,
                nombre,
                descripcion,
                estado
            FROM categorias
            ORDER BY id_categoria DESC
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {
                console.error(
                    "Error al consultar categorías:",
                    error.message
                );

                return res.status(500).json({
                    error: "Error al obtener las categorías"
                });
            }

            res.json(resultados);
        });
    }
);


// =====================================================
// GET - OBTENER CATEGORÍA POR ID
// ADMINISTRADOR Y VENDEDOR
// =====================================================
router.get(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR", "VENDEDOR"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            SELECT
                id_categoria,
                nombre,
                descripcion,
                estado
            FROM categorias
            WHERE id_categoria = ?
        `;

        conexion.query(
            sql,
            [id],
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar categoría:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener la categoría"
                    });
                }

                if (resultados.length === 0) {
                    return res.status(404).json({
                        error: "Categoría no encontrada"
                    });
                }

                res.json(resultados[0]);
            }
        );
    }
);


// =====================================================
// POST - CREAR CATEGORÍA
// SOLO ADMINISTRADOR
// =====================================================
router.post(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const {
            nombre,
            descripcion
        } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error:
                    "El nombre de la categoría es obligatorio"
            });
        }

        const sql = `
            INSERT INTO categorias
            (
                nombre,
                descripcion
            )
            VALUES (?, ?)
        `;

        conexion.query(
            sql,
            [
                nombre,
                descripcion || null
            ],
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al crear categoría:",
                        error.message
                    );

                    if (
                        error.code ===
                        "ER_DUP_ENTRY"
                    ) {
                        return res.status(400).json({
                            error:
                                "La categoría ya existe"
                        });
                    }

                    return res.status(500).json({
                        error:
                            "Error al crear la categoría"
                    });
                }

                res.status(201).json({
                    mensaje:
                        "Categoría creada correctamente",

                    id_categoria:
                        resultado.insertId
                });
            }
        );
    }
);


// =====================================================
// PUT - ACTUALIZAR CATEGORÍA
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
            descripcion
        } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error:
                    "El nombre de la categoría es obligatorio"
            });
        }

        const sql = `
            UPDATE categorias
            SET
                nombre = ?,
                descripcion = ?
            WHERE id_categoria = ?
        `;

        conexion.query(
            sql,
            [
                nombre,
                descripcion || null,
                id
            ],
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al actualizar categoría:",
                        error.message
                    );

                    if (
                        error.code ===
                        "ER_DUP_ENTRY"
                    ) {
                        return res.status(400).json({
                            error:
                                "La categoría ya existe"
                        });
                    }

                    return res.status(500).json({
                        error:
                            "Error al actualizar la categoría"
                    });
                }

                if (
                    resultado.affectedRows === 0
                ) {
                    return res.status(404).json({
                        error:
                            "Categoría no encontrada"
                    });
                }

                res.json({
                    mensaje:
                        "Categoría actualizada correctamente"
                });
            }
        );
    }
);


// =====================================================
// DELETE - DESACTIVAR CATEGORÍA
// SOLO ADMINISTRADOR
// =====================================================
router.delete(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            UPDATE categorias
            SET estado = 0
            WHERE id_categoria = ?
        `;

        conexion.query(
            sql,
            [id],
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al desactivar categoría:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al desactivar la categoría"
                    });
                }

                if (
                    resultado.affectedRows === 0
                ) {
                    return res.status(404).json({
                        error:
                            "Categoría no encontrada"
                    });
                }

                res.json({
                    mensaje:
                        "Categoría desactivada correctamente"
                });
            }
        );
    }
);

// =====================================================
// PUT - ACTIVAR CATEGORÍA
// SOLO ADMINISTRADOR
// =====================================================
router.put(
    "/:id/estado",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            SELECT id_categoria
            FROM categorias
            WHERE id_categoria = ?
        `;

        conexion.query(sql, [id], (error, resultados) => {

            if (error) {
                console.error(
                    "Error al consultar categoría:",
                    error.message
                );

                return res.status(500).json({
                    error: "Error al consultar la categoría"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    error: "Categoría no encontrada"
                });
            }

            const sqlActivar = `
                UPDATE categorias
                SET estado = 1
                WHERE id_categoria = ?
            `;

            conexion.query(
                sqlActivar,
                [id],
                (error) => {

                    if (error) {
                        console.error(
                            "Error al activar categoría:",
                            error.message
                        );

                        return res.status(500).json({
                            error: "Error al activar la categoría"
                        });
                    }

                    res.json({
                        mensaje: "Categoría activada correctamente"
                    });
                }
            );
        });
    }
);

module.exports = router;