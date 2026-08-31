const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const conexion = require("../db");

const JWT_SECRET = "SIGESPAD_SECRET_2026";

// =====================================================
// GET - Obtener todos los usuarios
// =====================================================
router.get("/", (req, res) => {
    const sql = `
        SELECT
            id_usuario,
            nombre,
            correo,
            rol,
            estado,
            fecha_creacion
        FROM usuarios
        ORDER BY id_usuario DESC
    `;

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

    const sql = `
        SELECT
            id_usuario,
            nombre,
            correo,
            rol,
            estado,
            fecha_creacion
        FROM usuarios
        WHERE id_usuario = ?
    `;

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
// POST - Crear usuario
// =====================================================
router.post("/", async (req, res) => {
    const {
        nombre,
        correo,
        contrasena,
        rol
    } = req.body;

    // Validación
    if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).json({
            error: "Todos los campos son obligatorios"
        });
    }

    const rolesPermitidos = [
        "ADMINISTRADOR",
        "VENDEDOR"
    ];

    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({
            error: "El rol no es válido"
        });
    }

    try {
        // Encriptar contraseña
        const contrasenaHash = await bcrypt.hash(contrasena, 10);

        const sql = `
            INSERT INTO usuarios
            (nombre, correo, contraseña, rol)
            VALUES (?, ?, ?, ?)
        `;

        conexion.query(
            sql,
            [nombre, correo, contrasenaHash, rol],
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al crear usuario:",
                        error.message
                    );

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            error: "El correo ya está registrado"
                        });
                    }

                    return res.status(500).json({
                        error: "Error al crear el usuario"
                    });
                }

                res.status(201).json({
                    mensaje: "Usuario creado correctamente",
                    id_usuario: resultado.insertId
                });
            }
        );

    } catch (error) {
        console.error(
            "Error al encriptar contraseña:",
            error.message
        );

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});


// =====================================================
// POST - INICIAR SESIÓN
// =====================================================
router.post("/login", (req, res) => {
    const {
        correo,
        contrasena
    } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({
            error: "Correo y contraseña son obligatorios"
        });
    }

    const sql = `
        SELECT
            id_usuario,
            nombre,
            correo,
            contraseña,
            rol,
            estado
        FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(
        sql,
        [correo],
        async (error, resultados) => {

            if (error) {
                console.error(
                    "Error al iniciar sesión:",
                    error.message
                );

                return res.status(500).json({
                    error: "Error al iniciar sesión"
                });
            }

            if (resultados.length === 0) {
                return res.status(401).json({
                    error: "Correo o contraseña incorrectos"
                });
            }

            const usuario = resultados[0];

            // Verificar estado
            if (usuario.estado !== 1) {
                return res.status(403).json({
                    error: "El usuario está inactivo"
                });
            }

            // Comparar contraseña
            const contraseñaCorrecta =
                await bcrypt.compare(
                    contrasena,
                    usuario.contraseña
                );

            if (!contraseñaCorrecta) {
                return res.status(401).json({
                    error: "Correo o contraseña incorrectos"
                });
            }

            // Crear token
            const token = jwt.sign(
                {
                    id_usuario: usuario.id_usuario,
                    correo: usuario.correo,
                    rol: usuario.rol
                },
                JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );

            res.json({
                mensaje: "Inicio de sesión exitoso",
                token: token,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });
        }
    );
});


// =====================================================
// PUT - Actualizar usuario
// =====================================================
router.put("/:id", async (req, res) => {
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

    const rolesPermitidos = [
        "ADMINISTRADOR",
        "VENDEDOR"
    ];

    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({
            error: "El rol no es válido"
        });
    }

    try {
        const contrasenaHash =
            await bcrypt.hash(contrasena, 10);

        const sql = `
            UPDATE usuarios
            SET nombre = ?,
                correo = ?,
                contraseña = ?,
                rol = ?
            WHERE id_usuario = ?
        `;

        conexion.query(
            sql,
            [
                nombre,
                correo,
                contrasenaHash,
                rol,
                id
            ],
            (error, resultado) => {

                if (error) {
                    console.error(
                        "Error al actualizar usuario:",
                        error.message
                    );

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            error: "El correo ya está registrado"
                        });
                    }

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
            }
        );

    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
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

    conexion.query(
        sql,
        [id],
        (error, resultado) => {

            if (error) {
                console.error(
                    "Error al desactivar usuario:",
                    error.message
                );

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
        }
    );
});


module.exports = router;