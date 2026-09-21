
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import logo from "../assets/logo.jpeg";

function Navegacion() {
  const { usuario, autenticado, logout } = useAuth();
  const { cantidadProductos } = useCart();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/productos");
  };

  const nombrePanel = {
    ADMINISTRADOR: "Panel de administración",
    VENDEDOR: "Panel de ventas",
    CLIENTE: "Mi cuenta",
  };

  return (
    <header className="navbar">
      <div className="navbar-contenido">
        <Link to="/productos" className="navbar-logo">
          <img src={logo} alt="Papelería San Diego" />
        </Link>

        <nav className="navbar-menu">
          <Link to="/productos" className="navbar-link">
            Productos
          </Link>

          <Link to="/categorias" className="navbar-link">
            Categorías
          </Link>

          <Link to="/carrito" className="navbar-carrito">
            <span className="carrito-icono">🛒</span>
            <span>Carrito</span>

            {cantidadProductos > 0 && (
              <span className="carrito-contador">
                {cantidadProductos}
              </span>
            )}
          </Link>

          {autenticado ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                {nombrePanel[usuario?.rol] || "Mi cuenta"}
              </Link>

              <span className="navbar-link">
                Hola, {usuario?.nombre}
              </span>

              <button
                type="button"
                className="navbar-link"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-link">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navegacion;