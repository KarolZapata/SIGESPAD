import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RecuperarContrasena.css";

function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const solicitarCodigo = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    try {
      const respuesta = await api.post(
        "/usuarios/solicitar-recuperacion",
        { correo }
      );

      setMensaje(respuesta.data.mensaje);

      localStorage.setItem(
        "correoRecuperacion",
        correo
      );
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "No fue posible procesar la solicitud"
      );
    }
  };

  return (
    <div className="recuperacion-container">

      <div className="recuperacion-card">

        {/* =====================================================
            PANEL IZQUIERDO
            ===================================================== */}

        <div className="recuperacion-brand">

          <div className="recuperacion-brand-icon">
            ✦
          </div>

          <h1>SIGESPAD</h1>

          <div className="recuperacion-brand-line"></div>

          <p>
            Sistema de Gestión para
            <br />
            Papelería y Miscelánea
          </p>

          <p className="recuperacion-brand-small">
            PAPELERÍA SAN DIEGO
          </p>

        </div>

        {/* =====================================================
            PANEL DERECHO
            ===================================================== */}

        <div className="recuperacion-form-container">

          <h2>Recuperar contraseña</h2>

          <p className="recuperacion-subtitle">
            Ingresa tu correo electrónico y te enviaremos
            <br />
            un código de recuperación.
          </p>

          <form
            className="recuperacion-form"
            onSubmit={solicitarCodigo}
          >

            <div className="recuperacion-form-group">

              <label htmlFor="correo">
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                className="recuperacion-input"
                placeholder="Ingrese su correo"
                value={correo}
                onChange={(e) =>
                  setCorreo(e.target.value)
                }
                required
              />

            </div>

            {/* MENSAJE DE ÉXITO */}

            {mensaje && (
              <p className="recuperacion-mensaje-exito">
                {mensaje}
              </p>
            )}

            {/* MENSAJE DE ERROR */}

            {error && (
              <p className="recuperacion-mensaje-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="recuperacion-submit"
            >
              Enviar código
            </button>

          </form>

          {/* CONTINUAR */}

          {mensaje && (
            <button
              type="button"
              className="recuperacion-continuar"
              onClick={() =>
                navigate(
                  "/restablecer-contrasena"
                )
              }
            >
              Continuar
            </button>
          )}

          {/* VOLVER */}

          <button
            type="button"
            className="recuperacion-volver"
            onClick={() =>
              navigate("/login")
            }
          >
            ← Volver al inicio de sesión
          </button>

          {/* PIE */}

          <div className="recuperacion-footer">
            SIGESPAD · Gestión para Papelería San Diego
          </div>

        </div>

      </div>

    </div>
  );
}

export default RecuperarContrasena;