
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Usuarios.css";

const formularioInicial = {
  nombre: "",
  correo: "",
  contrasena: "",
  rol: "VENDEDOR",
};

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await api.get("/usuarios");
      setUsuarios(respuesta.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo cargar la lista de usuarios."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const actualizarCampo = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setUsuarioEditando(null);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!formulario.nombre.trim() || !formulario.correo.trim()) {
      setError("Ingresa el nombre y el correo del usuario.");
      return;
    }

    if (!usuarioEditando && !formulario.contrasena) {
      setError("La contraseña es obligatoria al crear un usuario.");
      return;
    }

    if (
      formulario.contrasena &&
      formulario.contrasena.length < 6
    ) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const datosUsuario = {
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim(),
      rol: formulario.rol,
    };

    // Al editar, solo enviamos la contraseña si se escribió una nueva.
    if (formulario.contrasena) {
      datosUsuario.contrasena = formulario.contrasena;
    }

    try {
      setGuardando(true);

      if (usuarioEditando) {
        const respuesta = await api.put(
          `/usuarios/${usuarioEditando.id_usuario}`,
          datosUsuario
        );

        setMensaje(
          respuesta.data.mensaje || "Usuario actualizado correctamente."
        );
      } else {
        const respuesta = await api.post("/usuarios", datosUsuario);

        setMensaje(
          respuesta.data.mensaje || "Usuario creado correctamente."
        );
      }

      limpiarFormulario();
      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo guardar la información del usuario."
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarUsuario = (usuario) => {
    setUsuarioEditando(usuario);

    setFormulario({
      nombre: usuario.nombre || "",
      correo: usuario.correo || "",
      contrasena: "",
      rol: usuario.rol || "VENDEDOR",
    });

    setError("");
    setMensaje("");
  };

  const cambiarEstado = async (usuario) => {
    setError("");
    setMensaje("");

    try {
      let respuesta;

      if (Number(usuario.estado) === 1) {
        respuesta = await api.delete(
          `/usuarios/${usuario.id_usuario}`
        );
      } else {
        respuesta = await api.put(
          `/usuarios/${usuario.id_usuario}/activar`
        );
      }

      setMensaje(
        respuesta.data.mensaje ||
          "Estado del usuario actualizado correctamente."
      );

      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo actualizar el estado del usuario."
      );
    }
  };

  if (cargando) {
    return (
      <main className="usuarios">
        <p>Cargando usuarios...</p>
      </main>
    );
  }

  return (
    <main className="usuarios">
      <header className="usuarios-encabezado">
        <h1>Gestión de usuarios</h1>
        <p>
          Administra las cuentas, los roles y el estado de los
          usuarios del sistema.
        </p>
      </header>

      {error && (
        <div className="usuarios-mensaje error">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="usuarios-mensaje exito">
          {mensaje}
        </div>
      )}

      <section className="usuarios-seccion">
        <h2>
          {usuarioEditando ? "Editar usuario" : "Registrar usuario"}
        </h2>

        <form
          className="usuarios-formulario"
          onSubmit={guardarUsuario}
        >
          <label>
            Nombre
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={actualizarCampo}
              maxLength="100"
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={actualizarCampo}
              maxLength="100"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="contrasena"
              value={formulario.contrasena}
              onChange={actualizarCampo}
              minLength="6"
              placeholder={
                usuarioEditando
                  ? "Dejar vacía para conservar la actual"
                  : "Mínimo 6 caracteres"
              }
              required={!usuarioEditando}
            />
          </label>

          <label>
            Rol
            <select
              name="rol"
              value={formulario.rol}
              onChange={actualizarCampo}
              required
            >
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="VENDEDOR">Vendedor</option>
            </select>
          </label>

          <div className="usuarios-formulario-acciones">
            <button type="submit" disabled={guardando}>
              {guardando
                ? "Guardando..."
                : usuarioEditando
                ? "Guardar cambios"
                : "Crear usuario"}
            </button>

            {usuarioEditando && (
              <button
                type="button"
                className="usuarios-boton-secundario"
                onClick={limpiarFormulario}
                disabled={guardando}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="usuarios-seccion">
        <h2>Usuarios registrados</h2>

        <div className="usuarios-tabla-contenedor">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.id_usuario}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.correo}</td>
                  <td>{usuario.rol}</td>
                  <td>
                    <span
                      className={`usuarios-etiqueta ${
                        Number(usuario.estado) === 1
                          ? "activo"
                          : "inactivo"
                      }`}
                    >
                      {Number(usuario.estado) === 1
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    {usuario.fecha_creacion
                      ? new Date(
                          usuario.fecha_creacion
                        ).toLocaleDateString("es-CO")
                      : "—"}
                  </td>
                  <td>
                    <div className="usuarios-acciones">
                      <button
                        type="button"
                        onClick={() => editarUsuario(usuario)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="usuarios-boton-secundario"
                        onClick={() => cambiarEstado(usuario)}
                      >
                        {Number(usuario.estado) === 1
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="7">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Usuarios;