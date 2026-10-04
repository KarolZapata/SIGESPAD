import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./VentasVendedor.css";

function VentasVendedor() {
  const navigate = useNavigate();

  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

          {!cargando && ventas.length > 0 && (
            <div className="ventas-contador">
              <span>{ventas.length}</span>
              <small>
                {ventas.length === 1
                  ? "venta registrada"
                  : "ventas registradas"}
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
        ) : (
          <div className="ventas-tabla-contenedor">
            <table className="ventas-tabla">

              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Vendedor</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id_venta}>

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