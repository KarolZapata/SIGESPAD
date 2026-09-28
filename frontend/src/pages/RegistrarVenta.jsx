import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RegistrarVenta.css";

function RegistrarVenta() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [carritoVenta, setCarritoVenta] = useState([]);

  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // CARGAR PRODUCTOS
  // =====================================================

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        setCargandoProductos(true);
        setError("");

        const respuesta = await api.get("/productos");

        const productosActivos = (respuesta.data || []).filter(
          (producto) =>
            Number(producto.estado) === 1 &&
            Number(producto.stock) > 0
        );

        setProductos(productosActivos);
      } catch (err) {
        console.error("Error al cargar productos:", err);

        setError(
          err.response?.data?.error ||
            "No fue posible cargar los productos."
        );
      } finally {
        setCargandoProductos(false);
      }
    };

    obtenerProductos();
  }, []);

  // =====================================================
  // PRODUCTOS FILTRADOS
  // =====================================================

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) {
      return productos;
    }

    return productos.filter(
      (producto) =>
        producto.codigo?.toLowerCase().includes(texto) ||
        producto.nombre?.toLowerCase().includes(texto)
    );
  }, [productos, busqueda]);

  // =====================================================
  // AGREGAR PRODUCTO
  // =====================================================

  const agregarProducto = (producto) => {
    setMensaje("");
    setError("");

    setCarritoVenta((actual) => {
      const existente = actual.find(
        (item) => item.id_producto === producto.id_producto
      );

      if (existente) {
        if (existente.cantidad >= Number(producto.stock)) {
          setError(
            `No hay más existencias disponibles de "${producto.nombre}".`
          );

          return actual;
        }

        return actual.map((item) =>
          item.id_producto === producto.id_producto
            ? {
                ...item,
                cantidad: item.cantidad + 1,
              }
            : item
        );
      }

      return [
        ...actual,
        {
          id_producto: producto.id_producto,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          precio_mayorista:
            producto.precio_mayorista !== null
              ? Number(producto.precio_mayorista)
              : null,
          stock: Number(producto.stock),
          cantidad: 1,
        },
      ];
    });
  };

  // =====================================================
  // CAMBIAR CANTIDAD
  // =====================================================

  const cambiarCantidad = (idProducto, nuevaCantidad) => {
    const cantidad = Number(nuevaCantidad);

    setCarritoVenta((actual) =>
      actual.map((item) => {
        if (item.id_producto !== idProducto) {
          return item;
        }

        if (cantidad < 1) {
          return item;
        }

        if (cantidad > item.stock) {
          setError(
            `Stock máximo disponible para "${item.nombre}": ${item.stock}.`
          );

          return item;
        }

        setError("");

        return {
          ...item,
          cantidad,
        };
      })
    );
  };

  // =====================================================
  // ELIMINAR PRODUCTO
  // =====================================================

  const eliminarProducto = (idProducto) => {
    setCarritoVenta((actual) =>
      actual.filter(
        (item) => item.id_producto !== idProducto
      )
    );

    setError("");
  };

  // =====================================================
  // CALCULAR PRECIO
  // =====================================================

  const obtenerPrecio = (item) => {
    if (
      item.cantidad >= 6 &&
      item.precio_mayorista !== null
    ) {
      return item.precio_mayorista;
    }

    return item.precio;
  };

  // =====================================================
  // CALCULAR SUBTOTAL
  // =====================================================

  const obtenerSubtotal = (item) => {
    return obtenerPrecio(item) * item.cantidad;
  };

  // =====================================================
  // TOTAL
  // =====================================================

  const total = useMemo(() => {
    return carritoVenta.reduce(
      (acumulado, item) =>
        acumulado + obtenerSubtotal(item),
      0
    );
  }, [carritoVenta]);

  // =====================================================
  // FORMATO DE DINERO
  // =====================================================

  const formatoPrecio = (valor) => {
    return Number(valor || 0).toLocaleString("es-CO");
  };

  // =====================================================
  // REGISTRAR VENTA
  // =====================================================
    const registrarVenta = async () => {
    setMensaje("");
    setError("");

    if (carritoVenta.length === 0) {
        setError(
        "Debe agregar al menos un producto a la venta."
        );
        return;
    }

    const detalles = carritoVenta.map((item) => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
    }));

    try {
        setRegistrando(true);

        const respuesta = await api.post("/ventas", {
        detalles,
        });

        const idVenta = respuesta.data.id_venta;

        setMensaje(
        `Venta #${idVenta} registrada correctamente.`
        );

        setCarritoVenta([]);

    } catch (err) {
        console.error("Error al registrar venta:", err);

        setError(
        err.response?.data?.error ||
            "No fue posible registrar la venta."
        );
    } finally {
        setRegistrando(false);
    }
    };

  // =====================================================
  // LIMPIAR VENTA
  // =====================================================

  const limpiarVenta = () => {
    setCarritoVenta([]);
    setMensaje("");
    setError("");
  };

  return (
    <main className="registrar-venta">
      <header className="registrar-venta-header">
        <div>
          <span className="etiqueta-seccion">
            VENTAS
          </span>

          <h1>Registrar venta</h1>

          <p>
            Registra una venta presencial seleccionando
            los productos y cantidades.
          </p>
        </div>

        <button
          type="button"
          className="btn-volver-venta"
          onClick={() => navigate("/dashboard")}
        >
          Volver al panel
        </button>
      </header>

      {mensaje && (
        <div className="mensaje-venta exitoso">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mensaje-venta error">
          {error}
        </div>
      )}

      <section className="registrar-venta-grid">
        {/* =================================================
            PRODUCTOS
        ================================================= */}

        <section className="productos-venta">
          <div className="seccion-venta-header">
            <div>
              <h2>Productos</h2>
              <p>
                Selecciona los productos que deseas
                registrar.
              </p>
            </div>
          </div>

          <div className="buscador-venta">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
            />
          </div>

          {cargandoProductos ? (
            <p className="estado-venta">
              Cargando productos...
            </p>
          ) : productosFiltrados.length === 0 ? (
            <p className="estado-venta">
              No se encontraron productos disponibles.
            </p>
          ) : (
            <div className="productos-venta-lista">
              {productosFiltrados.map((producto) => (
                <article
                  className="producto-venta-card"
                  key={producto.id_producto}
                >
                  <div>
                    <span className="producto-venta-codigo">
                      {producto.codigo}
                    </span>

                    <h3>{producto.nombre}</h3>

                    <p>
                      Precio: $
                      {formatoPrecio(
                        producto.precio
                      )}
                    </p>

                    {producto.precio_mayorista !==
                      null && (
                      <small>
                        Mayorista desde 6 unidades: $
                        {formatoPrecio(
                          producto.precio_mayorista
                        )}
                      </small>
                    )}

                    <span className="producto-venta-stock">
                      Stock: {producto.stock}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      agregarProducto(producto)
                    }
                  >
                    Agregar
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            RESUMEN DE VENTA
        ================================================= */}

        <aside className="resumen-venta">
          <div className="seccion-venta-header">
            <div>
              <h2>Resumen de venta</h2>
              <p>
                Productos seleccionados.
              </p>
            </div>
          </div>

          {carritoVenta.length === 0 ? (
            <div className="venta-vacia">
              <p>
                Aún no has agregado productos.
              </p>

              <span>
                Selecciona productos para comenzar.
              </span>
            </div>
          ) : (
            <>
              <div className="detalle-venta-lista">
                {carritoVenta.map((item) => {
                  const precio =
                    obtenerPrecio(item);

                  const subtotal =
                    obtenerSubtotal(item);

                  const usaMayorista =
                    item.cantidad >= 6 &&
                    item.precio_mayorista !== null;

                  return (
                    <article
                      className="detalle-venta-item"
                      key={item.id_producto}
                    >
                      <div className="detalle-venta-info">
                        <strong>
                          {item.nombre}
                        </strong>

                        <small>
                          {item.codigo}
                        </small>

                        <span>
                          $
                          {formatoPrecio(precio)}
                          {" "}× {item.cantidad}
                        </span>

                        {usaMayorista && (
                          <em>
                            Precio mayorista
                          </em>
                        )}
                      </div>

                      <div className="detalle-venta-controles">
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.cantidad}
                          onChange={(e) =>
                            cambiarCantidad(
                              item.id_producto,
                              e.target.value
                            )
                          }
                        />

                        <strong>
                          $
                          {formatoPrecio(
                            subtotal
                          )}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarProducto(
                              item.id_producto
                            )
                          }
                          title="Eliminar producto"
                        >
                          ×
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="resumen-venta-total">
                <span>Total</span>

                <strong>
                  ${formatoPrecio(total)}
                </strong>
              </div>

              <div className="acciones-venta">
                <button
                  type="button"
                  className="btn-limpiar-venta"
                  onClick={limpiarVenta}
                  disabled={registrando}
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  className="btn-registrar-venta"
                  onClick={registrarVenta}
                  disabled={registrando}
                >
                  {registrando
                    ? "Registrando..."
                    : "Registrar venta"}
                </button>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}

export default RegistrarVenta;