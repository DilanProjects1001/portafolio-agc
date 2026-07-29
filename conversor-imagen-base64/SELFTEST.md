# Informe de autoverificación — Conversor de Imagen a Base64

Este documento explica **qué se probó, cómo y con qué resultado**. Todo lo que aparece
aquí sale de ejecuciones reales, no de suposiciones.

## Cómo ejecutar las pruebas

```bash
cd conversor-imagen-base64
node check.js
```

No hace falta instalar nada (`npm install` no existe aquí): sólo Node.js.
El script devuelve **código de salida 0** si todo pasa y **1** si algo falla.

## Resultado de la última ejecución

```
Resultado: 72 pruebas pasadas, 0 fallidas.
EXIT = 0
```

## Qué se probó exactamente

### A) Codificación Base64 (20 pruebas)

El punto delicado de un codificador Base64 es el **relleno**: cuando el archivo no es
múltiplo de 3 bytes hay que completar con `=`. Por eso se comparan los resultados de
nuestro motor contra `Buffer.toString('base64')` de Node, que es la implementación de
referencia, con tamaños de **0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 255, 1024, 6151 y
12345 bytes** (los datos se generan con un generador pseudoaleatorio determinista, así
que las pruebas son siempre reproducibles).

Los tamaños no son al azar: cubren los tres restos posibles al dividir entre 3, el caso
vacío y un tamaño mayor que el búfer interno de 8192 caracteres del codificador, que es
donde suelen aparecer los errores de concatenación por trozos.

### B) Decodificación e ida y vuelta (11 pruebas)

- Codificar y volver a decodificar 1, 2, 3, 100 y 4097 bytes devuelve **exactamente** los
  bytes originales (comparación byte a byte).
- Decodifica correctamente cadenas con saltos de línea y espacios.
- Acepta un data URI completo (`data:image/png;base64,...`) y no sólo la parte codificada.
- **Rechaza con un error claro**: caracteres que no pertenecen al alfabeto Base64,
  longitudes imposibles y entradas que no son texto.

### C) Detección del formato real (10 pruebas)

El formato se deduce de los **primeros bytes del archivo** (la firma binaria), no de la
extensión del nombre, que cualquiera puede cambiar. Se verifica la detección de
**PNG, JPEG, GIF, BMP, ICO, WebP y SVG**. También se comprueba el comportamiento de
respaldo: si no hay firma reconocible se usa la extensión, pero el resultado se marca
como `seguro: false` para que la interfaz pueda avisar.

### D) Ayudas de presentación (9 pruebas)

Formato legible del tamaño (`512 B`, `2.0 KB`, `1.50 MB`), rechazo de tamaños negativos,
estimación del crecimiento de Base64 (~33 %), construcción del data URI y partido del
texto en líneas de ancho fijo. Además se comprueba que la **estimación coincide con el
largo real** de la cadena producida.

### E) La interfaz (22 pruebas)

`check.js` lee `index.html` y comprueba que existan de verdad todos los elementos de los
que depende el funcionamiento:

- idioma `es`, codificación UTF-8, `viewport` responsive y título correcto;
- el `input type="file"` con `accept="image/*"`;
- los botones **Convertir a Base64**, **Copiar**, **Descargar .txt** y **Limpiar**;
- la zona de previsualización, el `textarea` del resultado y la opción del prefijo `data:`;
- que la página carga `base64.js` (el mismo motor que prueban estos tests);
- que existe el soporte de **arrastrar y soltar**;
- **cero recursos externos**: no hay ningún `src`/`href` que apunte a `http://` o
  `https://`, así que la página funciona sin conexión;
- que `base64.js` no usa ningún `require()` de terceros;
- que **todos** los `getElementById` del código apuntan a un `id` que existe en el HTML
  (13 identificadores revisados). Esta prueba atrapa el error más típico al editar la
  interfaz: renombrar un `id` y dejar el JavaScript apuntando al viejo.

## Verificación visual

La interfaz se abrió con **Microsoft Edge en modo headless** (perfil aislado dentro de la
propia carpeta del proyecto, sin ventanas visibles) y se guardó una captura en
`ui_shots/iter_1.png`. La captura se revisó a ojo para comprobar contraste, tamaño de los
botones y que el resultado se vea completo.

## Qué NO cubren las pruebas automáticas

Con honestidad, esto queda fuera del alcance de `node check.js`:

- El **copiado al portapapeles** y la **descarga del .txt**: dependen de APIs del
  navegador y de permisos del usuario; se comprobaron manualmente en la captura.
- La **lectura real de un archivo** con `FileReader` (sólo existe en el navegador). El
  motor que procesa esos bytes sí está probado al 100 %.
- El **aspecto visual** no se valida automáticamente: se revisa mirando la captura de
  `ui_shots/`.
