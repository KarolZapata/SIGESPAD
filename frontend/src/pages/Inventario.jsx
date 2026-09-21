
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Inventario.css";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [formulario, setFormulario] = useState({
    id_producto: "",
    tipo: "ENTRADA",
    cantidad: "",
    motivo: "",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [respuestaProductos, respuestaMovimientos] =
        await Promise.all([
          api.get("/inventario"),
          api.get("/inventario/movimientos"),
        ]);

      setProductos(respuestaProductos.data);
      setMovimientos(respuestaMovimientos.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo cargar la información del inventario."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const actualizarCampo = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const registrarMovimiento = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (
      !formulario.id_producto ||
      !formulario.cantidad ||
      Number(formulario.cantidad) <= 0 ||
      !Number.isInteger(Number(formulario.cantidad))
    ) {
      setError("Selecciona un producto e ingresa una cantidad entera mayor que cero.");
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await api.post(
        "/inventario/movimientos",
        {
          ...formulario,
          cantidad: Number(formulario.cantidad),
        }
      );

      setMensaje(
        `${respuesta.data.mensaje}. Stock actualizado: ${respuesta.data.stock_nuevo}.`
      );

      setFormulario({
        id_producto: "",
        tipo: "ENTRADA",
        cantidad: "",
        motivo: "",
      });

      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo registrar el movimiento."
      );
    } finally {
      setGuardando(false);
    }
  };

  const productosActivos = productos.filter(
    (producto) => Number(producto.estado) === 1
  );

  const productosStockBajo = productos.filter(
    (producto) => Number(producto.stock_bajo) === 1
  );

  const formatoFecha = (fecha) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleString("es-CO");
  };

  if (cargando) {
    return (
      <main className="inventario">
        <p>Cargando inventario...</p>
      </main>
    );
  }

  return (
    <main className="inventario">
      <header className="inventario-encabezado">
        <h1>Gestión de inventario</h1>
        <p>
          Consulta existencias, identifica productos con stock
          bajo y registra entradas o salidas.
        </p>
      </header>

      {error && (
        <div className="inventario-mensaje error">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="inventario-mensaje exito">
          {mensaje}
        </div>
      )}

      <section className="inventario-resumen">
        <article className="inventario-tarjeta">
          <span>Productos registrados</span>
          <strong>{productos.length}</strong>
        </article>

        <article className="inventario-tarjeta">
          <span>Productos activos</span>
          <strong>{productosActivos.length}</strong>
        </article>

        <article className="inventario-tarjeta alerta">
          <span>Stock bajo</span>
          <strong>{productosStockBajo.length}</strong>
        </article>
      </section>

      <section className="inventario-seccion">
        <h2>Existencias</h2>

        <div className="inventario-tabla-contenedor">
          <table className="inventario-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock actual</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id_producto}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria || "—"}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.stock_minimo}</td>
                  <td>
                    {Number(producto.estado) !== 1 ? (
                      <span className="inventario-etiqueta inactivo">
                        Inactivo
                      </span>
                    ) : Number(producto.stock_bajo) === 1 ? (
                      <span className="inventario-etiqueta bajo">
                        Stock bajo
                      </span>
                    ) : (
                      <span className="inventario-etiqueta disponible">
                        Disponible
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {productos.length === 0 && (
                <tr>
                  <td colSpan="6">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="inventario-seccion">
        <h2>Registrar movimiento</h2>
        <p>
          Registra entradas por reposición o salidas manuales
          de productos.
        </p>

        <form
          className="inventario-formulario"
          onSubmit={registrarMovimiento}
        >
          <label>
            Producto
            <select
              name="id_producto"
              value={formulario.id_producto}
              onChange={actualizarCampo}
              required
            >
              <option value="">Selecciona un producto</option>

              {productosActivos.map((producto) => (
                <option
                  key={producto.id_producto}
                  value={producto.id_producto}
                >
                  {producto.codigo} - {producto.nombre} (Stock: {producto.stock})
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de movimiento
            <select
              name="tipo"
              value={formulario.tipo}
              onChange={actualizarCampo}
              required
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </label>

          <label>
            Cantidad
            <input
              type="number"
              name="cantidad"
              min="1"
              step="1"
              value={formulario.cantidad}
              onChange={actualizarCampo}
              placeholder="Ej. 10"
              required
            />
          </label>

          <label>
            Motivo
            <input
              type="text"
              name="motivo"
              value={formulario.motivo}
              onChange={actualizarCampo}
              placeholder="Ej. Reposición de mercancía"
              maxLength="255"
            />
          </label>

          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar movimiento"}
          </button>
        </form>
      </section>

      <section className="inventario-seccion">
        <h2>Historial de movimientos</h2>

        <div className="inventario-tabla-contenedor">
          <table className="inventario-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock anterior</th>
                <th>Stock nuevo</th>
                <th>Motivo</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id_movimiento}>
                  <td>{formatoFecha(movimiento.fecha_movimiento)}</td>
                  <td>{movimiento.codigo}</td>
                  <td>{movimiento.producto}</td>
                  <td>
                    <span
                      className={`inventario-etiqueta ${
                        movimiento.tipo === "ENTRADA"
                          ? "disponible"
                          : "bajo"
                      }`}
                    >
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td>{movimiento.cantidad}</td>
                  <td>{movimiento.stock_anterior}</td>
                  <td>{movimiento.stock_nuevo}</td>
                  <td>{movimiento.motivo || "—"}</td>
                </tr>
              ))}

              {movimientos.length === 0 && (
                <tr>
                  <td colSpan="8">
                    Aún no hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Inventario;