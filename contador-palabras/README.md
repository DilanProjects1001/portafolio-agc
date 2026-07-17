# 📝 Contador de Palabras

🔗 Demo en vivo: https://agc-contador-palabras.pages.dev

Herramienta web sencilla que analiza cualquier texto y te dice, al instante:

- **Palabras** (separadas por espacios o saltos de línea)
- **Caracteres** (con y sin espacios)
- **Frases** (delimitadas por `.`, `?` o `!`)
- **Párrafos** (separados por una línea en blanco)
- **Las 10 palabras más frecuentes**, con una barra visual (sin distinguir mayúsculas/minúsculas e ignorando la puntuación)

Todo ocurre dentro de tu navegador: **nada se envía a internet** y **no necesitas instalar nada**.

## Cómo usarla

1. Abre el archivo **`index.html`** con doble clic (funciona en cualquier navegador moderno).
2. Escribe o pega tu texto en el recuadro grande.
3. Pulsa **Contar** (o simplemente escribe: los resultados se actualizan solos).
4. También puedes pulsar **Cargar ejemplo** para ver una demostración, o **Limpiar** para empezar de nuevo.

## Archivos del proyecto

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La aplicación (la página que abres). |
| `style.css` | Los estilos y colores. |
| `script.js` | Conecta los botones y el texto con los cálculos. |
| `counter.js` | Las funciones de conteo (lógica pura, reutilizable y testeable). |
| `check.js` | Autotest: comprueba que los cálculos son correctos. |

## Verificar que todo funciona (opcional, para técnicos)

Si tienes [Node.js](https://nodejs.org) instalado, ejecuta en esta carpeta:

```bash
node check.js
```

Debe imprimir la lista de pruebas y terminar con **`✔ Todos los tests pasaron`** (código de salida 0).

## Ángulo de monetización

Un contador de palabras es una de las herramientas más buscadas por estudiantes,
redactores, community managers y opositores. Formas realistas de rentabilizarlo:

- **Tráfico + publicidad / afiliados:** el término "contador de palabras" tiene un
  volumen de búsqueda enorme y constante. Publicada como página web gratuita, atrae
  visitas recurrentes que se monetizan con anuncios o enlaces de afiliado a
  herramientas de escritura (correctores, IA de redacción, cursos).
- **Versión "Pro" freemium:** la base es gratis; se cobra una suscripción baja por
  extras como analizar archivos `.docx`/`.pdf`, guardar historial, exportar informes,
  detectar palabras de relleno o calcular tiempo de lectura y densidad de palabras clave (SEO).
- **Producto de marca blanca para agencias:** licenciar la herramienta personalizada
  (logo y colores del cliente) a agencias de marketing y academias que la integran en
  su propio sitio como valor añadido.
- **Complemento de un embudo:** usarla como imán de captación (lead magnet) para un
  producto mayor —un curso de redacción, un servicio de corrección o un SaaS de
  contenidos— capturando el correo a cambio de funciones avanzadas.

Al no depender de servidores ni librerías externas, el coste de operación es
prácticamente cero: se puede alojar gratis como sitio estático y escalar sin gastos.
