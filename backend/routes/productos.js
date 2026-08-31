const express = require("express");
const router = express.Router();

const conexion = require("../db");

// Obtener todos los productos
router.get("/", (req, res) => {
    const sql = "SELECT * FROM productos";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al consultar productos:", error.message);

            return res.status(500).json({
                error: "Error al obtener los productos"
            });
        }

        res.json(resultados);
    });
});

// Crear un nuevo producto
router.post("/", (req, res) => {
    const {
        nombre,
        descripcion,
        categoria,
        precio,
        stock,
        stock_minimo
    } = req.body;

    const sql = `
        INSERT INTO productos
        (nombre, descripcion, categoria, precio, stock, stock_minimo)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nombre,
        descripcion,
        categoria,
        precio,
        stock,
        stock_minimo
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al crear producto:", error.message);

            return res.status(500).json({
                error: "Error al crear el producto"
            });
        }

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            id_producto: resultado.insertId
        });
    });
});

// Actualizar un producto
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        nombre,
        descripcion,
        categoria,
        precio,
        stock,
        stock_minimo
    } = req.body;

    const sql = `
        UPDATE productos
        SET nombre = ?,
            descripcion = ?,
            categoria = ?,
            precio = ?,
            stock = ?,
            stock_minimo = ?
        WHERE id_producto = ?
    `;

    const valores = [
        nombre,
        descripcion,
        categoria,
        precio,
        stock,
        stock_minimo,
        id
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al actualizar producto:", error.message);

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
    });
});

// Desactivar un producto
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE productos
        SET estado = 0
        WHERE id_producto = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error("Error al desactivar producto:", error.message);

            return res.status(500).json({
                error: "Error al desactivar el producto"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        res.json({
            mensaje: "Producto desactivado correctamente"
        });
    });
});

module.exports = router;