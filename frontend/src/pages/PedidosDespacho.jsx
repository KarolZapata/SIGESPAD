
import { useEffect, useState } from "react";
import api from "../services/api";
import "./PedidosDespacho.css";

const estados = [
  "PENDIENTE",
  "PREPARANDO",
  "ENVIADO",
  "LISTO_RECOGER",
  "ENTREGADO",
];

const nombresEstado = {
  PENDIENTE: "Pendiente",
  PREPARANDO: "Preparando",
  ENVIADO: "Enviado",
  LISTO_RECOGER: "Listo para recoger",
  ENTREGADO: "Entregado",
};

export default function PedidosDespacho() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(null);

  async function cargarPedidos() {
    try {
      setError("");
      const respuesta = await api.get("/ventas/despachos");
      setPedidos(respuesta.data);
    } catch (e) {
      setError(
        e.response?.data?.error ||
          "No se pudieron cargar los pedidos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function actualizarLista() {
    setCargando(true);
    await cargarPedidos();
  }

  async function cambiarEstado(pedido, estado) {
    try {
      setActualizando(pedido.id_entrega);
      setError("");

      await api.put(`/ventas/despachos/${pedido.id_entrega}`, {
        estado_despacho: estado,
        observaciones: pedido.observaciones || null,
      });

      await cargarPedidos();
    } catch (e) {
      setError(
        e.response?.data?.error ||
          "No se pudo actualizar el despacho."
      );
    } finally {
      setActualizando(null);
    }
  }

  const dinero = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(valor || 0));

  const fecha = (valor) => {
    if (!valor) return "No disponible";

    const fechaPedido = new Date(valor);

    if (Number.isNaN(fechaPedido.getTime())) {
      return "No disponible";
    }

    return fechaPedido.toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const pendientes = pedidos.filter(
    (pedido) => pedido.estado_despacho === "PENDIENTE"
  ).length;

  const enProceso = pedidos.filter((pedido) =>
    ["PREPARANDO", "ENVIADO", "LISTO_RECOGER"].includes(
      pedido.estado_despacho
    )
  ).length;

  const entregados = pedidos.filter(
    (pedido) => pedido.estado_despacho === "ENTREGADO"
  ).length;

  if (cargando && pedidos.length === 0) {
    return (
      <main className="despachos">
        <section className="despachos-cargando">
          <div className="despachos-spinner" />
          <h2>Cargando pedidos</h2>
          <p>Estamos consultando las compras de la tienda.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="despachos">
      <header className="despachos-encabezado">
        <div className="despachos-titulo">
          <span className="despachos-eyebrow">
            PAPELERÍA SAN DIEGO · LOGÍSTICA
          </span>
          <h1>Pedidos por despachar</h1>
          <p>
            Administra las compras web y mantén actualizado el estado
            de cada entrega.
          </p>
        </div>

        <button
          type="button"
          className="despachos-btn-actualizar"
          onClick={actualizarLista}
          disabled={cargando}
        >
          <span aria-hidden="true">↻</span>
          {cargando ? "Actualizando..." : "Actualizar pedidos"}
        </button>
      </header>

      <section className="despachos-resumen">
        <article className="despachos-indicador">
          <div className="despachos-indicador-icono icono-pendiente">
            !
          </div>
          <div>
            <span>Pendientes</span>
            <strong>{pendientes}</strong>
            <small>Por comenzar</small>
          </div>
        </article>

        <article className="despachos-indicador">
          <div className="despachos-indicador-icono icono-proceso">
            ↗
          </div>
          <div>
            <span>En proceso</span>
            <strong>{enProceso}</strong>
            <small>Preparación o entrega</small>
          </div>
        </article>

        <article className="despachos-indicador">
          <div className="despachos-indicador-icono icono-entregado">
            ✓
          </div>
          <div>
            <span>Entregados</span>
            <strong>{entregados}</strong>
            <small>Pedidos completados</small>
          </div>
        </article>
      </section>

      {error && (
        <div className="despachos-error" role="alert">
          <span>⚠</span>
          <p>{error}</p>
          <button type="button" onClick={cargarPedidos}>
            Reintentar
          </button>
        </div>
      )}

      <section className="despachos-seccion">
        <div className="despachos-seccion-encabezado">
          <div>
            <h2>Listado de pedidos</h2>
            <p>
              {pedidos.length}{" "}
              {pedidos.length === 1
                ? "pedido registrado"
                : "pedidos registrados"}
            </p>
          </div>
          <span className="despachos-contador">
            {pedidos.length} en total
          </span>
        </div>

        {pedidos.length === 0 ? (
          <div className="despachos-vacio">
            <div className="despachos-vacio-icono">📦</div>
            <h3>Todo está al día</h3>
            <p>
              Cuando haya compras web pagadas pendientes de entrega,
              aparecerán aquí para que puedas gestionarlas.
            </p>
            <button
              type="button"
              className="despachos-btn-secundario"
              onClick={actualizarLista}
              disabled={cargando}
            >
              Revisar de nuevo
            </button>
          </div>
        ) : (
          <div className="despachos-lista">
            {pedidos.map((pedido) => (
              <article
                className="despacho-card"
                key={pedido.id_entrega}
              >
                <div className="despacho-card-cabecera">
                  <div>
                    <span className="despacho-numero">
                      ORDEN DE COMPRA
                    </span>
                    <h3>Pedido #{pedido.id_venta}</h3>
                  </div>

                  <span
                    className={`despacho-estado estado-${pedido.estado_despacho?.toLowerCase()}`}
                  >
                    {nombresEstado[pedido.estado_despacho] ||
                      pedido.estado_despacho?.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="despacho-cliente">
                  <div className="despacho-avatar" aria-hidden="true">
                    {(pedido.cliente || "C")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <span>Cliente</span>
                    <strong>{pedido.cliente || "No disponible"}</strong>
                    <small>{fecha(pedido.fecha_venta)}</small>
                  </div>
                </div>

                <div className="despacho-detalles">
                  <div className="despacho-detalle">
                    <span>Tipo de entrega</span>
                    <strong>
                      {pedido.tipo_entrega === "DOMICILIO"
                        ? "🚚 A domicilio"
                        : "🏪 Recogida en tienda"}
                    </strong>
                  </div>

                  <div className="despacho-detalle">
                    <span>Total de la compra</span>
                    <strong className="despacho-total">
                      {dinero(pedido.total)}
                    </strong>
                  </div>

                  {pedido.tipo_entrega === "DOMICILIO" && (
                    <>
                      <div className="despacho-detalle">
                        <span>Ciudad</span>
                        <strong>{pedido.ciudad || "No especificada"}</strong>
                      </div>

                      <div className="despacho-detalle despacho-direccion">
                        <span>Dirección de entrega</span>
                        <strong>
                          {pedido.direccion || "No especificada"}
                        </strong>
                      </div>

                      <div className="despacho-detalle">
                        <span>Costo de envío</span>
                        <strong>{dinero(pedido.costo)}</strong>
                      </div>
                    </>
                  )}
                </div>

                <div className="despacho-acciones">
                  <label htmlFor={`estado-${pedido.id_entrega}`}>
                    Actualizar estado del pedido
                    <select
                      id={`estado-${pedido.id_entrega}`}
                      value={pedido.estado_despacho}
                      disabled={actualizando === pedido.id_entrega}
                      onChange={(e) =>
                        cambiarEstado(pedido, e.target.value)
                      }
                    >
                      {estados.map((estado) => (
                        <option value={estado} key={estado}>
                          {nombresEstado[estado]}
                        </option>
                      ))}
                    </select>
                  </label>

                  {actualizando === pedido.id_entrega && (
                    <span className="despacho-guardando">
                      Guardando cambio...
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
