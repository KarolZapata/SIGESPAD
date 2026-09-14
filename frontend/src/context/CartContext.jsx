import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");

    return carritoGuardado
      ? JSON.parse(carritoGuardado)
      : [];
  });

  const guardarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);

    localStorage.setItem(
      "carrito",
      JSON.stringify(nuevoCarrito)
    );
  };

  const agregarAlCarrito = (producto) => {
    console.log("PRODUCTO AGREGADO:", producto);

    const productoExistente = carrito.find(
      (item) =>
        item.id_producto === producto.id_producto
    );

    let nuevoCarrito;

    if (productoExistente) {
      nuevoCarrito = carrito.map((item) =>
        item.id_producto === producto.id_producto
          ? {
              ...item,
              cantidad: item.cantidad + 1,
            }
          : item
      );
    } else {
      nuevoCarrito = [
        ...carrito,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    }

    guardarCarrito(nuevoCarrito);
  };

  const aumentarCantidad = (id_producto) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id_producto === id_producto
        ? {
            ...item,
            cantidad: item.cantidad + 1,
          }
        : item
    );

    guardarCarrito(nuevoCarrito);
  };

  const disminuirCantidad = (id_producto) => {
    const nuevoCarrito = carrito
      .map((item) =>
        item.id_producto === id_producto
          ? {
              ...item,
              cantidad: item.cantidad - 1,
            }
          : item
      )
      .filter((item) => item.cantidad > 0);

    guardarCarrito(nuevoCarrito);
  };

  const eliminarDelCarrito = (id_producto) => {
    const nuevoCarrito = carrito.filter(
      (item) =>
        item.id_producto !== id_producto
    );

    guardarCarrito(nuevoCarrito);
  };

  const vaciarCarrito = () => {
    guardarCarrito([]);
  };

  const obtenerPrecio = (producto) => {
    if (
      producto.cantidad >= 6 &&
      producto.precio_mayorista !== null
    ) {
      return Number(producto.precio_mayorista);
    }

    return Number(producto.precio);
  };

  const obtenerSubtotal = (producto) => {
    return (
      obtenerPrecio(producto) *
      producto.cantidad
    );
  };

  const obtenerTotal = () => {
    return carrito.reduce(
      (total, producto) =>
        total + obtenerSubtotal(producto),
      0
    );
  };

  const cantidadProductos = carrito.reduce(
    (total, producto) =>
      total + producto.cantidad,
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