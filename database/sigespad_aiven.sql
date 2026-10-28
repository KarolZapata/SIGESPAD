-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-10-2026 a las 05:32:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sigespad`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`, `estado`, `fecha_creacion`) VALUES
(1, 'Papelería', 'Productos de papelería', 1, '2026-08-31 18:22:24'),
(2, 'Accesorios', 'Productos de accesorios', 1, '2026-09-21 00:08:44'),
(3, 'Cristalería y Hogar', 'Productos de cristalería y hogar', 1, '2026-09-21 00:08:44'),
(4, 'Relojería', 'Productos de relojería', 1, '2026-09-21 00:08:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id_detalle`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(7, 5, 1, 2, 7000.00, 14000.00),
(8, 6, 140, 1, 19800.00, 19800.00),
(9, 6, 141, 1, 8400.00, 8400.00),
(10, 6, 132, 1, 13600.00, 13600.00),
(11, 7, 151, 1, 95000.00, 95000.00),
(12, 7, 86, 3, 2400.00, 7200.00),
(13, 7, 79, 8, 300.00, 2400.00),
(14, 8, 152, 1, 650000.00, 650000.00),
(15, 8, 151, 1, 95000.00, 95000.00),
(16, 9, 139, 1, 4000.00, 4000.00),
(17, 9, 137, 1, 21600.00, 21600.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id_movimiento` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `tipo` enum('ENTRADA','SALIDA') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `stock_anterior` int(11) NOT NULL,
  `stock_nuevo` int(11) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_venta` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_inventario`
--

INSERT INTO `movimientos_inventario` (`id_movimiento`, `id_producto`, `tipo`, `cantidad`, `stock_anterior`, `stock_nuevo`, `motivo`, `fecha_movimiento`, `id_venta`) VALUES
(1, 35, 'ENTRADA', 5, 590, 595, 'Reposición de mercancia', '2026-09-21 01:02:01', NULL),
(2, 35, 'SALIDA', 5, 595, 590, 'Venta', '2026-09-21 01:02:35', NULL),
(3, 1, 'SALIDA', 2, 520, 518, 'Venta', '2026-09-21 02:38:01', 5),
(4, 1, 'ENTRADA', 2, 518, 520, 'Cancelación de venta', '2026-09-21 02:41:59', 5),
(5, 140, 'SALIDA', 1, 460, 459, 'Venta', '2026-09-28 12:10:49', 6),
(6, 141, 'SALIDA', 1, 460, 459, 'Venta', '2026-09-28 12:10:49', 6),
(7, 132, 'SALIDA', 1, 480, 479, 'Venta', '2026-09-28 12:10:49', 6),
(8, 151, 'SALIDA', 1, 10, 9, 'Venta', '2026-09-28 12:17:07', 7),
(9, 86, 'SALIDA', 3, 450, 447, 'Venta', '2026-09-28 12:17:07', 7),
(10, 79, 'SALIDA', 8, 550, 542, 'Venta', '2026-09-28 12:17:07', 7),
(11, 152, 'SALIDA', 1, 3, 2, 'Venta', '2026-09-28 20:05:17', 8),
(12, 151, 'SALIDA', 1, 9, 8, 'Venta', '2026-09-28 20:05:17', 8),
(13, 152, 'ENTRADA', 1, 2, 3, 'Cancelación de venta', '2026-10-04 00:59:38', 8),
(14, 151, 'ENTRADA', 1, 8, 9, 'Cancelación de venta', '2026-10-04 00:59:38', 8),
(15, 139, 'SALIDA', 1, 450, 449, 'Venta', '2026-10-17 18:35:08', 9),
(16, 137, 'SALIDA', 1, 430, 429, 'Venta', '2026-10-17 18:35:08', 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id_pago` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `tipo_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','NEQUI','DAVIPLATA') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` enum('PENDIENTE','CONFIRMADO','ANULADO') DEFAULT 'PENDIENTE',
  `fecha_pago` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagos`
--

INSERT INTO `pagos` (`id_pago`, `id_venta`, `tipo_pago`, `monto`, `estado`, `fecha_pago`) VALUES
(1, 7, 'EFECTIVO', 104600.00, 'CONFIRMADO', '2026-09-28 12:26:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `precio_mayorista` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  `imagen` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `codigo`, `nombre`, `descripcion`, `categoria`, `precio`, `precio_mayorista`, `stock`, `stock_minimo`, `imagen`, `estado`, `fecha_creacion`) VALUES
(1, 'ACC-0001', 'Caimán irrompible', 'Diseño elaborado para ofrecer una sujeción firme y confiable del cabello, con una estructura resistente que permite utilizarlo cómodamente en diferentes tipos de peinados y ocasiones.', 'Accesorios', 7000.00, 3500.00, 520, 96, NULL, 1, '2026-09-20 17:49:40'),
(2, 'ACC-0002', 'Caimán Flor Hawaii', 'Diseño inspirado en flores tropicales de estilo Hawaii, combinado con un elegante acabado tipo ojo de gato que resalta sus detalles y le aporta un aspecto llamativo y femenino.', 'Accesorios', 5600.00, 2800.00, 538, 96, NULL, 1, '2026-09-20 17:49:40'),
(3, 'ACC-0003', 'Peineta', 'Accesorio de estilo decorativo con detalles inspirados en el acabado Murano, pensado para complementar recogidos y peinados con un toque sofisticado, elegante y diferente.', 'Accesorios', 18000.00, 9000.00, 510, 72, NULL, 1, '2026-09-20 17:49:40'),
(4, 'ACC-0004', 'Diadema', 'Estampado de fresas en suaves tonos pastel que combina un estilo tierno y femenino, ideal para complementar el cabello de manera sencilla y darle un detalle especial al look.', 'Accesorios', 5800.00, 2900.00, 545, 96, NULL, 1, '2026-09-20 17:49:40'),
(5, 'ACC-0005', 'Bamba tipo pañoleta', 'Diseño corto inspirado en las pañoletas tradicionales, acompañado de un estampado de cerezas que le aporta un estilo juvenil, fresco y llamativo para complementar diferentes peinados.', 'Accesorios', 4000.00, 2000.00, 570, 96, NULL, 1, '2026-09-20 17:49:40'),
(6, 'ACC-0006', 'Bamba estampada', 'Presenta una variedad de diseños y estampados surtidos que permiten elegir diferentes estilos según la ocasión, siendo una opción práctica para complementar peinados de forma sencilla y versátil.', 'Accesorios', 3800.00, 1900.00, 580, 108, NULL, 1, '2026-09-20 17:49:40'),
(7, 'ACC-0007', 'Bamba de satín', 'Elaborada en satín con un delicado aplique decorativo de moño en velo, combinando una apariencia elegante con un acabado suave que aporta un toque femenino y especial al peinado.', 'Accesorios', 3800.00, 1900.00, 560, 96, NULL, 1, '2026-09-20 17:49:40'),
(8, 'ACC-0008', 'Bamba de satín tipo moño', 'Fabricada en tela de satín con colores surtidos y estampado de corazones, ofreciendo una combinación entre suavidad, color y un diseño romántico para complementar distintos estilos.', 'Accesorios', 6600.00, 2300.00, 530, 96, NULL, 1, '2026-09-20 17:49:40'),
(9, 'ACC-0009', 'Set pinza con colero', 'Conjunto en tonos vino tinto acompañado de un estampado decorativo y piezas coordinadas, ideal para crear peinados combinados y añadir un detalle de color elegante al cabello.', 'Accesorios', 4400.00, 2200.00, 415, 84, NULL, 1, '2026-09-20 17:49:40'),
(10, 'ACC-0010', 'Set de pinzas x2', 'Incluye dos unidades con estampados surtidos y diseños diferentes, ofreciendo variedad para combinar, alternar entre peinados o elegir la opción que mejor se adapte a cada look.', 'Accesorios', 3800.00, 1900.00, 528, 96, NULL, 1, '2026-09-20 17:49:40'),
(11, 'ACC-0011', 'Caimán pequeño', 'Diseños surtidos decorados con divertidas figuras de animales, ideales para aportar un toque alegre y juvenil a los peinados, especialmente en estilos más casuales y originales.', 'Accesorios', 3000.00, 1500.00, 560, 108, NULL, 1, '2026-09-20 17:49:40'),
(12, 'ACC-0012', 'Set de pinzas', 'Conjunto decorado con figuras de cerezas que aporta un estilo dulce y llamativo, perfecto para complementar peinados cotidianos con pequeños detalles inspirados en esta fruta.', 'Accesorios', 4200.00, 1200.00, 520, 96, NULL, 1, '2026-09-20 17:49:40'),
(13, 'ACC-0013', 'Set de pinzas con moño', 'Diseño inspirado en cerezas acompañado de un detalle de moño que realza su apariencia, creando una combinación femenina y encantadora para complementar diferentes peinados.', 'Accesorios', 4600.00, 2300.00, 536, 96, NULL, 1, '2026-09-20 17:49:40'),
(14, 'ACC-0014', 'Set de pinzas tejido', 'Presenta un diseño de cerezas con acabado tejido que le da una apariencia diferente y llamativa, ideal para quienes buscan accesorios con detalles originales y un toque artesanal.', 'Accesorios', 5400.00, 2700.00, 555, 96, NULL, 1, '2026-09-20 17:49:40'),
(15, 'ACC-0015', 'Colero tipo pañoleta', 'Estampado de cerezas combinado con un diseño inspirado en las pañoletas, creando un accesorio versátil que permite recoger el cabello y darle un toque juvenil y femenino al peinado.', 'Accesorios', 3800.00, 1900.00, 585, 108, NULL, 1, '2026-09-20 17:49:40'),
(16, 'ACC-0016', 'Bamba en satín', 'Su acabado satinado y el estampado de cerezas en tonos pastel crean una combinación suave y delicada, perfecta para complementar peinados con un detalle romántico y lleno de color.', 'Accesorios', 3800.00, 1900.00, 585, 108, NULL, 1, '2026-09-20 17:49:40'),
(17, 'ACC-0017', 'Turbante', 'Diseño estampado disponible en tonos surtidos, pensado para complementar diferentes estilos de cabello y aportar un detalle práctico, moderno y diferente a los peinados.', 'Accesorios', 4600.00, 2300.00, 500, 84, NULL, 1, '2026-09-20 17:49:40'),
(18, 'ACC-0018', 'Pinza moño tipo coquette', 'Estampado de fresas acompañado de un detalle de moño que combina dos elementos muy delicados, creando un accesorio de apariencia tierna y femenina inspirado en el estilo coquette.', 'Accesorios', 4800.00, 2400.00, 510, 96, NULL, 1, '2026-09-20 17:49:40'),
(19, 'ACC-0019', 'Pinza moño tipo coquette en satín', 'Elaborada con acabado satinado y estampado de cerezas, incorpora un detalle de moño que resalta su estilo coquette y la convierte en un accesorio delicado para distintos peinados.', 'Accesorios', 4800.00, 2400.00, 510, 96, NULL, 1, '2026-09-20 17:49:40'),
(20, 'ACC-0020', 'Cartón pinza x3 piezas', 'Presentación de tres piezas en tonos blanco y negro, con diseños fáciles de combinar y pensados para sujetar diferentes secciones del cabello de manera práctica durante el día.', 'Accesorios', 4000.00, 2000.00, 560, 96, NULL, 1, '2026-09-20 17:49:40'),
(21, 'ACC-0021', 'Cartón gancho invisible', 'Accesorios de diseño discreto que permiten sujetar y organizar el cabello sin llamar demasiado la atención, ideales para complementar peinados sencillos, recogidos y acabados más pulidos.', 'Accesorios', 3400.00, 1700.00, 570, 108, NULL, 1, '2026-09-20 17:49:40'),
(22, 'ACC-0022', 'Cartón pinza tic tac x12', 'Presentación de doce unidades en tonos surtidos, ideal para disponer de diferentes opciones al momento de peinarse y combinar colores según el estilo o la ocasión.', 'Accesorios', 2600.00, 1300.00, 580, 108, NULL, 1, '2026-09-20 17:49:40'),
(23, 'ACC-0023', 'Cartón pinza tic tac x12', 'Contiene doce unidades en tonos variados que permiten crear distintas combinaciones, ofreciendo una alternativa práctica y versátil para complementar peinados de uso diario.', 'Accesorios', 3400.00, 1700.00, 585, 108, NULL, 1, '2026-09-20 17:49:40'),
(24, 'ACC-0024', 'Cartón diadema x2 piezas', 'Presentación de dos piezas en tonos pastel que aportan una apariencia suave y delicada, ideales para acompañar diferentes peinados y añadir un toque femenino y sutil al look.', 'Accesorios', 4000.00, 2000.00, 545, 96, NULL, 1, '2026-09-20 17:49:40'),
(25, 'ACC-0025', 'Set pinza niña moño capibara en tonos y diseños surtidos', 'Conjunto infantil con encantadores detalles de moños y figuras de capibara, disponible en tonos y diseños surtidos que aportan un estilo tierno, divertido y especial a los peinados de las más pequeñas.', 'Accesorios', 4400.00, 2200.00, 530, 96, NULL, 1, '2026-09-20 17:49:40'),
(26, 'ACC-0026', 'Caimán alargado con corazón en tonos pastel mate', 'Diseño alargado en suaves tonos pastel con acabado mate y un detalle de corazón que aporta una apariencia delicada y romántica, ideal para complementar peinados de manera sencilla y femenina.', 'Accesorios', 5000.00, 2500.00, 526, 96, NULL, 1, '2026-09-20 17:49:40'),
(27, 'ACC-0027', 'Set de caimán X4 en tonos metalizados y diseños surtidos', 'Incluye cuatro accesorios en diferentes diseños y tonos metalizados que aportan brillo y variedad, perfectos para crear peinados modernos y añadir detalles llamativos al cabello.', 'Accesorios', 4800.00, 2400.00, 556, 96, NULL, 1, '2026-09-20 17:49:40'),
(28, 'ACC-0028', 'Set de caimán X4 en tono negro y tipo carey en diseños surtidos', 'Conjunto de cuatro piezas que combina el clásico negro con estampados tipo carey en diferentes diseños, ofreciendo opciones versátiles que pueden adaptarse fácilmente a distintos estilos y ocasiones.', 'Accesorios', 4000.00, 2000.00, 590, 108, NULL, 1, '2026-09-20 17:49:40'),
(29, 'ACC-0029', 'Set de caimán X4 en tonos y diseños surtidos', 'Cuatro accesorios con variedad de tonos y formas para elegir diferentes estilos de acuerdo con el peinado, permitiendo crear combinaciones prácticas y darle mayor variedad a la colección de accesorios.', 'Accesorios', 4000.00, 2000.00, 590, 108, NULL, 1, '2026-09-20 17:49:40'),
(30, 'ACC-0030', 'Gancho invisible X2', 'Presentación de dos unidades metálicas decoradas con pequeños brillantes que aportan un detalle elegante y sutil, ideales para sujetar el cabello y complementar peinados con un toque de luminosidad.', 'Accesorios', 3200.00, 1600.00, 530, 96, NULL, 1, '2026-09-20 17:49:40'),
(31, 'ACC-0031', 'Gancho invisible X2', 'Dos ganchos metálicos con brillantes que combinan funcionalidad y un acabado delicado, perfectos para utilizar en recogidos, peinados sencillos o como detalle decorativo en diferentes estilos.', 'Accesorios', 3200.00, 1600.00, 530, 96, NULL, 1, '2026-09-20 17:49:40'),
(32, 'ACC-0032', 'Pinza niña B/N', 'Diseño infantil en combinación de blanco y negro, pensado para complementar los peinados de las más pequeñas con un accesorio sencillo, práctico y fácil de combinar con diferentes looks.', 'Accesorios', 4000.00, 2000.00, 518, 96, NULL, 1, '2026-09-20 17:49:40'),
(33, 'ACC-0033', 'Banana decorada', 'Accesorio práctico y versátil con detalles decorativos que aportan un acabado especial al peinado, ideal para recoger el cabello de manera sencilla y mantener un estilo cómodo y arreglado.', 'Accesorios', 3000.00, 1500.00, 522, 96, NULL, 1, '2026-09-20 17:49:40'),
(34, 'ACC-0034', 'Caimán mariposa', 'Diseño metálico en tonos dorado y plateado con una delicada silueta de mariposa, ideal para añadir un detalle elegante y femenino a diferentes peinados de manera llamativa pero sutil.', 'Accesorios', 3800.00, 1900.00, 575, 96, NULL, 1, '2026-09-20 17:49:40'),
(35, 'ACC-0035', 'Caimán dálmata', 'Elaborado en pasta con una combinación de blanco y negro inspirada en el clásico estampado dálmata, creando un accesorio original y fácil de destacar entre diferentes estilos de peinado.', 'Accesorios', 5000.00, 2500.00, 590, 108, NULL, 1, '2026-09-20 17:49:40'),
(36, 'ACC-0036', 'Caimán negro y café', 'Elaborado en pasta y disponible en una combinación de tonos negro y café, ofrece una apariencia sobria y versátil que facilita su combinación con diferentes colores y estilos de cabello.', 'Accesorios', 5000.00, 2500.00, 590, 108, NULL, 1, '2026-09-20 17:49:40'),
(37, 'ACC-0037', 'Caimán cuadrado', 'Diseño de forma cuadrada en tonos tierra que combina una apariencia moderna con colores neutros y cálidos, ideal para complementar peinados con un acabado discreto y sofisticado.', 'Accesorios', 5000.00, 2500.00, 586, 108, NULL, 1, '2026-09-20 17:49:40'),
(38, 'ACC-0038', 'Caimán estampado', 'Elaborado en pasta con una variedad de tonos y estampados que aportan color y personalidad, ofreciendo diferentes alternativas para complementar peinados cotidianos de manera original.', 'Accesorios', 5000.00, 2500.00, 610, 120, NULL, 1, '2026-09-20 17:49:40'),
(39, 'ACC-0039', 'Caimán pasta', 'Variedad de tonos y diseños elaborados en pasta que permite elegir entre diferentes estilos, convirtiéndolo en un accesorio práctico y versátil para acompañar distintos tipos de peinados.', 'Accesorios', 5200.00, 2600.00, 600, 120, NULL, 1, '2026-09-20 17:49:40'),
(40, 'ACC-0040', 'Caimán gamuz', 'Suave textura y agradable acabado al tacto, disponible en tonos surtidos que facilitan su combinación con diferentes estilos y aportan una apariencia cálida y diferente al peinado.', 'Accesorios', 5600.00, 2800.00, 590, 108, NULL, 1, '2026-09-20 17:49:40'),
(41, 'ACC-0041', 'Caimán grande', 'Diseño rectangular en colores pastel que combina un tamaño amplio con tonos suaves y actuales, ideal para sujetar el cabello y añadir un toque moderno y llamativo al look.', 'Accesorios', 5800.00, 2900.00, 585, 108, NULL, 1, '2026-09-20 17:49:40'),
(42, 'ACC-0042', 'Caimán grande', 'Diseño cuadrado en tonos blanco y negro que ofrece una combinación clásica y fácil de coordinar, ideal para utilizar diariamente y complementar diferentes estilos de cabello.', 'Accesorios', 5000.00, 2500.00, 585, 108, NULL, 1, '2026-09-20 17:49:40'),
(43, 'ACC-0043', 'Caimán grande', 'Diseño en forma de garras con combinación de tonos blanco y negro, pensado para ofrecer una apariencia moderna y llamativa mientras permite recoger el cabello de manera práctica.', 'Accesorios', 5000.00, 2500.00, 590, 108, NULL, 1, '2026-09-20 17:49:40'),
(44, 'ACC-0044', 'Caimán mediano', 'Diseño cúbico disponible en diferentes tonos pastel, combinando colores suaves con una forma moderna que permite complementar el peinado y aportar un pequeño detalle de color y estilo.', 'Accesorios', 5000.00, 2500.00, 590, 108, NULL, 1, '2026-09-20 17:49:40'),
(47, 'ACC-0045', 'Pinza moño coquette fresa', 'Diseño en forma de moño con estampado de fresas, inspirado en el estilo coquette y pensado para aportar un detalle tierno y femenino al peinado. Su combinación de formas y estampado la convierte en un accesorio llamativo para diferentes ocasiones.', 'Accesorios', 4800.00, 2400.00, 470, 96, NULL, 1, '2026-09-27 00:01:00'),
(48, 'ACC-0046', 'Pinza moño coquette cerezas', 'Elaborada en satín con estampado de cerezas y un diseño de moño que resalta su estilo coquette. El acabado aporta una apariencia suave y elegante, ideal para complementar peinados con un detalle romántico y delicado.', 'Accesorios', 4800.00, 2400.00, 450, 96, NULL, 1, '2026-09-27 00:01:00'),
(49, 'ACC-0047', 'Diadema con moño', 'Diseño clásico de diadema acompañado de un detalle de moño que le aporta mayor encanto y presencia. Es una opción versátil para recoger el cabello del rostro mientras complementa el look con un acabado femenino y especial.', 'Accesorios', 5600.00, 2800.00, 490, 108, NULL, 1, '2026-09-27 00:01:00'),
(50, 'ACC-0048', 'Caimán mediano carey', 'Diseño de tamaño mediano con acabado tipo carey, caracterizado por sus tonos y patrones inspirados en este clásico estampado. Su apariencia neutra facilita la combinación con diferentes colores de cabello, prendas y estilos de uso diario.', 'Accesorios', 3000.00, 1500.00, 450, 108, NULL, 1, '2026-09-27 00:01:00'),
(51, 'ACC-0049', 'Caimán pequeño mariposa', 'Diseño pequeño con detalle de mariposa en tono negro, ideal para complementar peinados con un accesorio discreto pero llamativo. Su tamaño resulta práctico para sujetar pequeñas secciones del cabello y añadir un detalle juvenil al look.', 'Accesorios', 2600.00, 1300.00, 435, 96, NULL, 1, '2026-09-27 00:01:00'),
(52, 'ACC-0050', 'Caimán mediano corazones', 'Diseño cuadrado con figuras de corazones en tonos pastel, combinando formas modernas con colores suaves y delicados. Es una alternativa ideal para darle un pequeño toque de color al peinado sin perder un estilo tierno y femenino.', 'Accesorios', 3000.00, 1500.00, 485, 108, NULL, 1, '2026-09-27 00:01:00'),
(53, 'ACC-0051', 'Toalla para cabello', 'Elaborada especialmente para facilitar el secado del cabello de manera práctica y cómoda. Disponible en tonos pastel que aportan una apariencia suave y agradable, convirtiéndola en un accesorio funcional para incorporar a la rutina de cuidado personal.', 'Accesorios', 17000.00, 8500.00, 410, 96, NULL, 1, '2026-09-27 00:01:00'),
(54, 'ACC-0052', 'Bamba fresa pastel', 'Diseño en tonos pastel con estampado de fresas que combina colores suaves y un estilo juvenil. Es una opción práctica para recoger el cabello y añadir un detalle alegre y femenino tanto a peinados cotidianos como a looks más casuales.', 'Accesorios', 3400.00, 1700.00, 430, 96, NULL, 1, '2026-09-27 00:01:00'),
(55, 'ACC-0053', 'Bamba pañoleta satín', 'Diseño tipo pañoleta elaborado en satín y disponible en tonos surtidos, ofreciendo una apariencia elegante y diferente. Su acabado permite complementar distintos peinados con un accesorio llamativo que aporta textura, color y un toque especial.', 'Accesorios', 6600.00, 2300.00, 425, 96, NULL, 1, '2026-09-27 00:01:00'),
(56, 'ACC-0054', 'Cartón caimán x2 tornasolado', 'Presentación de dos piezas con acabado tornasolado y diseños surtidos, ideales para variar los peinados y crear diferentes combinaciones. El efecto de color aporta un detalle brillante y moderno que resalta fácilmente entre los accesorios tradicionales.', 'Accesorios', 5000.00, 2500.00, 415, 108, NULL, 1, '2026-09-27 00:01:00'),
(57, 'ACC-0055', 'Caimán metálico cherry', 'Diseño metálico en tono dorado acompañado de un detalle inspirado en cerezas, combinando un acabado brillante con una figura decorativa. Es una opción ideal para complementar peinados con un accesorio diferente, elegante y lleno de personalidad.', 'Accesorios', 3800.00, 1900.00, 430, 108, NULL, 1, '2026-09-27 00:01:00'),
(58, 'ACC-0056', 'Colero tripa de pollo grande x6', 'Set de seis coleros grandes en colores surtidos, pensado para quienes buscan variedad de tonos en un solo conjunto. Su formato práctico permite utilizarlos en diferentes peinados y contar con varias opciones para combinar durante el día.', 'Accesorios', 2000.00, 1000.00, 490, 108, NULL, 1, '2026-09-27 00:01:00'),
(59, 'ACC-0057', 'Colero tripa de pollo grande pastel', 'Coleros de tamaño grande disponibles en diferentes tonos pastel, perfectos para crear peinados suaves y coloridos. La variedad de colores permite combinarlos fácilmente con diferentes estilos y prendas, aportando un detalle fresco y juvenil.', 'Accesorios', 2000.00, 1000.00, 490, 108, NULL, 1, '2026-09-27 00:01:00'),
(60, 'ACC-0058', 'Cartón colero pequeño pastel x12', 'Presentación de doce coleros pequeños en tonos pastel, ideal para disponer de varias unidades y utilizarlas en diferentes peinados. Sus colores suaves facilitan las combinaciones y permiten incorporar pequeños detalles de color de manera sencilla.', 'Accesorios', 3000.00, 1500.00, 470, 108, NULL, 1, '2026-09-27 00:01:00'),
(61, 'ACC-0059', 'Cartón colero pequeño tomi x12', 'Set de doce coleros pequeños en color tomi, pensado para ofrecer una buena cantidad de unidades para el uso diario. Su tamaño resulta práctico para diferentes tipos de peinado y facilita tener siempre accesorios disponibles para combinar.', 'Accesorios', 3000.00, 1500.00, 485, 108, NULL, 1, '2026-09-27 00:01:00'),
(62, 'ACC-0060', 'Colero tripa de pollo grande x12', 'Presentación de doce coleros grandes en colores neutros, una alternativa práctica para contar con tonos fáciles de combinar. Su variedad permite utilizarlos en diferentes ocasiones y acompañar desde peinados sencillos hasta estilos más elaborados.', 'Accesorios', 2400.00, 1200.00, 470, 108, NULL, 1, '2026-09-27 00:01:00'),
(63, 'ACC-0061', 'Cartón colero grande tomi x12', 'Set de doce coleros tipo tripa de pollo en color tomi y tamaño grande, ideal para quienes prefieren disponer de varias unidades del mismo tono. Su presentación resulta funcional para el uso frecuente y permite crear diferentes peinados de manera práctica.', 'Accesorios', 2400.00, 1200.00, 430, 108, NULL, 1, '2026-09-27 00:01:00'),
(64, 'ACC-0062', 'Cartón colero grande B/N x12', 'Presentación de doce coleros grandes en tonos blanco y negro, con una combinación clásica y versátil. Son fáciles de coordinar con diferentes estilos de ropa y cabello, convirtiéndose en una opción práctica para el uso cotidiano.', 'Accesorios', 2400.00, 1200.00, 460, 108, NULL, 1, '2026-09-27 00:01:00'),
(65, 'ACC-0063', 'Cartón colero grande negro x12', 'Set de doce coleros grandes en color negro, ideal para contar con un accesorio básico y fácil de combinar. Su tono neutro permite utilizarlos con una amplia variedad de peinados, prendas y ocasiones sin perder un acabado discreto.', 'Accesorios', 2400.00, 1200.00, 465, 108, NULL, 1, '2026-09-27 00:01:00'),
(66, 'ACC-0064', 'Cartón colero pequeño negro x12', 'Presentación de doce coleros pequeños en color negro, pensados para peinados que requieren accesorios prácticos y discretos. El tono facilita su combinación con diferentes estilos y resulta adecuado tanto para el día a día como para ocasiones especiales.', 'Accesorios', 2000.00, 1000.00, 475, 108, NULL, 1, '2026-09-27 00:01:00'),
(67, 'ACC-0065', 'Cartón colero pequeño B/N x12', 'Set de doce coleros pequeños en tonos blanco y negro, que ofrece variedad dentro de una combinación clásica. Su tamaño permite utilizarlos en diferentes peinados y realizar distintas combinaciones según el estilo que se quiera lograr.', 'Accesorios', 2000.00, 1000.00, 475, 108, NULL, 1, '2026-09-27 00:01:00'),
(68, 'ACC-0066', 'Colero cartón negro x20', 'Presentación de veinte coleros en color negro, ideal para uso frecuente y para quienes prefieren contar con varias unidades disponibles. Su tono neutro permite combinarlos fácilmente y utilizarlos en una gran variedad de peinados.', 'Accesorios', 2400.00, 1200.00, 475, 108, NULL, 1, '2026-09-27 00:01:00'),
(69, 'ACC-0067', 'Colero cartón B/N x20', 'Set de veinte coleros en tonos blanco y negro, ofreciendo una combinación práctica de colores básicos. La cantidad de piezas permite tener diferentes opciones para el uso diario y adaptarlas fácilmente a distintos peinados y estilos.', 'Accesorios', 2400.00, 1200.00, 475, 108, NULL, 1, '2026-09-27 00:01:00'),
(70, 'ACC-0068', 'Estuche cauchos niña princesas', 'Estuche infantil con cauchos para el cabello y diseños inspirados en princesas, disponibles en diferentes motivos de tonos pastel claros. Su presentación resulta práctica para organizar los accesorios y aportar un detalle divertido y encantador a los pein', 'Accesorios', 3200.00, 1600.00, 480, 108, NULL, 1, '2026-09-27 00:01:00'),
(71, 'ACC-0069', 'Bolsitas de cauchos surtidos', 'Presentación en bolsitas con cauchos para el cabello y diferentes motivos decorativos en tonos blanco y negro. La variedad de diseños permite elegir entre distintas opciones y complementar peinados infantiles de una manera práctica y original.', 'Accesorios', 3200.00, 1600.00, 480, 108, NULL, 1, '2026-09-27 00:01:00'),
(72, 'ACC-0070', 'Bolsa mediana de caucho niña negra', 'Bolsa mediana con cauchos para niña en color negro, una opción práctica para organizar y tener disponibles varias unidades para diferentes peinados. Su tono clásico permite combinar fácilmente los accesorios con distintos estilos de ropa y cabello.', 'Accesorios', 2200.00, 1100.00, 490, 108, NULL, 1, '2026-09-27 00:01:00'),
(73, 'ACC-0071', 'Bolsa mediana de caucho niña pastel', 'Bolsa mediana con cauchos en diferentes colores pastel, ideal para crear peinados infantiles alegres y delicados. La variedad de tonos ofrece múltiples posibilidades de combinación y permite contar con varios accesorios en una sola presentación.', 'Accesorios', 2200.00, 1100.00, 490, 108, NULL, 1, '2026-09-27 00:01:00'),
(74, 'ACC-0072', 'Bolsa caucho niña negra', 'Presentación de cauchos para niña en color negro, pensados para complementar diferentes peinados de forma sencilla y práctica. El tono neutro permite utilizarlos fácilmente con distintos estilos y resulta una opción básica para el uso cotidiano.', 'Accesorios', 2200.00, 1100.00, 490, 108, NULL, 1, '2026-09-27 00:01:00'),
(75, 'ACC-0073', 'Bolsa caucho niña pastel', 'Cauchos para niña disponibles en colores pastel, perfectos para añadir pequeños detalles de color a los peinados. Su presentación es práctica para el uso diario y permite combinar diferentes tonos según el estilo que se quiera crear.', 'Accesorios', 2200.00, 1100.00, 490, 108, NULL, 1, '2026-09-27 00:01:00'),
(76, 'ACC-0074', 'Cartón piojitos oso B/N', 'Presentación de pequeños accesorios con forma de oso en diseños surtidos de color blanco y negro. Su estilo infantil y divertido los convierte en una opción especial para complementar peinados de niñas con detalles originales y fáciles de combinar.', 'Accesorios', 3400.00, 1700.00, 470, 108, NULL, 1, '2026-09-27 00:01:00'),
(77, 'ACC-0075', 'Cartón piojitos florecita neutros', 'Pequeños accesorios con diseño de florecita en tonos neutros, ideales para decorar y sujetar el cabello de manera sencilla. Su combinación de colores permite utilizarlos con diferentes estilos y añadir un detalle delicado a los peinados.', 'Accesorios', 3000.00, 1500.00, 430, 96, NULL, 1, '2026-09-27 00:01:00'),
(78, 'ACC-0076', 'Bolsa de cauchos de silicona', 'Variedad de cauchos de silicona en tonos pastel, blanco y negro y colores fuertes, ideales para crear diferentes combinaciones y complementar peinados infantiles de forma práctica y colorida.', 'Accesorios', 2800.00, 1400.00, 550, 108, NULL, 1, '2026-09-27 00:01:00'),
(79, 'ACC-0077', 'Bolsa de cauchos pequeños', 'Presentación con cauchos pequeños en diferentes opciones de color, perfectos para realizar peinados, trenzas y recogidos que requieren accesorios de tamaño reducido.', 'Accesorios', 600.00, 300.00, 550, 108, NULL, 1, '2026-09-27 00:01:00'),
(80, 'ACC-0078', 'Tarro de caucho gatico', 'Tarro con cauchos en un divertido diseño de gatico y tonos pastel, ideal para mantener los accesorios organizados y aportar un detalle tierno a los peinados de las más pequeñas.', 'Accesorios', 6400.00, 3200.00, 550, 108, NULL, 1, '2026-09-27 00:01:01'),
(81, 'ACC-0079', 'Bolsa de caucho niña neutros', 'Cauchos pequeños para niña en tonos neutros y fáciles de combinar, pensados para el uso diario y para acompañar diferentes estilos de peinado sin recargar el look.', 'Accesorios', 900.00, 450.00, 550, 108, NULL, 1, '2026-09-27 00:01:01'),
(82, 'ACC-0080', 'Bolsa de caucho niña B/N', 'Selección de cauchos pequeños en blanco y negro que combina colores clásicos y versátiles, adecuada para crear diferentes peinados y contar con accesorios fáciles de coordinar.', 'Accesorios', 900.00, 450.00, 550, 108, NULL, 1, '2026-09-27 00:01:01'),
(83, 'ACC-0081', 'Bolsa de caucho niña negro', 'Cauchos pequeños en color negro, ideales para recoger el cabello de manera sencilla y mantener un acabado discreto. Su tono permite combinarlos fácilmente con diferentes estilos y ocasiones.', 'Accesorios', 900.00, 450.00, 550, 108, NULL, 1, '2026-09-27 00:01:01'),
(84, 'ACC-0082', 'Bolsa de caucho niña pastel', 'Variedad de cauchos pequeños en tonos pastel que aportan color y un acabado delicado a los peinados. Son prácticos para trenzas, coletas y diferentes estilos infantiles.', 'Accesorios', 900.00, 450.00, 550, 108, NULL, 1, '2026-09-27 00:01:01'),
(85, 'ACC-0083', 'Set de accesorios para trenzas', 'Conjunto de accesorios en colores surtidos diseñado para complementar trenzas y crear peinados más llamativos. Ofrece diferentes opciones para jugar con combinaciones de tonos y estilos.', 'Accesorios', 3200.00, 1600.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(86, 'ACC-0084', 'Set gancho y tic tac', 'Combinación de ganchos y pinzas tipo tic tac en tonos fuertes, ideal para quienes buscan accesorios coloridos y funcionales que ayuden a variar los peinados y darles un toque más alegre.', 'Accesorios', 2400.00, 1200.00, 450, 108, NULL, 1, '2026-09-27 00:01:01'),
(87, 'ACC-0085', 'Diadema perlada blanca', 'Diseño en color blanco con detalles perlados que le aportan una apariencia elegante y delicada. Es ideal para complementar peinados sencillos o más arreglados con un accesorio de acabado sofisticado.', 'Accesorios', 3000.00, 1500.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(88, 'ACC-0086', 'Bamba tela lisa neutra', 'Elaborada en tela lisa y disponible en diferentes tonos neutros, ofrece una opción sencilla y versátil para recoger el cabello. Sus colores permiten combinarla fácilmente con diferentes prendas y estilos.', 'Accesorios', 3200.00, 1600.00, 430, 108, NULL, 1, '2026-09-27 00:01:01'),
(89, 'ACC-0087', 'Bamba con perlas B/N', 'Diseño decorado con perlas y disponible en blanco y negro, logrando una combinación clásica con un detalle elegante. Es una alternativa ideal para complementar peinados con un toque delicado y especial.', 'Accesorios', 3200.00, 1600.00, 430, 108, NULL, 1, '2026-09-27 00:01:01'),
(90, 'ACC-0088', 'Bamba de gamuza pastel', 'Elaborada en material tipo gamuza y disponible en tonos pastel, combina una textura suave con colores delicados que aportan un acabado cálido y femenino a diferentes peinados.', 'Accesorios', 3400.00, 1700.00, 440, 108, NULL, 1, '2026-09-27 00:01:01'),
(91, 'ACC-0089', 'Cartón bamba de gamuza neutra', 'Presentación en cartón de bambas elaboradas en material tipo gamuza y tonos neutros. Su estilo sobrio y versátil facilita la combinación con distintos looks y permite disponer de varias opciones para el uso diario.', 'Accesorios', 3400.00, 1700.00, 440, 108, NULL, 1, '2026-09-27 00:01:01'),
(92, 'ACC-0090', 'Set de pinza', 'Conjunto de pinzas en diseños surtidos, pensado para ofrecer diferentes alternativas al momento de organizar el cabello. Su variedad permite elegir el accesorio más adecuado según el peinado y la ocasión.', 'Accesorios', 4200.00, 2100.00, 430, 108, NULL, 1, '2026-09-27 00:01:01'),
(93, 'ACC-0091', 'Cartón caimán mediano trenzado', 'Presentación de caimanes medianos con diseño trenzado en tonos pastel y neutros, combinando colores suaves con una forma diferente que aporta un detalle moderno y funcional al peinado.', 'Accesorios', 3600.00, 1800.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(94, 'ACC-0092', 'Cartón caimán mediano curvo', 'Caimanes medianos con diseño curvo y una selección de tonos pastel y neutros. Su forma permite sujetar el cabello de manera práctica mientras añade un acabado sencillo y actual.', 'Accesorios', 3600.00, 1800.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(95, 'ACC-0093', 'Pinza flor pastel', 'Diseño en forma de flor disponible en tonos pastel, ideal para aportar un detalle alegre y femenino al cabello. Su apariencia decorativa permite utilizarla como complemento en diferentes estilos de peinado.', 'Accesorios', 4000.00, 2000.00, 430, 108, NULL, 1, '2026-09-27 00:01:01'),
(96, 'ACC-0094', 'Bamba tipo dona', 'Diseño tipo dona pensado para facilitar la creación de recogidos y moños de manera práctica. Es un accesorio funcional que ayuda a dar forma al cabello y conseguir peinados organizados con facilidad.', 'Accesorios', 2600.00, 1300.00, 435, 108, NULL, 1, '2026-09-27 00:01:01'),
(97, 'ACC-0095', 'Set pinza unicornio pastel', 'Conjunto de pinzas con temática de unicornio en tonos pastel, pensado para complementar peinados infantiles con diseños coloridos y divertidos. Su estilo aporta un detalle especial y encantador al cabello.', 'Accesorios', 3800.00, 1900.00, 470, 108, NULL, 1, '2026-09-27 00:01:01'),
(98, 'ACC-0096', 'Cartón piojitos surtidos x12', 'Presentación de doce bolsitas de piojitos con diferentes diseños y colores, incluyendo tonos neutros, negro, blanco y negro y opciones pastel. Ideal para tener variedad de accesorios pequeños y combinarlos en distintos peinados.', 'Accesorios', 2000.00, 1000.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(99, 'ACC-0097', 'Balaca bebé con moño', 'Diseño para bebé acompañado de un delicado moño y disponible en diferentes tonos pastel. Es una opción cómoda y decorativa para complementar el cabello con un detalle suave y tierno.', 'Accesorios', 6600.00, 2300.00, 420, 96, NULL, 1, '2026-09-27 00:01:01'),
(100, 'ACC-0098', 'Cartón set pinza y piojitos niña', 'Presentación para niña que combina pinzas y piojitos con diseño de moño en diferentes tonos pastel. La variedad de accesorios permite crear combinaciones sencillas y darle un toque especial a los peinados infantiles.', 'Accesorios', 3600.00, 1800.00, 450, 108, NULL, 1, '2026-09-27 00:01:01'),
(101, 'ACC-0099', 'Cartón set colero y pinzas', 'Conjunto de colero y pinzas en tela estampada con puntos, disponible en blanco y negro. Su diseño coordinado facilita crear peinados combinados con un estilo clásico, juvenil y fácil de llevar.', 'Accesorios', 3200.00, 1600.00, 440, 108, NULL, 1, '2026-09-27 00:01:01'),
(102, 'ACC-0100', 'Cartón set piojitos y colero flor', 'Combinación de piojitos y colero con diseño de flor en tonos pastel, pensada para complementar peinados infantiles de manera delicada. Sus detalles decorativos aportan un toque alegre y femenino.', 'Accesorios', 3600.00, 1800.00, 440, 108, NULL, 1, '2026-09-27 00:01:01'),
(103, 'ACC-0101', 'Set de pinza x2 en tela brillante', 'Dos piezas elaboradas en tela brillante y decoradas con apliques, ideales para aportar textura y luminosidad al peinado. Una combinación práctica para alternar estilos y añadir detalles decorativos al cabello.', 'Accesorios', 3400.00, 1700.00, 440, 108, NULL, 1, '2026-09-27 00:01:01'),
(104, 'ACC-0102', 'Topo de seguridad x12 surtido', 'Presentación de doce pares de aretes de seguridad con diferentes diseños, pensados para ofrecer variedad al momento de elegir. Su formato surtido permite contar con múltiples estilos en un solo paquete.', 'Accesorios', 4000.00, 2000.00, 420, 96, NULL, 1, '2026-09-27 00:01:01'),
(105, 'ACC-0103', 'Topo de seguridad esmaltado x12', 'Paquete de doce pares de aretes de seguridad con acabado esmaltado y un único diseño. Su presentación uniforme resulta práctica para quienes prefieren mantener un estilo definido y delicado.', 'Accesorios', 6400.00, 3200.00, 410, 96, NULL, 1, '2026-09-27 00:01:01'),
(106, 'ACC-0104', 'Cadena de acero dorada', 'Cadena elaborada en acero y disponible en diferentes diseños con acabado dorado. Sus opciones permiten elegir entre distintos estilos para complementar accesorios y looks con un toque elegante.', 'Accesorios', 24600.00, 12300.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(107, 'ACC-0105', 'Cadena de acero con covergold', 'Diseños elaborados en acero con dije en covergold y opciones en tonos plateado y dorado. La variedad de acabados permite encontrar diferentes estilos para complementar looks de manera delicada y versátil.', 'Accesorios', 19600.00, 9800.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(108, 'ACC-0106', 'Juego de cadena, dije y topo', 'Conjunto que combina cadena en acero, dije en covergold y topitos en acero en tonos dorado y plateado. Una propuesta coordinada que reúne varios accesorios para crear un look completo y armonioso.', 'Accesorios', 19600.00, 9800.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(109, 'ACC-0107', 'Topo de acero dorado', 'Aretes tipo topo elaborados en acero y disponibles en diferentes diseños con acabado dorado. Son una alternativa versátil para complementar distintos estilos de manera sencilla y elegante.', 'Accesorios', 10600.00, 5300.00, 430, 96, NULL, 1, '2026-09-27 00:01:01'),
(110, 'ACC-0108', 'Set topo x3 pares en rodio', 'Presentación de tres pares de topitos en rodio con diseños surtidos y opciones en tonos dorado y plateado. Permite variar de estilo y combinar diferentes acabados según la ocasión.', 'Accesorios', 19000.00, 9500.00, 440, 96, NULL, 1, '2026-09-27 00:01:01'),
(111, 'ACC-0109', 'Set topo x3 pares en rodio', 'Tres pares de topitos en rodio disponibles en tonos dorado y plateado, ideales para contar con diferentes opciones de uso. Su variedad de acabados facilita combinarlos con distintos accesorios y estilos.', 'Accesorios', 26000.00, 13000.00, 450, 108, NULL, 1, '2026-09-27 00:01:01'),
(112, 'ACC-0110', 'Pulsera de rodio surtida', 'Pulseras en rodio con diferentes diseños y acabados en tonos dorado y plateado. Una selección versátil para complementar el look con un accesorio delicado y adaptable a diferentes ocasiones.', 'Accesorios', 48000.00, 24500.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(113, 'ACC-0111', 'Pulsera de acero surtida', 'Diseños variados elaborados en acero, ideales para quienes buscan accesorios versátiles y fáciles de combinar. Su variedad permite elegir diferentes estilos para complementar looks cotidianos o más especiales.', 'Accesorios', 42000.00, 22000.00, 445, 108, NULL, 1, '2026-09-27 00:01:01'),
(114, 'ACC-0112', 'Pulsera de acero dorado y oro rosa', 'Diseño en acero con opciones de tono dorado y oro rosa, combinando acabados cálidos y femeninos. Es una pieza fácil de integrar con otros accesorios y perfecta para darle un detalle elegante al look.', 'Accesorios', 19600.00, 9800.00, 420, 108, NULL, 1, '2026-09-27 00:01:01'),
(115, 'ACC-0113', 'Cadena de rodio', 'Cadena elaborada en rodio con diferentes diseños y opciones en tonos dorado y plateado. Su variedad permite elegir entre estilos clásicos y modernos para complementar diferentes combinaciones de accesorios.', 'Accesorios', 29600.00, 14800.00, 415, 108, NULL, 1, '2026-09-27 00:01:01'),
(116, 'ACC-0114', 'Aro de rodio con brillantes', 'Aros elaborados en rodio con diferentes diseños y pequeños brillantes que aportan luminosidad al accesorio. Disponibles en tonos dorado y plateado para adaptarse fácilmente a distintos estilos.', 'Accesorios', 64000.00, 32000.00, 410, 108, NULL, 1, '2026-09-27 00:01:01'),
(117, 'ACC-0115', 'Juego cadena y topo dorado', 'Conjunto coordinado de cadena y topitos en acero con acabado dorado. Una combinación práctica para crear un look uniforme y elegante utilizando ambos accesorios en una misma ocasión.', 'Accesorios', 7200.00, 3600.00, 430, 108, NULL, 1, '2026-09-27 00:01:01'),
(118, 'ACC-0116', 'Juego cadena y topo plateado', 'Set compuesto por cadena y topitos en acero con acabado plateado, ideal para quienes prefieren accesorios de apariencia clásica y versátil. Sus piezas combinan fácilmente entre sí para lograr un acabado armonioso.', 'Accesorios', 6800.00, 3400.00, 420, 108, NULL, 1, '2026-09-27 00:01:01'),
(119, 'ACC-0117', 'Cartón arete gancho español x12', 'Presentación de doce aretes tipo gancho español en acero y diseños surtidos. Ofrece variedad de estilos en un solo paquete, ideal para contar con diferentes opciones de accesorios y combinarlas según la ocasión.', 'Accesorios', 105600.00, 52800.00, 350, 96, NULL, 1, '2026-09-27 00:01:01'),
(120, 'ACC-0118', 'Cartón topo de acero x12', 'Paquete de doce topitos en acero con diferentes diseños, pensado para ofrecer variedad y facilidad de combinación. Su presentación permite contar con múltiples alternativas para complementar distintos looks.', 'Accesorios', 100800.00, 50400.00, 350, 96, NULL, 1, '2026-09-27 00:01:01'),
(121, 'ACC-0119', 'Set cadena y topo niña esmaltado', 'Conjunto infantil de cadena y topitos con acabado esmaltado y diferentes diseños, pensado para complementar looks de niña con accesorios coloridos, delicados y coordinados.', 'Accesorios', 17200.00, 8600.00, 410, 108, NULL, 1, '2026-09-27 00:01:01'),
(122, 'ACC-0120', 'Set cadena y arete gancho niña', 'Juego infantil compuesto por cadena y arete tipo gancho español con acabado esmaltado y diseños surtidos. Una combinación pensada para crear un conjunto alegre y coordinado con diferentes detalles decorativos.', 'Accesorios', 17200.00, 8600.00, 410, 108, NULL, 1, '2026-09-27 00:01:01'),
(123, 'ACC-0121', 'Collar en rodio con dije', 'Collar elaborado en material tipo rodio con dije disponible en diferentes diseños, ofreciendo varias opciones para elegir según el estilo. Su acabado versátil permite combinarlo fácilmente con otros accesorios y complementar looks tanto sencillos como más', 'Accesorios', 13600.00, 6800.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(124, 'ACC-0122', 'Collar en rodio con dije', 'Diseño con cadena en acabado rodio y dije en diferentes opciones decorativas, pensado para aportar un detalle especial al atuendo. Su variedad de diseños permite encontrar alternativas para distintos gustos y ocasiones.', 'Accesorios', 15600.00, 7800.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(125, 'ACC-0123', 'Collar en rodio con dije', 'Accesorio de apariencia delicada elaborado en rodio, acompañado de dijes disponibles en diferentes diseños. Es una pieza fácil de combinar que puede utilizarse como complemento diario o para darle un toque diferente a un look más elaborado.', 'Accesorios', 17200.00, 8600.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(126, 'ACC-0124', 'Collar en rodio con dije', 'Cadena en acabado rodio con variedad de dijes decorativos para escoger, creando diferentes estilos dentro de una misma referencia. Su diseño permite llevarlo solo o combinarlo con otros accesorios de manera armoniosa.', 'Accesorios', 24000.00, 12000.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(127, 'ACC-0125', 'Set topo y cadena horóscopo', 'Conjunto en tono plateado compuesto por topitos y cadena con diseño inspirado en el horóscopo. Los motivos son surtidos, permitiendo encontrar diferentes opciones con un estilo moderno y especial para complementar el look.', 'Accesorios', 8400.00, 4200.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(128, 'ACC-0126', 'Set topo de seguridad y cadena', 'Conjunto que combina topitos de seguridad y cadena con diseños surtidos inspirados en diferentes personajes. Es una alternativa divertida y versátil para complementar accesorios infantiles o juveniles con motivos llamativos y variados.', 'Accesorios', 16000.00, 8000.00, 400, 96, NULL, 1, '2026-09-27 00:01:01'),
(129, 'ACC-0127', 'Cartón topo perla', 'Presentación de topitos con detalles tipo perla, disponibles en diferentes colores y formas, elaborados en acero inoxidable. La variedad de diseños permite elegir entre opciones delicadas y fáciles de combinar para distintos estilos.', 'Accesorios', 24000.00, 12000.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(130, 'ACC-0128', 'Candonga y topo dorado', 'Set compuesto por candonga y topo elaborados en acero, disponibles en diferentes diseños con acabado dorado. La combinación de ambas piezas permite crear un look coordinado y añadir un detalle elegante y moderno al conjunto.', 'Accesorios', 9400.00, 4600.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(131, 'ACC-0129', 'Candonga y topo dorado', 'Conjunto de acero en tono dorado que reúne una candonga y un topo en diferentes diseños. Su presentación coordinada resulta práctica para combinar ambos accesorios y conseguir un acabado uniforme y sofisticado.', 'Accesorios', 17800.00, 8900.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(132, 'ACC-0130', 'Candonga y topo dorado', 'Diseño combinado de candonga y topo en acero con acabado dorado y opciones surtidas. Es una propuesta versátil que permite variar el estilo sin perder la armonía entre las piezas.', 'Accesorios', 13600.00, 6800.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(133, 'ACC-0131', 'Topo de acero dorado', 'Topitos elaborados en acero con acabado dorado y disponibles en diferentes diseños. Su formato versátil permite utilizarlos como accesorio diario y combinarlos fácilmente con otras piezas de joyería.', 'Accesorios', 9600.00, 4800.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(134, 'ACC-0132', 'Set candonga x3 pares', 'Presentación de tres pares de candongas en acero con diseños surtidos y acabado plateado. La variedad de estilos permite alternar las piezas según la ocasión y contar con diferentes opciones para complementar distintos looks.', 'Accesorios', 13600.00, 6800.00, 480, 108, NULL, 1, '2026-09-27 00:01:01'),
(135, 'ACC-0133', 'Arete largo en covergold', 'Diseño de arete largo elaborado en covergold, disponible en diferentes estilos y acabados en tono dorado. Su formato alargado aporta movimiento y presencia, convirtiéndolo en un accesorio ideal para destacar el look.', 'Accesorios', 9000.00, 4500.00, 450, 108, NULL, 1, '2026-09-27 00:01:01'),
(136, 'ACC-0134', 'Arete largo en covergold', 'Aretes de diseño largo con acabado en covergold y diferentes opciones surtidas. Son ideales para quienes buscan un accesorio llamativo que aporte elegancia y complemente de manera especial diferentes estilos de vestuario.', 'Accesorios', 8000.00, 4000.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(137, 'ACC-0135', 'Topo balín dorado mediano', 'Topo tipo balín de tamaño mediano elaborado en acero inoxidable con acabado dorado. Su diseño sencillo y clásico lo convierte en una pieza fácil de llevar y combinar con otros accesorios en diferentes ocasiones.', 'Accesorios', 21600.00, 10800.00, 429, 108, NULL, 1, '2026-09-27 00:01:01'),
(138, 'ACC-0136', 'Topo balín plateado mediano', 'Topo tipo balín de tamaño mediano fabricado en acero inoxidable con acabado plateado. Su estilo limpio y versátil permite utilizarlo cómodamente como accesorio cotidiano y combinarlo con diferentes tipos de joyería.', 'Accesorios', 21600.00, 10800.00, 430, 108, NULL, 1, '2026-09-27 00:01:01'),
(139, 'ACC-0137', 'Candonga figura dorada', 'Candonga elaborada en acero con diseño de figura y acabado completamente dorado, disponible en diferentes tamaños. Sus formas decorativas aportan un detalle llamativo y permiten escoger una opción acorde con cada estilo.', 'Accesorios', 4000.00, 2000.00, 449, 108, NULL, 1, '2026-09-27 00:01:01'),
(140, 'ACC-0138', 'Collar en covergold rodinado', 'Collar elaborado en covergold con acabado rodinado y variedad de dijes surtidos. Su combinación de materiales y diseños ofrece una apariencia delicada y moderna, ideal para complementar looks de diferentes estilos.', 'Accesorios', 19800.00, 9900.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(141, 'ACC-0139', 'Topo en rodio surtido', 'Topitos elaborados en rodio con diferentes diseños y opciones en tonos dorado y plateado. La variedad permite alternar estilos y elegir fácilmente una pieza que combine con diferentes prendas y accesorios.', 'Accesorios', 8400.00, 4200.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(142, 'ACC-0140', 'Set topo x3 pares en acero', 'Presentación de tres pares de topitos en acero con diseños diferentes, pensados para ofrecer variedad y múltiples opciones de uso. Son accesorios versátiles que pueden combinarse fácilmente según el estilo o la ocasión.', 'Accesorios', 5400.00, 2700.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(143, 'ACC-0141', 'Aretes cherry en rodio', 'Aretes elaborados en material tipo rodio con diseños inspirados en cerezas y diferentes opciones disponibles. Su detalle decorativo aporta un toque juvenil y llamativo, ideal para complementar el look con un accesorio diferente.', 'Accesorios', 15800.00, 7900.00, 460, 108, NULL, 1, '2026-09-27 00:01:01'),
(144, 'PAP-0142', 'Porta carnet surtido', 'Porta carnet disponible en diferentes diseños y personajes, pensado para llevar y proteger el carnet de manera práctica. Sus motivos variados permiten elegir una opción acorde con diferentes gustos y estilos.', 'Papelería', 9000.00, 4500.00, 500, 108, NULL, 1, '2026-09-27 00:01:01'),
(145, 'REL-0143', 'G-FORCE AK25172', 'Reloj de diseño deportivo en combinación verde y negro, con función de doble horario y resistencia al agua. Incorpora una correa de resina con diseño ergonómico, pensada para ofrecer comodidad y acompañar actividades de uso cotidiano.', 'Relojería', 90000.00, NULL, 10, 2, NULL, 1, '2026-09-27 00:01:01'),
(146, 'REL-0144', 'G-FORCE Gold Edition', 'Modelo de apariencia robusta inspirado en un estilo militar, con acabado camuflado y funciones como cronómetro y luz LED integrada. Su diseño combina funcionalidad y presencia, ideal para quienes prefieren relojes deportivos de aspecto llamativo.', 'Relojería', 100000.00, NULL, 10, 2, NULL, 1, '2026-09-27 00:01:01'),
(147, 'REL-0145', 'G-FORCE Chrono Sport', 'Reloj de caja cuadrada con acabado en oro rosa y correa de silicona negra de alta resistencia. Su diseño deportivo y moderno combina una apariencia actual con materiales pensados para acompañar diferentes actividades y estilos.', 'Relojería', 115000.00, NULL, 8, 2, NULL, 1, '2026-09-27 00:01:01'),
(148, 'REL-0146', 'G-FORCE Chrono GF8051', 'Modelo con caja hexagonal en azul metálico y pulsera de acero inoxidable, creando una combinación moderna y llamativa. Su estructura y acabado le aportan una apariencia deportiva, ideal para complementar looks casuales y urbanos.', 'Relojería', 125000.00, NULL, 8, 2, NULL, 1, '2026-09-27 00:01:01'),
(149, 'REL-0147', 'CURREN Chronograph negro y oro', 'Reloj de estilo ejecutivo con caja en acero negro y detalles en tono oro rosa. Su diseño combina una apariencia elegante con elementos de inspiración deportiva, convirtiéndolo en una opción versátil para diferentes ocasiones y estilos.', 'Relojería', 110000.00, NULL, 9, 2, NULL, 1, '2026-09-27 00:01:01'),
(150, 'REL-0148', 'CURREN Chronograph Racing', 'Diseño deportivo con esfera dinámica y detalles en color rojo que resaltan su apariencia. Está pensado para complementar estilos activos y casuales, aportando un aspecto moderno y con mayor presencia en la muñeca.', 'Relojería', 110000.00, NULL, 8, 2, NULL, 1, '2026-09-27 00:01:01'),
(151, 'REL-0149', 'CURREN Classic Leather', 'Modelo de inspiración clásica con correa de cuero genuino en tono marrón y una estética mecánica de aire vintage. Su combinación de materiales y diseño aporta una apariencia elegante y atemporal, ideal para estilos más sobrios.', 'Relojería', 95000.00, NULL, 10, 2, NULL, 1, '2026-09-27 00:01:01'),
(152, 'REL-0150', 'CASIO EDIFICE Chronograph', 'Reloj de diseño deportivo y ejecutivo con estructura en acero inoxidable y acabado Black IP. Incorpora cronógrafo, regla de cálculo y resistencia al agua de hasta 100 metros, combinando funciones prácticas con una apariencia moderna y sofisticada.', 'Relojería', 650000.00, NULL, 3, 1, NULL, 1, '2026-09-27 00:01:02'),
(153, 'REL-0151', 'Smartwatch Táctico Pro', 'Reloj inteligente con diseño de chasis resistente y funciones orientadas al uso diario, incluyendo monitoreo de salud y recepción de notificaciones. Su apariencia robusta y funcional lo convierte en una opción versátil para actividades cotidianas y estilo', 'Relojería', 230000.00, 0.00, 4, 4, NULL, 1, '2026-09-27 00:01:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_imagenes`
--

CREATE TABLE `producto_imagenes` (
  `id_imagen` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `nombre_imagen` varchar(150) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_imagen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_imagenes`
--

INSERT INTO `producto_imagenes` (`id_imagen`, `id_producto`, `nombre_imagen`, `orden`) VALUES
(797, 1, 'ACC-0001.jpg', 1),
(798, 2, 'ACC-0002.jpg', 1),
(799, 3, 'ACC-0003.jpg', 1),
(800, 4, 'ACC-0004.jpg', 1),
(801, 5, 'ACC-0005.png', 1),
(802, 6, 'ACC-0006.jpg', 1),
(803, 7, 'ACC-0007.jpg', 1),
(804, 8, 'ACC-0008.jpg', 1),
(805, 9, 'ACC-0009.jpg', 1),
(806, 10, 'ACC-0010.jpg', 1),
(807, 11, 'ACC-0011-1.jpg', 1),
(808, 11, 'ACC-0011-02.jpg', 2),
(809, 11, 'ACC-0011-03.jpg', 3),
(810, 12, 'ACC-0012.jpg', 1),
(811, 13, 'ACC-0013.jpg', 1),
(812, 14, 'ACC-0014.jpg', 1),
(813, 15, 'ACC-0015.jpg', 1),
(814, 16, 'ACC-0016.jpg', 1),
(815, 17, 'ACC-0017.jpg', 1),
(816, 18, 'ACC-0018.png', 1),
(817, 19, 'ACC-0019.png', 1),
(818, 20, 'ACC-0020.jpg', 1),
(819, 21, 'ACC-0021.jpg', 1),
(820, 22, 'ACC-0022.jpg', 1),
(821, 23, 'ACC-0023.jpg', 1),
(822, 24, 'ACC-0024.png', 1),
(823, 25, 'ACC-0025.jpg', 1),
(824, 26, 'ACC-0026.jpg', 1),
(825, 27, 'ACC-0027.jpg', 1),
(826, 28, 'ACC-0028.jpg', 1),
(827, 29, 'ACC-0029.jpg', 1),
(828, 30, 'ACC-0030.jpg', 1),
(829, 31, 'ACC-0031.jpg', 1),
(830, 32, 'ACC-0032.jpg', 1),
(831, 33, 'ACC-0033.jpg', 1),
(832, 34, 'ACC-0034.jpg', 1),
(833, 35, 'ACC-0035.jpg', 1),
(834, 36, 'ACC-0036.jpg', 1),
(835, 37, 'ACC-0037-01.jpg', 1),
(836, 37, 'ACC-0037-002.jpg', 2),
(837, 38, 'ACC-0038-01.jpg', 1),
(838, 38, 'ACC-0038-02.jpg', 2),
(839, 38, 'ACC-0038-03.jpg', 3),
(840, 38, 'ACC-0038-04.jpg', 4),
(841, 38, 'ACC-0038-05.jpg', 5),
(842, 38, 'ACC-0038-06.jpg', 6),
(843, 39, 'ACC-0039.jpg', 1),
(844, 40, 'ACC-0040.jpg', 1),
(845, 41, 'ACC-0041.jpg', 1),
(846, 42, 'ACC-0042.jpg', 1),
(847, 43, 'ACC-0043.png', 1),
(848, 44, 'ACC-0044.jpg', 1),
(849, 47, 'ACC-0045.png', 1),
(850, 48, 'ACC-0046.png', 1),
(851, 49, 'ACC-0047-001.jpg', 1),
(852, 49, 'ACC-0047-002.jpg', 2),
(853, 49, 'ACC-0047-003.jpg', 3),
(854, 49, 'ACC-0047-004.jpg', 4),
(855, 50, 'ACC-0048-001.jpg', 1),
(856, 50, 'ACC-0048-002.jpg', 2),
(857, 50, 'ACC-0048-003.jpg', 3),
(858, 50, 'ACC-0048-004.jpg', 4),
(859, 51, 'ACC-0049-001.jpg', 1),
(860, 51, 'ACC-0049-002.jpg', 2),
(861, 51, 'ACC-0049-003.jpg', 3),
(862, 52, 'ACC-0050-001.jpg', 1),
(863, 52, 'ACC-0050-002.jpg', 2),
(864, 52, 'ACC-0050-003.jpg', 3),
(865, 52, 'ACC-0050-004.jpg', 4),
(866, 52, 'ACC-0050-005.jpg', 5),
(867, 52, 'ACC-0050-006.jpg', 6),
(868, 53, 'ACC-0051.jpg', 1),
(869, 54, 'ACC-0052.jpg', 1),
(870, 55, 'ACC-0053.jpg', 1),
(871, 56, 'ACC-0054.jpg', 1),
(872, 57, 'ACC-0055.jpg', 1),
(873, 58, 'ACC-0056.jpg', 1),
(874, 59, 'ACC-0057.jpg', 1),
(875, 60, 'ACC-0058.jpg', 1),
(876, 61, 'ACC-0059.jpg', 1),
(877, 62, 'ACC-0060.jpg', 1),
(878, 63, 'ACC-0061.jpg', 1),
(879, 64, 'ACC-0062.jpg', 1),
(880, 65, 'ACC-0063.jpg', 1),
(881, 66, 'ACC-0064.jpg', 1),
(882, 67, 'ACC-0065.jpg', 1),
(883, 68, 'ACC-0066.jpg', 1),
(884, 69, 'ACC-0067.jpg', 1),
(885, 70, 'ACC-0068.jpg', 1),
(886, 71, 'ACC-0069.jpg', 1),
(887, 72, 'ACC-0070.jpg', 1),
(888, 73, 'ACC-0071.jpg', 1),
(889, 74, 'ACC-0072.jpg', 1),
(890, 75, 'ACC-0073.jpg', 1),
(891, 76, 'ACC-0074.jpg', 1),
(892, 77, 'ACC-0075.jpg', 1),
(893, 78, 'ACC-0076-001.jpg', 1),
(894, 78, 'ACC-0076-002.jpg', 2),
(895, 78, 'ACC-0076-003.jpg', 3),
(896, 79, 'ACC-0077-001.jpg', 1),
(897, 79, 'ACC-0077-002.jpg', 2),
(898, 79, 'ACC-0077-003.jpg', 3),
(899, 79, 'ACC-0077-004.jpg', 4),
(900, 80, 'ACC-0078.jpg', 1),
(901, 81, 'ACC-0079.jpg', 1),
(902, 82, 'ACC-0080.jpg', 1),
(903, 83, 'ACC-0081.jpg', 1),
(904, 84, 'ACC-0082.jpg', 1),
(905, 85, 'ACC-0083.jpg', 1),
(906, 86, 'ACC-0084-001.jpg', 1),
(907, 86, 'ACC-0084-002.jpg', 2),
(908, 86, 'ACC-0084-003.jpg', 3),
(909, 87, 'ACC-0085.jpg', 1),
(910, 88, 'ACC-0086.jpg', 1),
(911, 89, 'ACC-0087.jpg', 1),
(912, 90, 'ACC-0088.jpg', 1),
(913, 91, 'ACC-0089.jpg', 1),
(914, 92, 'ACC-0090.jpg', 1),
(915, 93, 'ACC-0091.jpg', 1),
(916, 94, 'ACC-0092.jpg', 1),
(917, 95, 'ACC-0093.jpg', 1),
(918, 96, 'ACC-0094.jpg', 1),
(919, 97, 'ACC-0095.jpg', 1),
(920, 98, 'ACC-0096.jpg', 1),
(921, 99, 'ACC-0097.jpg', 1),
(922, 100, 'ACC-0098.jpg', 1),
(923, 101, 'ACC-0099.jpg', 1),
(924, 102, 'ACC-0100.jpg', 1),
(925, 103, 'ACC-0101.jpg', 1),
(926, 104, 'ACC-0102.jpg', 1),
(927, 105, 'ACC-0103.jpg', 1),
(928, 106, 'ACC-0104.jpg', 1),
(929, 107, 'ACC-0105.jpg', 1),
(930, 108, 'ACC-0106.jpg', 1),
(931, 109, 'ACC-0107.jpg', 1),
(932, 110, 'ACC-0108.jpg', 1),
(933, 111, 'ACC-0109.jpg', 1),
(934, 112, 'ACC-0110.jpg', 1),
(935, 113, 'ACC-0111.jpg', 1),
(936, 114, 'ACC-0112.jpg', 1),
(937, 115, 'ACC-0113.jpg', 1),
(938, 116, 'ACC-0114.jpg', 1),
(939, 117, 'ACC-0115.jpg', 1),
(940, 118, 'ACC-0116.jpg', 1),
(941, 119, 'ACC-0117.jpg', 1),
(942, 120, 'ACC-0118.jpg', 1),
(943, 121, 'ACC-0119.jpg', 1),
(944, 122, 'ACC-0120.jpg', 1),
(945, 123, 'ACC-0121.jpg', 1),
(946, 124, 'ACC-0122.jpg', 1),
(947, 125, 'ACC-0123.jpg', 1),
(948, 126, 'ACC-0124.jpg', 1),
(949, 127, 'ACC-0125.jpg', 1),
(950, 128, 'ACC-0126.jpg', 1),
(951, 129, 'ACC-0127.jpg', 1),
(952, 130, 'ACC-0128.jpg', 1),
(953, 131, 'ACC-0129.jpg', 1),
(954, 132, 'ACC-0130.jpg', 1),
(955, 133, 'ACC-0131.jpg', 1),
(956, 134, 'ACC-0132.jpg', 1),
(957, 135, 'ACC-0133.jpg', 1),
(958, 136, 'ACC-0134.jpg', 1),
(959, 137, 'ACC-0135.jpg', 1),
(960, 138, 'ACC-0136.jpg', 1),
(961, 139, 'ACC-0137.jpg', 1),
(962, 140, 'ACC-0138.jpg', 1),
(963, 141, 'ACC-0139.jpg', 1),
(964, 142, 'ACC-0140.jpg', 1),
(965, 143, 'ACC-0141.jpg', 1),
(969, 145, 'REL-0143.png', 1),
(970, 146, 'REL-0144.png', 1),
(971, 147, 'REL-0145.png', 1),
(972, 148, 'REL-0146.png', 1),
(973, 149, 'REL-0147.png', 1),
(974, 150, 'REL-0148.png', 1),
(975, 151, 'REL-0149.png', 1),
(976, 152, 'REL-0150.png', 1),
(977, 153, 'REL-0151.png', 1),
(978, 144, 'PAP-0142-001.jpg', 1),
(979, 144, 'PAP-0142-002.jpg', 2),
(980, 144, 'PAP-0142-003.jpg', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `rol` enum('ADMINISTRADOR','VENDEDOR','CLIENTE') NOT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `codigo_recuperacion` varchar(6) DEFAULT NULL,
  `codigo_recuperacion_expira` datetime DEFAULT NULL,
  `correo_verificado` tinyint(1) NOT NULL DEFAULT 1,
  `token_verificacion` varchar(64) DEFAULT NULL,
  `token_verificacion_expira` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `contraseña`, `rol`, `estado`, `fecha_creacion`, `codigo_recuperacion`, `codigo_recuperacion_expira`, `correo_verificado`, `token_verificacion`, `token_verificacion_expira`) VALUES
(1, 'Administrador prueba', 'admin@sigespad.com', '$2b$10$uFBaesnDRgqKN06ay5WFV.U6zbmqFdbtVjk35we/6E6SsbhyF3g5e', 'ADMINISTRADOR', 1, '2026-08-23 23:18:38', NULL, NULL, 1, NULL, NULL),
(2, 'Vendedor prueba', 'vendedor2@sigespad.com', '$2b$10$jf34OsVt1mT204/as3usNuEg5oKLgshglfDzQ/w5UoMc9sxPx6R5.', 'VENDEDOR', 1, '2026-08-24 01:11:18', NULL, NULL, 1, NULL, NULL),
(4, 'Cliente Prueba', 'cliente@sigespad.com', '$2b$10$puD8i8Vo/AdKG.aq3mAujutC2y4yjt4BjhLi12VtlEUee.ddFZDfO', 'CLIENTE', 1, '2026-09-05 21:35:56', NULL, NULL, 1, NULL, NULL),
(5, 'Karol Zapata', 'karol111704@gmail.com', '$2b$10$1mSmdXbTwdmQL3lbClVmguYp.PlPRKCa1WJmySZfMilpODy8VTE3q', 'CLIENTE', 0, '2026-10-11 18:40:51', '224105', '2026-10-11 14:21:01', 1, NULL, NULL),
(6, 'Karol Zapata', 'kzapata15@uan.edu.co', '$2b$10$XYbdEWbDy8fYbnpGQBuQieY1TLNbN56vkngsWGZG0IgjmX1WiwAAS', 'CLIENTE', 1, '2026-10-12 21:18:24', NULL, NULL, 1, NULL, NULL),
(7, 'Yolanda Guevara', 'karolsiete7@gmail.com', '$2b$10$z/CbxKju0crbIl7G/uaHgurKx2cUBHQ/uIEF8KhgkTW9fYCq01pm.', 'CLIENTE', 1, '2026-10-12 21:59:59', NULL, NULL, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('PENDIENTE','COMPLETADA','CANCELADA') DEFAULT 'COMPLETADA',
  `canal` enum('PRESENCIAL','WEB') NOT NULL DEFAULT 'PRESENCIAL',
  PRIMARY KEY (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `id_usuario`, `fecha_venta`, `total`, `estado`, `canal`) VALUES
(5, 1, '2026-09-21 02:38:01', 14000.00, 'CANCELADA', 'PRESENCIAL'),
(6, 2, '2026-09-28 12:10:49', 41800.00, 'COMPLETADA', 'PRESENCIAL'),
(7, 2, '2026-09-28 12:17:07', 104600.00, 'COMPLETADA', 'PRESENCIAL'),
(8, 2, '2026-09-28 20:05:17', 745000.00, 'CANCELADA', 'PRESENCIAL'),
(9, 2, '2026-10-17 18:35:08', 25600.00, 'COMPLETADA', 'PRESENCIAL');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD KEY `id_venta` (`id_venta`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `movimientos_inventario`
--


--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD KEY `fk_pago_venta` (`id_venta`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD UNIQUE KEY `uq_productos_codigo` (`codigo`);

--
-- Indices de la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD KEY `id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=164;

--
-- AUTO_INCREMENT de la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=981;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `fk_pago_venta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`);

--
-- Filtros para la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD CONSTRAINT `producto_imagenes_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
