import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Ventas.css";

function Ventas() {
  const navigate = useNavigate();

  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroCanal, setFiltroCanal] = useState("TODOS");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerVentas();
  }, []);

  const obtenerVentas = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await api.get("/ventas");
      setVentas(respuesta.data);
    } catch (error) {
      console.error(error);
      setError("No fue posible cargar las ventas.");
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (idVenta) => {
    try {
      setCargandoDetalle(true);
      setVentaSeleccionada(null);
      setMensaje("");

      const respuesta = await api.get(`/ventas/${idVenta}`);
      setVentaSeleccionada(respuesta.data);
    } catch (error) {
      console.error(error);
      setMensaje("No fue posible cargar el detalle de la venta.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cancelarVenta = async (idVenta) => {
    const confirmar = window.confirm(
      `¿Estás segura de que deseas cancelar la venta #${idVenta}?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");

      await api.delete(`/ventas/${idVenta}`);

      setMensaje(`La venta #${idVenta} fue cancelada correctamente.`);
      setVentaSeleccionada(null);

      await obtenerVentas();
    } catch (error) {
      console.error(error);
      setMensaje(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "No fue posible cancelar la venta."
      );
    }
  };

const limpiarFiltros = () => {
  setFiltroEstado("TODOS");
  setFiltroCanal("TODOS");
  setFechaInicial("");
  setFechaFinal("");
  setMensaje("");
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

  const formatoPrecio = (valor) =>
    Number(valor || 0).toLocaleString("es-CO");

  if (cargando) {
    return (
      <main className="ventas-page">
        <p className="ventas-cargando">Cargando ventas...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="ventas-page">
        <p className="ventas-mensaje error">{error}</p>

        <button
          type="button"
          className="btn-reintentar"
          onClick={obtenerVentas}
        >
          Volver a intentar
        </button>
      </main>
    );
  }

  return (
    <main className="ventas-page">

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <header className="ventas-header">
        <span className="ventas-etiqueta">
          GESTIÓN COMERCIAL
        </span>

        <h1>Ventas</h1>

        <p>
          Consulta y administra las ventas registradas en el sistema.
        </p>
      </header>

      {/* =====================================================
          BOTÓN VOLVER AL PANEL
      ===================================================== */}

      <div className="ventas-volver-panel">
        <button
          type="button"
          className="btn-volver-panel"
          onClick={() => navigate("/dashboard")}
        >
          <span>←</span>
          Volver al panel
        </button>
      </div>

      {mensaje && (
        <p className="ventas-mensaje">
          {mensaje}
        </p>
      )}

      {/* =====================================================
          FILTROS
      ===================================================== */}

      <section className="ventas-seccion">

        <div className="ventas-seccion-encabezado">
          <div>
            <span className="ventas-subtitulo">
              CONSULTA Y FILTROS
            </span>

            <h2>Buscar ventas</h2>

            <p>
              Utiliza los filtros para localizar una venta específica.
            </p>
          </div>
        </div>

        <div className="ventas-filtros">

          <div className="ventas-campo">
            <label htmlFor="filtro-estado">
              Estado
            </label>

            <select
              id="filtro-estado"
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
            <label htmlFor="filtro-canal">
              Canal de venta
            </label>

            <select
              id="filtro-canal"
              value={filtroCanal}
              onChange={(e) => setFiltroCanal(e.target.value)}
            >
              <option value="TODOS">Todos los canales</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="WEB">Web</option>
            </select>
          </div>

          <div className="ventas-campo">
            <label htmlFor="fecha-inicial">
              Fecha inicial
            </label>

            <input
              id="fecha-inicial"
              type="date"
              value={fechaInicial}
              max={fechaFinal || undefined}
              onChange={(e) => setFechaInicial(e.target.value)}
            />
          </div>

          <div className="ventas-campo">
            <label htmlFor="fecha-final">
              Fecha final
            </label>

            <input
              id="fecha-final"
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

      </section>

      {/* =====================================================
          LISTADO DE VENTAS
      ===================================================== */}

      <section className="ventas-seccion">

        <div className="ventas-seccion-encabezado">

          <div>
            <span className="ventas-subtitulo">
              REGISTRO DE OPERACIONES
            </span>

            <h2>Ventas registradas</h2>

            <p>
              Consulta el detalle y estado de las ventas realizadas.
            </p>
          </div>

          <span className="ventas-contador">
            {ventasFiltradas.length}{" "}
            {ventasFiltradas.length === 1 ? "venta" : "ventas"}
          </span>

        </div>

        {ventas.length === 0 ? (
          <p className="ventas-vacio">
            No hay ventas registradas.
          </p>
        ) : ventasFiltradas.length === 0 ? (
          <p className="ventas-vacio">
            No se encontraron ventas con esos criterios.
          </p>
        ) : (
          <div className="ventas-tabla-contenedor">

            <table className="ventas-tabla">

              <thead>
                <tr>
                  <th>N.º venta</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Canal</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {ventasFiltradas.map((venta) => (

                  <tr key={venta.id_venta}>

                    <td className="venta-numero">
                      #{venta.id_venta}
                    </td>

                    <td>
                      {venta.usuario}
                    </td>

                    <td>
                      {venta.fecha_venta
                        ? new Date(
                            venta.fecha_venta
                          ).toLocaleString("es-CO")
                        : "—"}
                    </td>

                    <td>
                      {venta.canal || "—"}
                    </td>

                    <td className="venta-precio">
                      ${formatoPrecio(venta.total)}
                    </td>

                    <td>
                      <span
                        className={`venta-estado estado-${venta.estado?.toLowerCase()}`}
                      >
                        {venta.estado}
                      </span>
                    </td>

                    <td className="venta-acciones">

                      <button
                        type="button"
                        className="btn-ver-venta"
                        onClick={() =>
                          verDetalle(venta.id_venta)
                        }
                      >
                        Ver detalle
                      </button>

                      {venta.estado !== "CANCELADA" && (
                        <button
                          type="button"
                          className="btn-cancelar-venta"
                          onClick={() =>
                            cancelarVenta(venta.id_venta)
                          }
                        >
                          Cancelar
                        </button>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {cargandoDetalle && (
        <p className="ventas-mensaje">
          Cargando detalle de la venta...
        </p>
      )}

      {/* =====================================================
          MODAL DETALLE DE VENTA
      ===================================================== */}

      {ventaSeleccionada && (

        <div className="venta-modal-fondo">

          <div className="venta-modal">

            <div className="venta-modal-header">

              <h2>
                Detalle de la venta #
                {ventaSeleccionada.venta.id_venta}
              </h2>

              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() =>
                  setVentaSeleccionada(null)
                }
                aria-label="Cerrar detalle"
              >
                ×
              </button>

            </div>

            <div className="venta-informacion">

              <div className="venta-dato">
                <span>Usuario</span>
                <strong>
                  {ventaSeleccionada.venta.usuario}
                </strong>
              </div>

              <div className="venta-dato">
                <span>Fecha</span>
                <strong>
                  {ventaSeleccionada.venta.fecha_venta
                    ? new Date(
                        ventaSeleccionada.venta.fecha_venta
                      ).toLocaleString("es-CO")
                    : "—"}
                </strong>
              </div>

              <div className="venta-dato">
                <span>Estado</span>
                <strong>
                  {ventaSeleccionada.venta.estado}
                </strong>
              </div>
              <div className="venta-dato">
              <span>Canal</span>
              <strong>
                {ventaSeleccionada.venta.canal || "—"}
              </strong>
            </div>

            </div>

            <div className="ventas-tabla-contenedor">

              <table className="ventas-tabla ventas-tabla-detalle">

                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>

                  {ventaSeleccionada.detalles?.map(
                    (detalle, indice) => (

                      <tr
                        key={
                          detalle.id_detalle || indice
                        }
                      >

                        <td>
                          {detalle.producto}
                        </td>

                        <td>
                          {detalle.cantidad}
                        </td>

                        <td>
                          $
                          {formatoPrecio(
                            detalle.precio_unitario
                          )}
                        </td>

                        <td>
                          $
                          {formatoPrecio(
                            detalle.subtotal
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="venta-total">

              <span>Total de la venta</span>

              <strong>
                $
                {formatoPrecio(
                  ventaSeleccionada.venta.total
                )}
              </strong>

            </div>

            <div className="venta-modal-acciones">

              {ventaSeleccionada.venta.estado !==
                "CANCELADA" && (

                <button
                  type="button"
                  className="btn-cancelar-venta"
                  onClick={() =>
                    cancelarVenta(
                      ventaSeleccionada.venta.id_venta
                    )
                  }
                >
                  Cancelar venta
                </button>

              )}

              <button
                type="button"
                className="btn-cerrar"
                onClick={() =>
                  setVentaSeleccionada(null)
                }
              >
                Cerrar
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default Ventas;