# SELFTEST — Verificador de Enlaces Rotos

Documento de pruebas de la versión **funcional** (con servidor Node.js real).

## Cómo ejecutar las pruebas

Desde una terminal, dentro de esta carpeta (`verificador-enlaces`):

```
node check.js
```

No necesita internet ni `npm install`: el propio script arranca `server.js` en
un puerto de prueba, lo consulta y lo cierra automáticamente. Termina con
**código de salida 0** si todo está bien, o **1** si algo falla.

## Qué se probó

### 1. Autotest automático (`node check.js`)
El script `check.js` valida en dos partes, **sin necesidad de internet**:

**Parte 1 — Archivos y textos clave:**
- Existencia de: `index.html`, `style.css`, `app.js`, `server.js`, `README.md`.
- Textos esperados en cada archivo:
  - `index.html` → `Verificar`, `urlInput`, `app.js`.
  - `style.css` → `btn`, `.campo-url`, `spinner`.
  - `app.js` → `fetch`, `/check`, `addEventListener`.
  - `server.js` → `createServer`, `/check`, `extraerEnlaces`.
  - `README.md` → `Verificador`, `monetización`, `node server.js`.

**Parte 2 — Servidor y endpoint real:**
1. Crea una página de prueba (`_test_page.html`) con dos enlaces conocidos que
   apuntan al propio servidor local:
   - `/style.css` → archivo que existe (debe dar **200 = OK**).
   - `/no-existe-xyz-404` → archivo inexistente (debe dar **404 = roto**).
2. Arranca `server.js` en un puerto de prueba (3111) con `windowsHide`.
3. Llama a `POST /check` con la URL de esa página.
4. Verifica que el endpoint:
   - Devuelve un array de enlaces.
   - Detecta el enlace válido como **OK (status 200)**.
   - Detecta el enlace inexistente como **roto (status 404)**.
5. **Cierra el servidor** y borra la página de prueba al terminar.

Así se comprueba el flujo completo (descargar página → extraer enlaces →
verificar estado HTTP) de forma determinista y offline.

### 2. Servidor real en el puerto 3000
Se arrancó `node server.js` y se comprobó con `curl` que responde **HTTP 200**
en `http://localhost:3000/`. Tras las pruebas, se detuvo únicamente ese proceso.

### 3. Evaluación visual
Con el servidor corriendo se capturó la interfaz con Edge headless (perfil
aislado dentro del proyecto) y se revisó manualmente.
- Captura: `ui_shots/iter_1.png` (estado inicial de la versión previa).
- Captura: `ui_shots/iter_2.png` (interfaz funcionando, con la tabla de
  resultados y las etiquetas de color OK/Roto). Revisada: colores correctos,
  buen contraste, resumen claro. Sin defectos que corregir.

  > Nota honesta: Edge headless solo carga y fotografía (no puede pulsar el
  > botón), por eso `iter_2.png` muestra los resultados con datos
  > representativos en el formato REAL. La verificación real de estados
  > (200/404) queda demostrada de forma automática por `check.js` (Parte 2).

## Resultado de ejecutar `node check.js`

```
=== Autotest: Verificador de Enlaces Rotos ===
OK     - Existe: index.html
OK     -   Contiene "Verificar"
OK     -   Contiene "urlInput"
OK     -   Contiene "app.js"
OK     - Existe: style.css
OK     -   Contiene "btn"
OK     -   Contiene ".campo-url"
OK     -   Contiene "spinner"
OK     - Existe: app.js
OK     -   Contiene "fetch"
OK     -   Contiene "/check"
OK     -   Contiene "addEventListener"
OK     - Existe: server.js
OK     -   Contiene "createServer"
OK     -   Contiene "/check"
OK     -   Contiene "extraerEnlaces"
OK     - Existe: README.md
OK     -   Contiene "Verificador"
OK     -   Contiene "monetización"
OK     -   Contiene "node server.js"
OK     - El endpoint /check respondió con 2 enlaces
OK     - Enlace válido detectado como OK (status 200)
OK     - Enlace roto detectado correctamente (status 404)
=============================================
RESULTADO: TODO CORRECTO (0 errores)
```

**Código de salida:** `0` (éxito).

## Estado

- ✅ Servidor Node.js funcional (solo módulos built-in, sin dependencias).
- ✅ Endpoint `POST /check` descarga la página, extrae enlaces y verifica
  estados reales (200/404/redirecciones), con timeout de 10s.
- ✅ Frontend conectado al servidor (fetch a `/check`, spinner de carga,
  resultados con colores).
- ✅ `node check.js` termina con exit 0, arrancando y cerrando el servidor.
- ✅ Interfaz capturada y revisada visualmente.
