import { useState } from "react";
import { useCart } from "../context/CartContext";
import { SERVER_URL } from "../services/api";
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

  const [tipoEntrega, setTipoEntrega] = useState("RECOGIDA");
  const [ciudad, setCiudad] = useState("Bogotá");
  const [direccion, setDireccion] = useState("");
  const costoEnvio = tipoEntrega === "DOMICILIO" ? 10000 : 0;
  const totalConEnvio = obtenerTotal() + costoEnvio;

  const navigate = useNavigate();
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState("");
  const iniciarPagoWompi = async () => {
    if (carrito.length === 0 || procesandoPago) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }
    
    if (
      tipoEntrega === "DOMICILIO" &&
      !direccion.trim()
    ) {
      setErrorPago("Ingresa la dirección de entrega.");
      return;
    }

    setProcesandoPago(true);
    setErrorPago("");

    try {
      const respuesta = await fetch(
        `${SERVER_URL}/api/wompi/iniciar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            detalles: carrito.map((producto) => ({
              id_producto: producto.id_producto,
              cantidad: Number(producto.cantidad),
            })),
            tipo_entrega: tipoEntrega,
            ciudad: tipoEntrega === "DOMICILIO" ? ciudad : null,
            direccion: tipoEntrega === "DOMICILIO" ? direccion.trim() : null,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "No fue posible iniciar el pago."
        );
      }

      if (!datos.checkoutUrl) {
        throw new Error("El servidor no devolvió el enlace de pago.");
      }

      window.location.href = datos.checkoutUrl;
    } catch (error) {
      setErrorPago(error.message || "Error al conectar con Wompi.");
      setProcesandoPago(false);
    }
  };


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
                ? `${SERVER_URL}/imagenes-productos/${imagen}`
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


          <section className="entrega-opciones">
            <h2>¿Cómo quieres recibir tu pedido?</h2>

            <label>
              <input
                type="radio"
                name="tipoEntrega"
                checked={tipoEntrega === "RECOGIDA"}
                onChange={() => setTipoEntrega("RECOGIDA")}
              />
              Recoger en Papelería San Diego — Gratis
            </label>

            <label>
              <input
                type="radio"
                name="tipoEntrega"
                checked={tipoEntrega === "DOMICILIO"}
                onChange={() => setTipoEntrega("DOMICILIO")}
              />
              Envío a domicilio — $10.000
            </label>

            {tipoEntrega === "DOMICILIO" && (
              <div>
                <label htmlFor="ciudadEntrega">Ciudad</label>
                <select
                  id="ciudadEntrega"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                >
                  <option value="Bogotá">Bogotá</option>
                  <option value="Soacha">Soacha</option>
                </select>

                <label htmlFor="direccionEntrega">Dirección completa</label>
                <input
                  id="direccionEntrega"
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección, barrio y detalles"
                  maxLength={255}
                />

                <p>Tiempo estimado: hasta 3 días hábiles.</p>
              </div>
            )}
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
            <div>
              <p>Productos: {formatearPrecio(obtenerTotal())}</p>
              <p>Domicilio: {formatearPrecio(costoEnvio)}</p>
              <strong>Total estimado: {formatearPrecio(totalConEnvio)}</strong>
            </div>
            </div>

            <p className="resumen-nota">
              El total se calcula según las cantidades seleccionadas y
              los precios aplicables. El valor final será validado por
              el servidor al procesar la compra.
            </p>

            <button
              className="btn-comprar"
              disabled={carrito.length === 0 || procesandoPago}
              onClick={iniciarPagoWompi}
            >
              {procesandoPago ? "Conectando con Wompi..." : "Pagar con Wompi"}
            </button>

            {errorPago && (
              <p role="alert" className="wompi-pendiente">
                {errorPago}
              </p>
            )}

            <div className="carrito-seguridad">
              <span>🔒</span>
              <p>Pago seguro mediante Wompi.</p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Carrito;