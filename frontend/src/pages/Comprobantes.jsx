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
      console.error("Error al cargar comprobante:", err);

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

      {/* =====================================================
          ENCABEZADO DE LA PÁGINA
      ===================================================== */}

      <header className="comprobantes-header">
        <span className="comprobantes-etiqueta">
          VENTAS
        </span>

        <h1>Comprobantes</h1>

        <p>
          Consulta y genera el comprobante de una venta
          registrada.
        </p>
      </header>

      {/* =====================================================
          SELECTOR DE VENTA
      ===================================================== */}

      <section className="comprobantes-selector">

        <div className="selector-icono">
          ✓
        </div>

        <div className="selector-contenido">
          <span className="selector-etiqueta">
            CONSULTA
          </span>

          <label htmlFor="venta">
            Seleccionar venta
          </label>

          <p>
            Selecciona una venta para consultar su
            comprobante.
          </p>

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
        </div>

      </section>

      {/* =====================================================
          MENSAJES
      ===================================================== */}

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

      {/* =====================================================
          COMPROBANTE
      ===================================================== */}

      {venta && !cargandoComprobante && (
        <>
          <section className="comprobante">

            {/* DECORACIÓN SUPERIOR */}
            <div className="comprobante-franja"></div>

            {/* ENCABEZADO */}
            <div className="comprobante-encabezado">

              <div className="comprobante-marca">
                <div className="marca-icono">
                  SD
                </div>

                <div>
                  <h2>PAPELERÍA SAN DIEGO</h2>

                  <p>
                    Calidad · Servicio · Confianza
                  </p>
                </div>
              </div>

              <div className="comprobante-numero">
                <span>COMPROBANTE DE VENTA</span>

                <strong>
                  #{venta.id_venta}
                </strong>

                <small>
                  {formatoFecha(venta.fecha_venta)}
                </small>
              </div>

            </div>

            {/* SEPARADOR */}
            <div className="comprobante-linea"></div>

            {/* INFORMACIÓN GENERAL */}
            <div className="comprobante-meta">

              <div className="meta-item">
                <span className="meta-icono">
                  👤
                </span>

                <div>
                  <small>VENDEDOR</small>
                  <strong>
                    {venta.usuario}
                  </strong>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icono">
                  📅
                </span>

                <div>
                  <small>FECHA DE VENTA</small>
                  <strong>
                    {formatoFecha(
                      venta.fecha_venta
                    )}
                  </strong>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icono">
                  ●
                </span>

                <div>
                  <small>ESTADO</small>

                  <strong>
                    <span
                      className={`estado-comprobante ${venta.estado?.toLowerCase()}`}
                    >
                      {venta.estado}
                    </span>
                  </strong>
                </div>
              </div>

            </div>

            {/* =================================================
                PRODUCTOS
            ================================================= */}

            <div className="comprobante-seccion">

              <div className="seccion-titulo">
                <div>
                  <span>DETALLE DE LA VENTA</span>
                  <h3>Productos</h3>
                </div>

                <div className="cantidad-productos">
                  {detalles.length}{" "}
                  {detalles.length === 1
                    ? "producto"
                    : "productos"}
                </div>
              </div>

              <div className="comprobante-tabla">

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

                        <td>
                          <div className="producto-tabla">
                            <span className="producto-indicador"></span>

                            <strong>
                              {detalle.producto}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="cantidad-badge">
                            {detalle.cantidad}
                          </span>
                        </td>

                        <td>
                          $
                          {formatoPrecio(
                            detalle.precio_unitario
                          )}
                        </td>

                        <td className="valor-subtotal">
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

            </div>

            {/* =================================================
                PAGOS
            ================================================= */}

            <div className="comprobante-seccion">

              <div className="seccion-titulo">
                <div>
                  <span>TRANSACCIONES</span>
                  <h3>Información de pago</h3>
                </div>

                <div className="cantidad-productos">
                  {pagos.length}{" "}
                  {pagos.length === 1
                    ? "pago"
                    : "pagos"}
                </div>
              </div>

              {pagos.length === 0 ? (

                <div className="sin-pagos">
                  <div className="sin-pagos-icono">
                    $
                  </div>

                  <div>
                    <strong>
                      Sin pagos registrados
                    </strong>

                    <p>
                      Esta venta todavía no tiene
                      pagos registrados.
                    </p>
                  </div>
                </div>

              ) : (

                <div className="comprobante-tabla">

                  <table>
                    <thead>
                      <tr>
                        <th>Tipo de pago</th>
                        <th>Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pagos.map((pago) => (
                        <tr key={pago.id_pago}>

                          <td>
                            <strong>
                              {pago.tipo_pago}
                            </strong>
                          </td>

                          <td className="valor-subtotal">
                            $
                            {formatoPrecio(
                              pago.monto
                            )}
                          </td>

                          <td>
                            <span
                              className={`estado-pago ${pago.estado?.toLowerCase()}`}
                            >
                              {pago.estado}
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>

              )}

            </div>

            {/* =================================================
                RESUMEN DE TOTALES
            ================================================= */}

            <div className="resumen-final">

              <div className="resumen-datos">

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
                    {formatoPrecio(
                      totalPagado
                    )}
                  </strong>
                </div>

                <div className="resumen-saldo">
                  <span>Saldo pendiente</span>

                  <strong>
                    $
                    {formatoPrecio(
                      Math.max(
                        0,
                        saldoPendiente
                      )
                    )}
                  </strong>
                </div>

              </div>

            </div>

            {/* =================================================
                PIE
            ================================================= */}

            <footer className="comprobante-footer">

              <div className="footer-linea"></div>

              <p>
                Gracias por su compra
              </p>

              <span>
                PAPELERÍA SAN DIEGO
              </span>

              <small>
                Comprobante interno generado por SIGESPAD
              </small>

            </footer>

          </section>

          {/* =================================================
              ACCIONES
          ================================================= */}

          <div className="comprobante-acciones no-imprimir">

            <button
              type="button"
              className="btn-volver"
              onClick={() =>
                navigate("/ventas-vendedor")
              }
            >
              ← Volver a ventas
            </button>

            <button
              type="button"
              className="btn-imprimir"
              onClick={imprimirComprobante}
            >
              🖨 Imprimir comprobante
            </button>

          </div>
        </>
      )}
    </main>
  );
}

export default Comprobantes;