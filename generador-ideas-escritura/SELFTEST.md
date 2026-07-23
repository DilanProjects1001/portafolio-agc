# Autotest — Generador de Ideas para Escritura

Este documento explica qué valida el autotest `check.js`, que se ejecuta **sin
navegador** con el comando:

```
node check.js
```

El script termina con **código de salida 0** si todo pasa, o **1** si algo falla.

## Qué se comprueba

1. **Archivos principales existen**: `index.html`, `style.css`, `script.js` y
   `README.md`.
2. **Carpeta de capturas**: existe la subcarpeta `ui_shots/`.
3. **Estructura del HTML** (elementos esenciales de la interfaz):
   - El documento declara idioma español (`lang="es"`).
   - Incluye el título de la app.
   - Enlaza la hoja de estilos (`style.css`) y el script (`script.js`).
   - Contiene el botón «Generar» (`id="btnGenerar"`), el botón «Copiar»
     (`id="btnCopiar"`), el selector de tipo (`id="tipo"`) y el contenedor de la
     idea (`id="idea"`).
4. **Contenido del script**: define `generarIdea()` y los bancos de datos
   (`PERSONAJES`, `LUGARES`, `CONFLICTOS`).
5. **Prueba funcional real**: se extrae la lógica de generación de `script.js` y se
   ejecuta para cada tipo de idea (`completa`, `personaje`, `lugar`, `conflicto`,
   `primeraLinea`, `genero`), comprobando que devuelve **texto no vacío**.

## Por qué así

El autotest no abre el navegador; en su lugar verifica que los archivos existan,
que el HTML tenga los ganchos que la interfaz necesita y que la lógica de
generación funcione de verdad. Esto permite validar el proyecto de forma
automática y rápida en cualquier máquina con Node.js.
