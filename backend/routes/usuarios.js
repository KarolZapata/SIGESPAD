const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const conexion = require("../db");

const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;
const crypto = require("crypto");
const { enviarCorreo } = require("../services/correo");


// =====================================================
// POST - INICIAR SESIÓN
// RUTA PÚBLICA
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
            estado,
            correo_verificado
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

            // Verificar que el usuario esté activo
            if (usuario.estado !== 1) {
                return res.status(403).json({
                    error: "El usuario está inactivo"
                });
            }

            // Verificar contraseña
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

            if (
                usuario.rol === "CLIENTE" &&
                Number(usuario.correo_verificado) !== 1
            ) {
                return res.status(403).json({
                    error:
                        "Debes verificar tu correo electrónico antes de iniciar sesión."
                });
            }

            // Crear token JWT
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
 // POST - REGISTRO DE CLIENTE
 // RUTA PÚBLICA. El cliente debe verificar su correo.
 // =====================================================
router.post("/registro", async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (
        typeof nombre !== "string" ||
        typeof correo !== "string" ||
        typeof contrasena !== "string" ||
        !nombre.trim() ||
        !correo.trim() ||
        !contrasena
    ) {
        return res.status(400).json({
            error: "Nombre, correo y contraseña son obligatorios"
        });
    }

    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (nombreLimpio.length > 100) {
        return res.status(400).json({
            error: "El nombre no puede superar los 100 caracteres"
        });
    }

    const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        correoLimpio.length > 100 ||
        !patronCorreo.test(correoLimpio)
    ) {
        return res.status(400).json({
            error: "Ingresa un correo electrónico válido"
        });
    }

    const patronContrasena =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,128}$/;

    if (!patronContrasena.test(contrasena)) {
        return res.status(400).json({
            error:
                "La contraseña debe tener entre 8 y 128 caracteres, una mayúscula, una minúscula, un número y un símbolo especial, sin espacios."
        });
    }

    try {
        const sqlVerificar = `
            SELECT id_usuario
            FROM usuarios
            WHERE correo = ?
        `;

        conexion.query(
            sqlVerificar,
            [correoLimpio],
            async (error, resultados) => {
                if (error) {
                    console.error(
                        "Error al verificar correo:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al registrar el cliente"
                    });
                }

                if (resultados.length > 0) {
                    return res.status(400).json({
                        error: "El correo ya está registrado"
                    });
                }

                try {
                    const contrasenaHash = await bcrypt.hash(
                        contrasena,
                        10
                    );

                    // Token aleatorio y hash para guardarlo en la BD.
                    const token = crypto.randomBytes(32).toString("hex");
                    const tokenHash = crypto
                        .createHash("sha256")
                        .update(token)
                        .digest("hex");

                    const expiracion = new Date(
                        Date.now() + 24 * 60 * 60 * 1000
                    );

                    const sqlInsertar = `
                        INSERT INTO usuarios (
                            nombre,
                            correo,
                            contraseña,
                            rol,
                            estado,
                            correo_verificado,
                            token_verificacion,
                            token_verificacion_expira
                        )
                        VALUES (?, ?, ?, 'CLIENTE', 1, 0, ?, ?)
                    `;

                    conexion.query(
                        sqlInsertar,
                        [
                            nombreLimpio,
                            correoLimpio,
                            contrasenaHash,
                            tokenHash,
                            expiracion
                        ],
                        async (error, resultado) => {
                            if (error) {
                                console.error(
                                    "Error al registrar cliente:",
                                    error.message
                                );

                                if (error.code === "ER_DUP_ENTRY") {
                                    return res.status(400).json({
                                        error: "El correo ya está registrado"
                                    });
                                }

                                return res.status(500).json({
                                    error: "Error al registrar el cliente"
                                });
                            }

                            const frontendURL = (
                                process.env.FRONTEND_URL ||
                                "http://localhost:5173"
                            ).replace(/\/$/, "");

                            const enlace =
                                `${frontendURL}/verificar-correo?token=${token}`;

                            try {
                                await enviarCorreo({
                                    para: correoLimpio,
                                    asunto: "Verifica tu correo - SIGESPAD",
                                    html: `
                                        <html>
                                        <body style="margin:0;padding:0;background-color:#f2f5f9;font-family:Arial,Helvetica,sans-serif;color:#263449;">
                                            <div style="display:none;font-size:1px;color:#f2f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
                                                Confirma tu correo y activa tu cuenta de SIGESPAD.
                                            </div>

                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f2f5f9;padding:30px 12px;">
                                                <tr>
                                                    <td align="center">
                                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">

                                                            <!-- ENCABEZADO -->
                                                            <tr>
                                                                <td align="center" style="background:#142f53;padding:30px 20px;">
                                                                    <div style="font-size:24px;font-weight:bold;letter-spacing:1px;color:#ffffff;">
                                                                        PAPELERÍA SAN DIEGO
                                                                    </div>
                                                                    <div style="font-size:12px;color:#dce6f3;margin-top:8px;letter-spacing:1px;">
                                                                        CALIDAD · SERVICIO · CONFIANZA
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                            <!-- CONTENIDO -->
                                                            <tr>
                                                                <td style="padding:36px 30px 30px;">
                                                                    <h1 style="margin:0 0 22px;text-align:center;font-size:26px;line-height:1.3;color:#142f53;">
                                                                        ¡Te damos la bienvenida!
                                                                    </h1>

                                                                    <p style="font-size:15px;line-height:1.8;margin:0 0 16px;">
                                                                        Hola <strong>${nombreLimpio.replace(/[&<>"']/g, caracter => ({
                                                                            "&": "&amp;",
                                                                            "<": "&lt;",
                                                                            ">": "&gt;",
                                                                            '"': "&quot;",
                                                                            "'": "&#39;"
                                                                        })[caracter])}</strong>,
                                                                    </p>

                                                                    <p style="font-size:15px;line-height:1.8;margin:0 0 16px;color:#526176;">
                                                                        Gracias por registrarte en <strong>SIGESPAD</strong>, la plataforma de Papelería San Diego.
                                                                    </p>

                                                                    <p style="font-size:15px;line-height:1.8;margin:0 0 28px;color:#526176;">
                                                                        Para activar tu cuenta y comenzar a disfrutar de nuestros servicios, confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:
                                                                    </p>

                                                                    <!-- BOTÓN DE VERIFICACIÓN -->
                                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 28px;">
                                                                        <tr>
                                                                            <td align="center" bgcolor="#2458a6" style="border-radius:8px;">
                                                                                <a href="${enlace}" style="display:inline-block;padding:15px 30px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
                                                                                    Verificar mi correo
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>

                                                                    <!-- AVISO -->
                                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f6fc;border-radius:8px;margin-bottom:24px;">
                                                                        <tr>
                                                                            <td style="padding:16px 18px;">
                                                                                <p style="margin:0;font-size:13px;line-height:1.7;color:#526176;">
                                                                                    <strong style="color:#142f53;">Importante:</strong>
                                                                                    este enlace estará disponible durante 24 horas y solo puede utilizarse una vez.
                                                                                </p>
                                                                            </td>
                                                                        </tr>
                                                                    </table>

                                                                    <p style="font-size:12px;line-height:1.7;color:#788497;margin:0 0 8px;">
                                                                        ¿El botón no funciona? Copia y pega este enlace en tu navegador:
                                                                    </p>

                                                                    <p style="font-size:12px;line-height:1.7;overflow-wrap:anywhere;word-break:break-word;margin:0 0 24px;">
                                                                        <a href="${enlace}" style="color:#2458a6;">${enlace}</a>
                                                                    </p>

                                                                    <p style="font-size:13px;line-height:1.7;color:#788497;margin:0;">
                                                                        Si no creaste esta cuenta, puedes ignorar este mensaje.
                                                                    </p>
                                                                </td>
                                                            </tr>

                                                            <!-- PIE DE PÁGINA -->
                                                            <tr>
                                                                <td align="center" style="background:#f8fafc;border-top:1px solid #e8edf3;padding:24px 18px;">
                                                                    <p style="margin:0 0 7px;font-size:14px;font-weight:bold;color:#142f53;">
                                                                        Papelería San Diego
                                                                    </p>
                                                                    <p style="margin:0;font-size:11px;line-height:1.8;color:#8994a4;">
                                                                        Este es un mensaje automático de SIGESPAD.<br>
                                                                        Por favor, no respondas a este correo.
                                                                    </p>
                                                                </td>
                                                            </tr>

                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </body>
                                        </html>
                                    `
                                });

                                return res.status(201).json({
                                    mensaje:
                                        "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
                                    id_usuario: resultado.insertId
                                });
                            } catch (errorCorreo) {
                                console.error(
                                    "Error al enviar correo de verificación:",
                                    errorCorreo.message
                                );

                                // La cuenta existe, pero permanece sin verificar.
                                return res.status(201).json({
                                    mensaje:
                                        "Tu cuenta fue creada, pero no pudimos enviar el correo de verificación. Contacta al administrador para solicitar un nuevo enlace.",
                                    id_usuario: resultado.insertId,
                                    correoEnviado: false
                                });
                            }
                        }
                    );
                } catch (error) {
                    console.error(
                        "Error al procesar el registro:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error interno del servidor"
                    });
                }
            }
        );
    } catch (error) {
        console.error(
            "Error al registrar cliente:",
            error.message
        );

        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});


/**
 * POST - VERIFICAR CORREO
 * Recibe el token enviado por correo y activa la cuenta.
 */
router.post("/verificar-correo", (req, res) => {
    const { token } = req.body;

    if (typeof token !== "string" || !token.trim()) {
        return res.status(400).json({
            error: "El enlace de verificación no es válido."
        });
    }

    const tokenHash = crypto
        .createHash("sha256")
        .update(token.trim())
        .digest("hex");

    const sql = `
        SELECT id_usuario
        FROM usuarios
        WHERE token_verificacion = ?
          AND token_verificacion_expira > NOW()
          AND correo_verificado = 0
          AND rol = 'CLIENTE'
        LIMIT 1
    `;

    conexion.query(sql, [tokenHash], (error, resultados) => {
        if (error) {
            console.error(
                "Error al verificar correo:",
                error.message
            );

            return res.status(500).json({
                error: "No fue posible verificar el correo."
            });
        }

        if (resultados.length === 0) {
            return res.status(400).json({
                error:
                    "El enlace es inválido, ya fue utilizado o ha expirado."
            });
        }

        const sqlActualizar = `
            UPDATE usuarios
            SET correo_verificado = 1,
                token_verificacion = NULL,
                token_verificacion_expira = NULL
            WHERE id_usuario = ?
        `;

        conexion.query(
            sqlActualizar,
            [resultados[0].id_usuario],
            (error) => {
                if (error) {
                    console.error(
                        "Error al activar la cuenta:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "No fue posible activar la cuenta."
                    });
                }

                return res.json({
                    mensaje:
                        "Correo verificado correctamente. Ya puedes iniciar sesión."
                });
            }
        );
    });
});



 // =====================================================
 // POST - SOLICITAR RECUPERACIÓN DE CONTRASEÑA
 // RUTA PÚBLICA
 // =====================================================

router.post("/solicitar-recuperacion", (req, res) => {

    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({
            error: "El correo es obligatorio"
        });
    }

    const sql = `
        SELECT id_usuario, nombre, correo
        FROM usuarios
        WHERE correo = ?
        AND estado = 1
    `;

    conexion.query(
        sql,
        [correo],
        async (error, resultados) => {

            if (error) {
                console.error(
                    "Error al buscar usuario:",
                    error.message
                );

                return res.status(500).json({
                    error: "Error al procesar la solicitud"
                });
            }

            // Por seguridad, no revelamos si el correo existe.
            if (resultados.length === 0) {
                return res.json({
                    mensaje:
                        "Si el correo está registrado, recibirás un código de recuperación."
                });
            }

            const usuario = resultados[0];

            // Generar código de recuperación de 6 dígitos.
            const codigo = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            // El código será válido durante 15 minutos.
            const expiracion = new Date(
                Date.now() + 15 * 60 * 1000
            );

            const sqlActualizar = `
                UPDATE usuarios
                SET
                    codigo_recuperacion = ?,
                    codigo_recuperacion_expira = ?
                WHERE id_usuario = ?
            `;

            conexion.query(
                sqlActualizar,
                [
                    codigo,
                    expiracion,
                    usuario.id_usuario
                ],
                async (error) => {

                    if (error) {
                        console.error(
                            "Error al guardar código:",
                            error.message
                        );

                        return res.status(500).json({
                            error:
                                "No fue posible generar el código"
                        });
                    }

                    try {

                        // Reutilizar el servicio de correo de SIGESPAD.
                        await enviarCorreo({
                            para: usuario.correo,

                            asunto:
                                "Código para recuperar tu contraseña - SIGESPAD",

                            html: `
                                <div style="
                                    font-family: Arial, sans-serif;
                                    max-width: 500px;
                                    margin: auto;
                                    padding: 30px;
                                    border: 1px solid #ddd;
                                    border-radius: 10px;
                                ">

                                    <h2 style="
                                        color: #12345b;
                                    ">
                                        Recuperación de contraseña
                                    </h2>

                                    <p>
                                        Hola ${usuario.nombre},
                                    </p>

                                    <p>
                                        Recibimos una solicitud para
                                        restablecer tu contraseña de SIGESPAD.
                                    </p>

                                    <p>
                                        Tu código de recuperación es:
                                    </p>

                                    <div style="
                                        font-size: 32px;
                                        font-weight: bold;
                                        letter-spacing: 8px;
                                        text-align: center;
                                        margin: 25px 0;
                                        color: #12345b;
                                    ">
                                        ${codigo}
                                    </div>

                                    <p>
                                        Este código es válido durante
                                        <strong>15 minutos</strong>.
                                    </p>

                                    <p>
                                        Si no solicitaste este cambio,
                                        puedes ignorar este mensaje.
                                    </p>

                                    <hr>

                                    <small>
                                        SIGESPAD - Gestión para
                                        Papelería San Diego
                                    </small>

                                </div>
                            `
                        });

                        return res.json({
                            mensaje:
                                "Si el correo está registrado, recibirás un código de recuperación."
                        });

                    } catch (error) {

                        console.error(
                            "Error enviando correo de recuperación:",
                            error.message
                        );

                        return res.status(500).json({
                            error:
                                "No fue posible enviar el correo de recuperación"
                        });
                    }
                }
            );
        }
    );
});


 // =====================================================
 // POST - VERIFICAR CÓDIGO DE RECUPERACIÓN
 // RUTA PÚBLICA
 // =====================================================

router.post("/verificar-codigo-recuperacion", (req, res) => {

    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        return res.status(400).json({
            error: "El correo y el código son obligatorios"
        });
    }

    if (!/^\d{6}$/.test(String(codigo))) {
        return res.status(400).json({
            error: "El código debe tener 6 dígitos"
        });
    }

    const sql = `
        SELECT id_usuario
        FROM usuarios
        WHERE correo = ?
          AND estado = 1
          AND codigo_recuperacion = ?
          AND codigo_recuperacion_expira > NOW()
    `;

    conexion.query(
        sql,
        [correo.trim(), String(codigo)],
        (error, resultados) => {

            if (error) {
                console.error(
                    "Error al verificar código:",
                    error.message
                );

                return res.status(500).json({
                    error: "No fue posible verificar el código"
                });
            }

            if (resultados.length === 0) {
                return res.status(400).json({
                    error: "El código es incorrecto o ha vencido"
                });
            }

            return res.json({
                valido: true,
                mensaje: "Código verificado correctamente"
            });
        }
    );
});



 // =====================================================
 // POST - RESTABLECER CONTRASEÑA
 // RUTA PÚBLICA
 // =====================================================

router.post("/restablecer-contrasena", async (req, res) => {
    const {
        correo,
        codigo,
        nuevaContrasena
    } = req.body;

    // Validar campos obligatorios
    if (!correo || !codigo || !nuevaContrasena) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    // Validar formato del código
    if (!/^\d{6}$/.test(String(codigo))) {
        return res.status(400).json({
            mensaje: "El código debe tener 6 dígitos"
        });
    }

    // Validar tipo de contraseña
    if (typeof nuevaContrasena !== "string") {
        return res.status(400).json({
            mensaje: "La contraseña no es válida"
        });
    }

    // Validar requisitos de seguridad de la contraseña
    const requisitosContrasena = [
        {
            valido: nuevaContrasena.length >= 8,
            mensaje: "La contraseña debe tener al menos 8 caracteres"
        },
        {
            valido: /[A-Z]/.test(nuevaContrasena),
            mensaje: "La contraseña debe contener una letra mayúscula"
        },
        {
            valido: /[a-z]/.test(nuevaContrasena),
            mensaje: "La contraseña debe contener una letra minúscula"
        },
        {
            valido: /[0-9]/.test(nuevaContrasena),
            mensaje: "La contraseña debe contener un número"
        },
        {
            valido: /[^A-Za-z0-9]/.test(nuevaContrasena),
            mensaje: "La contraseña debe contener un símbolo especial"
        }
    ];

    const requisitoIncumplido = requisitosContrasena.find(
        (requisito) => !requisito.valido
    );

    if (requisitoIncumplido) {
        return res.status(400).json({
            mensaje: requisitoIncumplido.mensaje
        });
    }

    try {
        // Validar el código nuevamente en el servidor
        const sqlBuscar = `
            SELECT id_usuario
            FROM usuarios
            WHERE correo = ?
              AND estado = 1
              AND codigo_recuperacion = ?
              AND codigo_recuperacion_expira > NOW()
        `;

        conexion.query(
            sqlBuscar,
            [correo.trim(), String(codigo)],
            async (error, resultados) => {
                if (error) {
                    console.error(
                        "Error al validar recuperación:",
                        error.message
                    );

                    return res.status(500).json({
                        mensaje: "No fue posible validar la recuperación"
                    });
                }

                if (resultados.length === 0) {
                    return res.status(400).json({
                        mensaje: "El código es incorrecto o ha vencido"
                    });
                }

                try {
                    const usuario = resultados[0];

                    // Cifrar la nueva contraseña
                    const hash = await bcrypt.hash(
                        nuevaContrasena,
                        10
                    );

                    // Actualizar contraseña e invalidar el código
                    const sqlActualizar = `
                        UPDATE usuarios
                        SET
                            contraseña = ?,
                            codigo_recuperacion = NULL,
                            codigo_recuperacion_expira = NULL
                        WHERE id_usuario = ?
                          AND correo = ?
                          AND estado = 1
                          AND codigo_recuperacion = ?
                          AND codigo_recuperacion_expira > NOW()
                    `;

                    conexion.query(
                        sqlActualizar,
                        [
                            hash,
                            usuario.id_usuario,
                            correo.trim(),
                            String(codigo)
                        ],
                        (error, resultado) => {
                            if (error) {
                                console.error(
                                    "Error al actualizar contraseña:",
                                    error.message
                                );

                                return res.status(500).json({
                                    mensaje:
                                        "No fue posible actualizar la contraseña"
                                });
                            }

                            if (resultado.affectedRows === 0) {
                                return res.status(400).json({
                                    mensaje:
                                        "El código venció o ya fue utilizado"
                                });
                            }

                            return res.json({
                                mensaje:
                                    "Tu contraseña se ha cambiado correctamente"
                            });
                        }
                    );
                } catch (error) {
                    console.error(
                        "Error al cifrar contraseña:",
                        error.message
                    );

                    return res.status(500).json({
                        mensaje:
                            "No fue posible restablecer la contraseña"
                    });
                }
            }
        );
    } catch (error) {
        console.error(
            "Error en restablecimiento:",
            error.message
        );

        return res.status(500).json({
            mensaje:
                "Ocurrió un error al restablecer la contraseña"
        });
    }
});

// =====================================================
// GET - OBTENER TODOS LOS USUARIOS
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

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

        conexion.query(
            sql,
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar usuarios:",
                        error.message
                    );

                    return res.status(500).json({
                        error: "Error al obtener los usuarios"
                    });
                }

                res.json(resultados);
            }
        );
    }
);


// =====================================================
// GET - OBTENER USUARIO POR ID
// SOLO ADMINISTRADOR
// =====================================================
router.get(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

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

        conexion.query(
            sql,
            [id],
            (error, resultados) => {

                if (error) {
                    console.error(
                        "Error al consultar usuario:",
                        error.message
                    );

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
            }
        );
    }
);


// =====================================================
// POST - CREAR USUARIO
// SOLO ADMINISTRADOR
// =====================================================
router.post(
    "/",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    async (req, res) => {

        const {
            nombre,
            correo,
            contrasena,
            rol
        } = req.body;

        // Validar campos
        if (
            !nombre ||
            !correo ||
            !contrasena ||
            !rol
        ) {
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

        // Validar contraseña mínima
        if (contrasena.length < 6) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        try {

            const contrasenaHash =
                await bcrypt.hash(
                    contrasena,
                    10
                );

            const sql = `
                INSERT INTO usuarios
                (
                    nombre,
                    correo,
                    contraseña,
                    rol
                )
                VALUES (?, ?, ?, ?)
            `;

            conexion.query(
                sql,
                [
                    nombre,
                    correo,
                    contrasenaHash,
                    rol
                ],
                (error, resultado) => {

                    if (error) {

                        console.error(
                            "Error al crear usuario:",
                            error.message
                        );

                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        ) {
                            return res.status(400).json({
                                error: "El correo ya está registrado"
                            });
                        }

                        return res.status(500).json({
                            error: "Error al crear el usuario"
                        });
                    }

                    res.status(201).json({
                        mensaje:
                            "Usuario creado correctamente",
                        id_usuario:
                            resultado.insertId
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
    }
);



 // =====================================================
 // PUT - ACTUALIZAR USUARIO
 // SOLO ADMINISTRADOR
 // =====================================================
router.put(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    async (req, res) => {
        const { id } = req.params;
        const { nombre, correo, contrasena, rol } = req.body;

        // Validar campos obligatorios (la contraseña es opcional)
        if (!nombre || !correo || !rol) {
            return res.status(400).json({
                error: "Nombre, correo y rol son obligatorios"
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

        // Solo cambiar la contraseña si se proporcionó una nueva
        const cambiarContrasena =
            typeof contrasena === "string" &&
            contrasena.length > 0;

        if (cambiarContrasena && contrasena.length < 6) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        try {
            let sql;
            let parametros;

            if (cambiarContrasena) {
                const contrasenaHash = await bcrypt.hash(
                    contrasena,
                    10
                );

                sql = `
                    UPDATE usuarios
                    SET
                        nombre = ?,
                        correo = ?,
                        contraseña = ?,
                        rol = ?
                    WHERE id_usuario = ?
                `;

                parametros = [
                    nombre,
                    correo,
                    contrasenaHash,
                    rol,
                    id
                ];
            } else {
                sql = `
                    UPDATE usuarios
                    SET
                        nombre = ?,
                        correo = ?,
                        rol = ?
                    WHERE id_usuario = ?
                `;

                parametros = [
                    nombre,
                    correo,
                    rol,
                    id
                ];
            }

            conexion.query(
                sql,
                parametros,
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
            console.error(
                "Error interno:",
                error.message
            );

            res.status(500).json({
                error: "Error interno del servidor"
            });
        }
    }
);


// =====================================================
// DELETE - DESACTIVAR USUARIO
// SOLO ADMINISTRADOR
// =====================================================
router.delete(
    "/:id",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;

        // Evitar que un administrador se desactive a sí mismo
        if (
            Number(id) ===
            Number(req.usuario.id_usuario)
        ) {
            return res.status(400).json({
                error:
                    "No puede desactivar su propio usuario"
            });
        }

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
                        error:
                            "Error al desactivar el usuario"
                    });
                }

                if (
                    resultado.affectedRows === 0
                ) {
                    return res.status(404).json({
                        error:
                            "Usuario no encontrado"
                    });
                }

                res.json({
                    mensaje:
                        "Usuario desactivado correctamente"
                });
            }
        );
    }
);


// =====================================================
// PUT - ACTIVAR USUARIO
// SOLO ADMINISTRADOR
// =====================================================
router.put(
    "/:id/activar",
    verificarToken,
    verificarRol("ADMINISTRADOR"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            UPDATE usuarios
            SET estado = 1
            WHERE id_usuario = ?
        `;

        conexion.query(
            sql,
            [id],
            (error, resultado) => {

                if (error) {

                    console.error(
                        "Error al activar usuario:",
                        error.message
                    );

                    return res.status(500).json({
                        error:
                            "Error al activar el usuario"
                    });
                }

                if (
                    resultado.affectedRows === 0
                ) {
                    return res.status(404).json({
                        error:
                            "Usuario no encontrado"
                    });
                }

                res.json({
                    mensaje:
                        "Usuario activado correctamente"
                });
            }
        );
    }
);


module.exports = router;