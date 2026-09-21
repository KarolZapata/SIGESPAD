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
    },
    {
      titulo: "Ventas",
      descripcion:
        "Consultar la información de las ventas según sus permisos.",
    },
    {
      titulo: "Pagos",
      descripcion:
        "Registrar pagos y gestionar su confirmación.",
    },
    {
      titulo: "Comprobantes",
      descripcion: "Generar comprobantes de las ventas.",
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
        "Consultar las compras realizadas cuando esté implementado el historial.",
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

  return (
    <main className="dashboard">
      <section className="dashboard-encabezado">
        <h1>
          {usuario?.rol === "ADMINISTRADOR"
            ? "Panel de administración"
            : usuario?.rol === "VENDEDOR"
            ? "Panel de ventas"
            : "Mi cuenta"}
        </h1>

        <p>Bienvenido, {usuario?.nombre}</p>
        <p>Rol: {usuario?.rol}</p>
      </section>

      <section className="dashboard-contenido">
        <h2>Opciones disponibles</h2>

        <div className="dashboard-opciones">
          {opciones.map((opcion) => (
            <button
              type="button"
              className="dashboard-opcion"
              key={opcion.titulo}
              onClick={() => irASeccion(opcion.ruta)}
              disabled={!opcion.ruta}
            >
              <h3>{opcion.titulo}</h3>
              <p>{opcion.descripcion}</p>
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={cerrarSesion}
        className="dashboard-cerrar-sesion"
      >
        Cerrar sesión
      </button>
    </main>
  );
}

export default Dashboard;