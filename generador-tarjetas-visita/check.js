// Autotest sin navegador: valida que index.html existe y contiene un formulario.
// Uso: node check.js  (termina con exit 0 si todo pasa, exit 1 si falla)

const fs = require("fs");
const path = require("path");

const rutaHtml = path.join(__dirname, "index.html");
let errores = 0;

function comprobar(descripcion, condicion) {
  if (condicion) {
    console.log("  OK  - " + descripcion);
  } else {
    console.log("FALLO - " + descripcion);
    errores++;
  }
}

console.log("== Autotest: Generador de Tarjetas de Visita ==");

// 1) El archivo index.html debe existir
const existe = fs.existsSync(rutaHtml);
comprobar("index.html existe", existe);

if (existe) {
  const html = fs.readFileSync(rutaHtml, "utf8");

  // 2) Debe contener una etiqueta <form>
  comprobar("contiene la etiqueta <form>", /<form[\s>]/i.test(html));

  // 3) Debe contener la zona de previsualización de la tarjeta
  comprobar('contiene el elemento con id "tarjeta"', /id=["']tarjeta["']/i.test(html));

  // 4) Debe contener los botones de acción
  comprobar("contiene el botón de descargar", /id=["']btn-descargar["']/i.test(html));
}

console.log("==============================================");

if (errores === 0) {
  console.log("RESULTADO: TODO CORRECTO");
  process.exit(0);
} else {
  console.log("RESULTADO: " + errores + " prueba(s) fallida(s)");
  process.exit(1);
}
