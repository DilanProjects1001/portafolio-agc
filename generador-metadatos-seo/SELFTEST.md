# SELFTEST — Generador de Metadatos SEO

Documento de verificación del proyecto. Todo lo que aparece aquí es salida real de
comandos ejecutados el **31/07/2026**, no una descripción de lo que debería pasar.

## 1. Pruebas automáticas

**Comando:** `node check.js` · **Node.js:** v24.13.1 · **Código de salida: 0**

```
Pruebas pasadas: 81
Pruebas fallidas: 0
RESULTADO: TODO OK
```

`check.js` carga `src/seo.js` como módulo de Node (sin navegador, sin dependencias) y
comprueba 81 afirmaciones repartidas en 11 grupos:

| Grupo | Qué se prueba | Nº |
|---|---|---|
| 1. Escapado de HTML | Comillas, `<`, `>`, `&` escapados; un `</title><script>` inyectado queda neutralizado | 4 |
| 2. Limpieza de texto | Saltos de línea colapsados, valores `null` sin reventar | 2 |
| 3. Normalización de URL | Añade `https://`, respeta el protocolo existente, extrae dominio sin `www`, construye migas de pan | 8 |
| 4. Medición y recorte por píxeles | Textos anchos miden más, el recorte cabe en el límite y acaba en `…`, los cortos no se tocan | 6 |
| 5. Análisis de longitud | Estados `vacio`/`corto`/`ok`/`largo`, y que la descripción se mida a su escala real | 11 |
| 6. Palabras clave | Separación por comas, duplicados fuera sin distinguir mayúsculas | 3 |
| 7. Etiquetas meta | `<title>`, description, canonical, Open Graph, Twitter Card, robots index/noindex | 13 |
| 8. JSON-LD | `Article`/`Product`/`Organization`/`WebSite`, tipo desconocido → `WebSite`, JSON reparseable | 14 |
| 9. Vistas previas | La previa de Google cabe en 580 px, migas correctas, valores por defecto | 5 |
| 10. Auditoría | Puntuación de una ficha completa vs. vacía, y los 5 avisos detectables | 11 |
| 11. Entradas raras | `undefined`, idioma inválido, tipo de tarjeta inválido | 4 |

### Casos que merecen mención

- **Inyección de HTML.** `generarMetaTags({ titulo: '</title><script>alert(1)</script>' })`
  no produce ningún `<script>` en la salida: todo va escapado.
- **El límite real de Google es en píxeles.** Se comprueba que una descripción de
  **157 caracteres** (por debajo del límite nominal de 160) ya desborda los 920 px y
  se marca como larga, y que la vista previa la recorta con `…`.
- **Robustez.** `auditar(undefined)` y `generarMetaTags(undefined)` no lanzan excepción.

## 2. Revisión visual de la interfaz

Capturas tomadas con Microsoft Edge en modo `--headless=new`, con un perfil aislado
dentro del proyecto (borrado después). Cada iteración se miró y se corrigió lo que
estaba mal.

| Captura | Qué muestra | Resultado de la revisión |
|---|---|---|
| `ui_shots/iter_1.png` | Primera versión, 1280 px | **2 defectos encontrados** (ver abajo) |
| `ui_shots/iter_2.png` | Tras corregirlos | Correcto: nota 100/100, descripción validada, imagen fallida explicada |
| `ui_shots/iter_3_tarjeta_x_jsonld.png` | Pestaña **X (Twitter)** + pestaña **JSON-LD** | Correcto: la tarjeta cambia de estilo y el código muestra el JSON-LD |
| `ui_shots/iter_4_pantalla_estrecha.png` | Ventana de 900×700 | Correcto: las columnas se apilan y todo sigue legible |

### Defectos detectados mirando `iter_1.png` y cómo se arreglaron

1. **La descripción válida salía marcada como «Larga» (nota 92 en vez de 100).**
   La tabla de anchos de carácter estaba calibrada para el título (~20 px) y se aplicaba
   también a la descripción, que Google pinta a ~14 px. Resultado: 135 caracteres se
   medían como 1014 px y disparaban el aviso.
   *Arreglo:* se añadió un factor `escala` por campo (`descripcion: 0.79`) y se ajustó su
   límite a 920 px, que es donde Google recorta de verdad. Ahora esos 135 caracteres
   miden 801 px y el aviso salta a partir de ~157 caracteres.

2. **La tarjeta social mostraba un rectángulo gris vacío** cuando la URL de la imagen no
   cargaba, sin explicar por qué.
   *Arreglo:* la imagen se prueba con un objeto `Image()` antes de pintarla; si falla, se
   muestra el mensaje «La imagen no se pudo cargar. Comprueba la URL — el resto de
   etiquetas se genera igual.» Se ignoran las respuestas de URLs ya sustituidas para
   evitar que una carga lenta pise a la actual.

## 3. Despliegue

El proyecto está publicado en Cloudflare Pages:

- **URL:** https://agc-generador-metadatos-seo.pages.dev
- Proyecto nuevo creado para esto (`agc-generador-metadatos-seo`), 9 archivos subidos.

## 4. Qué NO cubren estas pruebas

Es honesto decirlo:

- Los tests son del **motor** (`src/seo.js`). El cableado del DOM (`src/app.js`) se ha
  verificado **visualmente** con las capturas, no con tests automáticos: no hay un
  navegador headless con DOM en el runner de pruebas.
- Copiar al portapapeles y descargar el `.html` se han revisado por código, pero
  requieren un gesto del usuario y no se pueden disparar desde una captura estática.
- Los anchos en píxeles son una **estimación** con una tabla de anchos por carácter, no
  una medición tipográfica exacta. Sirve para avisar de recortes; el margen de error
  ronda el 3-5 % y por eso los límites se han fijado con algo de holgura.
