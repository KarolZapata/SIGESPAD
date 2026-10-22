
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { SERVER_URL } from "../services/api";
import "./ResultadoPago.css";

function ResultadoPago() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vaciarCarrito } = useCart();

  const referencia = searchParams.get("reference");

  const [estado, setEstado] = useState("CONSULTANDO");
  const [mensaje, setMensaje] = useState(
    "Estamos verificando la confirmación de tu pago."
  );

  useEffect(() => {
    let cancelado = false;
    let intentos = 0;
    let temporizador;

    async function consultarEstado() {
      const token = localStorage.getItem("token");

      if (!token) {
        setEstado("ERROR");
        setMensaje("Inicia sesión para consultar tu compra.");
        return;
      }

      if (!referencia) {
        setEstado("ERROR");
        setMensaje(
          "No recibimos la referencia de la compra. Consulta Mis compras."
        );
        return;
      }

      try {
        const respuesta = await fetch(
          `${SERVER_URL}/api/wompi/estado/${encodeURIComponent(referencia)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.error || "No pudimos consultar el pago.");
        }

        if (cancelado) return;

        if (
          datos.estado_venta === "COMPLETADA" &&
          datos.estado_pago === "CONFIRMADO"
        ) {
          vaciarCarrito();
          setEstado("APROBADO");
          setMensaje("¡Pago aprobado! Tu compra se registró correctamente.");
          return;
        }

        if (
          datos.estado_venta === "CANCELADA" ||
          datos.estado_pago === "ANULADO"
        ) {
          setEstado("RECHAZADO");
          setMensaje(
            "El pago no fue aprobado. Puedes revisar tu carrito e intentarlo nuevamente."
          );
          return;
        }

        intentos += 1;

        if (intentos < 10) {
          temporizador = setTimeout(consultarEstado, 3000);
        } else {
          setEstado("PENDIENTE");
          setMensaje(
            "El pago todavía está en verificación. Consulta Mis compras en unos momentos."
          );
        }
      } catch (error) {
        if (cancelado) return;

        intentos += 1;

        if (intentos < 10) {
          temporizador = setTimeout(consultarEstado, 3000);
        } else {
          setEstado("PENDIENTE");
          setMensaje(
            "No pudimos confirmar el estado todavía. Tu carrito se conserva."
          );
        }
      }
    }

    consultarEstado();

    return () => {
    cancelado = true;
    clearTimeout(temporizador);
    };
    }, [referencia]);

  return (
    <main className="resultado-pago">
      <section className="resultado-pago-card">
        <div className={`resultado-pago-icono ${estado.toLowerCase()}`}>
          {estado === "APROBADO"
            ? "✓"
            : estado === "RECHAZADO"
            ? "×"
            : estado === "ERROR"
            ? "!"
            : "…"}
        </div>

        <h1>
          {estado === "APROBADO"
            ? "¡Compra confirmada!"
            : estado === "RECHAZADO"
            ? "Pago no aprobado"
            : estado === "ERROR"
            ? "No pudimos consultar"
            : "Verificando tu pago"}
        </h1>

        <p>{mensaje}</p>

        {referencia && (
          <small>Referencia: {referencia}</small>
        )}

        <div className="resultado-pago-botones">
          <button onClick={() => navigate("/mis-compras")}>
            Ver mis compras
          </button>

          <button
            className="resultado-pago-secundario"
            onClick={() => navigate("/productos")}
          >
            Volver a productos
          </button>
        </div>
      </section>
    </main>
  );
}

export default ResultadoPago;
