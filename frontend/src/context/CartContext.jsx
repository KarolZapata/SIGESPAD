import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

function obtenerClaveCarrito(usuario) {
  if (!usuario) {
    return "carrito_invitado";
  }

  if (usuario.id_usuario !== undefined && usuario.id_usuario !== null) {
    return `carrito_usuario_${usuario.id_usuario}`;
  }

  return "carrito_invitado";
}

function obtenerCarritoGuardado(claveCarrito) {
  try {
    const carritoGuardado =
      localStorage.getItem(claveCarrito);

    if (!carritoGuardado) {
      return [];
    }

    const carritoParseado =
      JSON.parse(carritoGuardado);

    return Array.isArray(carritoParseado)
      ? carritoParseado
      : [];
  } catch (error) {
    console.error(
      "Error al cargar el carrito:",
      error
    );

    return [];
  }
}

export function CartProvider({ children }) {
  const { usuario } = useAuth();

  const [claveCarrito, setClaveCarrito] = useState(() =>
    obtenerClaveCarrito(usuario)
  );

  const [carrito, setCarrito] = useState(() =>
    obtenerCarritoGuardado(
      obtenerClaveCarrito(usuario)
    )
  );

  // Detectar cambio de usuario o cierre de sesión
  useEffect(() => {
    const nuevaClave = obtenerClaveCarrito(usuario);

    setClaveCarrito((claveAnterior) => {
      if (claveAnterior !== nuevaClave) {
        setCarrito(
          obtenerCarritoGuardado(nuevaClave)
        );
      }

      return nuevaClave;
    });
  }, [usuario]);

  // Guardar automáticamente el carrito correspondiente
  // al usuario actual
  useEffect(() => {
    try {
      localStorage.setItem(
        claveCarrito,
        JSON.stringify(carrito)
      );
    } catch (error) {
      console.error(
        "Error al guardar el carrito:",
        error
      );
    }
  }, [carrito, claveCarrito]);

  // Agregar un producto o aumentar su cantidad
  const agregarAlCarrito = (
    producto,
    cantidadAgregar = 1
  ) => {
    const cantidad = Number(cantidadAgregar);

    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      return;
    }

    setCarrito((carritoActual) => {
      const idProducto =
        String(producto.id_producto);

      const existente = carritoActual.find(
        (item) =>
          String(item.id_producto) === idProducto
      );

      if (existente) {
        return carritoActual.map((item) =>
          String(item.id_producto) === idProducto
            ? {
                ...item,
                cantidad:
                  Number(item.cantidad) + cantidad,
              }
            : item
        );
      }

      return [
        ...carritoActual,
        {
          ...producto,
          cantidad,
        },
      ];
    });
  };

  // Aumentar cantidad
  const aumentarCantidad = (id_producto) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        String(item.id_producto) ===
        String(id_producto)
          ? {
              ...item,
              cantidad:
                Number(item.cantidad) + 1,
            }
          : item
      )
    );
  };

  // Disminuir cantidad
  const disminuirCantidad = (id_producto) => {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          String(item.id_producto) ===
          String(id_producto)
            ? {
                ...item,
                cantidad:
                  Number(item.cantidad) - 1,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  // Eliminar completamente un producto
  const eliminarDelCarrito = (id_producto) => {
    setCarrito((carritoActual) =>
      carritoActual.filter(
        (item) =>
          String(item.id_producto) !==
          String(id_producto)
      )
    );
  };

  // Vaciar el carrito
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // Obtener precio según cantidad
  const obtenerPrecio = (producto) => {
    const cantidad = Number(
      producto.cantidad
    );

    const precioMayorista =
      producto.precio_mayorista;

    if (
      cantidad >= 6 &&
      precioMayorista !== null &&
      precioMayorista !== undefined &&
      precioMayorista !== ""
    ) {
      return Number(precioMayorista);
    }

    return Number(producto.precio);
  };

  // Obtener subtotal de un producto
  const obtenerSubtotal = (producto) => {
    return (
      obtenerPrecio(producto) *
      Number(producto.cantidad)
    );
  };

  // Obtener total de compra
  const obtenerTotal = () => {
    return carrito.reduce(
      (total, producto) =>
        total + obtenerSubtotal(producto),
      0
    );
  };

  // Sumar las unidades de todos los productos
  const cantidadProductos = carrito.reduce(
    (total, producto) =>
      total + Number(producto.cantidad),
    0
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        aumentarCantidad,
        disminuirCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        obtenerPrecio,
        obtenerSubtotal,
        obtenerTotal,
        cantidadProductos,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}