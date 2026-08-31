const express = require("express");
const router = express.Router();

const conexion = require("../db");

// =====================================================
// GET - Obtener todas las categorías
// =====================================================
router.get("/", (req, res) => {
    const sql = "SELECT * FROM categorias ORDER BY id_categoria DESC";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al consultar categorías:", error.message);

            return res.status(500).json({
                error: "Error al obtener las categorías"
            });
        }

        res.json(resultados);
    });
});


// =====================================================
// GET - Obtener una categoría por ID
// =====================================================
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT *
        FROM categorias
        WHERE id_categoria = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error("Error al consultar categoría:", error.message);

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
    });
});


// =====================================================
// POST - Crear una categoría
// =====================================================
router.post("/", (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
        return res.status(400).json({
            error: "El nombre de la categoría es obligatorio"
        });
    }

    const sql = `
        INSERT INTO categorias
        (nombre, descripcion)
        VALUES (?, ?)
    `;

    conexion.query(
        sql,
        [nombre, descripcion || null],
        (error, resultado) => {

            if (error) {
                console.error("Error al crear categoría:", error.message);

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        error: "La categoría ya existe"
                    });
                }

                return res.status(500).json({
                    error: "Error al crear la categoría"
                });
            }

            res.status(201).json({
                mensaje: "Categoría creada correctamente",
                id_categoria: resultado.insertId
            });
        }
    );
});


// =====================================================
// PUT - Actualizar una categoría
// =====================================================
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
        return res.status(400).json({
            error: "El nombre de la categoría es obligatorio"
        });
    }

    const sql = `
        UPDATE categorias
        SET nombre = ?,
            descripcion = ?
        WHERE id_categoria = ?
    `;

    conexion.query(
        sql,
        [nombre, descripcion || null, id],
        (error, resultado) => {

            if (error) {
                console.error(
                    "Error al actualizar categoría:",
                    error.message
                );

                return res.status(500).json({
                    error: "Error al actualizar la categoría"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Categoría no encontrada"
                });
            }

            res.json({
                mensaje: "Categoría actualizada correctamente"
            });
        }
    );
});


// =====================================================
// DELETE - Desactivar una categoría
// =====================================================
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE categorias
        SET estado = 0
        WHERE id_categoria = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error(
                "Error al desactivar categoría:",
                error.message
            );

            return res.status(500).json({
                error: "Error al desactivar la categoría"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Categoría no encontrada"
            });
        }

        res.json({
            mensaje: "Categoría desactivada correctamente"
        });
    });
});


module.exports = router;