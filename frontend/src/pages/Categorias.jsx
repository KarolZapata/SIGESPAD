import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Categorias.css";

function Categorias() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      const respuesta = await api.get("/productos/publicos");

      const productos = respuesta.data;

      const categoriasUnicas = [
        ...new Set(
          productos
            .map((producto) => producto.categoria)
            .filter(Boolean)
        ),
      ];

      setCategorias(categoriasUnicas);

    } catch (error) {
      console.error(
        "Error al obtener categorías:",
        error
      );
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="categorias-page">
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="categorias-page">

      <div className="categorias-header">

        <h1>Categorías</h1>

        <p>
          Explora nuestros productos por categoría.
        </p>

      </div>

      <div className="categorias-grid">

        {categorias.map((categoria) => (

          <button
            key={categoria}
            className="categoria-card"
            onClick={() =>
              navigate(
                `/productos?categoria=${encodeURIComponent(
                  categoria
                )}`
              )
            }
          >

            <div className="categoria-icono">
              ✦
            </div>

            <h2>
              {categoria}
            </h2>

            <span>
              Ver productos →
            </span>

          </button>

        ))}

      </div>

    </div>
  );
}

export default Categorias;