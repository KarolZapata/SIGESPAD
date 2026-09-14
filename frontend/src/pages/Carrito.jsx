import { useCart } from "../context/CartContext";
import "./Carrito.css";

function Carrito() {
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    obtenerPrecio,
    obtenerSubtotal,
    obtenerTotal,
  } = useCart();

  return (
    <div className="carrito-page">

      <div className="carrito-header">
        <h1>Mi carrito</h1>

        <p>
          Revisa los productos que deseas comprar.
        </p>
      </div>

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <h2>Tu carrito está vacío</h2>

          <p>
            Agrega productos para comenzar tu compra.
          </p>
        </div>
      ) : (
        <div className="carrito-contenido">

          <div className="carrito-productos">

            {carrito.map((producto) => (

              <div
                className="carrito-item"
                key={producto.id_producto}
              >

                <div className="carrito-info">

                  <h2>
                    {producto.nombre}
                  </h2>

                  <p>
                    {producto.descripcion}
                  </p>

                  <p className="carrito-precio">
                    Precio unitario: $
                    {obtenerPrecio(producto).toLocaleString("es-CO")}
                  </p>

                  {producto.cantidad >= 6 &&
                    producto.precio_mayorista !== null && (
                      <p className="precio-mayorista-carrito">
                        Precio mayorista aplicado
                      </p>
                    )}

                </div>

                <div className="carrito-cantidad">

                  <button
                    onClick={() =>
                      disminuirCantidad(
                        producto.id_producto
                      )
                    }
                  >
                    −
                  </button>

                  <span>
                    {producto.cantidad}
                  </span>

                  <button
                    onClick={() =>
                      aumentarCantidad(
                        producto.id_producto
                      )
                    }
                  >
                    +
                  </button>

                </div>

                <div className="carrito-subtotal">

                  <strong>
                    $
                    {obtenerSubtotal(
                      producto
                    ).toLocaleString("es-CO")}
                  </strong>

                  <button
                    className="btn-eliminar"
                    onClick={() =>
                      eliminarDelCarrito(
                        producto.id_producto
                      )
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </div>

            ))}

          </div>

          <div className="carrito-resumen">

            <h2>Resumen de compra</h2>

            <p>
              Productos:{" "}
              {carrito.reduce(
                (total, producto) =>
                  total + producto.cantidad,
                0
              )}
            </p>

            <h3>
              Total: $
              {obtenerTotal().toLocaleString("es-CO")}
            </h3>

            <button
              className="btn-vaciar"
              onClick={vaciarCarrito}
            >
              Vaciar carrito
            </button>

            <button className="btn-comprar">
              Continuar compra
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Carrito;