# Conversor CSV ↔ JSON 🔄

Una **app web sencilla** para convertir datos entre los dos formatos más comunes:

- **CSV** — el formato de tablas que exporta Excel y Google Sheets (filas y columnas).
- **JSON** — el formato que usan las webs y los programas.

Pegas tus datos, eliges la dirección (**CSV → JSON** o **JSON → CSV**) y obtienes el
resultado al instante. Además **avisa** si tus datos tienen problemas (filas con columnas
de más o de menos, encabezados vacíos o repetidos).

## Cómo usarla

1. Abre el archivo **`index.html`** con doble clic (se abre en tu navegador).
2. No necesitas instalar nada ni conexión a internet: **todo se procesa en tu equipo**,
   tus datos nunca salen de tu computadora.
3. Pega tu CSV o tu JSON en el panel de la izquierda, elige el separador si hace falta y
   pulsa el botón de conversión. Puedes **copiar** o **descargar** el resultado.

Botones de ayuda: **Ejemplo** carga datos de muestra y **Limpiar** vacía los paneles.

## Qué hace bien

- Respeta los campos con **comas dentro** (`"García, Ana"`) y las **comillas escapadas** (`""`).
- Admite separador **coma**, **punto y coma** o **tabulación**.
- Si algunos objetos JSON tienen claves distintas, **une todas las columnas** y deja
  vacías las celdas que falten.
- Convierte de ida y vuelta sin perder datos (CSV → JSON → CSV).

## Ejemplo

Entrada CSV:

```
nombre,edad,ciudad
"García, Ana",30,Madrid
Luis,25,Bogotá
```

Salida JSON:

```json
[
  { "nombre": "García, Ana", "edad": "30", "ciudad": "Madrid" },
  { "nombre": "Luis", "edad": "25", "ciudad": "Bogotá" }
]
```

## Verificación

El archivo `check.js` comprueba automáticamente que las conversiones son correctas:

```
node check.js
```

Sale con código 0 si todo está bien. Ver detalles en `SELFTEST.md`.

## Ángulo de monetización

Puede ofrecerse como **herramienta gratuita gancho** para atraer tráfico de desarrolladores,
analistas y personas de oficina. Una versión "Pro" podría añadir conversión a/desde Excel
(.xlsx), transformación de columnas, límites más altos de tamaño y una API por suscripción.

---

# CSV ↔ JSON Converter 🔄 (English)

A **simple web app** to convert data between the two most common formats:

- **CSV** — the spreadsheet format exported by Excel and Google Sheets.
- **JSON** — the format used by websites and programs.

Paste your data, pick the direction (**CSV → JSON** or **JSON → CSV**) and get the result
instantly. It also **warns** you when the data has issues (rows with too many/few columns,
empty or duplicate headers).

## How to use it

1. Open **`index.html`** by double-clicking it (opens in your browser).
2. No install and no internet needed: **everything runs on your machine**, your data never
   leaves your computer.
3. Paste your CSV or JSON in the left panel, choose the separator if needed, and press the
   convert button. You can **copy** or **download** the result.

## What it handles well

- Fields with **commas inside** (`"Smith, John"`) and **escaped quotes** (`""`).
- **Comma**, **semicolon** or **tab** separators.
- JSON objects with different keys: it **merges all columns** and leaves missing cells empty.
- Round-trips without data loss (CSV → JSON → CSV).

## Verification

```
node check.js
```

Exits with code 0 if everything is fine. See `SELFTEST.md` for details.

---

_Proyecto del portafolio AGC — generado de forma autónoma._
