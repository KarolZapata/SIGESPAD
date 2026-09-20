
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Carrito.css";

const formatearPrecio = (valor) =>
  Number(valor || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

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

  const navigate = useNavigate();

  const totalUnidades = carrito.reduce(
    (total, producto) => total + Number(producto.cantidad || 0),
    0
  );

  return (
    <main className="carrito-page">
      <header className="carrito-header">
        <div>
          <span className="carrito-etiqueta">PAPELERÍA SAN DIEGO</span>
          <h1>Mi carrito</h1>
          <p>Revisa tus productos antes de continuar con tu compra.</p>
        </div>

        {carrito.length > 0 && (
          <button
            className="carrito-seguir-comprando"
            onClick={() => navigate("/productos")}
          >
            ← Seguir comprando
          </button>
        )}
      </header>

      {carrito.length === 0 ? (
        <section className="carrito-vacio">
          <div className="carrito-vacio-icono">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>
            Todavía no has agregado productos. Explora nuestro catálogo
            y encuentra lo que necesitas.
          </p>
          <button
            className="btn-seguir-comprando"
            onClick={() => navigate("/productos")}
          >
            Explorar productos
          </button>
        </section>
      ) : (
        <div className="carrito-contenido">
          <section className="carrito-lista">
            <div className="carrito-lista-header">
              <h2>Productos seleccionados</h2>
              <span>{totalUnidades} unidades</span>
            </div>

            {carrito.map((producto) => {
              const imagen = producto.imagenes?.[0]?.nombre;

              const imagenUrl = imagen
                ? `http://localhost:3000/imagenes-productos/${imagen}`
                : null;

              const precioUnitario = obtenerPrecio(producto);
              const aplicaMayorista =
                Number(producto.cantidad) >= 6 &&
                producto.precio_mayorista !== null &&
                producto.precio_mayorista !== undefined &&
                producto.precio_mayorista !== "";

              return (
                <article
                  className="carrito-item"
                  key={producto.id_producto}
                >
                  <div className="carrito-imagen">
                    {imagenUrl ? (
                      <img src={imagenUrl} alt={producto.nombre} />
                    ) : (
                      <div className="carrito-imagen-vacia">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="carrito-info">
                    <span className="carrito-categoria">
                      {producto.categoria || "Producto"}
                    </span>

                    <h3>{producto.nombre}</h3>

                    {producto.codigo && (
                      <p className="carrito-codigo">
                        Código: {producto.codigo}
                      </p>
                    )}

                    <p className="carrito-descripcion">
                      {producto.descripcion}
                    </p>

                    <div className="carrito-precio-linea">
                      <span>Precio unitario</span>
                      <strong>{formatearPrecio(precioUnitario)}</strong>
                    </div>

                    {aplicaMayorista && (
                      <span className="precio-mayorista-carrito">
                        ✓ Precio mayorista aplicado
                      </span>
                    )}
                  </div>

                  <div className="carrito-controles">
                    <span className="carrito-control-label">
                      Cantidad
                    </span>

                    <div className="carrito-cantidad">
                      <button
                        onClick={() =>
                          disminuirCantidad(producto.id_producto)
                        }
                        disabled={Number(producto.cantidad) <= 1}
                        aria-label={`Disminuir ${producto.nombre}`}
                      >
                        −
                      </button>

                      <span>{producto.cantidad}</span>

                      <button
                        onClick={() =>
                          aumentarCantidad(producto.id_producto)
                        }
                        aria-label={`Aumentar ${producto.nombre}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="btn-eliminar"
                      onClick={() =>
                        eliminarDelCarrito(producto.id_producto)
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="carrito-subtotal">
                    <span>Subtotal</span>
                    <strong>
                      {formatearPrecio(obtenerSubtotal(producto))}
                    </strong>
                  </div>
                </article>
              );
            })}

            <button
              className="btn-vaciar"
              onClick={vaciarCarrito}
            >
              Vaciar carrito
            </button>
          </section>

          <aside className="carrito-resumen">
            <h2>Resumen de compra</h2>

            <div className="resumen-fila">
              <span>Productos</span>
              <strong>{totalUnidades} unidades</strong>
            </div>

            <div className="resumen-fila">
              <span>Artículos diferentes</span>
              <strong>{carrito.length}</strong>
            </div>

            <div className="resumen-total">
              <span>Total estimado</span>
              <strong>{formatearPrecio(obtenerTotal())}</strong>
            </div>

            <p className="resumen-nota">
              El total se calcula según las cantidades seleccionadas y
              los precios aplicables. El valor final será validado por
              el servidor al procesar la compra.
            </p>

            <button
              className="btn-comprar"
              disabled
              title="La integración de Wompi está pendiente"
            >
              Pagar con Wompi
            </button>

            <p className="wompi-pendiente">
              La pasarela de pagos se habilitará cuando terminemos su
              configuración.
            </p>

            <div className="carrito-seguridad">
              <span>🔒</span>
              <p>Pago seguro al completar la integración de Wompi.</p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Carrito;