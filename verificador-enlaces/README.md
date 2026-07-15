# Verificador de Enlaces Rotos

Herramienta web que **comprueba de verdad los enlaces (links) de una página**. Pegas una dirección (URL), pulsas **Verificar** y la app descarga la página, saca todos sus enlaces y comprueba el estado real de cada uno (funciona, roto o sin respuesta).

A diferencia de una demo, esta versión trae un **servidor Node.js propio** que hace las comprobaciones reales (esquivando el bloqueo CORS del navegador). No usa ninguna dependencia externa: solo Node.js.

## ¿Qué es?

Un enlace roto es un link que apunta a una página que ya no existe (error 404) o que no responde. Tener enlaces rotos da mala imagen y perjudica el posicionamiento en buscadores (SEO). Esta herramienta los detecta rápido.

## Cómo ejecutarlo

1. Necesitas tener **Node.js** instalado (nada más; sin `npm install`).
2. Abre una terminal en esta carpeta y ejecuta:

   ```
   node server.js
   ```

3. Abre tu navegador en: **http://localhost:3000**
4. Escribe o pega la dirección que quieres revisar y haz clic en **Verificar**.
5. Verás el listado de enlaces con su estado en colores:
   - 🟢 **Verde** = OK (códigos 200–399)
   - 🔴 **Rojo** = Roto o sin respuesta (404, error, timeout…)

Para detener el servidor, pulsa `Ctrl + C` en la terminal.

### Ejemplo de uso

- Ejecutas `node server.js` y abres `http://localhost:3000`.
- Escribes: `https://example.com`
- Pulsas **Verificar**.
- La herramienta descarga la página y te muestra, por ejemplo:
  - `https://www.iana.org/domains/example` — **OK (200)**
  - `https://example.com/pagina-inexistente` — **Roto (404)**

## Cómo funciona por dentro

- `server.js` — servidor Node.js (módulos `http`, `https`, `url`; sin dependencias). Sirve los archivos y expone el endpoint `POST /check`.
- El endpoint `/check` recibe `{ "url": "..." }`, descarga la página (siguiendo hasta 3 redirecciones), extrae los `href` de las etiquetas `<a>` y comprueba el estado HTTP de cada enlace (primero con `HEAD`, y si el servidor no lo acepta, con `GET`).
- Límites de seguridad: **timeout de 10 segundos** por enlace, hasta **3 redirecciones**, y un máximo de **50 enlaces** por página. Los errores (conexión rechazada, timeout) se marcan como fallidos.
- Devuelve JSON con un array de `{ url, status, ok }`.
- `app.js` (cliente) envía la URL a `/check` y pinta los resultados con su color.

## Ángulo de monetización

- **Suscripción de monitoreo continuo**: cobrar una cuota mensual a empresas y tiendas online por revisar sus sitios de forma automática y avisar por correo cuando aparezca un enlace roto.
- **Suite de SEO**: integrar esta herramienta en un paquete de auditoría web (velocidad, metadatos, enlaces) y venderlo a agencias y freelancers.
- **Informes bajo demanda**: auditorías puntuales de enlaces rotos como servicio de pago único.
