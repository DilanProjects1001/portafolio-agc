# SELFTEST — qué se prueba y por qué

Ejecutar: `node check.js` (sin dependencias, sin navegador). Devuelve **exit 0** si todo pasa.

## Cobertura (34 comprobaciones en 8 bloques)

| Bloque | Qué verifica | Por qué importa |
|--------|--------------|-----------------|
| 1. Validación | Empresa vacía, URL sin protocolo, correo mal formado, ningún dato marcado, retención fuera de rango (1–240 meses), claves inventadas descartadas | Un documento legal con la URL o el correo mal puestos es inservible: el error se detecta antes de generar |
| 2. Política de Privacidad | Título, responsable con CIF, tabla de datos con **solo** los seleccionados, las 7 secciones RGPD, ley y autoridad correctas, plazo de conservación real, lista completa de derechos | Es el documento obligatorio; comprueba que no falta ninguna sección exigida |
| 3. Jurisdicción | México → LFPDPPP + INAI + derechos ARCO (sin portabilidad); California → CCPA + opt-out; las 8 jurisdicciones generan los 3 documentos con >800 caracteres; país desconocido cae en España | Evita el fallo típico de estos generadores: citar el RGPD a un cliente mexicano |
| 4. Política de Cookies | La tabla refleja las casillas marcadas; sin analíticas ni marketing aparece el aviso "solo cookies técnicas"; se explica cómo borrarlas en Chrome, Firefox, Safari y Edge | Declarar cookies que no usas (o al revés) es justamente lo que sancionan las agencias de protección de datos |
| 5. Aviso Legal | Objeto, propiedad intelectual, legislación aplicable y jurisdicción | Comprueba la estructura mínima del aviso legal |
| 6. Robustez | Ningún `{{marcador}}`, `undefined`, `null`, `NaN`, `TODO` ni lista vacía en el texto final; fecha en formato largo español; **el HTML introducido por el usuario se escapa** | Un `undefined` en un documento publicado destruye la credibilidad; el escapado evita XSS al previsualizar |
| 7. Markdown → HTML | Títulos, listas, negritas, enlaces y tablas (incluida la fila separadora `---`, que no debe aparecer); el HTML descargable es un documento completo con etiquetas balanceadas | El archivo `.html` se sube tal cual a producción: tiene que estar bien formado |
| 8. Integridad | Existen todos los archivos del proyecto; `index.html` **no carga ningún recurso remoto** | Garantiza la promesa de "100% offline": el test falla si alguien mete un CDN |

## Salida real (3 de agosto de 2026)

```
=== Generador de Política de Privacidad — autotest ===

[1] Validación de datos de entrada
  ok   los datos de ejemplo son válidos
  ok   rechaza empresa vacía
  ok   rechaza URL sin protocolo
  ok   acepta URL con http y con https
  ok   rechaza correo mal formado
  ok   rechaza no seleccionar ningún dato
  ok   rechaza retención fuera de rango
  ok   ignora claves de datos inventadas

[2] Política de Privacidad
  ok   incluye título y responsable
  ok   lista los datos seleccionados y solo esos
  ok   incluye las 7 secciones obligatorias del RGPD
  ok   cita la ley y la autoridad de la jurisdicción elegida
  ok   refleja el plazo de conservación indicado
  ok   incluye los derechos RGPD completos
  ok   la sección de newsletter aparece solo si está activada
  ok   las transferencias internacionales dependen de la opción
  ok   sin terceros declara que no cede datos
  ok   con terceros los enumera con su enlace

[3] Adaptación por jurisdicción
  ok   México usa LFPDPPP, INAI y derechos ARCO
  ok   California usa CCPA y derechos de opt-out
  ok   cada jurisdicción genera los 3 documentos sin errores
  ok   jurisdicción desconocida cae en España por defecto

[4] Política de Cookies
  ok   la tabla refleja las cookies activadas
  ok   sin analíticas ni marketing avisa de que solo hay técnicas
  ok   explica cómo borrarlas en los navegadores principales

[5] Aviso Legal y Términos
  ok   incluye objeto, propiedad intelectual y jurisdicción

[6] Robustez del texto generado
  ok   ningún documento deja marcadores sin sustituir
  ok   la fecha se escribe en formato largo en español
  ok   el HTML del usuario se escapa (no hay inyección)

[7] Conversión Markdown → HTML
  ok   convierte títulos, listas, negritas y enlaces
  ok   convierte tablas markdown en <table> con cabecera
  ok   el HTML descargable es un documento completo y bien formado

[8] Integridad del proyecto
  ok   todos los archivos esperados existen
  ok   el HTML no carga recursos externos (sin CDNs)

====================================================
RESULTADO: 34/34 pruebas correctas ✔
====================================================
```

## Comprobación visual

La interfaz se capturó con Edge en modo headless y perfil aislado, y se revisó a ojo:

| Captura | Qué muestra |
|---------|-------------|
| `ui_shots/iter_1.png` | Vista general: formulario + Política de Privacidad ya generada |
| `ui_shots/iter_2.png` | Formulario completo (datos, terceros) tras compactar las casillas a dos columnas |
| `ui_shots/demo_en_vivo.png` | La misma pantalla servida desde https://agc-generador-politica-privacidad.pages.dev/?demo=1 |

Correcciones aplicadas tras mirar las capturas:
1. La rejilla de casillas caía a una sola columna y alargaba mucho el formulario → se bajó el
   ancho mínimo de cada casilla a 168 px, de modo que ahora entran dos por fila.
2. El panel de resultados quedaba fuera de vista al bajar por el formulario → ahora es
   `sticky` en pantallas anchas y acompaña al scroll.

**Verificación del despliegue** (mismo día): `index.html`, `styles.css`, `src/generator.js` y
`src/app.js` responden `200` en producción, y la captura en vivo demuestra que el JavaScript
se ejecuta en el servidor real (el documento aparece renderizado, no el estado vacío).

## Qué NO cubre el autotest

- El comportamiento del navegador (clic en pestañas, descarga de archivos, `localStorage`):
  se ha verificado manualmente sobre la captura y el flujo `?demo=1`, que ejecuta la misma
  ruta de código (`escribirFormulario` → `validar` → `generarTodo` → `markdownAHtml`).
- La exactitud jurídica del contenido: es una plantilla profesional, no asesoramiento legal.
