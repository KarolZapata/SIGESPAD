import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("DATOS ENVIADOS:", {
  correo,
  contrasena,
});

const respuesta = await api.post("/usuarios/login", {
  correo,
  contrasena,
});

console.log("RESPUESTA DEL BACKEND:", respuesta.data);
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
        <h1>SIGESPAD</h1>

        <p>
          Sistema de Gestión para Papelería y Miscelánea
        </p>

        <form onSubmit={iniciarSesion}>
          <label>Correo electrónico</label>

          <input
            type="email"
            placeholder="Ingrese su correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <label>Contraseña</label>

          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button type="submit">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;