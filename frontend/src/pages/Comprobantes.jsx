import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Comprobantes.css";

function Comprobantes() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ventaInicial = searchParams.get("venta");

  const [ventas, setVentas] = useState([]);
  const [idVenta, setIdVenta] = useState(ventaInicial || "");

  const [venta, setVenta] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [pagos, setPagos] = useState([]);

  const [cargandoVentas, setCargandoVentas] = useState(true);
  const [cargandoComprobante, setCargandoComprobante] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    obtenerVentas();
  }, []);

  useEffect(() => {
    if (ventaInicial) {
      cargarComprobante(ventaInicial);
    }
  }, [ventaInicial]);

  const obtenerVentas = async () => {
    try {
      setCargandoVentas(true);
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
      setCargandoVentas(false);
    }
  };

  const cargarComprobante = async (id) => {
    if (!id) {
      setError("Selecciona una venta.");
      return;
    }

    try {
      setCargandoComprobante(true);
      setError("");

      const [respuestaVenta, respuestaPagos] =
        await Promise.all([
          api.get(`/ventas/${id}`),
          api.get(`/pagos/venta/${id}`),
        ]);

      setVenta(respuestaVenta.data.venta);
      setDetalles(respuestaVenta.data.detalles || []);
      setPagos(respuestaPagos.data || []);
    } catch (err) {
      console.error(
        "Error al cargar comprobante:",
        err
      );

      setVenta(null);
      setDetalles([]);
      setPagos([]);

      setError(
        err.response?.data?.error ||
          "No fue posible cargar el comprobante."
      );
    } finally {
      setCargandoComprobante(false);
    }
  };

  const seleccionarVenta = (e) => {
    const id = e.target.value;

    setIdVenta(id);

    if (id) {
      navigate(`/comprobantes?venta=${id}`);
      cargarComprobante(id);
    } else {
      setVenta(null);
      setDetalles([]);
      setPagos([]);
    }
  };

  const formatoPrecio = (valor) => {
    return Number(valor || 0).toLocaleString("es-CO");
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-CO", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const totalPagado = pagos.reduce(
    (total, pago) =>
      total +
      (pago.estado === "CONFIRMADO"
        ? Number(pago.monto)
        : 0),
    0
  );

  const saldoPendiente =
    Number(venta?.total || 0) - totalPagado;

  const imprimirComprobante = () => {
    window.print();
  };

  return (
    <main className="comprobantes-page">
      <header className="comprobantes-header">
        <div>
          <span className="comprobantes-etiqueta">
            VENTAS
          </span>

          <h1>Comprobantes</h1>

          <p>
            Consulta y genera el comprobante de una venta
            registrada.
          </p>
        </div>
      </header>

      <section className="comprobantes-selector">
        <label htmlFor="venta">
          Seleccionar venta
        </label>

        <select
          id="venta"
          value={idVenta}
          onChange={seleccionarVenta}
          disabled={cargandoVentas}
        >
          <option value="">
            Selecciona una venta
          </option>

          {ventas.map((item) => (
            <option
              key={item.id_venta}
              value={item.id_venta}
            >
              Venta #{item.id_venta} - $
              {formatoPrecio(item.total)} -{" "}
              {item.estado}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <div className="comprobantes-mensaje error">
          {error}
        </div>
      )}

      {cargandoComprobante && (
        <div className="comprobantes-mensaje">
          Cargando comprobante...
        </div>
      )}

      {venta && !cargandoComprobante && (
        <>
          <section className="comprobante">
            <div className="comprobante-encabezado">
              <div>
                <h2>PAPELERÍA SAN DIEGO</h2>
                <p>Comprobante de venta</p>
              </div>

              <div className="comprobante-numero">
                <strong>
                  Venta #{venta.id_venta}
                </strong>

                <span>
                  {formatoFecha(venta.fecha_venta)}
                </span>
              </div>
            </div>

            <div className="comprobante-info">
              <div>
                <span>Vendedor</span>
                <strong>{venta.usuario}</strong>
              </div>

              <div>
                <span>Estado</span>
                <strong>{venta.estado}</strong>
              </div>
            </div>

            <div className="comprobante-detalles">
              <h3>Productos</h3>

              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {detalles.map((detalle) => (
                    <tr key={detalle.id_detalle}>
                      <td>{detalle.producto}</td>

                      <td>{detalle.cantidad}</td>

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
                  ))}
                </tbody>
              </table>
            </div>

            <div className="comprobante-pago">
              <h3>Información de pago</h3>

              {pagos.length === 0 ? (
                <p>
                  No hay pagos registrados para esta
                  venta.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagos.map((pago) => (
                      <tr key={pago.id_pago}>
                        <td>{pago.tipo_pago}</td>

                        <td>
                          $
                          {formatoPrecio(
                            pago.monto
                          )}
                        </td>

                        <td>
                          {pago.estado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="comprobante-totales">
              <div>
                <span>Total venta</span>
                <strong>
                  $
                  {formatoPrecio(
                    venta.total
                  )}
                </strong>
              </div>

              <div>
                <span>Total pagado</span>
                <strong>
                  $
                  {formatoPrecio(totalPagado)}
                </strong>
              </div>

              <div>
                <span>Saldo pendiente</span>
                <strong>
                  $
                  {formatoPrecio(
                    Math.max(0, saldoPendiente)
                  )}
                </strong>
              </div>
            </div>

            <footer className="comprobante-footer">
              <p>
                Gracias por su compra.
              </p>

              <small>
                Comprobante interno generado por
                SIGESPAD.
              </small>
            </footer>
          </section>

          <div className="comprobante-acciones no-imprimir">
            <button
              type="button"
              onClick={() => navigate("/ventas-vendedor")}
            >
              Volver a ventas
            </button>

            <button
              type="button"
              onClick={imprimirComprobante}
            >
              Imprimir comprobante
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default Comprobantes;