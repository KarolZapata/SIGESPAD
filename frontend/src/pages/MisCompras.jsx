import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MisCompras.css";

function MisCompras() {
  const navigate = useNavigate();

  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://localhost:3000/api/ventas/mis-compras",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las compras.");
      }

      const datos = await respuesta.json();

      setCompras(datos);
    } catch (error) {
      console.error("Error al cargar compras:", error);
      setMensaje("No fue posible cargar tus compras.");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  if (cargando) {
    return (
      <main className="mis-compras">
        <div className="mis-compras-contenedor">
          <h1>Mis compras</h1>
          <p className="mis-compras-cargando">
            Cargando tus compras...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mis-compras">
      <div className="mis-compras-contenedor">
        <div className="mis-compras-encabezado">
          <div>
            <h1>Mis compras</h1>
            <p>
              Consulta las compras realizadas con tu cuenta.
            </p>
          </div>

          <button
            type="button"
            className="mis-compras-volver"
            onClick={() => navigate("/dashboard")}
          >
            Volver al panel
          </button>
        </div>

        {mensaje && (
          <div className="mis-compras-mensaje error">
            {mensaje}
          </div>
        )}

        {!mensaje && compras.length === 0 && (
          <div className="mis-compras-vacio">
            <h2>Aún no tienes compras</h2>

            <p>
              Cuando realices una compra, aparecerá aquí tu
              historial.
            </p>

            <button
              type="button"
              onClick={() => navigate("/productos")}
              className="mis-compras-boton"
            >
              Explorar productos
            </button>
          </div>
        )}

        {compras.length > 0 && (
          <section className="mis-compras-lista">
            <h2>Historial de compras</h2>

            {compras.map((compra) => (
              <article
                key={compra.id_venta}
                className="compra-card"
              >
                <div className="compra-card-principal">
                  <div>
                    <span className="compra-label">
                      Compra
                    </span>

                    <h3>#{compra.id_venta}</h3>
                  </div>

                  <div>
                    <span className="compra-label">
                      Fecha
                    </span>

                    <p>
                      {formatearFecha(compra.fecha_venta)}
                    </p>
                  </div>

                  <div>
                    <span className="compra-label">
                      Total
                    </span>

                    <p className="compra-total">
                      {formatearPrecio(compra.total)}
                    </p>
                  </div>

                  <div>
                    <span className="compra-label">
                      Estado
                    </span>

                    <span
                      className={`compra-estado estado-${compra.estado?.toLowerCase()}`}
                    >
                      {compra.estado}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default MisCompras;