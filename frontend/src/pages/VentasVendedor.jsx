import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./VentasVendedor.css";

function VentasVendedor() {
  const navigate = useNavigate();

  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroCanal, setFiltroCanal] = useState("TODOS");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  const obtenerVentas = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await api.get("/ventas");

      setVentas(respuesta.data || []);
    } catch (err) {
      console.error("Error al consultar ventas:", err);

      setError(
        err.response?.data?.error ||
          "No fue posible cargar las ventas."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerVentas();
  }, []);

  const formatoPrecio = (valor) => {
    return Number(valor || 0).toLocaleString("es-CO");
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const limpiarFiltros = () => {
    setFiltroEstado("TODOS");
    setFiltroCanal("TODOS");
    setFechaInicial("");
    setFechaFinal("");
  };

  const ventasFiltradas = ventas.filter((venta) => {
    const coincideEstado =
      filtroEstado === "TODOS" ||
      venta.estado === filtroEstado;

    const coincideCanal =
      filtroCanal === "TODOS" ||
      venta.canal === filtroCanal;

    let coincideFechaInicial = true;
    let coincideFechaFinal = true;

    if (venta.fecha_venta) {
      const fecha = new Date(venta.fecha_venta);

      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const dia = String(fecha.getDate()).padStart(2, "0");

      const fechaVenta = `${anio}-${mes}-${dia}`;

      if (fechaInicial) {
        coincideFechaInicial = fechaVenta >= fechaInicial;
      }

      if (fechaFinal) {
        coincideFechaFinal = fechaVenta <= fechaFinal;
      }
    } else {
      coincideFechaInicial = !fechaInicial;
      coincideFechaFinal = !fechaFinal;
    }

    return (
      coincideEstado &&
      coincideCanal &&
      coincideFechaInicial &&
      coincideFechaFinal
    );
  });

  const verDetalle = (idVenta) => {
    navigate(`/comprobantes?venta=${idVenta}`);
  };

  return (
    <main className="ventas-vendedor">

      {/* ================================
          NAVEGACIÓN
      ================================= */}

      <div className="ventas-navegacion">
        <button
          type="button"
          className="ventas-volver-panel"
          onClick={() => navigate("/dashboard")}
        >
          <span>←</span>
          Volver al panel
        </button>
      </div>

      {/* ================================
          ENCABEZADO
      ================================= */}

      <header className="ventas-vendedor-header">
        <div className="ventas-vendedor-titulo">
          <span className="ventas-etiqueta">
            GESTIÓN DE VENTAS
          </span>

          <h1>Ventas registradas</h1>

          <p>
            Consulta las ventas realizadas y revisa el detalle
            de cada transacción.
          </p>
        </div>

        <button
          type="button"
          className="ventas-btn-actualizar"
          onClick={obtenerVentas}
          disabled={cargando}
        >
          <span className="ventas-icono-actualizar">↻</span>
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      {/* ================================
          MENSAJE DE ERROR
      ================================= */}

      {error && (
        <div className="ventas-mensaje ventas-error">
          <strong>Ocurrió un problema</strong>
          <span>{error}</span>
        </div>
      )}

      {/* ================================
          CONTENIDO
      ================================= */}

      <section className="ventas-contenido">

      <div className="ventas-filtros">

        <div className="ventas-campo">
          <label htmlFor="vendedor-filtro-estado">
            Estado
          </label>

          <select
            id="vendedor-filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div className="ventas-campo">
          <label htmlFor="vendedor-filtro-canal">
            Canal de venta
          </label>

          <select
            id="vendedor-filtro-canal"
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
          >
            <option value="TODOS">Todos los canales</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="WEB">Web</option>
          </select>
        </div>

        <div className="ventas-campo">
          <label htmlFor="vendedor-fecha-inicial">
            Fecha inicial
          </label>

          <input
            id="vendedor-fecha-inicial"
            type="date"
            value={fechaInicial}
            max={fechaFinal || undefined}
            onChange={(e) => setFechaInicial(e.target.value)}
          />
        </div>

        <div className="ventas-campo">
          <label htmlFor="vendedor-fecha-final">
            Fecha final
          </label>

          <input
            id="vendedor-fecha-final"
            type="date"
            value={fechaFinal}
            min={fechaInicial || undefined}
            onChange={(e) => setFechaFinal(e.target.value)}
          />
        </div>

        <div className="ventas-filtro-accion">
          <button
            type="button"
            className="btn-limpiar-filtros"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>

      </div>

        <div className="ventas-contenido-header">
          <div>
            <span className="ventas-seccion-etiqueta">
              REGISTRO
            </span>

            <h2>Historial de ventas</h2>

            <p>
              Consulta las transacciones registradas en el sistema.
            </p>
          </div>

          {!cargando && ventasFiltradas.length > 0 && (
            <div className="ventas-contador">
              <span>{ventasFiltradas.length}</span>
              <small>
                {ventasFiltradas.length === 1
                  ? "venta encontrada"
                  : "ventas encontradas"}
              </small>
            </div>
          )}
        </div>

        {cargando ? (
          <div className="ventas-estado-vacio">
            <div className="ventas-cargando-icono">↻</div>

            <h3>Cargando ventas...</h3>

            <p>
              Estamos consultando las ventas registradas.
            </p>
          </div>
        ) : ventas.length === 0 ? (
          <div className="ventas-estado-vacio">
            <div className="ventas-vacio-icono">▱</div>

            <h3>No hay ventas registradas</h3>

            <p>
              Cuando se registre una venta, aparecerá
              automáticamente en este listado.
            </p>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="ventas-estado-vacio">
            <div className="ventas-vacio-icono">▱</div>

            <h3>No se encontraron ventas</h3>

            <p>
              Intenta cambiar los filtros de estado, canal o fechas.
            </p>
          </div>
        ) : (
          <div className="ventas-tabla-contenedor">
            <table className="ventas-tabla">

              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Vendedor</th>
                  <th>Fecha</th>
                  <th>Canal</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {ventasFiltradas.map((venta) => (                  <tr key={venta.id_venta}>

                    <td>
                      <span className="venta-numero">
                        #{venta.id_venta}
                      </span>
                    </td>

                    <td>
                      <span className="venta-vendedor">
                        {venta.usuario}
                      </span>
                    </td>

                    <td>
                      <span className="venta-fecha">
                        {formatoFecha(venta.fecha_venta)}
                      </span>
                    </td>

                    <td>
                      {venta.canal || "—"}
                    </td>

                    <td>
                      <strong className="venta-total">
                        ${formatoPrecio(venta.total)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`venta-estado venta-estado-${String(
                          venta.estado
                        ).toLowerCase()}`}
                      >
                        {venta.estado}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="ventas-btn-detalle"
                        onClick={() =>
                          verDetalle(venta.id_venta)
                        }
                      >
                        Ver detalle
                        <span>→</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>

    </main>
  );
}

export default VentasVendedor;