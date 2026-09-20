const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const db = require("../db");

// Ruta del CSV
const rutaCSV = path.join(
  __dirname,
  "../../Catalogo/Catalogo_SIGESPAD_44.csv"
);

// Carpeta donde están las imágenes
const carpetaImagenes = path.join(
  __dirname,
  "../../Catalogo/imagenes_productos"
);

// Convertir db.query de callbacks a Promise
function ejecutarConsulta(sql, valores = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, valores, (error, resultados) => {
      if (error) {
        reject(error);
      } else {
        resolve(resultados);
      }
    });
  });
}

async function importarCatalogo() {
  try {
    console.log("======================================");
    console.log("   IMPORTADOR DE CATÁLOGO SIGESPAD");
    console.log("======================================");

    // Verificar CSV
    if (!fs.existsSync(rutaCSV)) {
      throw new Error(`No se encontró el archivo CSV en: ${rutaCSV}`);
    }

    // Verificar carpeta de imágenes
    if (!fs.existsSync(carpetaImagenes)) {
      throw new Error(
        `No se encontró la carpeta de imágenes en: ${carpetaImagenes}`
      );
    }

    // Leer CSV
    const contenidoCSV = fs.readFileSync(rutaCSV, "utf8");

    const productos = parse(contenidoCSV, {
      columns: true,
      delimiter: ";",
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });

    console.log(`Productos encontrados en el CSV: ${productos.length}`);
    console.log("");

    let nuevos = 0;
    let actualizados = 0;
    let imagenesRegistradas = 0;

    // Obtener archivos de imágenes
    const archivosImagenes = fs
      .readdirSync(carpetaImagenes)
      .filter((archivo) =>
        /\.(jpg|jpeg|png|webp)$/i.test(archivo)
      );

    console.log(
      `Imágenes encontradas en la carpeta: ${archivosImagenes.length}`
    );
    console.log("");

    // ==========================================
    // IMPORTAR PRODUCTOS
    // ==========================================

    for (const producto of productos) {
      const codigo = producto["Código"]?.trim();
      const nombre = producto["Nombre"]?.trim();
      const descripcion = producto["Descripción"]?.trim() || null;
      const categoria = producto["Categoría"]?.trim() || null;

      const precio = parseFloat(
        String(producto["Precio normal"]).replace(",", ".")
      );

      const precioMayorista = producto["Precio mayorista"]
        ? parseFloat(
            String(producto["Precio mayorista"]).replace(",", ".")
          )
        : null;

      const stock = parseInt(producto["Stock"], 10);
      const stockMinimo = parseInt(producto["Stock minimo"], 10);

      if (!codigo || !nombre) {
        console.log("⚠️ Producto omitido: falta código o nombre.");
        continue;
      }

      if (isNaN(precio) || isNaN(stock) || isNaN(stockMinimo)) {
        console.log(`⚠️ ${codigo} omitido: datos numéricos inválidos.`);
        continue;
      }

      // Buscar producto existente
      const existentes = await ejecutarConsulta(
        "SELECT id_producto FROM productos WHERE codigo = ?",
        [codigo]
      );

      let idProducto;

      if (existentes.length > 0) {
        idProducto = existentes[0].id_producto;

        await ejecutarConsulta(
          `UPDATE productos
           SET nombre = ?,
               descripcion = ?,
               categoria = ?,
               precio = ?,
               precio_mayorista = ?,
               stock = ?,
               stock_minimo = ?
           WHERE codigo = ?`,
          [
            nombre,
            descripcion,
            categoria,
            precio,
            precioMayorista,
            stock,
            stockMinimo,
            codigo,
          ]
        );

        actualizados++;

        console.log(`🔄 Actualizado: ${codigo} - ${nombre}`);
      } else {
        const resultado = await ejecutarConsulta(
          `INSERT INTO productos
           (codigo, nombre, descripcion, categoria, precio,
            precio_mayorista, stock, stock_minimo, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            codigo,
            nombre,
            descripcion,
            categoria,
            precio,
            precioMayorista,
            stock,
            stockMinimo,
          ]
        );

        idProducto = resultado.insertId;

        nuevos++;

        console.log(`✅ Creado: ${codigo} - ${nombre}`);
      }

      // ==========================================
      // REGISTRAR IMÁGENES DEL PRODUCTO
      // ==========================================

      // Eliminar relaciones anteriores de este producto
      await ejecutarConsulta(
        "DELETE FROM producto_imagenes WHERE id_producto = ?",
        [idProducto]
      );

      // Buscar imágenes cuyo nombre corresponda al código
      const imagenesProducto = archivosImagenes
        .filter((archivo) => {
          const nombreArchivo = path.parse(archivo).name;

          return (
            nombreArchivo === codigo ||
            nombreArchivo.startsWith(`${codigo}-`)
          );
        })
        .sort((a, b) => a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: "base",
        }));

      // Registrar imágenes encontradas
      let orden = 1;

      for (const imagen of imagenesProducto) {
        await ejecutarConsulta(
          `INSERT INTO producto_imagenes
           (id_producto, nombre_imagen, orden)
           VALUES (?, ?, ?)`,
          [idProducto, imagen, orden]
        );

        console.log(`   🖼️ ${imagen}`);

        orden++;
        imagenesRegistradas++;
      }

      if (imagenesProducto.length === 0) {
        console.log(`   ⚠️ Sin imagen encontrada para ${codigo}`);
      }
    }

    console.log("");
    console.log("======================================");
    console.log("       IMPORTACIÓN FINALIZADA");
    console.log("======================================");
    console.log(`Productos nuevos: ${nuevos}`);
    console.log(`Productos actualizados: ${actualizados}`);
    console.log(`Imágenes registradas: ${imagenesRegistradas}`);
    console.log(`Total productos procesados: ${productos.length}`);
    console.log("======================================");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("❌ ERROR DURANTE LA IMPORTACIÓN");
    console.error(error.message);
    process.exit(1);
  }
}

importarCatalogo();