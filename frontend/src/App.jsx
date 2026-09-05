import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard SIGESPAD</h1>
      <p>Bienvenido al sistema.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;