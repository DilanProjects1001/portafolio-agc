# Autotest — Generador de Tarjetas de Visita

Se verificó que index.html existe y contiene formulario.

## Detalle

El script `check.js` comprueba, sin necesidad de navegador:

- Que el archivo `index.html` existe.
- Que contiene la etiqueta `<form>`.
- Que contiene la zona de previsualización de la tarjeta (`id="tarjeta"`).
- Que contiene el botón de descarga (`id="btn-descargar"`).

Para ejecutarlo: `node check.js` (termina con código 0 si todo pasa).
