import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const respuesta = await api.post("/usuarios/login", {
        correo,
        password,
      });

      const { token, usuario } = respuesta.data;

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.mensaje ||
        "Correo o contraseña incorrectos"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>SIGESPAD</h1>

        <p>Sistema de Gestión para Papelería y Miscelánea</p>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;