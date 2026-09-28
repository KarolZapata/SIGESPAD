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
      <header className="ventas-vendedor-header">
        <div>
          <span className="ventas-etiqueta">VENTAS</span>

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
        >
          Actualizar
        </button>
      </header>

      {error && (
        <div className="ventas-mensaje ventas-error">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="ventas-mensaje">
          Cargando ventas...
        </div>
      ) : ventas.length === 0 ? (
        <div className="ventas-mensaje">
          No hay ventas registradas.
        </div>
      ) : (
        <section className="ventas-tabla-contenedor">
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
                  <td>#{venta.id_venta}</td>

                  <td>{venta.usuario}</td>

                  <td>
                    {formatoFecha(venta.fecha_venta)}
                  </td>

                  <td>
                    $
                    {formatoPrecio(venta.total)}
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
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default VentasVendedor;