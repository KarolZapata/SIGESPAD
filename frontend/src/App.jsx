import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";
import Categorias from "./pages/Categorias";
import DetalleProducto from "./pages/DetalleProducto";
import Dashboard from "./pages/Dashboard";
import AdministrarProductos from "./pages/AdministrarProductos";
import AdministrarCategorias from "./pages/AdministrarCategorias";
import Inventario from "./pages/Inventario";
import Usuarios from "./pages/Usuarios";
import Ventas from "./pages/Ventas";
import Reportes from "./pages/Reportes";

import Navegacion from "./components/Navegacion";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import "./App.css";

function RutaProtegida({ children }) {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RutaAdministrador({ children }) {
  const { usuario } = useAuth();

  if (!usuario || usuario.rol !== "ADMINISTRADOR") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navegacion />

          <Routes>
            <Route
              path="/"
              element={<Navigate to="/productos" replace />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/productos"
              element={<Productos />}
            />

            <Route
              path="/productos/:id"
              element={<DetalleProducto />}
            />

            <Route
              path="/administrar-productos"
              element={
                <RutaProtegida>
                  <RutaAdministrador>
                    <AdministrarProductos />
                  </RutaAdministrador>
                </RutaProtegida>
              }
            />

            <Route
              path="/categorias"
              element={<Categorias />}
            />

            <Route
              path="/administrar-categorias"
              element={
                <RutaProtegida>
                  <RutaAdministrador>
                    <AdministrarCategorias />
                  </RutaAdministrador>
                </RutaProtegida>
              }
            />

            <Route
              path="/inventario"
              element={
                <RutaProtegida>
                  <RutaAdministrador>
                    <Inventario />
                  </RutaAdministrador>
                </RutaProtegida>
              }
            />

            <Route
              path="/usuarios"
              element={
                <RutaProtegida>
                  <RutaAdministrador>
                    <Usuarios />
                  </RutaAdministrador>
                </RutaProtegida>
              }
            />

            {/* Ventas: acceso exclusivo del administrador */}
            <Route
              path="/ventas"
              element={
                <RutaProtegida>
                  <RutaAdministrador>
                    <Ventas />
                  </RutaAdministrador>
                </RutaProtegida>
              }
            />

            {/* Reportes: acceso exclusivo del administrador */}
            <Route
              path="/reportes"
              element={
                <RutaProtegida>
                  <RutaAdministrador>
                    <Reportes />
                  </RutaAdministrador>
                </RutaProtegida>
              }
            />

            <Route
              path="/carrito"
              element={<Carrito />}
            />

            <Route
              path="/dashboard"
              element={
                <RutaProtegida>
                  <Dashboard />
                </RutaProtegida>
              }
            />

            <Route
              path="*"
              element={<Navigate to="/productos" replace />}
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;