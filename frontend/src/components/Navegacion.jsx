/* BARRA DE NAVEGACIÓN */
.navbar {
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-sizing: border-box;
  position: relative;
  z-index: 100;
}

.navbar-contenido {
  width: 100%;
  min-height: 76px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-sizing: border-box;
}

/* LOGO */
.navbar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 70px;
  text-decoration: none;
}

.navbar-logo img {
  display: block;
  width: 76px;
  height: 54px;
  object-fit: contain;
}

/* MENÚ */
.navbar-menu {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.navbar-link,
.navbar-carrito {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  min-width: 0;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #183153;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  text-decoration: none;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  box-sizing: border-box;
}

.navbar-link:hover {
  background: #f1f5f9;
}

.navbar-carrito {
  position: relative;
  flex: 0 0 auto;
  gap: 7px;
  padding: 12px 16px;
  background: #142f55;
  color: #ffffff;
  box-shadow: 0 3px 8px rgb(0 0 0 / 12%);
}

.navbar-carrito:hover {
  background: #1d416f;
}

.carrito-icono {
  flex: 0 0 auto;
}

.carrito-contador {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: #f4b942;
  color: #142f55;
  font-size: 11px;
  font-weight: 700;
}

/* TABLET Y PANTALLAS PEQUEÑAS */
@media (max-width: 1000px) {
  .navbar-contenido {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px 18px;
    padding: 12px 16px;
  }

  .navbar-menu {
    flex: 1 1 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
  }
}

/* CELULARES */
@media (max-width: 600px) {
  .navbar-contenido {
    padding: 10px;
  }

  .navbar-menu {
    gap: 5px;
  }

  .navbar-link,
  .navbar-carrito {
    padding: 9px 10px;
    font-size: 12px;
  }

  .navbar-logo img {
    width: 70px;
    height: 48px;
  }
}