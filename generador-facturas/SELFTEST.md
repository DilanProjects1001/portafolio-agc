# SELFTEST — Generador de Facturas y Presupuestos

Documento de pruebas del proyecto. Se divide en dos partes: **pruebas automáticas**
(pendientes de `check.js`, próxima iteración) y **pruebas manuales** que se pueden hacer
ahora abriendo `index.html` en el navegador.

## Estado actual

- ✅ Interfaz creada (`index.html` + `style.css` + `script.js`).
- ✅ Lógica de cálculo escrita y exportada para Node (`calcularTotales`, `importeLinea`,
  `aNumero`, `redondear2`, `formatoImporte`).
- ⏳ **Pendiente:** `check.js` con pruebas automáticas (exit 0). Se añadirá en la próxima
  iteración; las funciones de cálculo ya están aisladas para poder probarse sin navegador.
- ⏳ **Pendiente:** captura de pantalla en `ui_shots/` (evaluación visual).

## Pruebas automáticas previstas (para `check.js`)

Estas comprobaciones se automatizarán sobre las funciones puras de `script.js`:

| # | Caso | Entrada | Resultado esperado |
|---|------|---------|--------------------|
| 1 | Importe de una línea | cantidad=3, precio=10 | 30 |
| 2 | Totales con IVA 21% | items=[{2, 50}], IVA=21 | subtotal=100 · iva=21 · total=121 |
| 3 | Varios ítems | [{1,10},{2,5,5→}] | subtotal correcto sumado |
| 4 | Sin impuesto | IVA=0 | iva=0 · total=subtotal |
| 5 | Decimales con coma | precio="10,50" | se interpreta como 10.5 |
| 6 | Entradas vacías/no numéricas | precio="" | cuentan como 0, no rompen |

## Pruebas manuales (hacer ahora en el navegador)

1. **Abrir** `index.html` con doble clic. Debe verse el documento con dos filas vacías.
2. **Agregar fila**: pulsar «➕ Agregar fila» → aparece una fila nueva.
3. **Escribir ítems**: poner cantidad y precio → el importe de la fila y los totales
   (subtotal, IVA, total) se actualizan automáticamente.
4. **Cambiar IVA**: cambiar el porcentaje (ej. 21 → 10) → el IVA y el total se recalculan
   y la etiqueta muestra «IVA (10%)».
5. **Eliminar fila**: pulsar «×» en una fila → desaparece y los totales bajan.
6. **Guardado**: recargar la página (F5) → los datos escritos siguen ahí (localStorage).
7. **Imprimir/PDF**: pulsar «🖨️ Imprimir / PDF» → se abre el diálogo de impresión sin los
   botones ni controles (solo el documento). Elegir «Guardar como PDF».
8. **Limpiar**: pulsar «🗑️ Limpiar» → pide confirmación y deja el documento vacío.

## Cómo se ejecutará el autotest (cuando exista check.js)

```
node check.js
```

- **Exit 0** → todas las pruebas pasaron.
- **Exit 1** → alguna prueba falló.
