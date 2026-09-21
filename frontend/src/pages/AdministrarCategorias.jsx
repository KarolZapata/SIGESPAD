
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdministrarCategorias.css";

const formularioInicial = {
  nombre: "",
  descripcion: "",
};

function AdministrarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const obtenerCategorias = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await api.get("/categorias");
      setCategorias(Array.isArray(respuesta.data) ? respuesta.data : []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError(
        err.response?.data?.error ||
          "No fue posible cargar las categorías."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const categoriasFiltradas = categorias.filter((categoria) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      categoria.nombre?.toLowerCase().includes(texto) ||
      categoria.descripcion?.toLowerCase().includes(texto)
    );
  });

  const totalCategorias = categorias.length;
  const categoriasActivas = categorias.filter(
    (categoria) => Number(categoria.estado) === 1
  ).length;
  const categoriasInactivas = totalCategorias - categoriasActivas;

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setCategoriaEditando(null);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    setMensaje("");
    setError("");
    setMostrarFormulario(true);
  };

  const editarCategoria = (categoria) => {
    setFormulario({
      nombre: categoria.nombre || "",
      descripcion: categoria.descripcion || "",
    });

    setCategoriaEditando(categoria);
    setMensaje("");
    setError("");
    setMostrarFormulario(true);
  };

  const cancelarFormulario = () => {
    limpiarFormulario();
    setMensaje("");
    setError("");
    setMostrarFormulario(false);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const nombre = formulario.nombre.trim();

    if (!nombre) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setGuardando(true);

      const datos = {
        nombre,
        descripcion: formulario.descripcion.trim(),
      };

      if (categoriaEditando) {
        await api.put(
          `/categorias/${categoriaEditando.id_categoria}`,
          datos
        );
        setMensaje("Categoría actualizada correctamente.");
      } else {
        await api.post("/categorias", datos);
        setMensaje("Categoría creada correctamente.");
      }

      limpiarFormulario();
      setMostrarFormulario(false);
      await obtenerCategorias();
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      setError(
        err.response?.data?.error ||
          "No fue posible guardar la categoría."
      );
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoCategoria = async (categoria) => {
    const estaActiva = Number(categoria.estado) === 1;
    const accion = estaActiva ? "desactivar" : "activar";

    const confirmado = window.confirm(
      `¿Seguro que deseas ${accion} la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) return;

    try {
      setProcesandoId(categoria.id_categoria);
      setMensaje("");
      setError("");

      if (estaActiva) {
        await api.delete(`/categorias/${categoria.id_categoria}`);
      } else {
        await api.put(`/categorias/${categoria.id_categoria}/estado`, {
          estado: 1,
        });
      }

      setMensaje(
        estaActiva
          ? "Categoría desactivada correctamente."
          : "Categoría activada correctamente."
      );

      await obtenerCategorias();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError(
        err.response?.data?.error ||
          "No fue posible cambiar el estado de la categoría."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <main className="administrar-categorias">
      <header className="administrar-categorias-header">
        <div className="etiqueta-seccion">CATÁLOGO</div>
        <h1>Administrar categorías</h1>
        <p>
          Crea y administra las categorías de los productos de
          Papelería San Diego.
        </p>
      </header>

      {!mostrarFormulario ? (
        <section className="listado-categorias">
          <div className="listado-categorias-encabezado">
            <div>
              <h2>Categorías registradas</h2>
              <p className="subtitulo-categorias">
                Consulta y administra las categorías del catálogo.
              </p>
            </div>

            <button
              type="button"
              className="boton-nueva-categoria"
              onClick={abrirRegistro}
            >
              + Nueva categoría
            </button>
          </div>

          <div className="resumen-categorias">
            <div className="resumen-categoria">
              <span>Total de categorías</span>
              <strong>{totalCategorias}</strong>
            </div>
            <div className="resumen-categoria">
              <span>Activas</span>
              <strong>{categoriasActivas}</strong>
            </div>
            <div className="resumen-categoria">
              <span>Inactivas</span>
              <strong>{categoriasInactivas}</strong>
            </div>
          </div>

          <div className="categorias-herramientas">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              aria-label="Buscar categorías"
            />
          </div>

          {mensaje && <p className="mensaje-exito">{mensaje}</p>}
          {error && <p className="mensaje-error">{error}</p>}

          {cargando ? (
            <p className="categorias-cargando">Cargando categorías...</p>
          ) : (
            <div className="tabla-categorias-contenedor">
              <table className="tabla-categorias">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {categoriasFiltradas.map((categoria) => {
                    const activa = Number(categoria.estado) === 1;

                    return (
                      <tr key={categoria.id_categoria}>
                        <td>
                          <div className="categoria-identidad">
                            <div className="categoria-avatar">
                              {(categoria.nombre || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <strong>{categoria.nombre}</strong>
                          </div>
                        </td>

                        <td>
                          {categoria.descripcion || "Sin descripción"}
                        </td>

                        <td>
                          <span
                            className={
                              activa
                                ? "estado-categoria estado-activa"
                                : "estado-categoria estado-inactiva"
                            }
                          >
                            {activa ? "Activa" : "Inactiva"}
                          </span>
                        </td>

                        <td>
                          <div className="acciones-categoria">
                            <button
                              type="button"
                              className="boton-accion boton-editar"
                              onClick={() => editarCategoria(categoria)}
                              disabled={
                                procesandoId === categoria.id_categoria
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className={
                                activa
                                  ? "boton-accion boton-desactivar"
                                  : "boton-accion boton-activar"
                              }
                              onClick={() =>
                                cambiarEstadoCategoria(categoria)
                              }
                              disabled={
                                procesandoId === categoria.id_categoria
                              }
                            >
                              {procesandoId === categoria.id_categoria
                                ? "Procesando..."
                                : activa
                                  ? "Desactivar"
                                  : "Activar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {categoriasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="4" className="categorias-vacio">
                        {busqueda
                          ? "No se encontraron categorías con esa búsqueda."
                          : "Aún no hay categorías registradas."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <>
          <button
            type="button"
            className="boton-volver-categorias"
            onClick={cancelarFormulario}
          >
            ← Volver al listado
          </button>

          <form
            className="formulario-categoria"
            onSubmit={manejarEnvio}
          >
            <div className="formulario-categoria-titulo">
              <h2>
                {categoriaEditando
                  ? "Editar categoría"
                  : "Registrar categoría"}
              </h2>
              <p>Completa la información de la categoría.</p>
            </div>

            <div className="campo-categoria">
              <label htmlFor="nombre-categoria">
                Nombre de la categoría <span>*</span>
              </label>
              <input
                id="nombre-categoria"
                name="nombre"
                type="text"
                maxLength="100"
                value={formulario.nombre}
                onChange={manejarCambio}
                placeholder="Ej. Accesorios"
                required
              />
            </div>

            <div className="campo-categoria">
              <label htmlFor="descripcion-categoria">Descripción</label>
              <textarea
                id="descripcion-categoria"
                name="descripcion"
                maxLength="255"
                rows="4"
                value={formulario.descripcion}
                onChange={manejarCambio}
                placeholder="Describe brevemente la categoría"
              />
            </div>

            {mensaje && <p className="mensaje-exito">{mensaje}</p>}
            {error && <p className="mensaje-error">{error}</p>}

            <div className="acciones-formulario-categoria">
              <button
                type="button"
                className="boton-cancelar-categoria"
                onClick={cancelarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="boton-guardar-categoria"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : categoriaEditando
                    ? "Guardar cambios"
                    : "Guardar categoría"}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}

export default AdministrarCategorias;