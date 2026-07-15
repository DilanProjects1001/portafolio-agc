/* ===== Servidor del Verificador de Enlaces Rotos =====
   Solo módulos built-in de Node.js (http, https, url). Sin dependencias.

   - Sirve los archivos estáticos (index.html, style.css, app.js...) desde
     el directorio actual.
   - Endpoint POST /check: recibe {url}, descarga la página, extrae los
     enlaces (href de <a>) y verifica el código HTTP de cada uno siguiendo
     hasta 3 redirecciones. Devuelve JSON con [{url, status, ok}].

   Ejecutar:  node server.js   ->  http://localhost:3000
*/

const http = require("http");
const https = require("https");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

const PUERTO = process.env.PORT ? Number(process.env.PORT) : 3000;
const DIR = __dirname;
const TIMEOUT_MS = 10000;
const MAX_REDIRECCIONES = 3;
const MAX_ENLACES = 50; // límite de seguridad para no verificar cientos de enlaces

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8"
};

const servidor = http.createServer(function (req, res) {
  if (req.method === "POST" && req.url === "/check") {
    manejarCheck(req, res);
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    servirEstatico(req, res);
    return;
  }
  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Método no permitido");
});

/* ---------- Archivos estáticos ---------- */
function servirEstatico(req, res) {
  let ruta = decodeURIComponent(req.url.split("?")[0]);
  if (ruta === "/") ruta = "/index.html";

  // Evita salir del directorio del proyecto
  const rutaAbs = path.join(DIR, path.normalize(ruta));
  if (!rutaAbs.startsWith(DIR)) {
    res.writeHead(403);
    res.end("Prohibido");
    return;
  }

  fs.readFile(rutaAbs, function (err, datos) {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(req.method === "HEAD" ? undefined : "No encontrado");
      return;
    }
    const ext = path.extname(rutaAbs).toLowerCase();
    res.writeHead(200, { "Content-Type": TIPOS[ext] || "application/octet-stream" });
    // En HEAD solo enviamos las cabeceras, sin el cuerpo.
    res.end(req.method === "HEAD" ? undefined : datos);
  });
}

/* ---------- Endpoint /check ---------- */
function manejarCheck(req, res) {
  let cuerpo = "";
  req.on("data", function (trozo) {
    cuerpo += trozo;
    if (cuerpo.length > 1e6) req.destroy(); // protección
  });
  req.on("end", function () {
    let datos;
    try {
      datos = JSON.parse(cuerpo || "{}");
    } catch (e) {
      responderJSON(res, 400, { error: "JSON inválido" });
      return;
    }

    const objetivo = (datos.url || "").trim();
    let urlObjetivo;
    try {
      urlObjetivo = new URL(objetivo);
      if (!/^https?:$/.test(urlObjetivo.protocol)) throw new Error("protocolo");
    } catch (e) {
      responderJSON(res, 400, { error: "URL inválida. Incluye http:// o https://" });
      return;
    }

    descargar(urlObjetivo.href, 0)
      .then(function (resultado) {
        const html = resultado.cuerpo;
        let enlaces = extraerEnlaces(html, urlObjetivo.href);

        if (enlaces.length === 0) {
          responderJSON(res, 200, { pagina: urlObjetivo.href, enlaces: [], mensaje: "No se encontraron enlaces en la página." });
          return;
        }

        const total = enlaces.length;
        enlaces = enlaces.slice(0, MAX_ENLACES);

        Promise.all(enlaces.map(verificarEnlace)).then(function (verificados) {
          responderJSON(res, 200, {
            pagina: urlObjetivo.href,
            total: total,
            verificados: verificados.length,
            enlaces: verificados
          });
        });
      })
      .catch(function (err) {
        responderJSON(res, 200, {
          pagina: urlObjetivo.href,
          error: "No se pudo descargar la página: " + err.message,
          enlaces: []
        });
      });
  });
}

/* Verifica un enlace y devuelve {url, status, ok} */
function verificarEnlace(url) {
  return solicitar(url, "HEAD", 0)
    .then(function (info) {
      return construirResultado(url, info.status);
    })
    .catch(function () {
      // Algunos servidores no aceptan HEAD: reintentamos con GET
      return solicitar(url, "GET", 0)
        .then(function (info) {
          return construirResultado(url, info.status);
        })
        .catch(function (err) {
          return { url: url, status: 0, ok: false, error: err.code || err.message || "fallo" };
        });
    });
}

function construirResultado(url, status) {
  return { url: url, status: status, ok: status >= 200 && status < 400 };
}

/* Descarga completa de una página (GET, sigue redirecciones) */
function descargar(url, salto) {
  return new Promise(function (resolver, rechazar) {
    if (salto > MAX_REDIRECCIONES) return rechazar(new Error("demasiadas redirecciones"));
    const lib = url.startsWith("https") ? https : http;
    const opciones = new URL(url);
    const peticion = lib.request(
      opciones,
      { method: "GET", headers: { "User-Agent": "VerificadorEnlaces/1.0" } },
      function (resp) {
        if ([301, 302, 303, 307, 308].indexOf(resp.statusCode) !== -1 && resp.headers.location) {
          resp.resume();
          const siguiente = new URL(resp.headers.location, url).href;
          resolver(descargar(siguiente, salto + 1));
          return;
        }
        let cuerpo = "";
        resp.setEncoding("utf8");
        resp.on("data", function (t) {
          cuerpo += t;
          if (cuerpo.length > 5e6) resp.destroy(); // no leer páginas enormes
        });
        resp.on("end", function () {
          resolver({ status: resp.statusCode, cuerpo: cuerpo });
        });
      }
    );
    aplicarLimites(peticion, rechazar);
    peticion.end();
  });
}

/* Solicitud ligera (HEAD/GET) que sigue redirecciones y devuelve el status */
function solicitar(url, metodo, salto) {
  return new Promise(function (resolver, rechazar) {
    if (salto > MAX_REDIRECCIONES) return resolver({ status: 310 }); // demasiados saltos
    let lib;
    let opciones;
    try {
      lib = url.startsWith("https") ? https : http;
      opciones = new URL(url);
    } catch (e) {
      return rechazar(e);
    }
    const peticion = lib.request(
      opciones,
      { method: metodo, headers: { "User-Agent": "VerificadorEnlaces/1.0" } },
      function (resp) {
        if ([301, 302, 303, 307, 308].indexOf(resp.statusCode) !== -1 && resp.headers.location) {
          resp.resume();
          try {
            const siguiente = new URL(resp.headers.location, url).href;
            resolver(solicitar(siguiente, metodo, salto + 1));
          } catch (e) {
            resolver({ status: resp.statusCode });
          }
          return;
        }
        resp.resume(); // descartamos el cuerpo
        resolver({ status: resp.statusCode });
      }
    );
    aplicarLimites(peticion, rechazar);
    peticion.end();
  });
}

function aplicarLimites(peticion, rechazar) {
  peticion.setTimeout(TIMEOUT_MS, function () {
    peticion.destroy(new Error("timeout"));
  });
  peticion.on("error", function (err) {
    rechazar(err);
  });
}

/* Extrae los href de las etiquetas <a> y los convierte en URLs absolutas */
function extraerEnlaces(html, base) {
  const enlaces = [];
  const regex = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") ||
        href.startsWith("tel:") || href.startsWith("javascript:")) {
      continue;
    }
    try {
      const abs = new URL(href, base).href;
      if (/^https?:/.test(abs) && enlaces.indexOf(abs) === -1) {
        enlaces.push(abs);
      }
    } catch (e) {
      /* href inválido, se ignora */
    }
  }
  return enlaces;
}

function responderJSON(res, codigo, obj) {
  const cuerpo = JSON.stringify(obj);
  res.writeHead(codigo, { "Content-Type": "application/json; charset=utf-8" });
  res.end(cuerpo);
}

servidor.listen(PUERTO, function () {
  console.log("Servidor del Verificador de Enlaces en http://localhost:" + PUERTO);
});

module.exports = servidor;
