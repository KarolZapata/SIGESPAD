
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Login from "./pages/Login";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";
import Categorias from "./pages/Categorias";
import DetalleProducto from "./pages/DetalleProducto";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";

import logo from "./assets/logo.jpeg";

import "./App.css";

function Dashboard() {
  const { usuario, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard SIGESPAD</h1>

      <p>
        Bienvenido, {usuario?.nombre}
      </p>

      <p>
        Rol: {usuario?.rol}
      </p>

      <button onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

function RutaProtegida({ children }) {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Navegacion() {
  const { cantidadProductos } = useCart();

  return (
    <header className="navbar">
      <div className="navbar-contenido">

        {/* LOGO */}
        <Link
          to="/productos"
          className="navbar-logo"
        >
          <img
            src={logo}
            alt="Papelería San Diego"
          />
        </Link>

        {/* MENÚ */}
        <nav className="navbar-menu">
          <Link
            to="/productos"
            className="navbar-link"
          >
            Productos
          </Link>

          <Link
            to="/categorias"
            className="navbar-link"
          >
            Categorías
          </Link>

          <Link
            to="/carrito"
            className="navbar-carrito"
          >
            <span className="carrito-icono">
              🛒
            </span>

            <span>
              Carrito
            </span>

            {cantidadProductos > 0 && (
              <span className="carrito-contador">
                {cantidadProductos}
              </span>
            )}
          </Link>

          {/* INICIAR SESIÓN */}
          <Link
            to="/login"
            className="navbar-link"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navegacion />

          <Routes>
            {/* Página principal: catálogo */}
            <Route
              path="/"
              element={<Navigate to="/productos" replace />}
            />

            {/* Inicio de sesión */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Catálogo */}
            <Route
              path="/productos"
              element={<Productos />}
            />

            {/* Detalle del producto */}
            <Route
              path="/productos/:id"
              element={<DetalleProducto />}
            />

            {/* Categorías */}
            <Route
              path="/categorias"
              element={<Categorias />}
            />

            {/* Carrito */}
            <Route
              path="/carrito"
              element={<Carrito />}
            />

            {/* Dashboard protegido */}
            <Route
              path="/dashboard"
              element={
                <RutaProtegida>
                  <Dashboard />
                </RutaProtegida>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;