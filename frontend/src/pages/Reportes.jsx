import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../services/api";
import "./Reportes.css";

function Reportes() {
  const [resumen, setResumen] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [filtroProductoMovimiento, setFiltroProductoMovimiento] = useState("");
  const [filtroTipoMovimiento, setFiltroTipoMovimiento] = useState("");
  const [fechaMovimientoInicio, setFechaMovimientoInicio] = useState("");
  const [fechaMovimientoFin, setFechaMovimientoFin] = useState("");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [cargandoVentas, setCargandoVentas] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [cargandoStock, setCargandoStock] = useState(true);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [cargandoVendedores, setCargandoVendedores] = useState(true);
  const [cargandoMovimientos, setCargandoMovimientos] = useState(true);

  const [errores, setErrores] = useState({});

  useEffect(() => {
    obtenerResumen();
    obtenerProductosMasVendidos();
    obtenerStockBajo();
    obtenerPagos();
    obtenerVendedores();
    obtenerMovimientos();
  }, []);

  useEffect(() => {
    obtenerVentas();
  }, [fechaInicio, fechaFin]);

  const registrarError = (seccion, mensaje) => {
    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [seccion]: mensaje,
    }));
  };

  const limpiarError = (seccion) => {
  setErrores((erroresActuales) => {
    const { [seccion]: _, ...resto } = erroresActuales;
    return resto;
  });
};

  const movimientosFiltrados = movimientos.filter((movimiento) => {
  const nombreProducto = String(movimiento.producto || "").toLowerCase();
  const filtroProducto = filtroProductoMovimiento.toLowerCase();

  const coincideProducto = nombreProducto.includes(filtroProducto);

  const coincideTipo =
    !filtroTipoMovimiento ||
    movimiento.tipo === filtroTipoMovimiento;

  const fecha = movimiento.fecha_movimiento
    ? new Date(movimiento.fecha_movimiento).toISOString().slice(0, 10)
    : "";

  const coincideFechaInicio =
    !fechaMovimientoInicio || fecha >= fechaMovimientoInicio;

  const coincideFechaFin =
    !fechaMovimientoFin || fecha <= fechaMovimientoFin;

  return (
    coincideProducto &&
    coincideTipo &&
    coincideFechaInicio &&
    coincideFechaFin
  );
});

 const limpiarFiltrosMovimientos = () => {
  setFiltroProductoMovimiento("");
  setFiltroTipoMovimiento("");
  setFechaMovimientoInicio("");
  setFechaMovimientoFin("");
};

  const obtenerResumen = async () => {
    try {
      setCargandoResumen(true);
      limpiarError("resumen");

      const respuesta = await api.get("/reportes/resumen");
      setResumen(respuesta.data);
    } catch (error) {
      console.error(error);
      registrarError("resumen", "No fue posible cargar el resumen general.");
    } finally {
      setCargandoResumen(false);
    }
  };

  const obtenerVentas = async () => {
    try {
      setCargandoVentas(true);
      limpiarError("ventas");

      const parametros = {};

      if (fechaInicio) parametros.fecha_inicio = fechaInicio;
      if (fechaFin) parametros.fecha_fin = fechaFin;

      const respuesta = await api.get("/reportes/ventas", {
        params: parametros,
      });

      const datosOrdenados = respuesta.data
        .map((venta) => ({
          ...venta,
          fecha: String(venta.fecha).slice(0, 10),
          cantidad_ventas: Number(venta.cantidad_ventas),
          total_ventas: Number(venta.total_ventas),
        }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

      setVentas(datosOrdenados);
    } catch (error) {
      console.error(error);
      registrarError("ventas", "No fue posible cargar el reporte de ventas.");
    } finally {
      setCargandoVentas(false);
    }
  };

  const obtenerProductosMasVendidos = async () => {
    try {
      setCargandoProductos(true);
      limpiarError("productos");

      const respuesta = await api.get(
        "/reportes/productos-mas-vendidos"
      );

      const datos = respuesta.data.map((producto) => ({
        ...producto,
        cantidad_vendida: Number(producto.cantidad_vendida),
        total_generado: Number(producto.total_generado),
      }));

      setProductosMasVendidos(datos);
    } catch (error) {
      console.error(error);
      registrarError(
        "productos",
        "No fue posible cargar los productos más vendidos."
      );
    } finally {
      setCargandoProductos(false);
    }
  };

  const obtenerStockBajo = async () => {
    try {
      setCargandoStock(true);
      limpiarError("stock");

      const respuesta = await api.get("/reportes/stock-bajo");
      setStockBajo(respuesta.data);
    } catch (error) {
      console.error(error);
      registrarError(
        "stock",
        "No fue posible cargar los productos con stock bajo."
      );
    } finally {
      setCargandoStock(false);
    }
  };

  const obtenerPagos = async () => {
    try {
      setCargandoPagos(true);
      limpiarError("pagos");

      const respuesta = await api.get("/reportes/pagos");

      const datos = respuesta.data.map((pago) => ({
        ...pago,
        cantidad_pagos: Number(pago.cantidad_pagos),
        total_recaudado: Number(pago.total_recaudado),
      }));

      setPagos(datos);
    } catch (error) {
      console.error(error);
      registrarError("pagos", "No fue posible cargar el reporte de pagos.");
    } finally {
      setCargandoPagos(false);
    }
  };

  const obtenerVendedores = async () => {
    try {
      setCargandoVendedores(true);
      limpiarError("vendedores");

      const respuesta = await api.get("/reportes/vendedores");

      const datos = respuesta.data.map((vendedor) => ({
        ...vendedor,
        cantidad_ventas: Number(vendedor.cantidad_ventas),
        total_vendido: Number(vendedor.total_vendido),
      }));

      setVendedores(datos);
    } catch (error) {
      console.error(error);
      registrarError(
        "vendedores",
        "No fue posible cargar el reporte de vendedores."
      );
    } finally {
      setCargandoVendedores(false);
    }
  };

  const obtenerMovimientos = async () => {
    try {
      setCargandoMovimientos(true);
      limpiarError("movimientos");

      const respuesta = await api.get("/inventario/movimientos");
      setMovimientos(
        respuesta.data.map((movimiento) => ({
          ...movimiento,
          cantidad: Number(movimiento.cantidad),
          stock_anterior: Number(movimiento.stock_anterior),
          stock_nuevo: Number(movimiento.stock_nuevo),
        }))
      );
    } catch (error) {
      console.error(error);
      registrarError(
        "movimientos",
        "No fue posible cargar el historial de movimientos."
      );
    } finally {
      setCargandoMovimientos(false);
    }
  };

  const formatoPrecio = (valor) =>
    Number(valor || 0).toLocaleString("es-CO");

  const limpiarFechas = () => {
    setFechaInicio("");
    setFechaFin("");
  };

  return (
    <div className="reportes-page">
      <div className="reportes-header">
        <h1>Reportes</h1>
        <p>
          Consulta indicadores de ventas e inventario de SIGESPAD.
        </p>
      </div>

      {/* RESUMEN GENERAL */}
      <section className="reportes-resumen">
        <h2>Resumen general</h2>

        {errores.resumen && (
          <p className="reportes-mensaje error">{errores.resumen}</p>
        )}

        {cargandoResumen ? (
          <p className="reportes-mensaje">Cargando resumen...</p>
        ) : resumen ? (
          <div className="reportes-tarjetas">
            <article className="reporte-tarjeta">
              <h3>Usuarios activos</h3>
              <p>{resumen.usuarios_activos}</p>
            </article>

            <article className="reporte-tarjeta">
              <h3>Productos activos</h3>
              <p>{resumen.productos_activos}</p>
            </article>

            <article className="reporte-tarjeta">
              <h3>Categorías activas</h3>
              <p>{resumen.categorias_activas}</p>
            </article>

            <article className="reporte-tarjeta">
              <h3>Total de ventas registradas</h3>
              <p>{resumen.total_ventas}</p>
            </article>

            <article className="reporte-tarjeta">
              <h3>Ingresos por ventas completadas</h3>
              <p>${formatoPrecio(resumen.ingresos_totales)}</p>
            </article>

            <article className="reporte-tarjeta">
              <h3>Productos con stock bajo</h3>
              <p>{resumen.productos_stock_bajo}</p>
            </article>
          </div>
        ) : (
          <p className="reportes-mensaje">
            No hay información del resumen disponible.
          </p>
        )}
      </section>

      {/* VENTAS POR PERÍODO */}
      <section className="reporte-seccion">
        <h2>Ventas por período</h2>
        <p>
          Consulta las ventas completadas según el rango de fechas.
        </p>

        <div className="reportes-filtros">
          <div>
            <label htmlFor="fecha-inicio">Fecha de inicio</label>
            <input
              id="fecha-inicio"
              type="date"
              value={fechaInicio}
              max={fechaFin || undefined}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="fecha-fin">Fecha de fin</label>
            <input
              id="fecha-fin"
              type="date"
              value={fechaFin}
              min={fechaInicio || undefined}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-limpiar-reportes"
            onClick={limpiarFechas}
          >
            Limpiar fechas
          </button>
        </div>

        {errores.ventas && (
          <p className="reportes-mensaje error">{errores.ventas}</p>
        )}

        {cargandoVentas ? (
          <p className="reportes-mensaje">
            Cargando reporte de ventas...
          </p>
        ) : ventas.length === 0 ? (
          <p className="reportes-mensaje">
            No hay ventas completadas para el período seleccionado.
          </p>
        ) : (
          <>
            <div className="reporte-grafico">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={ventas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(valor) => `$${formatoPrecio(valor)}`}
                  />
                  <Tooltip
                    formatter={(valor, nombre) => [
                      nombre === "Ingresos"
                        ? `$${formatoPrecio(valor)}`
                        : valor,
                      nombre,
                    ]}
                    labelFormatter={(fecha) => `Fecha: ${fecha}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_ventas"
                    name="Ingresos"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="reportes-tabla-contenedor">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cantidad de ventas</th>
                    <th>Total vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.fecha}>
                      <td>{venta.fecha}</td>
                      <td>{venta.cantidad_ventas}</td>
                      <td>${formatoPrecio(venta.total_ventas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* PRODUCTOS MÁS VENDIDOS */}
      <section className="reporte-seccion">
        <h2>Productos más vendidos</h2>
        <p>
          Los 10 productos con mayor cantidad vendida en ventas completadas.
        </p>

        {errores.productos && (
          <p className="reportes-mensaje error">{errores.productos}</p>
        )}

        {cargandoProductos ? (
          <p className="reportes-mensaje">
            Cargando productos más vendidos...
          </p>
        ) : productosMasVendidos.length === 0 ? (
          <p className="reportes-mensaje">
            No hay productos vendidos en ventas completadas.
          </p>
        ) : (
          <>
            <div className="reporte-grafico">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={productosMasVendidos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={90}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="cantidad_vendida"
                    name="Cantidad vendida"
                    fill="#2563eb"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="reportes-tabla-contenedor">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad vendida</th>
                    <th>Total generado</th>
                  </tr>
                </thead>
                <tbody>
                  {productosMasVendidos.map((producto) => (
                    <tr key={producto.id_producto}>
                      <td>{producto.nombre}</td>
                      <td>{producto.categoria}</td>
                      <td>{producto.cantidad_vendida}</td>
                      <td>${formatoPrecio(producto.total_generado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* STOCK BAJO */}
      <section className="reporte-seccion">
        <h2>Productos con stock bajo</h2>
        <p>
          Productos activos cuyo stock está en el mínimo establecido o por
          debajo de este.
        </p>

        {errores.stock && (
          <p className="reportes-mensaje error">{errores.stock}</p>
        )}

        {cargandoStock ? (
          <p className="reportes-mensaje">
            Cargando productos con stock bajo...
          </p>
        ) : stockBajo.length === 0 ? (
          <p className="reportes-mensaje">
            No hay productos activos con stock bajo.
          </p>
        ) : (
          <div className="reportes-tabla-contenedor">
            <table className="reportes-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock actual</th>
                  <th>Stock mínimo</th>
                  <th>Precio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stockBajo.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td>{producto.nombre}</td>
                    <td>{producto.categoria}</td>
                    <td className="stock-critico">{producto.stock}</td>
                    <td>{producto.stock_minimo}</td>
                    <td>${formatoPrecio(producto.precio)}</td>
                    <td>
                      <span className="stock-bajo-etiqueta">
                        Stock bajo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MÉTODOS DE PAGO */}
      <section className="reporte-seccion">
        <h2>Ventas por método de pago</h2>
        <p>
          Distribución de pagos confirmados asociados a ventas completadas.
        </p>

        {errores.pagos && (
          <p className="reportes-mensaje error">{errores.pagos}</p>
        )}

        {cargandoPagos ? (
          <p className="reportes-mensaje">Cargando reporte de pagos...</p>
        ) : pagos.length === 0 ? (
          <p className="reportes-mensaje">
            No hay pagos confirmados asociados a ventas completadas.
          </p>
        ) : (
          <>
            <div className="reporte-grafico">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pagos}
                    dataKey="total_recaudado"
                    nameKey="tipo_pago"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {pagos.map((pago, indice) => (
                      <Cell
                        key={`${pago.tipo_pago}-${indice}`}
                        fill={
                          [
                            "#2563eb",
                            "#16a34a",
                            "#f59e0b",
                            "#9333ea",
                            "#0891b2",
                            "#dc2626",
                          ][indice % 6]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(valor) => `$${formatoPrecio(valor)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="reportes-tabla-contenedor">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>Método de pago</th>
                    <th>Cantidad de pagos</th>
                    <th>Total recaudado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago, indice) => (
                    <tr key={`${pago.tipo_pago}-${indice}`}>
                      <td>{pago.tipo_pago}</td>
                      <td>{pago.cantidad_pagos}</td>
                      <td>${formatoPrecio(pago.total_recaudado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* VENTAS POR VENDEDOR */}
      <section className="reporte-seccion">
        <h2>Ventas por vendedor</h2>
        <p>
          Cantidad de ventas completadas y total vendido por cada vendedor.
        </p>

        {errores.vendedores && (
          <p className="reportes-mensaje error">{errores.vendedores}</p>
        )}

        {cargandoVendedores ? (
          <p className="reportes-mensaje">
            Cargando reporte de vendedores...
          </p>
        ) : vendedores.length === 0 ? (
          <p className="reportes-mensaje">
            No hay ventas completadas registradas por vendedores.
          </p>
        ) : (
          <>
            <div className="reporte-grafico">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={vendedores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="vendedor"
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(valor) => `$${formatoPrecio(valor)}`}
                  />
                  <Tooltip
                    formatter={(valor) => `$${formatoPrecio(valor)}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="total_vendido"
                    name="Total vendido"
                    fill="#16a34a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="reportes-tabla-contenedor">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>Vendedor</th>
                    <th>Cantidad de ventas</th>
                    <th>Total vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {vendedores.map((vendedor) => (
                    <tr key={vendedor.id_usuario}>
                      <td>{vendedor.vendedor}</td>
                      <td>{vendedor.cantidad_ventas}</td>
                      <td>${formatoPrecio(vendedor.total_vendido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* HISTORIAL DE MOVIMIENTOS DE INVENTARIO */}
      <section className="reporte-seccion">
        <h2>Movimientos de inventario</h2>
        <p>
          Consulta las entradas y salidas registradas, incluyendo el cambio
          de existencias y el motivo del movimiento.
        </p>

        <div className="reportes-filtros reportes-filtros-movimientos">
          <div>
            <label htmlFor="buscar-producto-movimiento">Producto</label>
            <input
              id="buscar-producto-movimiento"
              type="text"
              placeholder="Buscar por nombre"
              value={filtroProductoMovimiento}
              onChange={(e) => setFiltroProductoMovimiento(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="tipo-movimiento">Tipo de movimiento</label>
            <select
              id="tipo-movimiento"
              value={filtroTipoMovimiento}
              onChange={(e) => setFiltroTipoMovimiento(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>

          <div>
            <label htmlFor="fecha-movimiento-inicio">Fecha de inicio</label>
            <input
              id="fecha-movimiento-inicio"
              type="date"
              value={fechaMovimientoInicio}
              max={fechaMovimientoFin || undefined}
              onChange={(e) => setFechaMovimientoInicio(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="fecha-movimiento-fin">Fecha de fin</label>
            <input
              id="fecha-movimiento-fin"
              type="date"
              value={fechaMovimientoFin}
              min={fechaMovimientoInicio || undefined}
              onChange={(e) => setFechaMovimientoFin(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-limpiar-reportes"
            onClick={limpiarFiltrosMovimientos}
          >
            Limpiar filtros
          </button>
        </div>

        {errores.movimientos && (
          <p className="reportes-mensaje error">{errores.movimientos}</p>
        )}

        {cargandoMovimientos ? (
          <p className="reportes-mensaje">
            Cargando movimientos de inventario...
          </p>
        ) : movimientosFiltrados.length === 0 ? (
          <p className="reportes-mensaje">
            No hay movimientos que coincidan con los filtros seleccionados.
          </p>
        ) : (
          <div className="reportes-tabla-contenedor">
            <table className="reportes-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock anterior</th>
                  <th>Stock nuevo</th>
                  <th>Motivo</th>
                  <th>ID venta</th>
                </tr>
              </thead>
              <tbody>
                {movimientosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id_movimiento}>
                    <td>
                      {movimiento.fecha_movimiento
                        ? new Date(movimiento.fecha_movimiento).toLocaleString(
                            "es-CO"
                          )
                        : "—"}
                    </td>
                    <td>{movimiento.producto || "—"}</td>
                    <td>{movimiento.codigo || "—"}</td>
                    <td>
                      <span
                        className={`movimiento-etiqueta ${
                          movimiento.tipo === "ENTRADA"
                            ? "movimiento-entrada"
                            : "movimiento-salida"
                        }`}
                      >
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td>{movimiento.cantidad}</td>
                    <td>{movimiento.stock_anterior}</td>
                    <td>{movimiento.stock_nuevo}</td>
                    <td>{movimiento.motivo || "Sin motivo"}</td>
                    <td>{movimiento.id_venta ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Reportes;
