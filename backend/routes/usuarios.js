const express = require("express");
const router = express.Router();

const conexion = require("../db");

// =====================================================
// GET - Obtener todos los usuarios
// =====================================================
router.get("/", (req, res) => {
    const sql = "SELECT * FROM usuarios";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al consultar usuarios:", error.message);

            return res.status(500).json({
                error: "Error al obtener los usuarios"
            });
        }

        res.json(resultados);
    });
});


// =====================================================
// GET - Obtener un usuario por ID
// =====================================================
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM usuarios WHERE id_usuario = ?";

    conexion.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error("Error al consultar usuario:", error.message);

            return res.status(500).json({
                error: "Error al obtener el usuario"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        res.json(resultados[0]);
    });
});


// =====================================================
// POST - Crear un usuario
// =====================================================
router.post("/", (req, res) => {
    const {
        nombre,
        correo,
        contrasena,
        rol
    } = req.body;

    // Validación básica
    if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).json({
            error: "Todos los campos son obligatorios"
        });
    }

    const sql = `
        INSERT INTO usuarios
        (nombre, correo, contraseña, rol)
        VALUES (?, ?, ?, ?)
    `;

    const valores = [
        nombre,
        correo,
        contrasena,
        rol
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al crear usuario:", error.message);

            return res.status(500).json({
                error: "Error al crear el usuario"
            });
        }

        res.status(201).json({
            mensaje: "Usuario creado correctamente",
            id_usuario: resultado.insertId
        });
    });
});


// =====================================================
// PUT - Actualizar un usuario
// =====================================================
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        nombre,
        correo,
        contrasena,
        rol
    } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).json({
            error: "Todos los campos son obligatorios"
        });
    }

    const sql = `
        UPDATE usuarios
        SET nombre = ?,
            correo = ?,
            contraseña = ?,
            rol = ?
        WHERE id_usuario = ?
    `;

    const valores = [
        nombre,
        correo,
        contrasena,
        rol,
        id
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al actualizar usuario:", error.message);

            return res.status(500).json({
                error: "Error al actualizar el usuario"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        res.json({
            mensaje: "Usuario actualizado correctamente"
        });
    });
});


// =====================================================
// DELETE - Desactivar usuario
// =====================================================
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE usuarios
        SET estado = 0
        WHERE id_usuario = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error("Error al desactivar usuario:", error.message);

            return res.status(500).json({
                error: "Error al desactivar el usuario"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        res.json({
            mensaje: "Usuario desactivado correctamente"
        });
    });
});


module.exports = router;