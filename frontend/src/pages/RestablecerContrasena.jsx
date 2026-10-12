
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./RestablecerContrasena.css";

export default function RestablecerContrasena() {
  const [params] = useSearchParams();

  const [correo, setCorreo] = useState(params.get("correo") || "");
  const [codigo, setCodigo] = useState("");
  const [codigoVerificado, setCodigoVerificado] = useState(false);
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [contrasenaCambiada, setContrasenaCambiada] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const requisitos = [
    {
      texto: "Mínimo 8 caracteres",
      cumplido: contrasena.length >= 8,
    },
    {
      texto: "Una letra mayúscula (A-Z)",
      cumplido: /[A-Z]/.test(contrasena),
    },
    {
      texto: "Una letra minúscula (a-z)",
      cumplido: /[a-z]/.test(contrasena),
    },
    {
      texto: "Un número (0-9)",
      cumplido: /[0-9]/.test(contrasena),
    },
    {
      texto: "Un símbolo especial (!, @, #, ...)",
      cumplido: /[^A-Za-z0-9]/.test(contrasena),
    },
  ];

  const contrasenaValida = requisitos.every(
    (requisito) => requisito.cumplido
  );

  const verificarCodigo = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const respuesta = await api.post(
        "/usuarios/verificar-codigo-recuperacion",
        {
          correo: correo.trim(),
          codigo: codigo.trim(),
        }
      );

      if (respuesta.data?.valido) {
        setCodigoVerificado(true);
        setMensaje(
          "Código verificado correctamente. Ahora crea tu contraseña."
        );
      } else {
        setCodigoVerificado(false);
        setError("El código es incorrecto o ha vencido.");
      }
    } catch (err) {
      setCodigoVerificado(false);
      setError(
        err.response?.data?.mensaje ||
          "El código es incorrecto o ha vencido."
      );
    } finally {
      setCargando(false);
    }
  };

  const cambiarContrasena = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!contrasenaValida) {
      setError(
        "La contraseña no cumple todos los requisitos de seguridad."
      );
      return;
    }

    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post(
        "/usuarios/restablecer-contrasena",
        {
          correo: correo.trim(),
          codigo: codigo.trim(),
          nuevaContrasena: contrasena,
        }
      );

      setError("");
      setMensaje(
        respuesta.data?.mensaje ||
          "Tu contraseña se ha cambiado correctamente."
      );

      setContrasenaCambiada(true);
      setCodigoVerificado(false);
      setCodigo("");
      setContrasena("");
      setConfirmar("");
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No fue posible cambiar la contraseña. Verifica el código e inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="restablecer-container">
      <section className="restablecer-card">
        <header className="restablecer-logo">
          <span className="restablecer-logo-icon">S</span>
          <h1>SIGESPAD</h1>

          <p>
            Sistema de Gestión para
            <br />
            Papelería y Miscelánea
          </p>

          <span className="restablecer-negocio">
            PAPELERÍA SAN DIEGO
          </span>
        </header>

        <div className="restablecer-separador" />

        <div className="restablecer-contenido">
          {contrasenaCambiada ? (
            <div className="restablecer-confirmacion">
              <div
                className="restablecer-confirmacion-icono"
                aria-hidden="true"
              >
                ✓
              </div>

              <h2>¡Contraseña cambiada!</h2>

              <p>
                Tu contraseña se ha actualizado correctamente.
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>

              <Link className="restablecer-boton-login" to="/">
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="restablecer-icono">
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

              <h2>
                {codigoVerificado
                  ? "Crear nueva contraseña"
                  : "Verificar código"}
              </h2>

              <p className="restablecer-info">
                {codigoVerificado
                  ? "El código es correcto. Ahora puedes crear una nueva contraseña."
                  : "Ingresa el código que enviamos a tu correo electrónico para continuar."}
              </p>

              {!codigoVerificado ? (
                <form onSubmit={verificarCodigo}>
                  <label htmlFor="correo-restablecer">
                    Correo electrónico
                  </label>

                  <input
                    id="correo-restablecer"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Tu correo electrónico"
                    autoComplete="email"
                    required
                  />

                  <label htmlFor="codigo-restablecer">
                    Código de recuperación
                  </label>

                  <input
                    id="codigo-restablecer"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ingresa el código recibido"
                    autoComplete="one-time-code"
                    required
                  />

                  <button type="submit" disabled={cargando}>
                    {cargando ? "Verificando..." : "Verificar código"}
                  </button>
                </form>
              ) : (
                <form onSubmit={cambiarContrasena}>
                  <label htmlFor="nueva-contrasena">
                    Nueva contraseña
                  </label>

                  <input
                    id="nueva-contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(e) => {
                      setContrasena(e.target.value);
                      setError("");
                    }}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                  />

                  <div className="restablecer-requisitos">
                    <strong>Tu contraseña debe contener:</strong>

                    <ul>
                      {requisitos.map((requisito) => (
                        <li
                          key={requisito.texto}
                          className={
                            requisito.cumplido
                              ? "requisito-cumplido"
                              : "requisito-pendiente"
                          }
                        >
                          <span aria-hidden="true">
                            {requisito.cumplido ? "✓" : "○"}
                          </span>
                          {requisito.texto}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <label htmlFor="confirmar-contrasena">
                    Confirmar contraseña
                  </label>

                  <input
                    id="confirmar-contrasena"
                    type="password"
                    value={confirmar}
                    onChange={(e) => {
                      setConfirmar(e.target.value);
                      setError("");
                    }}
                    placeholder="Escribe nuevamente la contraseña"
                    autoComplete="new-password"
                    required
                  />

                  {confirmar.length > 0 && (
                    <p
                      className={
                        contrasena === confirmar
                          ? "restablecer-coinciden"
                          : "restablecer-no-coinciden"
                      }
                    >
                      {contrasena === confirmar
                        ? "✓ Las contraseñas coinciden"
                        : "✗ Las contraseñas no coinciden"}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={
                      cargando ||
                      !contrasenaValida ||
                      contrasena !== confirmar
                    }
                  >
                    {cargando
                      ? "Actualizando..."
                      : "Cambiar contraseña"}
                  </button>
                </form>
              )}

              {error && (
                <div
                  className="restablecer-alerta restablecer-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {mensaje && (
                <div
                  className="restablecer-alerta restablecer-exito"
                  role="status"
                >
                  {mensaje}
                </div>
              )}

              <Link
                className="restablecer-volver"
                to="/recuperar-contrasena"
              >
                ← Volver a recuperación
              </Link>
            </>
          )}
        </div>

        <footer className="restablecer-footer">
          SIGESPAD <span>•</span> Gestión para Papelería San Diego
          <p>Calidad · Servicio · Confianza</p>
        </footer>
      </section>
    </main>
  );
}
