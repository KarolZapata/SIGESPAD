
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./DetalleProducto.css";

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCart();

  const [producto, setProducto] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        setCargando(true);
        setError("");

        const respuesta = await api.get(`/productos/publicos/${id}`);
        setProducto(respuesta.data);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        setError("No fue posible cargar la información del producto.");
      } finally {
        setCargando(false);
      }
    };

    obtenerProducto();
  }, [id]);

  if (cargando) {
    return <p className="detalle-mensaje">Cargando producto...</p>;
  }

  if (error || !producto) {
    return (
      <section className="detalle-mensaje">
        <p>{error || "Producto no encontrado."}</p>
        <button onClick={() => navigate("/productos")}>
          Volver a productos
        </button>
      </section>
    );
  }

  const imagenes = producto.imagenes || [];
  const imagenActual = imagenes[imagenSeleccionada];

  const imagenUrl = imagenActual
    ? `http://localhost:3000/imagenes-productos/${imagenActual.nombre}`
    : null;

  const stock = Number(producto.stock) || 0;
  const precioNormal = Number(producto.precio) || 0;
  const precioMayorista = Number(producto.precio_mayorista) || 0;

  const cambiarCantidad = (nuevaCantidad) => {
    if (nuevaCantidad >= 1 && nuevaCantidad <= stock) {
      setCantidad(nuevaCantidad);
    }
  };

  const manejarAgregarAlCarrito = () => {
    agregarAlCarrito(producto, cantidad);
  };

  return (
    <main className="detalle-producto">
      <button
        className="detalle-volver"
        onClick={() => navigate("/productos")}
      >
        ← Volver a productos
      </button>

      <div className="detalle-contenido">
        <section className="detalle-galeria">
          <div className="detalle-imagen-principal">
            {imagenUrl ? (
              <img src={imagenUrl} alt={producto.nombre} />
            ) : (
              <div className="detalle-sin-imagen">
                Imagen no disponible
              </div>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="detalle-miniaturas">
              {imagenes.map((imagen, indice) => (
                <button
                  key={`${imagen.nombre}-${indice}`}
                  className={
                    imagenSeleccionada === indice
                      ? "miniatura activa"
                      : "miniatura"
                  }
                  onClick={() => setImagenSeleccionada(indice)}
                >
                  <img
                    src={`http://localhost:3000/imagenes-productos/${imagen.nombre}`}
                    alt={`${producto.nombre} ${indice + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="detalle-informacion">
          <p className="detalle-categoria">
            {producto.categoria || "Sin categoría"}
          </p>

          <h1>{producto.nombre}</h1>

          <p className="detalle-codigo">
            Código: {producto.codigo}
          </p>

          <p className="detalle-descripcion">
            {producto.descripcion || "Este producto no tiene descripción."}
          </p>

          <div className="detalle-precios">
            <div>
              <span>Precio normal</span>
              <strong>
                {precioNormal.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                })}
              </strong>
            </div>

            {precioMayorista > 0 && (
              <div className="precio-mayorista">
                <span>Precio mayorista</span>
                <strong>
                  {precioMayorista.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  })}
                </strong>
                <small>Aplica desde 6 unidades</small>
              </div>
            )}
          </div>

          <p className={stock > 0 ? "detalle-stock disponible" : "detalle-stock agotado"}>
            {stock > 0 ? `Disponibles: ${stock}` : "Producto agotado"}
          </p>

          {stock > 0 && (
            <>
              <div className="detalle-cantidad">
                <span>Cantidad:</span>

                <button
                  onClick={() => cambiarCantidad(cantidad - 1)}
                  disabled={cantidad <= 1}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>

                <span className="cantidad-valor">{cantidad}</span>

                <button
                  onClick={() => cambiarCantidad(cantidad + 1)}
                  disabled={cantidad >= stock}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <button
                className="detalle-agregar"
                onClick={manejarAgregarAlCarrito}
              >
                Agregar al carrito
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default DetalleProducto;