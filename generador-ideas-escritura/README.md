# ✍️ Generador de Ideas para Escritura Creativa

Aplicación web sencilla que genera **ideas aleatorias para escribir**: personajes,
lugares, conflictos, primeras líneas y retos por género. Ideal para vencer el
bloqueo creativo o para calentar antes de escribir.

Funciona **100% en el navegador**, sin conexión a internet y sin instalar nada.

🔗 **Demo en vivo:** https://agc-generador-ideas-escritura.pages.dev

## ¿Qué problema resuelve?

El **bloqueo creativo** ("la página en blanco") es el mayor freno de cualquier
escritor: no saber por dónde empezar. Esta herramienta lo elimina dándote, en un
clic, una chispa inicial concreta (un personaje, un lugar, un conflicto o una
primera línea) para que empieces a escribir de inmediato en lugar de mirar el cursor.

## ¿Qué es?

Una herramienta para escritores que, con un solo clic, propone ideas listas para
desarrollar en un relato, cuento o novela. Puedes elegir el tipo de idea que
quieres recibir:

- **Idea completa**: personaje + lugar + conflicto en una sola frase.
- **Solo personaje**, **solo lugar** o **solo conflicto**.
- **Primera línea**: una frase de arranque para tu historia.
- **Reto por género**: una consigna creativa según el estilo (terror, romance, etc.).

## Cómo se usa

1. Abre el archivo `index.html` con doble clic (se abre en tu navegador).
2. Elige el **tipo de idea** en el menú desplegable.
3. Pulsa **«🎲 Generar idea»** las veces que quieras.
4. Pulsa **«📋 Copiar»** para llevarte la idea al portapapeles.

No necesitas instalar nada ni tener internet.

## Cómo correrlo

**Opción A — abrir directamente (lo más simple):** haz doble clic en `index.html`.

**Opción B — desde la terminal**, sitúate en la carpeta del proyecto y abre el archivo:

```bash
cd generador-ideas-escritura
start index.html      # Windows
# open index.html     # macOS
# xdg-open index.html # Linux
```

**Opción C — servidor local** (opcional, si prefieres una URL `http://`):

```bash
cd generador-ideas-escritura
python -m http.server 8000
# luego abre http://localhost:8000 en tu navegador
```

**Ejecutar las pruebas automáticas** (requiere Node.js, sin navegador):

```bash
cd generador-ideas-escritura
node check.js
```

## Ejemplo de uso

Seleccionas *«Idea completa»* y pulsas generar. La app muestra, por ejemplo:

```text
Una relojera que oye el futuro en el tic-tac en un faro que solo aparece con
niebla y debe elegir entre salvar su pasado o su futuro.
```

Otro ejemplo, eligiendo *«Primera línea»*:

```text
La última carta llegó tres días después de mi funeral.
```

Copias la idea con el botón **«📋 Copiar»** y empiezas a escribir tu cuento a
partir de ella.

## Ángulo de monetización

Puede ofrecerse como herramienta gratuita para atraer escritores y venderse una
versión **Premium** con más bancos de ideas, exportación a PDF y generación por IA.
También encaja como imán de suscriptores para un boletín o taller de escritura
creativa, o mediante afiliación con cursos y libros del sector.

## Estructura del proyecto

- `index.html` — interfaz de la aplicación.
- `style.css` — estilos (botones grandes, alto contraste).
- `script.js` — lógica de generación de ideas.
- `check.js` — autotest sin navegador (`node check.js`).
- `SELFTEST.md` — qué comprueba el autotest.
- `ui_shots/` — capturas de la interfaz (evidencia visual).
