
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./RecuperarContrasena.css";

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const solicitarCodigo = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const respuesta = await api.post(
        "/usuarios/solicitar-recuperacion",
        { correo }
      );

      setMensaje(
        respuesta.data?.mensaje ||
          "Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña."
      );
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No fue posible procesar la solicitud. Intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="recuperar-container">
      <section className="recuperar-card">
        <div className="recuperar-logo">
          <span className="recuperar-logo-icon">S</span>
          <h1>SIGESPAD</h1>
          <p className="recuperar-subtitulo">
            Sistema de Gestión para
            <br />
            Papelería y Miscelánea
          </p>
          <span className="recuperar-negocio">
            PAPELERÍA SAN DIEGO
          </span>
        </div>

        <div className="recuperar-separador" />

        <div className="recuperar-contenido">
          <div className="recuperar-icono">
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <path d="M12 14v3" />
            </svg>
          </div>

          <h2>Recuperar contraseña</h2>
          <p className="recuperar-info">
            ¿Olvidaste tu contraseña? No te preocupes.
            Ingresa tu correo electrónico y te enviaremos
            las instrucciones para recuperarla.
          </p>

          <form onSubmit={solicitarCodigo}>
            <label htmlFor="correo-recuperacion">
              Correo electrónico
            </label>

            <input
              id="correo-recuperacion"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              autoComplete="email"
              required
            />

            {error && (
              <div className="recuperar-alerta recuperar-error" role="alert">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="recuperar-alerta recuperar-exito" role="status">
                {mensaje}

              <Link
                className="recuperar-continuar"
                to={`/restablecer-contrasena?correo=${encodeURIComponent(correo.trim())}`}
              >
                Continuar
              </Link>
              </div>
            )}

            <button type="submit" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar código"}
            </button>
          </form>

          <Link className="recuperar-volver" to="/">
            <span aria-hidden="true">←</span> Volver al inicio de sesión
          </Link>
        </div>

        <footer className="recuperar-footer">
          <span>SIGESPAD</span>
          <span className="recuperar-punto">•</span>
          Gestión para Papelería San Diego
          <p>Calidad · Servicio · Confianza</p>
        </footer>
      </section>
    </main>
  );
}
