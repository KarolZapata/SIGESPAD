
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

  if (cargando) return <p>Cargando pedidos...</p>;

  return (
    <main className="despachos">
      <h1>Pedidos por despachar</h1>
      <p>Consulta las compras web pagadas y actualiza su entrega.</p>

      <button onClick={cargarPedidos}>Actualizar lista</button>

      {error && <p className="despachos-error">{error}</p>}

      {pedidos.length === 0 ? (
        <p>No hay pedidos pendientes de despacho.</p>
      ) : (
        <div className="despachos-lista">
          {pedidos.map((pedido) => (
            <article
              className="despacho-card"
              key={pedido.id_entrega}
            >
              <h2>Pedido #{pedido.id_venta}</h2>
              <p><strong>Cliente:</strong> {pedido.cliente}</p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(pedido.fecha_venta).toLocaleString("es-CO")}
              </p>
              <p><strong>Total:</strong> {dinero(pedido.total)}</p>
              <p>
                <strong>Entrega:</strong>{" "}
                {pedido.tipo_entrega === "DOMICILIO"
                  ? "Domicilio"
                  : "Recogida en tienda"}
              </p>

              {pedido.tipo_entrega === "DOMICILIO" && (
                <>
                  <p><strong>Ciudad:</strong> {pedido.ciudad}</p>
                  <p><strong>Dirección:</strong> {pedido.direccion}</p>
                  <p><strong>Costo de envío:</strong> {dinero(pedido.costo)}</p>
                </>
              )}

              <p>
                <strong>Estado:</strong>{" "}
                {pedido.estado_despacho.replace("_", " ")}
              </p>

              <label>
                Actualizar estado
                <select
                  value={pedido.estado_despacho}
                  disabled={actualizando === pedido.id_entrega}
                  onChange={(e) =>
                    cambiarEstado(pedido, e.target.value)
                  }
                >
                  {estados.map((estado) => (
                    <option value={estado} key={estado}>
                      {estado.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              {actualizando === pedido.id_entrega && (
                <p>Guardando cambio...</p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
