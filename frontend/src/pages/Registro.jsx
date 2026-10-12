import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // VALIDACIONES DE SEGURIDAD DE LA CONTRASEÑA
  // =====================================================

  const cumpleLongitud = contrasena.length >= 8;
  const cumpleMayuscula = /[A-Z]/.test(contrasena);
  const cumpleMinuscula = /[a-z]/.test(contrasena);
  const cumpleNumero = /[0-9]/.test(contrasena);
  const cumpleSimbolo = /[^A-Za-z0-9\s]/.test(contrasena);

  const contrasenaValida =
    cumpleLongitud &&
    cumpleMayuscula &&
    cumpleMinuscula &&
    cumpleNumero &&
    cumpleSimbolo;

  const contrasenasCoinciden =
    contrasena.length > 0 &&
    contrasena === confirmarContrasena;

  const formularioValido =
    nombre.trim().length > 0 &&
    correo.trim().length > 0 &&
    contrasenaValida &&
    contrasenasCoinciden;

  // =====================================================
  // REGISTRAR CLIENTE
  // =====================================================

  const registrarCliente = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (
      !nombreLimpio ||
      !correoLimpio ||
      !contrasena ||
      !confirmarContrasena
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!contrasenaValida) {
      setError(
        "La contraseña debe cumplir todos los requisitos de seguridad."
      );
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await api.post("/usuarios/registro", {
        nombre: nombreLimpio,
        correo: correoLimpio,
        contrasena,
      });


    setMensaje(
    respuesta.data.mensaje ||
        "Cuenta creada correctamente. Revisa tu correo para verificarla."
    );

    // No redirigir automáticamente.
    // Así el cliente puede leer el mensaje y revisar su correo.

    } catch (error) {
      setError(
        error.response?.data?.error ||
          "No fue posible crear la cuenta. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="login-container registro-container">
      <div className="login-card registro-card">

        {/* PANEL IZQUIERDO */}

        <div className="login-brand">
          <div className="login-brand-icon">✦</div>

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

        {/* PANEL DERECHO */}

        <div className="login-form-container registro-form-container">
          <h2>Crear cuenta</h2>

          <p className="login-subtitle">
            Regístrate para comprar en SIGESPAD
          </p>

          <form
            className="login-form"
            onSubmit={registrarCliente}
          >
            {/* NOMBRE */}

            <div className="login-form-group">
              <label htmlFor="nombre">
                Nombre completo
              </label>

              <input
                id="nombre"
                type="text"
                className="login-input"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError("");
                  setMensaje("");
                }}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            {/* CORREO */}

            <div className="login-form-group">
              <label htmlFor="correo-registro">
                Correo electrónico
              </label>

              <input
                id="correo-registro"
                type="email"
                className="login-input"
                placeholder="Ingresa tu correo"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setError("");
                  setMensaje("");
                }}
                maxLength={100}
                autoComplete="email"
                required
              />
            </div>

            {/* CONTRASEÑA */}

            <div className="login-form-group">
              <label htmlFor="contrasena-registro">
                Contraseña
              </label>

              <input
                id="contrasena-registro"
                type="password"
                className="login-input"
                placeholder="Crea una contraseña segura"
                value={contrasena}
                onChange={(e) => {
                  setContrasena(e.target.value);
                  setError("");
                  setMensaje("");
                }}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                aria-describedby="requisitos-contrasena"
              />

              {/* REQUISITOS EN TIEMPO REAL */}

              <div
                id="requisitos-contrasena"
                className="registro-requisitos"
              >
                <p className="registro-requisitos-titulo">
                  Tu contraseña debe contener:
                </p>

                <p
                  className={`registro-requisito ${
                    cumpleLongitud ? "cumplido" : "pendiente"
                  }`}
                >
                  <span className="registro-requisito-icono">
                    {cumpleLongitud ? "✓" : "○"}
                  </span>
                  Mínimo 8 caracteres
                </p>

                <p
                  className={`registro-requisito ${
                    cumpleMayuscula ? "cumplido" : "pendiente"
                  }`}
                >
                  <span className="registro-requisito-icono">
                    {cumpleMayuscula ? "✓" : "○"}
                  </span>
                  Una letra mayúscula (A-Z)
                </p>

                <p
                  className={`registro-requisito ${
                    cumpleMinuscula ? "cumplido" : "pendiente"
                  }`}
                >
                  <span className="registro-requisito-icono">
                    {cumpleMinuscula ? "✓" : "○"}
                  </span>
                  Una letra minúscula (a-z)
                </p>

                <p
                  className={`registro-requisito ${
                    cumpleNumero ? "cumplido" : "pendiente"
                  }`}
                >
                  <span className="registro-requisito-icono">
                    {cumpleNumero ? "✓" : "○"}
                  </span>
                  Un número (0-9)
                </p>

                <p
                  className={`registro-requisito ${
                    cumpleSimbolo ? "cumplido" : "pendiente"
                  }`}
                >
                  <span className="registro-requisito-icono">
                    {cumpleSimbolo ? "✓" : "○"}
                  </span>
                  Un símbolo especial (!, @, #, $...)
                </p>
              </div>
            </div>

            {/* CONFIRMAR CONTRASEÑA */}

            <div className="login-form-group">
              <label htmlFor="confirmar-contrasena">
                Confirmar contraseña
              </label>

              <input
                id="confirmar-contrasena"
                type="password"
                className="login-input"
                placeholder="Repite tu contraseña"
                value={confirmarContrasena}
                onChange={(e) => {
                  setConfirmarContrasena(e.target.value);
                  setError("");
                  setMensaje("");
                }}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />

              {confirmarContrasena && (
                <p
                  className={`registro-coincidencia ${
                    contrasenasCoinciden
                      ? "cumplido"
                      : "pendiente"
                  }`}
                  aria-live="polite"
                >
                  {contrasenasCoinciden
                    ? "✓ Las contraseñas coinciden"
                    : "✗ Las contraseñas no coinciden"}
                </p>
              )}
            </div>

            {/* MENSAJES */}

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            {mensaje && (
              <p
                className="registro-mensaje"
                role="status"
              >
                {mensaje}
              </p>
            )}

            {/* BOTÓN DE REGISTRO */}

            <button
              type="submit"
              className="login-submit"
              disabled={cargando || !formularioValido}
            >
              {cargando
                ? "Creando cuenta..."
                : "Crear cuenta"}
            </button>
          </form>

          {/* VOLVER AL INICIO DE SESIÓN */}

          <p className="registro-enlace-login">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login">
              Inicia sesión
            </Link>
          </p>

          {/* PIE */}

          <div className="login-footer">
            SIGESPAD · Gestión para Papelería San Diego
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;