import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./Productos.css";

function Productos() {
  const { agregarAlCarrito } = useCart();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const respuesta = await api.get("/productos/publicos");

      setProductos(respuesta.data);
    } catch (error) {
      console.error(error);

      setError("No fue posible cargar los productos");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="productos-page">

      <div className="productos-header">
        <h1>Productos</h1>

        <p>
          Explora nuestro catálogo y encuentra los productos
          que necesitas.
        </p>
      </div>

      {productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="productos-grid">

          {productos.map((producto) => (

            <div
              className="producto-card"
              key={producto.id_producto}
            >

              <img
                className="producto-imagen"
                src="https://placehold.co/600x400?text=Producto"
                alt={producto.nombre}
              />

              <div className="producto-contenido">

                <h2>
                  {producto.nombre}
                </h2>

                <p className="producto-descripcion">
                  {producto.descripcion}
                </p>

                <p className="producto-categoria">
                  Categoría: {producto.categoria}
                </p>

                <p className="precio-normal">
                  $
                  {Number(
                    producto.precio
                  ).toLocaleString("es-CO")}
                </p>

                {producto.precio_mayorista !== null && (
                  <p className="precio-mayorista">
                    Precio mayorista desde 6 unidades: $
                    {Number(
                      producto.precio_mayorista
                    ).toLocaleString("es-CO")}
                  </p>
                )}

                <p className="producto-stock">
                  Stock disponible: {producto.stock}
                </p>

                <button
                  className="btn-carrito"
                  onClick={() =>
                    agregarAlCarrito(producto)
                  }
                >
                  Agregar al carrito
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Productos;