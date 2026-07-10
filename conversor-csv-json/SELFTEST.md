# SELFTEST — Conversor CSV ↔ JSON

Documento de las pruebas automáticas del proyecto. Las pruebas viven en `check.js` y se
ejecutan con Node.js, sin navegador ni dependencias externas.

## Cómo ejecutar

```
node check.js
```

- **Exit 0** → todas las pruebas pasaron.
- **Exit 1** → alguna prueba falló (se muestra el detalle en consola).

## Qué se prueba

Se verifican las funciones `csvAJson`, `jsonACsv` y `validarCSV` de `script.js`.

| # | Caso | Qué comprueba |
|---|------|----------------|
| 1 | CSV simple → JSON | Convierte 3 columnas y 2 filas al arreglo de objetos correcto. |
| 2 | Comas y comillas dentro de campos | Respeta `"García, Ana"` (coma interna) y `""` (comilla escapada). |
| 3 | JSON → CSV | Genera encabezados y entrecomilla los campos con coma. |
| 4 | Ida y vuelta CSV → JSON → CSV | El CSV original se conserva tras el viaje redondo. |
| 5 | Objetos con claves distintas | Une todas las columnas; las celdas faltantes quedan vacías. |
| 6 | Validación de CSV | No avisa si está bien; detecta filas con columnas de menos. |
| 7 | Entradas inválidas | CSV vacío, JSON mal formado y JSON que no es arreglo de objetos lanzan error. |

## Evaluación visual

La interfaz se revisó visualmente con una captura headless (Edge, perfil aislado) guardada
en `ui_shots/iter_1.png`. Se verificó: buen contraste, botones grandes, dos paneles claros
(Entrada / Resultado), barra de opciones legible y diseño responsivo.

## Resultado de la última ejecución

```
Ejecutando pruebas del conversor CSV ↔ JSON...

Caso 1: CSV simple a JSON
  OK   3 columnas, 2 filas

Caso 2: CSV con comas y comillas dentro de campos
  OK   campo "García, Ana" con coma interna
  OK   comillas dobles escapadas ("")

Caso 3: JSON a CSV
  OK   arreglo de objetos a CSV
  OK   campo con coma se entrecomilla al exportar

Caso 4: ida y vuelta CSV -> JSON -> CSV
  OK   el CSV se conserva tras convertir a JSON y volver

Caso 5: objetos con claves distintas
  OK   columnas faltantes quedan vacías

Caso 6: validación de CSV
  OK   CSV correcto no genera avisos
  OK   detecta fila con columnas de menos

Caso 7: entradas inválidas
  OK   CSV vacío lanza error
  OK   JSON inválido lanza error
  OK   JSON que no es arreglo de objetos lanza error

✅ TODAS LAS PRUEBAS PASARON
```

Código de salida: **0** ✅
