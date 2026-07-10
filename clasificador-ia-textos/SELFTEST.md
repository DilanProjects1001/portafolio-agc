# SELFTEST — Clasificador de Textos con IA

Documento de las pruebas del proyecto. Las pruebas automáticas viven en `check.js` y se
ejecutan con Node.js, sin navegador ni dependencias externas.

## Cómo ejecutar

```
node check.js
```

- **Exit 0** → todas las pruebas pasaron.
- **Exit 1** → alguna prueba falló (se muestra el detalle en consola).

## Qué se prueba (automático)

Se verifica la función `clasificarTexto(texto)` de `script.js`, que devuelve
`{ categoria, etiqueta, confianza, coincidencias, puntuaciones }`.

| # | Caso | Entrada | Resultado esperado |
|---|------|---------|--------------------|
| 1 | Spam | "¡Oferta especial! Gana dinero gratis" | categoría `spam` |
| 2 | Normal | "Reunión mañana a las 10 en la oficina" | categoría `normal` |
| 3 | Urgente | "Esto urge, es una emergencia, respondan ya mismo" | categoría `urgente` |
| 4 | Queja | "…una queja: el producto llegó defectuoso, exijo reembolso" | categoría `queja` |
| 5 | Consulta | "Tengo una duda, ¿cuánto cuesta el servicio?" | categoría `consulta` |
| 6 | Robustez | texto vacío `""` | categoría `normal` (no rompe) |
| 7 | Rango confianza | "oferta gratis premio dinero" | confianza entre 0 y 100 |

En todos los casos se comprueba además que la **confianza** sea un número entre 0 y 100.

## Prueba visual (manual, hecha)

Se abrió `index.html` en Edge headless (perfil aislado) con un texto de spam usando el
parámetro `?texto=`. La captura `ui_shots/captura.png` muestra:

- Categoría detectada: **Spam / Promoción** (badge rojo).
- Barra de confianza al **99%**.
- Palabras detectadas: *oferta, gratis, gana, premio, dinero, haz clic*.

Se revisó el diseño: buen contraste, botones grandes, textos legibles, resultado claro.

## Resultado de la última ejecución

```
Ejecutando pruebas del clasificador de textos...

Clasificación por categoría
  OK   'oferta especial' es spam -> spam (99%)
  OK   'reunión mañana' es normal -> normal (60%)
  OK   'urge' es urgente -> urgente (99%)
  OK   'reclamo' es queja -> queja (99%)
  OK   'consulta' es consulta -> consulta (99%)

Robustez
  OK   texto vacío no rompe -> normal (60%)

Rango de confianza
  OK   confianza dentro de 0-100 (99%)

✅ TODAS LAS PRUEBAS PASARON
```

Código de salida: **0** ✅
