/* ===== Autotest del Verificador de Enlaces Rotos =====
   1) Comprueba que existan los archivos y contengan los textos clave.
   2) Arranca server.js en un puerto de prueba, crea una página con enlaces
      conocidos, llama a POST /check y valida que verifique bien los estados
      (200 para un archivo existente, 404 para uno inexistente). Luego cierra
      el servidor.

   Todo funciona SIN internet: las pruebas apuntan al propio servidor local.

   Ejecutar:  node check.js   (exit 0 si todo bien, exit 1 si algo falla)
*/

const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const dir = __dirname;
const PUERTO_TEST = 3111;
const FIXTURE = path.join(dir, "_test_page.html");

let errores = 0;
const lineas = [];

function ok(msg) { lineas.push("OK     - " + msg); }
function fallo(msg) { lineas.push("FALLO  - " + msg); errores++; }

/* ---------- Parte 1: archivos y textos ---------- */
const pruebas = [
  { archivo: "index.html", contiene: ["Verificar", "urlInput", "app.js"] },
  { archivo: "style.css", contiene: ["btn", ".campo-url", "spinner"] },
  { archivo: "app.js", contiene: ["fetch", "/check", "addEventListener"] },
  { archivo: "server.js", contiene: ["createServer", "/check", "extraerEnlaces"] },
  { archivo: "README.md", contiene: ["Verificador", "monetización", "node server.js"] }
];

pruebas.forEach(function (prueba) {
  const ruta = path.join(dir, prueba.archivo);
  if (!fs.existsSync(ruta)) {
    fallo("No existe el archivo: " + prueba.archivo);
    return;
  }
  const contenido = fs.readFileSync(ruta, "utf8");
  ok("Existe: " + prueba.archivo);
  prueba.contiene.forEach(function (texto) {
    if (contenido.indexOf(texto) === -1) {
      fallo('Falta el texto "' + texto + '" en ' + prueba.archivo);
    } else {
      ok('  Contiene "' + texto + '"');
    }
  });
});

/* ---------- Parte 2: servidor + endpoint /check ---------- */
function peticionCheck(urlObjetivo) {
  return new Promise(function (resolver, rechazar) {
    const cuerpo = JSON.stringify({ url: urlObjetivo });
    const req = http.request(
      {
        host: "localhost",
        port: PUERTO_TEST,
        path: "/check",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(cuerpo)
        }
      },
      function (res) {
        let datos = "";
        res.setEncoding("utf8");
        res.on("data", function (t) { datos += t; });
        res.on("end", function () {
          try { resolver(JSON.parse(datos)); }
          catch (e) { rechazar(new Error("respuesta no es JSON: " + datos)); }
        });
      }
    );
    req.on("error", rechazar);
    req.write(cuerpo);
    req.end();
  });
}

function esperar(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

function terminar(servidor) {
  try { if (servidor) servidor.kill(); } catch (e) {}
  try { if (fs.existsSync(FIXTURE)) fs.unlinkSync(FIXTURE); } catch (e) {}

  console.log("=== Autotest: Verificador de Enlaces Rotos ===");
  console.log(lineas.join("\n"));
  console.log("=============================================");
  if (errores === 0) {
    console.log("RESULTADO: TODO CORRECTO (0 errores)");
    process.exit(0);
  } else {
    console.log("RESULTADO: " + errores + " error(es) encontrados");
    process.exit(1);
  }
}

function pruebaServidor() {
  // Página de prueba con enlaces conocidos al propio servidor local:
  //  - /style.css  -> debe existir (200)
  //  - /no-existe-xyz -> debe dar 404
  const base = "http://localhost:" + PUERTO_TEST;
  const htmlFixture =
    "<html><body>" +
    '<a href="' + base + '/style.css">css ok</a>' +
    '<a href="' + base + '/no-existe-xyz-404">roto</a>' +
    "</body></html>";
  fs.writeFileSync(FIXTURE, htmlFixture, "utf8");

  const servidor = spawn(process.execPath, [path.join(dir, "server.js")], {
    env: Object.assign({}, process.env, { PORT: String(PUERTO_TEST) }),
    stdio: "ignore",
    windowsHide: true
  });

  servidor.on("error", function (err) {
    fallo("No se pudo arrancar server.js: " + err.message);
    terminar(null);
  });

  // Damos tiempo a que el servidor levante y probamos el endpoint.
  esperar(1200)
    .then(function () {
      return peticionCheck(base + "/_test_page.html");
    })
    .then(function (respuesta) {
      if (!respuesta || !Array.isArray(respuesta.enlaces)) {
        fallo("El endpoint /check no devolvió un array de enlaces. Respuesta: " + JSON.stringify(respuesta));
        return;
      }
      ok("El endpoint /check respondió con " + respuesta.enlaces.length + " enlaces");

      const cssOk = respuesta.enlaces.find(function (e) { return /style\.css/.test(e.url); });
      const roto = respuesta.enlaces.find(function (e) { return /no-existe-xyz/.test(e.url); });

      if (cssOk && cssOk.ok && cssOk.status >= 200 && cssOk.status < 400) {
        ok("Enlace válido detectado como OK (status " + cssOk.status + ")");
      } else {
        fallo("El enlace válido (style.css) no se detectó como OK: " + JSON.stringify(cssOk));
      }

      if (roto && !roto.ok && roto.status === 404) {
        ok("Enlace roto detectado correctamente (status 404)");
      } else {
        fallo("El enlace roto (404) no se detectó bien: " + JSON.stringify(roto));
      }
    })
    .catch(function (err) {
      fallo("Error consultando el endpoint /check: " + err.message);
    })
    .then(function () {
      terminar(servidor);
    });
}

pruebaServidor();
