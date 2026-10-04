import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const opcionesPorRol = {
  ADMINISTRADOR: [
    {
      titulo: "Productos",
      descripcion:
        "Agregar productos, editar información, precios e imágenes.",
      ruta: "/administrar-productos",
    },
    {
      titulo: "Categorías",
      descripcion:
        "Crear y administrar las categorías del catálogo.",
      ruta: "/administrar-categorias",
    },
    {
      titulo: "Inventario",
      descripcion:
        "Consultar existencias, stock mínimo y movimientos.",
      ruta: "/inventario",
    },
    {
      titulo: "Usuarios",
      descripcion:
        "Administrar cuentas, estados y roles de usuarios.",
      ruta: "/usuarios",
    },
    {
      titulo: "Ventas",
      descripcion:
        "Consultar y supervisar las ventas del negocio.",
      ruta: "/ventas",
    },
    {
      titulo: "Reportes",
      descripcion:
        "Consultar estadísticas, gráficos e indicadores de ventas e inventario.",
      ruta: "/reportes",
    },
  ],

  VENDEDOR: [
    {
      titulo: "Registrar venta",
      descripcion: "Registrar las ventas presenciales.",
      ruta: "/registrar-venta",
    },
    {
      titulo: "Ventas",
      descripcion:
        "Consultar la información de las ventas registradas.",
      ruta: "/ventas-vendedor",
    },
    {
      titulo: "Pagos",
      descripcion:
        "Registrar pagos y gestionar su confirmación.",
      ruta: "/pagos",
    },
    {
      titulo: "Comprobantes",
      descripcion:
        "Consultar e imprimir comprobantes de las ventas.",
      ruta: "/comprobantes",
    },
  ],

  CLIENTE: [
    {
      titulo: "Catálogo",
      descripcion:
        "Explorar productos y consultar sus detalles.",
      ruta: "/productos",
    },
    {
      titulo: "Carrito",
      descripcion:
        "Revisar y modificar los productos seleccionados.",
      ruta: "/carrito",
    },
    {
      titulo: "Mis compras",
      descripcion:
        "Consultar las compras realizadas con tu cuenta.",
      ruta: "/mis-compras",
    },
  ],
};

function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const opciones = opcionesPorRol[usuario?.rol] || [];

  const cerrarSesion = () => {
    logout();
    navigate("/productos");
  };

  const irASeccion = (ruta) => {
    if (ruta) {
      navigate(ruta);
    }
  };

  const tituloPanel =
    usuario?.rol === "ADMINISTRADOR"
      ? "Panel de administración"
      : usuario?.rol === "VENDEDOR"
      ? "Panel de ventas"
      : "Mi cuenta";

  const descripcionPanel =
    usuario?.rol === "ADMINISTRADOR"
      ? "Gestiona los productos, inventario, usuarios, ventas y reportes del negocio."
      : usuario?.rol === "VENDEDOR"
      ? "Gestiona las ventas y operaciones comerciales del negocio."
      : "Consulta y administra la información de tu cuenta.";

  return (
    <main className="dashboard">

      {/* =========================
          ENCABEZADO PRINCIPAL
      ========================= */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-etiqueta">
          {usuario?.rol}
        </div>

        <h1>{tituloPanel}</h1>

        <p className="dashboard-bienvenida">
          Bienvenido, <strong>{usuario?.nombre}</strong>
        </p>

        <p className="dashboard-descripcion">
          {descripcionPanel}
        </p>

      </section>

      {/* =========================
          MÓDULOS
      ========================= */}

      <section className="dashboard-contenido">

        <div className="dashboard-seccion-encabezado">

          <div>
            <span className="dashboard-seccion-etiqueta">
              GESTIÓN DEL SISTEMA
            </span>

            <h2>Opciones disponibles</h2>
          </div>

          <span className="dashboard-total">
            {opciones.length} módulos
          </span>

        </div>

        <div className="dashboard-opciones">

          {opciones.map((opcion, index) => (

            <button
              type="button"
              className="dashboard-opcion"
              key={opcion.titulo}
              onClick={() => irASeccion(opcion.ruta)}
              disabled={!opcion.ruta}
            >

              <div className="dashboard-opcion-superior">

                <span className="dashboard-numero">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="dashboard-opcion-linea"></span>

              </div>

              <div className="dashboard-opcion-contenido">

                <h3>{opcion.titulo}</h3>

                <p>{opcion.descripcion}</p>

              </div>

              <span className="dashboard-opcion-enlace">
                Administrar <span>→</span>
              </span>

            </button>

          ))}

        </div>

      </section>

      {/* =========================
          ACCIONES
      ========================= */}

      <section className="dashboard-acciones">

        <button
          type="button"
          onClick={() => navigate("/productos")}
          className="dashboard-volver"
        >
          <span>←</span>
          Volver al catálogo
        </button>

        <button
          type="button"
          onClick={cerrarSesion}
          className="dashboard-cerrar-sesion"
        >
          Cerrar sesión
        </button>

      </section>

    </main>
  );
}

export default Dashboard;