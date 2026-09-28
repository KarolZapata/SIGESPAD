import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RecuperarContrasena.css";

function RestablecerContrasena() {

    const navigate = useNavigate();

    const correoGuardado =
        localStorage.getItem(
            "correoRecuperacion"
        ) || "";

    const [correo, setCorreo] =
        useState(correoGuardado);

    const [codigo, setCodigo] =
        useState("");

    const [nuevaContrasena, setNuevaContrasena] =
        useState("");

    const [confirmarContrasena, setConfirmarContrasena] =
        useState("");

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");

    const restablecer = async (e) => {

        e.preventDefault();

        setMensaje("");
        setError("");

        if (
            nuevaContrasena !==
            confirmarContrasena
        ) {
            setError(
                "Las contraseñas no coinciden"
            );
            return;
        }

        try {

            const respuesta =
                await api.post(
                    "/usuarios/restablecer-contrasena",
                    {
                        correo,
                        codigo,
                        nuevaContrasena
                    }
                );

            setMensaje(
                respuesta.data.mensaje
            );

            localStorage.removeItem(
                "correoRecuperacion"
            );

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "No fue posible restablecer la contraseña"
            );
        }
    };

    return (
        <div className="recuperacion-container">

            <div className="recuperacion-card">

                <h1>Nueva contraseña</h1>

                <p>
                    Ingresa el código que recibiste
                    y establece una nueva contraseña.
                </p>

                <form onSubmit={restablecer}>

                    <label>
                        Correo electrónico
                    </label>

                    <input
                        type="email"
                        value={correo}
                        onChange={(e) =>
                            setCorreo(e.target.value)
                        }
                        required
                    />

                    <label>
                        Código de recuperación
                    </label>

                    <input
                        type="text"
                        maxLength="6"
                        placeholder="Código de 6 dígitos"
                        value={codigo}
                        onChange={(e) =>
                            setCodigo(e.target.value)
                        }
                        required
                    />

                    <label>
                        Nueva contraseña
                    </label>

                    <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={nuevaContrasena}
                        onChange={(e) =>
                            setNuevaContrasena(
                                e.target.value
                            )
                        }
                        minLength="6"
                        required
                    />

                    <label>
                        Confirmar contraseña
                    </label>

                    <input
                        type="password"
                        placeholder="Repita la contraseña"
                        value={confirmarContrasena}
                        onChange={(e) =>
                            setConfirmarContrasena(
                                e.target.value
                            )
                        }
                        minLength="6"
                        required
                    />

                    {mensaje && (
                        <p className="mensaje-exito">
                            {mensaje}
                        </p>
                    )}

                    {error && (
                        <p className="mensaje-error">
                            {error}
                        </p>
                    )}

                    <button type="submit">
                        Cambiar contraseña
                    </button>

                </form>

                <button
                    className="btn-volver"
                    onClick={() =>
                        navigate("/login")
                    }
                >
                    Volver al inicio de sesión
                </button>

            </div>

        </div>
    );
}

export default RestablecerContrasena;