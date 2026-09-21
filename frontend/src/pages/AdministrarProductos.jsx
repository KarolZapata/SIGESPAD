import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdministrarProductos.css";

// Estado inicial del formulario.
const formularioInicial = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoria: "",
  precio: "",
  precio_mayorista: "",
  stock: "",
  stock_minimo: "5",
};

function AdministrarProductos() {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [imagenes, setImagenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [vista, setVista] = useState("listado");
  const [productoEditando, setProductoEditando] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Carga los productos desde el backend.
  const obtenerProductos = async () => {
    try {
      setCargandoProductos(true);
      setError("");

      const respuesta = await api.get("/productos");
      setProductos(Array.isArray(respuesta.data) ? respuesta.data : []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError(
        err.response?.data?.error ||
          "No fue posible cargar los productos."
      );
    } finally {
      setCargandoProductos(false);
    }
  };

// Carga las categorías desde el backend.
const obtenerCategorias = async () => {
  try {
    const respuesta = await api.get("/categorias");
    setCategorias(Array.isArray(respuesta.data) ? respuesta.data : []);
  } catch (err) {
    console.error("Error al cargar categorías:", err);
    setError(
      err.response?.data?.error ||
        "No fue posible cargar las categorías."
    );
  }
};

useEffect(() => {
  obtenerProductos();
  obtenerCategorias();
}, []);

  // Filtra por código o nombre.
  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      producto.codigo?.toLowerCase().includes(texto) ||
      producto.nombre?.toLowerCase().includes(texto)
    );
  });

  // Estadísticas del inventario.
  const totalProductos = productos.length;
  const productosActivos = productos.filter(
    (producto) => Number(producto.estado) === 1
  ).length;
  const productosInactivos = totalProductos - productosActivos;

  // Actualiza el estado de un campo del formulario.
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  // Agrega imágenes seleccionadas al estado.
  const manejarImagenes = (e) => {
    const nuevasImagenes = Array.from(e.target.files || []);

    setImagenes((actuales) => [...actuales, ...nuevasImagenes]);

    // Permite seleccionar nuevamente el mismo archivo.
    e.target.value = "";
  };

  // Quita una imagen seleccionada.
  const quitarImagen = (indiceQuitar) => {
    setImagenes((actuales) =>
      actuales.filter((_, indice) => indice !== indiceQuitar)
    );
  };

  // Limpia el formulario y el selector de archivos.
  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setImagenes([]);

    const selector = document.getElementById("imagenes-producto");
    if (selector) selector.value = "";
  };

  // Abre el formulario para crear un producto nuevo.
  const abrirRegistro = () => {
    limpiarFormulario();
    setProductoEditando(null);
    setMensaje("");
    setError("");
    setVista("registro");
  };

  // Carga los datos del producto seleccionado en el formulario.
  const editarProducto = (producto) => {
    setFormulario({
      codigo: producto.codigo || "",
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      categoria: producto.categoria || "",
      precio: producto.precio ?? "",
      precio_mayorista: producto.precio_mayorista ?? "",
      stock: producto.stock ?? "",
      stock_minimo: producto.stock_minimo ?? "5",
    });

    setProductoEditando(producto);
    setImagenes([]);
    setMensaje("");
    setError("");
    setVista("registro");
  };

  // Sale del formulario y regresa al listado.
  const volverAlListado = () => {
    limpiarFormulario();
    setProductoEditando(null);
    setMensaje("");
    setError("");
    setVista("listado");
  };

  // Valida los campos numéricos y obligatorios.
  const validarFormulario = () => {
    if (!formulario.codigo.trim() || !formulario.nombre.trim()) {
      return "El código y el nombre son obligatorios.";
    }

    if (
      formulario.precio === "" ||
      !Number.isFinite(Number(formulario.precio)) ||
      Number(formulario.precio) <= 0
    ) {
      return "El precio de venta debe ser mayor que cero.";
    }

    if (
      formulario.precio_mayorista !== "" &&
      (!Number.isFinite(Number(formulario.precio_mayorista)) ||
        Number(formulario.precio_mayorista) < 0)
    ) {
      return "El precio mayorista no puede ser negativo.";
    }

    if (
      formulario.stock === "" ||
      !Number.isInteger(Number(formulario.stock)) ||
      Number(formulario.stock) < 0
    ) {
      return "El stock debe ser un número entero igual o mayor que cero.";
    }

    if (
      formulario.stock_minimo === "" ||
      !Number.isInteger(Number(formulario.stock_minimo)) ||
      Number(formulario.stock_minimo) < 0
    ) {
      return "El stock mínimo debe ser un entero igual o mayor que cero.";
    }

    if (!productoEditando && imagenes.length > 10) {
      return "Puedes seleccionar máximo 10 imágenes.";
    }

    return "";
  };

  // Registra un producto nuevo o actualiza el seleccionado.
  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    try {
      setCargando(true);

      if (productoEditando) {
        // La edición envía datos JSON al endpoint PUT.
        // El código no se actualiza desde este formulario.
        const datosActualizados = {
          nombre: formulario.nombre.trim(),
          descripcion: formulario.descripcion.trim(),
          categoria: formulario.categoria,
          precio: Number(formulario.precio),
          precio_mayorista:
            formulario.precio_mayorista === ""
              ? null
              : Number(formulario.precio_mayorista),
          stock: Number(formulario.stock),
          stock_minimo: Number(formulario.stock_minimo),
        };

        await api.put(
          `/productos/${productoEditando.id_producto}`,
          datosActualizados
        );

        setMensaje("Producto actualizado correctamente.");
      } else {
        // El registro usa FormData porque puede incluir imágenes.
        const datos = new FormData();

        Object.entries(formulario).forEach(([campo, valor]) => {
          datos.append(campo, valor);
        });

        imagenes.forEach((imagen) => {
          datos.append("imagenes", imagen);
        });

        await api.post("/productos", datos);
        setMensaje("Producto creado correctamente.");
      }

      limpiarFormulario();
      setProductoEditando(null);
      await obtenerProductos();
      setVista("listado");
    } catch (err) {
      console.error("Error al guardar producto:", err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No fue posible guardar el producto."
      );
    } finally {
      setCargando(false);
    }
  };

  // Activa o desactiva un producto según su estado actual.
  const cambiarEstadoProducto = async (producto) => {
    const estaActivo = Number(producto.estado) === 1;
    const accion = estaActivo ? "desactivar" : "activar";

    const confirmado = window.confirm(
      `¿Seguro que deseas ${accion} el producto "${producto.nombre}"?`
    );

    if (!confirmado) return;

    try {
      setProcesandoId(producto.id_producto);
      setError("");
      setMensaje("");

      if (estaActivo) {
        // El backend desactiva mediante DELETE lógico.
        await api.delete(`/productos/${producto.id_producto}`);
      } else {
        // El backend cuenta con una ruta específica para activar.
        await api.put(`/productos/${producto.id_producto}/activar`);
      }

      setMensaje(
        estaActivo
          ? "Producto desactivado correctamente."
          : "Producto activado correctamente."
      );

      await obtenerProductos();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No fue posible cambiar el estado del producto."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  // Formatea valores monetarios en pesos colombianos.
  const formatoPrecio = (valor) =>
    Number(valor || 0).toLocaleString("es-CO");

  return (
    <main className="administrar-productos">
      <header className="administrar-productos-header">
        <div className="etiqueta-seccion">INVENTARIO</div>
        <h1>Administrar productos</h1>
        <p>
          Registra y administra los productos del catálogo de Papelería San
          Diego.
        </p>
      </header>

      {vista === "listado" && (
        <section className="listado-productos">
          <div className="listado-productos-encabezado">
            <div>
              <h2>Productos registrados</h2>
              <p className="subtitulo-listado">
                Consulta y administra los productos del catálogo.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirRegistro}
              className="boton-nuevo-producto"
            >
              + Registrar producto
            </button>
          </div>

          {/* Resumen de cantidades del inventario. */}
          <div className="resumen-productos">
            <div className="resumen-producto">
              <span>Total de productos</span>
              <strong>{totalProductos}</strong>
            </div>
            <div className="resumen-producto">
              <span>Activos</span>
              <strong>{productosActivos}</strong>
            </div>
            <div className="resumen-producto">
              <span>Inactivos</span>
              <strong>{productosInactivos}</strong>
            </div>
          </div>

          <div className="productos-herramientas">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código o nombre..."
              aria-label="Buscar productos"
            />
          </div>

          {mensaje && <p className="mensaje-exito">{mensaje}</p>}
          {error && <p className="mensaje-error">{error}</p>}

          {cargandoProductos ? (
            <p className="productos-cargando">Cargando productos...</p>
          ) : (
            <div className="tabla-productos-contenedor">
              <table className="tabla-productos">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {productosFiltrados.map((producto) => {
                    const activo = Number(producto.estado) === 1;
                    const stockBajo =
                      Number(producto.stock) <=
                      Number(producto.stock_minimo ?? 5);

                    return (
                      <tr key={producto.id_producto}>
                        <td>
                          <div className="producto-celda">
                            <div className="producto-avatar">
                              {(producto.nombre || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="producto-identidad">
                              <strong>{producto.nombre}</strong>
                              <span>{producto.codigo}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="producto-categoria">
                            {producto.categoria || "Sin categoría"}
                          </span>
                        </td>

                        <td className="producto-precio">
                          ${formatoPrecio(producto.precio)}
                        </td>

                        <td>
                          <span
                            className={
                              stockBajo
                                ? "producto-stock stock-bajo"
                                : "producto-stock"
                            }
                          >
                            {producto.stock}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              activo
                                ? "estado-producto estado-activo"
                                : "estado-producto estado-inactivo"
                            }
                          >
                            {activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          <div className="acciones-producto">
                            <button
                              type="button"
                              className="boton-accion boton-editar"
                              onClick={() => editarProducto(producto)}
                              disabled={procesandoId === producto.id_producto}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className={
                                activo
                                  ? "boton-accion boton-desactivar"
                                  : "boton-accion boton-activar"
                              }
                              onClick={() => cambiarEstadoProducto(producto)}
                              disabled={procesandoId === producto.id_producto}
                            >
                              {procesandoId === producto.id_producto
                                ? "Procesando..."
                                : activo
                                  ? "Desactivar"
                                  : "Activar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {productosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="productos-vacio">
                        {busqueda
                          ? "No se encontraron productos con esa búsqueda."
                          : "Aún no hay productos registrados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {vista === "registro" && (
        <>
          <button
            type="button"
            className="boton-volver-listado"
            onClick={volverAlListado}
          >
            ← Volver al listado
          </button>

          <form className="formulario-producto" onSubmit={manejarEnvio}>
            <div className="formulario-titulo">
              <h2>
                {productoEditando
                  ? "Editar producto"
                  : "Información del producto"}
              </h2>
              <p>
                Completa los datos marcados con asterisco (*).
              </p>
            </div>

            <div className="campo-producto">
              <label htmlFor="codigo">
                Código <span>*</span>
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                maxLength="20"
                value={formulario.codigo}
                onChange={manejarCambio}
                placeholder="Ej. ACC-0001"
                required
                readOnly={Boolean(productoEditando)}
              />
              {productoEditando && (
                <small>El código no se puede modificar durante la edición.</small>
              )}
            </div>

            <div className="campo-producto">
              <label htmlFor="nombre">
                Nombre del producto <span>*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                maxLength="150"
                value={formulario.nombre}
                onChange={manejarCambio}
                placeholder="Escribe el nombre del producto"
                required
              />
            </div>

            <div className="campo-producto">
            <label htmlFor="categoria">Categoría</label>

            <select
                id="categoria"
                name="categoria"
                value={formulario.categoria}
                onChange={manejarCambio}
            >
                <option value="">Selecciona una categoría</option>

                {categorias
                .filter(
                    (categoria) =>
                    Number(categoria.estado) === 1 ||
                    categoria.nombre === formulario.categoria
                )
                .map((categoria) => (
                    <option
                    key={categoria.id_categoria}
                    value={categoria.nombre}
                    >
                    {categoria.nombre}
                    </option>
                ))}
            </select>
            </div>
            
            <div className="campo-producto">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                maxLength="255"
                value={formulario.descripcion}
                onChange={manejarCambio}
                placeholder="Describe brevemente el producto"
                rows="4"
              />
            </div>

            <div className="separador-formulario">
              <h2>Precios e inventario</h2>
              <p>Define los precios y las cantidades disponibles.</p>
            </div>

            <div className="campo-producto">
              <label htmlFor="precio">
                Precio de venta <span>*</span>
              </label>
              <div className="entrada-con-prefijo">
                <span>$</span>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formulario.precio}
                  onChange={manejarCambio}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="campo-producto">
              <label htmlFor="precio_mayorista">Precio mayorista</label>
              <div className="entrada-con-prefijo">
                <span>$</span>
                <input
                  id="precio_mayorista"
                  name="precio_mayorista"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.precio_mayorista}
                  onChange={manejarCambio}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="campo-producto">
              <label htmlFor="stock">
                Stock <span>*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formulario.stock}
                onChange={manejarCambio}
                placeholder="Cantidad disponible"
                required
              />
            </div>

            <div className="campo-producto">
              <label htmlFor="stock_minimo">
                Stock mínimo <span>*</span>
              </label>
              <input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                min="0"
                step="1"
                value={formulario.stock_minimo}
                onChange={manejarCambio}
                required
              />
              <small>Se utiliza como referencia para el inventario.</small>
            </div>

            {/* En edición no se habilita la carga porque el PUT actual
                del backend no administra archivos de imagen. */}
            {!productoEditando && (
              <div className="campo-producto campo-imagenes">
                <label htmlFor="imagenes-producto">
                  Imágenes del producto
                </label>

                <label
                  className="zona-imagenes"
                  htmlFor="imagenes-producto"
                >
                  <span className="icono-subida">↑</span>
                  <strong>Selecciona las imágenes</strong>
                  <span>
                    JPG, JPEG, PNG o WEBP · Máximo 10 imágenes, 5 MB cada una
                  </span>
                  <input
                    id="imagenes-producto"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={manejarImagenes}
                  />
                </label>

                {imagenes.length > 0 && (
                  <div className="lista-imagenes">
                    <strong>
                      {imagenes.length} imagen(es) seleccionada(s)
                    </strong>
                    <ul>
                      {imagenes.map((imagen, indice) => (
                        <li key={`${imagen.name}-${indice}`}>
                          {imagen.name}
                          <button
                            type="button"
                            onClick={() => quitarImagen(indice)}
                          >
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {mensaje && <p className="mensaje-exito">{mensaje}</p>}
            {error && <p className="mensaje-error">{error}</p>}

            <div className="acciones-formulario">
              <button
                type="button"
                className="boton-cancelar-producto"
                onClick={volverAlListado}
                disabled={cargando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={cargando}
                className="boton-guardar-producto"
              >
                {cargando
                  ? "Guardando..."
                  : productoEditando
                    ? "Guardar cambios"
                    : "Guardar producto"}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}

export default AdministrarProductos;