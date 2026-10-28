
import re
from pathlib import Path

archivo = Path(__file__).with_name("sigespad.sql")
salida = archivo.with_name("sigespad_aiven.sql")

if not archivo.exists():
    print("No encuentro:", archivo)
    print("Mueve el .sql a Descargas o corrige la ruta del archivo.")
    raise SystemExit(1)

sql = archivo.read_text(encoding="utf-8")

claves = {
    "categorias": "id_categoria",
    "detalle_venta": "id_detalle",
    "movimientos_inventario": "id_movimiento",
    "pagos": "id_pago",
    "productos": "id_producto",
    "producto_imagenes": "id_imagen",
    "usuarios": "id_usuario",
    "ventas": "id_venta",
}

# Agregar la clave primaria dentro de cada CREATE TABLE.
patron_create = re.compile(
    r"(CREATE TABLE\s+`([^`]+)`\s*\()(.*?)(\)\s*ENGINE\s*=.*?;)",
    re.IGNORECASE | re.DOTALL
)

encontradas = set()

def adaptar_tabla(match):
    nombre = match.group(2)
    columnas = match.group(3)
    cierre = match.group(4)

    if nombre not in claves:
        return match.group(0)

    columna_id = claves[nombre]
    if not re.search(
        rf"`{re.escape(columna_id)}`\s+", columnas
    ):
        raise ValueError(
            f"No se encontró {columna_id} en {nombre}"
        )

    if re.search(r"\bPRIMARY\s+KEY\b", columnas, re.I):
        encontradas.add(nombre)
        return match.group(0)

    encontradas.add(nombre)
    columnas = columnas.rstrip()

    return (
        match.group(1)
        + columnas
        + f",\n  PRIMARY KEY (`{columna_id}`)\n"
        + cierre
    )

sql = patron_create.sub(adaptar_tabla, sql)

faltantes = set(claves) - encontradas
if faltantes:
    raise ValueError(
        "No se adaptaron estas tablas: "
        + ", ".join(sorted(faltantes))
    )

# Quitar las instrucciones posteriores ADD PRIMARY KEY.
patron_alter = re.compile(
    r"ALTER TABLE\s+`([^`]+)`\s+(.*?);",
    re.IGNORECASE | re.DOTALL
)

def adaptar_alter(match):
    nombre = match.group(1)
    clausulas = match.group(2)

    if nombre not in claves:
        return match.group(0)

    partes = re.split(r",\s*(?=ADD\s)", clausulas, flags=re.I)
    partes = [
        p.strip() for p in partes
        if not re.match(r"ADD\s+PRIMARY\s+KEY\b", p.strip(), re.I)
    ]

    if not partes:
        return ""

    return f"ALTER TABLE `{nombre}`\n  " + ",\n  ".join(partes) + ";"

sql = patron_alter.sub(adaptar_alter, sql)

salida.write_text(sql, encoding="utf-8")
print("Archivo preparado:", salida)
print("El archivo original no fue modificado.")
