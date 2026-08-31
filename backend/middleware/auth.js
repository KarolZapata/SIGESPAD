const jwt = require("jsonwebtoken");

// La clave se obtiene desde el archivo .env
const JWT_SECRET = process.env.JWT_SECRET;

// =====================================================
// MIDDLEWARE - Verificar autenticación
// =====================================================
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "Token de autenticación requerido"
        });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            error: "Formato de token inválido"
        });
    }

    const token = partes[1];

    try {
        const usuario = jwt.verify(token, JWT_SECRET);

        req.usuario = usuario;

        next();

    } catch (error) {
        return res.status(401).json({
            error: "Token inválido o expirado"
        });
    }
};


// =====================================================
// MIDDLEWARE - Verificar rol
// =====================================================
const verificarRol = (...rolesPermitidos) => {

    return (req, res, next) => {

        if (!req.usuario) {
            return res.status(401).json({
                error: "Usuario no autenticado"
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: "No tiene permisos para realizar esta operación"
            });
        }

        next();
    };
};


module.exports = {
    verificarToken,
    verificarRol
};