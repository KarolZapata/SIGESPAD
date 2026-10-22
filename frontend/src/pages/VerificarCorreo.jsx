import { API_URL } from "../services/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./VerificarCorreo.css";
import logo from "../assets/logo.jpeg";

export default function VerificarCorreo() {
    const [mensaje, setMensaje] = useState(
        "Estamos confirmando tu dirección de correo..."
    );
    const [estado, setEstado] = useState("cargando");

    useEffect(() => {
        const parametros = new URLSearchParams(
            window.location.search
        );
        const token = parametros.get("token");

        if (!token) {
            setEstado("error");
            setMensaje(
                "El enlace no contiene un código de verificación válido."
            );
            return;
        }

        fetch(`${API_URL}/usuarios/verificar-correo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        })
            .then(async (respuesta) => {
                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(
                        datos.error ||
                        "No pudimos verificar tu correo."
                    );
                }

                return datos;
            })
            .then((datos) => {
                setEstado("exito");
                setMensaje(datos.mensaje);
            })
            .catch((error) => {
                setEstado("error");
                setMensaje(error.message);
            });
    }, []);

    return (
        <main className="verificacion-pagina">
            <section className="verificacion-tarjeta">
                <img
                    src={logo}
                    alt="Papelería San Diego"
                    className="verificacion-logo"
                />

                <div
                    className={`verificacion-icono ${estado}`}
                    aria-hidden="true"
                >
                    {estado === "cargando" && "…"}
                    {estado === "exito" && "✓"}
                    {estado === "error" && "!"}
                </div>

                <h1>
                    {estado === "cargando" &&
                        "Verificando tu correo"}
                    {estado === "exito" &&
                        "¡Correo verificado!"}
                    {estado === "error" &&
                        "No pudimos verificarlo"}
                </h1>

                <p className="verificacion-mensaje">
                    {mensaje}
                </p>

                {estado === "exito" && (
                    <Link
                        to="/login"
                        className="verificacion-boton"
                    >
                        Iniciar sesión
                    </Link>
                )}

                {estado === "error" && (
                    <Link
                        to="/login"
                        className="verificacion-boton secundario"
                    >
                        Ir al inicio de sesión
                    </Link>
                )}

                <p className="verificacion-pie">
                    Papelería San Diego · SIGESPAD
                </p>
            </section>
        </main>
    );
}
