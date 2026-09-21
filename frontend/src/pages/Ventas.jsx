
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Ventas.css";

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
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

  // Restablecer la búsqueda y el filtro de estado
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("TODOS");
    setMensaje("");
  };

  const ventasFiltradas = ventas.filter((venta) => {
    const texto = busqueda.trim().toLowerCase();

    const coincideBusqueda =
      String(venta.id_venta).includes(texto) ||
      venta.usuario?.toLowerCase().includes(texto);

    const coincideEstado =
      filtroEstado === "TODOS" || venta.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const formatoPrecio = (valor) =>
    Number(valor || 0).toLocaleString("es-CO");

  if (cargando) {
    return <p>Cargando ventas...</p>;
  }

  if (error) {
    return (
      <div className="ventas-page">
        <p className="ventas-mensaje error">{error}</p>
        <button onClick={obtenerVentas}>Volver a intentar</button>
      </div>
    );
  }

  return (
    <div className="ventas-page">
      <div className="ventas-header">
        <h1>Ventas</h1>
        <p>Consulta y administra las ventas registradas en el sistema.</p>
      </div>

      {mensaje && (
        <p className="ventas-mensaje">{mensaje}</p>
      )}

      <div className="ventas-filtros">
        <input
          type="text"
          placeholder="Buscar por número de venta o usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar ventas"
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="COMPLETADA">Completada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>

        <button
          type="button"
          className="btn-limpiar-filtros"
          onClick={limpiarFiltros}
        >
          Limpiar
        </button>
      </div>

      {ventas.length === 0 ? (
        <p className="ventas-mensaje">No hay ventas registradas.</p>
      ) : ventasFiltradas.length === 0 ? (
        <p className="ventas-mensaje">
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
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ventasFiltradas.map((venta) => (
                <tr key={venta.id_venta}>
                  <td>#{venta.id_venta}</td>
                  <td>{venta.usuario}</td>
                  <td>
                    {venta.fecha_venta
                      ? new Date(venta.fecha_venta).toLocaleString("es-CO")
                      : "—"}
                  </td>
                  <td>${formatoPrecio(venta.total)}</td>
                  <td>
                    <span
                      className={`venta-estado estado-${venta.estado?.toLowerCase()}`}
                    >
                      {venta.estado}
                    </span>
                  </td>
                  <td className="venta-acciones">
                    <button
                      className="btn-ver-venta"
                      onClick={() => verDetalle(venta.id_venta)}
                    >
                      Ver detalle
                    </button>

                    {venta.estado !== "CANCELADA" && (
                      <button
                        className="btn-cancelar-venta"
                        onClick={() => cancelarVenta(venta.id_venta)}
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

      {cargandoDetalle && (
        <p className="ventas-mensaje">
          Cargando detalle de la venta...
        </p>
      )}

      {ventaSeleccionada && (
        <div className="venta-modal-fondo">
          <div className="venta-modal">
            <div className="venta-modal-header">
              <h2>
                Detalle de la venta #{ventaSeleccionada.venta.id_venta}
              </h2>
              <button
                className="btn-cerrar-modal"
                onClick={() => setVentaSeleccionada(null)}
                aria-label="Cerrar detalle"
              >
                ×
              </button>
            </div>

            <p>
              <strong>Usuario:</strong>{" "}
              {ventaSeleccionada.venta.usuario}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {ventaSeleccionada.venta.fecha_venta
                ? new Date(
                    ventaSeleccionada.venta.fecha_venta
                  ).toLocaleString("es-CO")
                : "—"}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              {ventaSeleccionada.venta.estado}
            </p>

            <div className="ventas-tabla-contenedor">
              <table className="ventas-tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {ventaSeleccionada.detalles?.map((detalle, indice) => (
                    <tr key={detalle.id_detalle || indice}>
                      <td>{detalle.producto}</td>
                      <td>{detalle.cantidad}</td>
                      <td>${formatoPrecio(detalle.precio_unitario)}</td>
                      <td>${formatoPrecio(detalle.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="venta-total">
              Total: ${formatoPrecio(ventaSeleccionada.venta.total)}
            </h3>

            <div className="venta-modal-acciones">
              {ventaSeleccionada.venta.estado !== "CANCELADA" && (
                <button
                  className="btn-cancelar-venta"
                  onClick={() =>
                    cancelarVenta(ventaSeleccionada.venta.id_venta)
                  }
                >
                  Cancelar venta
                </button>
              )}

              <button
                className="btn-cerrar"
                onClick={() => setVentaSeleccionada(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ventas;