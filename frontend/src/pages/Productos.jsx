import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./Productos.css";

function Productos() {
  const { agregarAlCarrito } = useCart();
  const navigate = useNavigate();

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

  const verProducto = (idProducto) => {
    navigate(`/productos/${idProducto}`);
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

          {productos.map((producto) => {

            const imagenPrincipal =
              producto.imagenes &&
              producto.imagenes.length > 0
                ? `http://localhost:3000/imagenes-productos/${producto.imagenes[0].nombre}`
                : "https://placehold.co/600x400?text=Producto";

            return (
              <div
                className="producto-card"
                key={producto.id_producto}
              >

                {/* Imagen del producto */}
                <img
                  className="producto-imagen"
                  src={imagenPrincipal}
                  alt={producto.nombre}
                  onClick={() =>
                    verProducto(producto.id_producto)
                  }
                />

                <div className="producto-contenido">

                  {/* Nombre */}
                  <h2>
                    {producto.nombre}
                  </h2>

                  {/* Categoría */}
                  <p className="producto-categoria">
                    {producto.categoria}
                  </p>

                  {/* Precio normal */}
                  <p className="precio-normal">
                    Precio: $
                    {Number(
                      producto.precio
                    ).toLocaleString("es-CO")}
                  </p>

                {/* Precio mayorista */}
                <p className="precio-mayorista">
                    Mayorista: $
                    {Number(producto.precio_mayorista).toLocaleString("es-CO")}
                </p>

                  {/* Stock */}
                  <p className="producto-stock">
                    Stock disponible: {producto.stock}
                  </p>

                  {/* Botones */}
                  <div className="producto-acciones">

                    <button
                      className="btn-ver-producto"
                      onClick={() =>
                        verProducto(producto.id_producto)
                      }
                    >
                      Ver producto
                    </button>

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

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Productos;