import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const respuesta = await api.post("/usuarios/login", {
        correo,
        contrasena,
      });

      const { token, usuario } = respuesta.data;

      login(usuario, token);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Correo o contraseña incorrectos"
      );
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        {/* =====================================================
            PANEL IZQUIERDO
            ===================================================== */}

        <div className="login-brand">

          <div className="login-brand-icon">
            ✦
          </div>

          <h1>SIGESPAD</h1>

          <div className="login-brand-line"></div>

          <p>
            Sistema de Gestión para
            <br />
            Papelería y Miscelánea
          </p>

          <p className="login-brand-small">
            PAPELERÍA SAN DIEGO
          </p>

        </div>

        {/* =====================================================
            PANEL DERECHO
            ===================================================== */}

        <div className="login-form-container">

          <h2>Iniciar sesión</h2>

          <p className="login-subtitle">
            Ingresa tus datos para continuar
          </p>

          <form
            className="login-form"
            onSubmit={iniciarSesion}
          >

            {/* CORREO */}

            <div className="login-form-group">

              <label htmlFor="correo">
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                className="login-input"
                placeholder="Ingrese su correo"
                value={correo}
                onChange={(e) =>
                  setCorreo(e.target.value)
                }
                required
              />

            </div>

            {/* CONTRASEÑA */}

            <div className="login-form-group">

              <label htmlFor="contrasena">
                Contraseña
              </label>

              <div className="login-input-container">

                <input
                  id="contrasena"
                  type={
                    mostrarContrasena
                      ? "text"
                      : "password"
                  }
                  className="login-input login-password-input"
                  placeholder="Ingrese su contraseña"
                  value={contrasena}
                  onChange={(e) =>
                    setContrasena(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setMostrarContrasena(
                      !mostrarContrasena
                    )
                  }
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >

                  {mostrarContrasena ? (
                    /* OJO ABIERTO */
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 12C4.5 7.8 7.8 5.5 12 5.5C16.2 5.5 19.5 7.8 21.5 12C19.5 16.2 16.2 18.5 12 18.5C7.8 18.5 4.5 16.2 2.5 12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  ) : (
                    /* OJO CERRADO */
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3L21 21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 5.7C11.05 5.57 11.52 5.5 12 5.5C16.2 5.5 19.5 7.8 21.5 12C20.7 13.68 19.7 15.05 18.45 16.1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M6.15 6.15C4.65 7.45 3.4 9.35 2.5 12C4.5 16.2 7.8 18.5 12 18.5C13.15 18.5 14.25 18.32 15.27 17.98"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            {/* BOTÓN */}

            <button
              type="submit"
              className="login-submit"
            >
              Iniciar sesión
            </button>

          </form>

          {/* RECUPERAR CONTRASEÑA */}

          <button
            type="button"
            className="login-forgot"
            onClick={() =>
              navigate("/recuperar-contrasena")
            }
          >
            ¿Olvidaste tu contraseña?
          </button>

          {/* PIE */}

          <div className="login-footer">
            SIGESPAD · Gestión para Papelería San Diego
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;