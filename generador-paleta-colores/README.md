# 🎨 Generador de Paletas de Colores

App web sencilla y autocontenida (un solo `index.html`, sin dependencias ni CDNs)
que genera paletas de **5 colores aleatorios** y muestra el código HEX de cada uno.

🔗 **Demo en vivo:** https://agc-generador-paleta-colores.pages.dev

## ¿Qué hace?
- Crea al azar una paleta de 5 colores.
- Muestra cada color en un recuadro grande con su código **HEX** debajo (ej. `#A3F5C1`).
- Botón **"Generar nueva paleta"**: refresca los 5 colores.
- Botón **"Copiar paleta"**: copia los 5 códigos HEX separados por comas al portapapeles.
- Extra: haz clic en un color individual para copiar solo ese código, o presiona la
  **barra espaciadora** para generar otra paleta al instante.
- El texto se adapta al contraste del color para que siempre se lea bien.

## ¿Cómo se usa?
1. Abre el archivo `index.html` con doble clic (funciona en cualquier navegador moderno).
2. Pulsa **"Generar nueva paleta"** hasta encontrar una combinación que te guste.
3. Pulsa **"Copiar paleta"** y pega los códigos donde los necesites (Figma, CSS, etc.).

No requiere instalación, internet ni configuración: abrir y listo.

## Ángulo de monetización
- **Versión Pro (freemium):** guardar paletas favoritas, exportar a CSS/Tailwind/JSON,
  generar paletas por armonía (complementarias, análogas, monocromáticas) y bloquear
  colores para variar solo el resto.
- **Afiliación / plantillas:** vender packs de paletas curadas para marcas, o integrarla
  como widget en tiendas de plantillas de diseño.
- **API de paletas:** ofrecer un endpoint de generación de paletas para apps de diseño
  con un plan de suscripción por volumen de peticiones.
- **Publicidad discreta** para diseñadores y creadores de contenido que buscan inspiración.

## Estructura
- `index.html` — toda la app (HTML + CSS + JS embebidos).
- `ui_shots/` — capturas de la interfaz.
