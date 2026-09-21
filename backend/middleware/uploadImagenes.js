
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpetaImagenes = path.join(
  __dirname,
  "../../Catalogo/imagenes_productos"
);

if (!fs.existsSync(carpetaImagenes)) {
  fs.mkdirSync(carpetaImagenes, { recursive: true });
}

const tiposPermitidos = [".jpg", ".jpeg", ".png", ".webp"];

const filtroImagenes = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!tiposPermitidos.includes(extension)) {
    return cb(
      new Error("Formato no permitido. Usa JPG, JPEG, PNG o WEBP.")
    );
  }

  cb(null, true);
};

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaImagenes);
  },

  filename: (req, file, cb) => {
    const codigo = req.body.codigo?.trim();

    if (!codigo) {
      return cb(new Error("No se recibió el código del producto."));
    }

    // Contador independiente para cada solicitud
    req.contadorImagenes = (req.contadorImagenes || 0) + 1;

    const extension = path.extname(file.originalname).toLowerCase();
    const numero = String(req.contadorImagenes).padStart(2, "0");
    const nombreArchivo = `${codigo}-${numero}${extension}`;
    const rutaArchivo = path.join(carpetaImagenes, nombreArchivo);

    if (fs.existsSync(rutaArchivo)) {
      return cb(
        new Error(`Ya existe una imagen con el nombre ${nombreArchivo}`)
      );
    }

    cb(null, nombreArchivo);
  },
});

const uploadImagenes = multer({
  storage: almacenamiento,
  fileFilter: filtroImagenes,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadImagenes;