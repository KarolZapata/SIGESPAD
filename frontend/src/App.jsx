import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;