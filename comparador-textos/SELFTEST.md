# Autoverificación — Comparador de Textos

Ejecuta:

```bash
node check.js
```

Sale con código `0` si todo pasa y `1` si algo falla. No necesita instalar paquetes ni
abrir un navegador: el motor (`src/diff.js`) es un módulo puro que se carga igual en
Node que en la página.

## Qué se prueba

### 1. División de líneas
- Saltos de Windows (`\r\n`), Mac clásico (`\r`) y Unix (`\n`) se tratan igual.
- Texto vacío y `null` no rompen nada.
- Una línea final vacía se conserva (importante para el conteo).

### 2. Algoritmo de Myers (operaciones mínimas)
- Casos básicos: listas idénticas, una inserción, una eliminación, de vacío a lleno y
  de lleno a vacío.
- **Propiedad de ida y vuelta:** aplicar las operaciones sobre el texto A reconstruye
  exactamente el texto B, y descartando las adiciones se recupera exactamente A.
- **200 pares aleatorios** (con generador determinista, así el test es reproducible):
  en los 200 casos la reconstrucción es exacta en ambos sentidos y el número de
  ediciones nunca es peor que borrar todo y reescribirlo.
- Se comprueba que la solución es mínima en un caso conocido (4 ediciones).

### 3. Comparación completa
- Dos textos iguales se marcan como idénticos, con similitud 100 % y 0 cambios.
- Una línea editada se reporta como *modificada* (no como una eliminación + una
  adición) y las demás siguen *iguales*.
- Dentro de la línea editada se resalta solo la palabra nueva; la parte común **no**
  se resalta.
- Líneas añadidas y eliminadas al final/en medio, con la numeración correcta de cada
  lado (`numA` / `numB`, con `null` en el lado que no existe).
- Dos líneas sin nada en común **no** se emparejan como una edición: se reportan como
  una eliminación y una adición separadas.

### 4. Opciones de comparación
- Sin opciones, las mayúsculas y los espacios de más cuentan como diferencia.
- `ignorarMayusculas`, `ignorarEspacios` e `ignorarLineasVacias` hacen que los pares
  de prueba pasen a ser idénticos.
- Al ignorar líneas vacías, **los números de línea siguen siendo los del texto
  original** (verificado: línea 1 y línea 4).

### 5. Diferencias palabra por palabra
- `el gato duerme` vs `el perro duerme` → solo `gato` / `perro` marcados.
- Los segmentos devueltos, concatenados, reconstruyen la línea original sin perder ni
  añadir caracteres (a ambos lados).
- Detecta el cambio de una cifra dentro de una línea (`100` → `250`).
- La función de parecido: 1 para líneas iguales, < 0.35 para líneas ajenas, > 0.7 para
  un simple cambio de mayúsculas, 0 contra una línea vacía.

### 6. Parche unificado
- Cabeceras `--- a.txt` / `+++ b.txt` y cabecera de bloque `@@ -l,c +l,c @@`.
- Prefijos correctos: `-` para lo viejo, `+` para lo nuevo, espacio para el contexto.
- Sin diferencias, el parche sale vacío.
- **Los contadores de cada bloque cuadran** con las líneas que contiene (se recorre el
  parche generado y se cuentan), y dos cambios lejanos generan dos bloques separados.

### 7. Casos límite y rendimiento
- Dos textos vacíos: idénticos, similitud 100.
- De vacío a texto: 1 línea agregada, similitud 0.
- **3000 líneas con 2 cambios:** detecta exactamente esos 2 cambios en menos de 2 s.
- **1200 líneas totalmente distintas:** no se cuelga (hay un tope de pasos que corta a
  un modo simple) y reporta 0 líneas en común.

### 8. Archivos e integridad del proyecto
- Existen `index.html`, `src/diff.js`, `src/app.js`, `src/styles.css`, `README.md` y
  `SELFTEST.md`.
- El HTML **no carga ningún recurso externo** (sin CDNs): se verifica que no haya
  `src=`/`href=` apuntando a `http(s)://`.
- El HTML carga el motor y la app, y declara `lang="es"`.
- La interfaz no inyecta texto del usuario con `innerHTML` sin escapar (se construye
  el DOM con `createElement`/`createTextNode`).

## Qué NO cubre

- El comportamiento del navegador en sí (clics, arrastrar archivos, portapapeles,
  descarga del `.diff`): eso se revisa con las capturas de `ui_shots/`.
- Comparación de archivos binarios o PDF: la herramienta trabaja con texto plano.
