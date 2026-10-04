const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const db = require("../db");

// =====================================================
// RUTAS
// =====================================================

const rutaCSV = path.join(
  __dirname,
  "../../Catalogo/Catalogo_SIGESPAD_productos.csv"
);

const carpetaImagenes = path.join(
  __dirname,
  "../../Catalogo/imagenes_productos"
);

// =====================================================
// CONSULTAS MYSQL COMO PROMESAS
// =====================================================

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

// =====================================================
// IMPORTADOR
// =====================================================

async function importarCatalogo() {
  let conexion;

  try {
    console.log("");
    console.log("======================================");
    console.log("   IMPORTADOR DE CATÁLOGO SIGESPAD");
    console.log("======================================");
    console.log("");

    // =================================================
    // 1. VERIFICAR CSV
    // =================================================

    if (!fs.existsSync(rutaCSV)) {
      throw new Error(
        `No se encontró el archivo CSV en:\n${rutaCSV}`
      );
    }

    console.log("✓ CSV encontrado");

    // =================================================
    // 2. VERIFICAR CARPETA DE IMÁGENES
    // =================================================

    if (!fs.existsSync(carpetaImagenes)) {
      throw new Error(
        `No se encontró la carpeta de imágenes en:\n${carpetaImagenes}`
      );
    }

    console.log("✓ Carpeta de imágenes encontrada");
    console.log("");

    // =================================================
    // 3. LEER CSV
    // =================================================

    const contenidoCSV = fs.readFileSync(
      rutaCSV,
      "utf8"
    );

    const productos = parse(contenidoCSV, {
      columns: true,
      delimiter: ";",
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });

    console.log(
      `Productos encontrados en el CSV: ${productos.length}`
    );

    // =================================================
    // 4. VALIDAR CÓDIGOS DEL CSV
    // =================================================

    console.log("");
    console.log("Validando códigos del catálogo...");

    const codigos = new Set();
    const codigosDuplicados = new Set();

    for (const producto of productos) {
      const codigo = producto["Código"]?.trim();

      if (!codigo) {
        continue;
      }

      if (codigos.has(codigo)) {
        codigosDuplicados.add(codigo);
      }

      codigos.add(codigo);
    }

    if (codigosDuplicados.size > 0) {
      console.log("");
      console.log(
        "❌ Se encontraron códigos duplicados en el CSV:"
      );

      for (const codigo of codigosDuplicados) {
        console.log(`   - ${codigo}`);
      }

      console.log("");
      throw new Error(
        "La importación fue cancelada porque existen códigos duplicados en el CSV."
      );
    }

    console.log("✓ No existen códigos duplicados");
    console.log("");

    // =================================================
    // 5. OBTENER IMÁGENES
    // =================================================

    const archivosImagenes = fs
      .readdirSync(carpetaImagenes)
      .filter((archivo) =>
        /\.(jpg|jpeg|png|webp)$/i.test(archivo)
      );

    console.log(
      `Imágenes encontradas: ${archivosImagenes.length}`
    );

    console.log("");

    // =================================================
    // 6. VALIDAR DATOS NUMÉRICOS ANTES DE IMPORTAR
    // =================================================

    console.log("Validando datos de productos...");

    const productosInvalidos = [];

    for (const producto of productos) {
      const codigo = producto["Código"]?.trim();
      const nombre = producto["Nombre"]?.trim();

      const precio = parseFloat(
        String(producto["Precio normal"]).replace(",", ".")
      );

      const stock = parseInt(
        producto["Stock"],
        10
      );

      const stockMinimo = parseInt(
        producto["Stock minimo"],
        10
      );

      if (
        !codigo ||
        !nombre ||
        Number.isNaN(precio) ||
        Number.isNaN(stock) ||
        Number.isNaN(stockMinimo)
      ) {
        productosInvalidos.push(
          codigo || "(sin código)"
        );
      }
    }

    if (productosInvalidos.length > 0) {
      console.log("");
      console.log(
        "❌ Se encontraron productos con datos inválidos:"
      );

      for (const codigo of productosInvalidos) {
        console.log(`   - ${codigo}`);
      }

      console.log("");

      throw new Error(
        "La importación fue cancelada porque existen datos inválidos en el CSV."
      );
    }

    console.log("✓ Datos numéricos válidos");
    console.log("");

    // =================================================
    // 7. COMENZAR IMPORTACIÓN
    // =================================================

    console.log("======================================");
    console.log("      INICIANDO IMPORTACIÓN");
    console.log("======================================");
    console.log("");

    let nuevos = 0;
    let actualizados = 0;
    let imagenesRegistradas = 0;
    let productosSinImagen = 0;

    // =================================================
    // 8. PROCESAR PRODUCTOS
    // =================================================

    for (const producto of productos) {
      const codigo =
        producto["Código"]?.trim();

      const nombre =
        producto["Nombre"]?.trim();

      const descripcion =
        producto["Descripción"]?.trim() || null;

      const categoria =
        producto["Categoría"]?.trim() || null;

      const precio =
        parseFloat(
          String(producto["Precio normal"])
            .replace(",", ".")
        );

      const precioMayorista =
        producto["Precio mayorista"]
          ? parseFloat(
              String(
                producto["Precio mayorista"]
              ).replace(",", ".")
            )
          : null;

      const stock =
        parseInt(
          producto["Stock"],
          10
        );

      const stockMinimo =
        parseInt(
          producto["Stock minimo"],
          10
        );

      // =================================================
      // BUSCAR PRODUCTO EXISTENTE
      // =================================================

      const existentes =
        await ejecutarConsulta(
          `SELECT id_producto
           FROM productos
           WHERE codigo = ?`,
          [codigo]
        );

      let idProducto;

      // =================================================
      // PRODUCTO EXISTENTE
      // =================================================

      if (existentes.length > 0) {
        idProducto =
          existentes[0].id_producto;

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

        console.log(
          `🔄 Actualizado: ${codigo} - ${nombre}`
        );
      }

      // =================================================
      // PRODUCTO NUEVO
      // =================================================

      else {
        const resultado =
          await ejecutarConsulta(
            `INSERT INTO productos
             (
               codigo,
               nombre,
               descripcion,
               categoria,
               precio,
               precio_mayorista,
               stock,
               stock_minimo,
               estado
             )
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

        idProducto =
          resultado.insertId;

        nuevos++;

        console.log(
          `✅ Creado: ${codigo} - ${nombre}`
        );
      }

      // =================================================
      // ELIMINAR RELACIONES DE IMÁGENES ANTERIORES
      // =================================================

      await ejecutarConsulta(
        `DELETE FROM producto_imagenes
         WHERE id_producto = ?`,
        [idProducto]
      );

      // =================================================
      // BUSCAR IMÁGENES DEL PRODUCTO
      // =================================================

      const imagenesProducto =
        archivosImagenes
          .filter((archivo) => {
            const nombreArchivo =
              path.parse(archivo).name;

            return (
              nombreArchivo === codigo ||
              nombreArchivo.startsWith(
                `${codigo}-`
              )
            );
          })
          .sort((a, b) =>
            a.localeCompare(
              b,
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            )
          );

      // =================================================
      // REGISTRAR IMÁGENES
      // =================================================

      let orden = 1;

      for (const imagen of imagenesProducto) {
        await ejecutarConsulta(
          `INSERT INTO producto_imagenes
           (
             id_producto,
             nombre_imagen,
             orden
           )
           VALUES (?, ?, ?)`,
          [
            idProducto,
            imagen,
            orden,
          ]
        );

        console.log(
          `   🖼️ ${imagen}`
        );

        orden++;
        imagenesRegistradas++;
      }

      // =================================================
      // PRODUCTO SIN IMAGEN
      // =================================================

      if (
        imagenesProducto.length === 0
      ) {
        productosSinImagen++;

        console.log(
          `   ⚠️ Sin imagen encontrada para ${codigo}`
        );
      }
    }

    // =================================================
    // 9. RESUMEN FINAL
    // =================================================

    console.log("");
    console.log("======================================");
    console.log("       IMPORTACIÓN FINALIZADA");
    console.log("======================================");
    console.log(
      `Productos nuevos: ${nuevos}`
    );
    console.log(
      `Productos actualizados: ${actualizados}`
    );
    console.log(
      `Imágenes registradas: ${imagenesRegistradas}`
    );
    console.log(
      `Productos sin imagen: ${productosSinImagen}`
    );
    console.log(
      `Total productos procesados: ${productos.length}`
    );
    console.log("======================================");
    console.log("");

    process.exit(0);

  } catch (error) {

    console.error("");
    console.error(
      "❌ ERROR DURANTE LA IMPORTACIÓN"
    );
    console.error(
      error.message
    );
    console.error("");

    process.exit(1);
  }
}

importarCatalogo();