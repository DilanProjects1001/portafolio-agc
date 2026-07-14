# SELFTEST — Generador de Firmas de Email

## Qué se prueba

El script `check.js` valida la lógica pura de la app **sin navegador** (solo Node),
importando las funciones desde `app.js`. Ejecuta 27 pruebas:

### Generación de la firma
- `generarFirmaHTML()` devuelve un string HTML no vacío.
- La firma contiene el **nombre**, **cargo**, **empresa**, **correo** y **teléfono**.
- Incluye enlace `mailto:` para el correo.
- Los enlaces de **web**, **LinkedIn** y **Twitter/X** se normalizan con `https://`.
- Aplica el **color de acento** elegido.
- Genera una **tabla con estilos inline** (compatible con Gmail/Outlook).
- Funciona aunque falten los campos opcionales (sin redes no aparece "LinkedIn").

### Validación
- `validarDatos()` acepta datos completos.
- Detecta nombre faltante.
- Detecta correo con formato inválido.

### Utilidades y seguridad
- `normalizarUrl()` añade `https://`, respeta `http://` existente y maneja vacío.
- `escaparHTML()` escapa `<`, `>` y comillas.
- Contenido peligroso en el nombre (`<script>`) queda **escapado** (no se inyecta).

### Copiar (simulado)
- Se simula el portapapeles y se verifica que el texto copiado es exactamente el
  HTML de la firma generada.

### Estructura
- Existen `index.html`, `style.css` y `app.js`.

## Cómo ejecutarlo

```bash
node check.js
```

Termina con **código de salida 0** si las 27 pruebas pasan, o **1** si alguna falla.

## Resultado actual

```
Resumen: 27 pasadas, 0 fallidas.
Todas las pruebas superadas.
exit code: 0
```

## Nota sobre lo no cubierto por check.js

Copiar al portapapeles y descargar el `.html` dependen de APIs del navegador
(`navigator.clipboard`, `Blob`, `URL.createObjectURL`), por lo que se prueban de
forma **simulada** en Node y de forma **real** abriendo `index.html`. La captura
`ui_shots/iter_2.png` muestra la interfaz con el formulario lleno y la firma generada.
