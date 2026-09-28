import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Pagos.css";

function Pagos() {
  const navigate = useNavigate();
  const location = useLocation();

  const parametros = new URLSearchParams(location.search);
  const ventaInicial = parametros.get("venta") || "";

  const [idVenta, setIdVenta] = useState(ventaInicial);
  const [venta, setVenta] = useState(null);
  const [pagos, setPagos] = useState([]);

  const [tipoPago, setTipoPago] = useState("EFECTIVO");
  const [monto, setMonto] = useState("");

  const [cargandoVenta, setCargandoVenta] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // BUSCAR VENTA
  // =====================================================

  const buscarVenta = async () => {
    setMensaje("");
    setError("");
    setVenta(null);
    setPagos([]);

    if (!idVenta || Number(idVenta) <= 0) {
      setError("Ingrese un número de venta válido.");
      return;
    }

    try {
      setCargandoVenta(true);

      const respuesta = await api.get(`/ventas/${idVenta}`);

      setVenta(respuesta.data.venta);

      const respuestaPagos = await api.get(
        `/pagos/venta/${idVenta}`
      );

      setPagos(respuestaPagos.data || []);

    } catch (err) {
      console.error("Error al consultar venta:", err);

      setError(
        err.response?.data?.error ||
          "No fue posible consultar la venta."
      );
    } finally {
      setCargandoVenta(false);
    }
  };

  // =====================================================
  // CARGAR VENTA DESDE ?venta=
  // =====================================================

  useEffect(() => {
    if (ventaInicial) {
      buscarVenta();
    }
  }, []);

  // =====================================================
  // REGISTRAR PAGO
  // =====================================================

  const registrarPago = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!venta) {
      setError("Primero debe consultar una venta.");
      return;
    }

    const montoNumerico = Number(monto);

    if (!montoNumerico || montoNumerico <= 0) {
      setError("El monto debe ser mayor que cero.");
      return;
    }

    try {
      setRegistrando(true);

      const respuesta = await api.post("/pagos", {
        id_venta: venta.id_venta,
        tipo_pago: tipoPago,
        monto: montoNumerico,
      });

      setMensaje(
        respuesta.data.mensaje ||
          "Pago registrado correctamente."
      );

      setMonto("");

      // Actualizar venta y pagos
      await buscarVenta();

    } catch (err) {
      console.error("Error al registrar pago:", err);

      setError(
        err.response?.data?.error ||
          "No fue posible registrar el pago."
      );
    } finally {
      setRegistrando(false);
    }
  };

  // =====================================================
  // FORMATO DE DINERO
  // =====================================================

  const formatoPrecio = (valor) =>
    Number(valor || 0).toLocaleString("es-CO");

  // =====================================================
  // CALCULAR PAGADO Y PENDIENTE
  // =====================================================

  const totalPagado = pagos
    .filter((pago) => pago.estado === "CONFIRMADO")
    .reduce(
      (total, pago) => total + Number(pago.monto || 0),
      0
    );

  const totalVenta = Number(venta?.total || 0);

  const saldoPendiente = Math.max(
    totalVenta - totalPagado,
    0
  );

  return (
    <main className="pagos-page">
      <header className="pagos-header">
        <div>
          <span className="pagos-etiqueta">
            PAGOS
          </span>

          <h1>Gestión de pagos</h1>

          <p>
            Registra y consulta los pagos asociados a las
            ventas.
          </p>
        </div>

        <button
          type="button"
          className="pagos-btn-volver"
          onClick={() => navigate("/dashboard")}
        >
          Volver al panel
        </button>
      </header>

      {/* MENSAJES */}

      {mensaje && (
        <div className="pagos-mensaje exitoso">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="pagos-mensaje error">
          {error}
        </div>
      )}

      {/* BUSCAR VENTA */}

      <section className="pagos-seccion">
        <h2>Consultar venta</h2>

        <div className="pagos-buscador">
          <div>
            <label htmlFor="idVenta">
              Número de venta
            </label>

            <input
              id="idVenta"
              type="number"
              min="1"
              value={idVenta}
              onChange={(e) => setIdVenta(e.target.value)}
              placeholder="Ej. 15"
            />
          </div>

          <button
            type="button"
            onClick={buscarVenta}
            disabled={cargandoVenta}
            className="pagos-btn-principal"
          >
            {cargandoVenta
              ? "Consultando..."
              : "Consultar venta"}
          </button>
        </div>
      </section>

      {/* INFORMACIÓN DE LA VENTA */}

      {venta && (
        <>
          <section className="pagos-resumen">
            <div className="pago-resumen-card">
              <span>Venta</span>
              <strong>#{venta.id_venta}</strong>
            </div>

            <div className="pago-resumen-card">
              <span>Fecha</span>
              <strong>
                {new Date(
                  venta.fecha_venta
                ).toLocaleString("es-CO")}
              </strong>
            </div>

            <div className="pago-resumen-card">
              <span>Total venta</span>
              <strong>
                ${formatoPrecio(totalVenta)}
              </strong>
            </div>

            <div className="pago-resumen-card">
              <span>Total pagado</span>
              <strong>
                ${formatoPrecio(totalPagado)}
              </strong>
            </div>

            <div className="pago-resumen-card pendiente">
              <span>Saldo pendiente</span>
              <strong>
                ${formatoPrecio(saldoPendiente)}
              </strong>
            </div>

            <div className="pago-resumen-card">
              <span>Estado</span>
              <strong>{venta.estado}</strong>
            </div>
          </section>

          {/* REGISTRAR PAGO */}

          <section className="pagos-seccion">
            <h2>Registrar pago</h2>

            {saldoPendiente <= 0 ||
            venta.estado === "CANCELADA" ? (
              <div className="pagos-mensaje informacion">
                Esta venta no tiene saldo pendiente para
                registrar.
              </div>
            ) : (
              <form
                className="pagos-formulario"
                onSubmit={registrarPago}
              >
                <div>
                  <label htmlFor="tipoPago">
                    Tipo de pago
                  </label>

                  <select
                    id="tipoPago"
                    value={tipoPago}
                    onChange={(e) =>
                      setTipoPago(e.target.value)
                    }
                  >
                    <option value="EFECTIVO">
                      Efectivo
                    </option>
                    <option value="TARJETA">
                      Tarjeta
                    </option>
                    <option value="TRANSFERENCIA">
                      Transferencia
                    </option>
                    <option value="NEQUI">
                      Nequi
                    </option>
                    <option value="DAVIPLATA">
                      Daviplata
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="monto">
                    Monto
                  </label>

                  <input
                    id="monto"
                    type="number"
                    min="1"
                    step="0.01"
                    max={saldoPendiente}
                    value={monto}
                    onChange={(e) =>
                      setMonto(e.target.value)
                    }
                    placeholder="Ingrese el valor"
                  />
                </div>

                <button
                  type="submit"
                  className="pagos-btn-principal"
                  disabled={registrando}
                >
                  {registrando
                    ? "Registrando..."
                    : "Registrar pago"}
                </button>
              </form>
            )}
          </section>

          {/* HISTORIAL */}

          <section className="pagos-seccion">
            <h2>Pagos registrados</h2>

            {pagos.length === 0 ? (
              <p className="pagos-vacio">
                Esta venta todavía no tiene pagos registrados.
              </p>
            ) : (
              <div className="pagos-tabla-contenedor">
                <table className="pagos-tabla">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo de pago</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagos.map((pago) => (
                      <tr key={pago.id_pago}>
                        <td>{pago.id_pago}</td>

                        <td>{pago.tipo_pago}</td>

                        <td>
                          $
                          {formatoPrecio(
                            pago.monto
                          )}
                        </td>

                        <td>
                          <span
                            className={`pago-estado ${String(
                              pago.estado
                            ).toLowerCase()}`}
                          >
                            {pago.estado}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            pago.fecha_pago
                          ).toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Pagos;