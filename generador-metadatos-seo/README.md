# Generador de Metadatos SEO

> Write your page metadata once, see exactly how it will look on Google, Facebook and X,
> and copy the ready-to-paste `<head>` block — meta tags, Open Graph and JSON-LD included.

**Live demo:** https://agc-generador-metadatos-seo.pages.dev

No build step, no `npm install`, no CDNs, no tracking. Open `index.html` and it works.
Everything runs in the browser — your copy never leaves your machine.

![Main interface](ui_shots/iter_2.png)

---

## The problem it solves

Getting a page's metadata right means juggling three unrelated things at once: the
`<title>`/`description` pair Google shows, the Open Graph tags Facebook, LinkedIn and
WhatsApp read, and the JSON-LD structured data that powers rich results. Most people
write them blind, publish, and only then discover the title was truncated or the shared
link renders as a grey box.

This tool collapses all of it into one form with live previews and an automatic audit,
so you catch the mistakes **before** publishing.

## Features

| | |
|---|---|
| **Live Google preview** | Renders a real SERP result, truncated the way Google actually does it |
| **Pixel-accurate limits** | Google truncates by pixel width, not character count — a 157-character description can already overflow. Both are measured |
| **Social card preview** | Facebook and X (Twitter) layouts, large-image and small-image variants |
| **Automatic audit** | 0–100 score with a checklist of errors and warnings in plain Spanish |
| **Complete output** | Basic meta + Open Graph + Twitter Card + schema.org JSON-LD |
| **4 content types** | Website, Article, Product and Organization — each maps to the right `og:type` and schema |
| **Safe output** | Every value is HTML-escaped, so quotes and `<` in your copy can't break the tags |
| **Auto-save** | Your draft is kept in `localStorage`; close the tab and come back to it |
| **One-click export** | Copy to clipboard or download a starter `.html` with the `<head>` filled in |

## How to run it

```bash
# 1. Open the app — no server, no dependencies
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux

# 2. Run the automated checks (needs Node.js, no packages)
node check.js
```

`check.js` exits with code `0` when all 81 assertions pass. See [SELFTEST.md](SELFTEST.md)
for the full evidence.

## Using the engine from Node

The whole SEO engine lives in `src/seo.js` and has no DOM dependency, so you can reuse it
in a static-site build script:

```js
const SEO = require('./src/seo.js');

const datos = {
  titulo: 'Zapatillas de running para principiantes | RunFácil',
  descripcion: 'Guía para elegir tus primeras zapatillas de running: tipos de pisada, amortiguación, tallas y las 8 mejores opciones por menos de 90 €.',
  url: 'runfacil.es/guias/zapatillas-para-principiantes',
  sitio: 'RunFácil',
  imagen: 'runfacil.es/img/portada.jpg',
  textoImagen: 'Zapatillas sobre asfalto',
  tipo: 'article'
};

console.log(SEO.generarTodo(datos));   // meta tags + JSON-LD, ready for <head>
```

Auditing a page before you ship it:

```js
const informe = SEO.auditar(datos);
console.log(informe.puntuacion);       // 100
console.log(informe.errores);          // 0

informe.problemas.forEach(p => console.log(`[${p.nivel}] ${p.campo}: ${p.mensaje}`));
// [ok] Título: Título con longitud óptima (51 caracteres).
// [ok] Descripción: Descripción con longitud óptima (135 caracteres).
// [ok] URL: URL canónica definida.
// [ok] Imagen: Imagen social definida (recomendado 1200×630 px).

// Fail a build when the metadata is not good enough:
if (informe.errores > 0) process.exit(1);
```

Checking whether Google will truncate a title:

```js
SEO.analizarCampo('Mi título', SEO.LIMITES.titulo).estado;   // 'corto'

const largo = 'Guía completa de posicionamiento SEO para tiendas online en 2026 con plantillas';
SEO.anchoTexto(largo);                    // 606.2  (el límite de Google son 580 px)
SEO.recortarAPixeles(largo, 580);
// 'Guía completa de posicionamiento SEO para tiendas online en 2026 con…'
```

### Public API (`src/seo.js`)

| Function | Returns |
|---|---|
| `generarMetaTags(datos)` | `<meta>` block: basic SEO + Open Graph + Twitter Card |
| `generarJsonLd(datos)` | schema.org object (`WebSite` / `Article` / `Product` / `Organization`) |
| `generarJsonLdTexto(datos)` | The same, wrapped in its `<script type="application/ld+json">` |
| `generarTodo(datos)` | Both blocks concatenated |
| `auditar(datos)` | `{ puntuacion, nivel, errores, avisos, problemas[] }` |
| `analizarCampo(texto, limites)` | `{ longitud, pixeles, porcentaje, estado, mensaje }` |
| `vistaPreviaGoogle(datos)` / `vistaPreviaSocial(datos)` | Pre-truncated preview strings |
| `normalizarUrl` · `dominioDeUrl` · `migasDeUrl` · `escaparHtml` | URL and text helpers |

## Project layout

```
generador-metadatos-seo/
├── index.html          Interface (Spanish)
├── src/
│   ├── seo.js          Engine: generation, measurement and audit (no DOM)
│   ├── app.js          UI wiring only
│   └── styles.css      Styles, no external fonts or icons
├── check.js            81 automated assertions — exit 0 on success
├── SELFTEST.md         What was tested and the actual output
└── ui_shots/           Screenshots used to review the interface
```

## Monetization angle

Freelancers and agencies bill SEO audits per page; this is the deliverable's first screen —
white-label it, drop in a logo, and it becomes a lead magnet that captures the email of
anyone who wants their report exported. The engine is dependency-free and headless, so the
same file also sells as a CI check ("fail the build if a page scores under 80") or as a
paid plugin for static-site generators and CMS templates.

---

## Español

### ¿Qué problema resuelve?

Cuando publicas una página tienes que acertar con tres cosas a la vez: el título y la
descripción que verá Google, las etiquetas Open Graph que leen Facebook, LinkedIn y
WhatsApp, y los datos estructurados JSON-LD. Casi todo el mundo las escribe a ciegas,
publica, y descubre después que el título salió cortado o que el enlace se comparte como
un rectángulo gris.

Esta herramienta lo junta todo en un formulario con vista previa en vivo y una revisión
automática, para que corrijas los fallos **antes** de publicar.

### Cómo se usa

1. Abre `index.html` con doble clic (o entra en la [demo en vivo](https://agc-generador-metadatos-seo.pages.dev)).
2. Rellena el título, la descripción y la URL. Verás al instante cómo queda en Google.
3. Mira la nota de 0 a 100 y corrige lo que marque en rojo o ámbar.
4. Pulsa **Copiar código** y pega el bloque dentro del `<head>` de tu página.

Botones útiles: **Cargar ejemplo** rellena todo con un caso real, **Limpiar todo** vacía el
formulario, y **Descargar .html** te da un archivo con el `<head>` ya preparado.

### Detalles que quizá no esperas

- **Google recorta por píxeles, no por letras.** Una descripción de 157 caracteres puede
  pasarse aunque el límite "oficial" sean 160. La app mide las dos cosas.
- **Todo se queda en tu navegador.** No hay servidor, no hay cookies, no se envía nada.
- **Se guarda solo.** Cierra la pestaña y al volver sigue tu borrador.

### Verificación

```bash
node check.js      # 81 comprobaciones, sale con código 0
```

El detalle de qué se probó está en [SELFTEST.md](SELFTEST.md).
