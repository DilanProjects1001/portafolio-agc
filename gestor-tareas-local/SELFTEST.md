# SELFTEST — Gestor de Tareas Local

Este documento describe qué se probó y cómo reproducir las pruebas.

## Cómo ejecutar el autotest

Desde la carpeta del proyecto:

```
node check.js
```

- No requiere navegador ni dependencias externas (solo Node.js).
- Si todo pasa, termina con el mensaje `✅ TODAS LAS PRUEBAS PASARON.` y
  **código de salida 0**.
- Si algo falla, termina con **código de salida 1**.

## Qué prueba `check.js`

El autotest hace dos tipos de verificación:

### Grupo 1 — Estructura del `index.html`
Lee el archivo `index.html` como texto y comprueba que exista lo esencial:
- Contenedor principal `<div id="app">`.
- Campo de entrada `#campo-tarea` y botón `#btn-agregar`.
- Lista de tareas `#lista-tareas`.
- Uso de `localStorage` para persistencia.
- Declaración de idioma español (`lang="es"`).
- Que **no** haya CDNs externos (nada de `src`/`href` apuntando a `http(s)://`).

### Grupo 2 — Lógica real (sin navegador)
Extrae del `index.html` el bloque marcado entre
`// ===== LOGICA PURA INICIO =====` y `// ===== LOGICA PURA FIN =====`,
lo ejecuta en Node con un **simulador de `localStorage`** (en memoria) y prueba
el comportamiento de verdad:
- Agregar tareas incrementa la lista y guarda el texto correcto.
- Las tareas nuevas empiezan sin completar.
- Un texto vacío o con solo espacios **no** agrega nada.
- Marcar/desmarcar una tarea alterna su estado `completada`.
- El contador de pendientes es correcto.
- Eliminar quita la tarea correcta.
- Los filtros *pendientes / completadas / todas* devuelven lo esperado.
- "Limpiar completadas" deja solo las pendientes.
- Persistencia: al guardar y volver a cargar, las tareas se recuperan.
- Cargar sin datos previos devuelve una lista vacía (sin errores).

## Resultado obtenido (evidencia)

Ejecución real de `node check.js`:

```
==============================================
  Pruebas del Gestor de Tareas Local
==============================================

Grupo 1: Estructura del index.html
  [OK]   Existe el contenedor <div id="app">
  [OK]   Existe el campo de entrada #campo-tarea
  [OK]   Existe el botón agregar #btn-agregar
  [OK]   Existe la lista de tareas #lista-tareas
  [OK]   Usa localStorage para persistencia
  [OK]   Declara el idioma español (lang="es")
  [OK]   No usa CDNs externos (sin http(s) en src/href)

Grupo 2: Lógica real (agregar/completar/eliminar/persistir)
  [OK]   Se encuentra el bloque de lógica pura en el HTML
  [OK]   Agregar dos tareas deja 2 elementos
  [OK]   La primera tarea guarda su texto
  [OK]   Las tareas nuevas empiezan sin completar
  [OK]   Texto vacío/espacios no agrega nada
  [OK]   Marcar completada actualiza el estado
  [OK]   Volver a marcar la desmarca (alterna)
  [OK]   Cuenta 2 pendientes al inicio
  [OK]   Eliminar deja 1 tarea
  [OK]   Se eliminó la tarea correcta
  [OK]   Filtro 'pendientes' devuelve solo 1
  [OK]   Filtro 'completadas' devuelve solo 1
  [OK]   Filtro 'todas' devuelve 2
  [OK]   Limpiar completadas deja solo pendientes
  [OK]   Persistencia: se recuperan 2 tareas guardadas
  [OK]   Persistencia: el texto sobrevive al guardado
  [OK]   Sin datos guardados, cargar devuelve lista vacía

==============================================
  Resultado: 24 pasadas, 0 fallidas
==============================================

✅ TODAS LAS PRUEBAS PASARON.
EXIT CODE: 0
```

## Prueba visual (manual, con navegador)

Además del autotest, se capturó la interfaz con Edge en modo headless y perfil
aislado (sin abrir ventanas visibles):

- `ui_shots/iter_1.png` — estado inicial (lista vacía).
- `ui_shots/iter_2_con_tareas.png` — con tareas: una completada (tachada), dos
  pendientes, contador en "2 tareas pendientes".

Se revisaron ambas capturas: buen contraste, botones grandes y legibles, textos
en español y la app se ve bien sin configurar nada.
