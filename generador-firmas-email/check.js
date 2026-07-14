/* check.js — Pruebas automáticas del Generador de Firmas de Email
 * =====================================================================
 * No necesita navegador ni dependencias externas (solo Node).
 * Importa las funciones puras desde app.js (module.exports) y prueba:
 *   - Que la firma generada contenga nombre, cargo, empresa y correo.
 *   - Que los enlaces (mailto, web, LinkedIn, Twitter) aparezcan bien.
 *   - Que la validación detecte campos faltantes y correos inválidos.
 *   - Que normalizarUrl y escaparHTML funcionen correctamente.
 *   - Una simulación de "copiar" (que el string a copiar sea el HTML).
 *
 * Cómo ejecutarlo:
 *     node check.js
 *
 * Si TODAS las pruebas pasan, termina con código de salida 0; si no, 1.
 * ===================================================================== */

"use strict";

var fs = require("fs");
var path = require("path");
var app = require("./app.js");

var pasadas = 0;
var fallidas = 0;

function afirmar(nombre, condicion) {
  if (condicion) {
    pasadas++;
    console.log("OK   - " + nombre);
  } else {
    fallidas++;
    console.log("FALLA - " + nombre);
  }
}

/* Datos de ejemplo para las pruebas. */
var datos = {
  nombre: "Ana García",
  cargo: "Directora de Marketing",
  empresa: "Estudio Creativo S.A.",
  correo: "ana@empresa.com",
  telefono: "+34 600 123 456",
  web: "www.empresa.com",
  linkedin: "linkedin.com/in/anagarcia",
  twitter: "x.com/anagarcia",
  color: "#2563eb",
};

var html = app.generarFirmaHTML(datos);

/* 1) La firma es un string HTML no vacío. */
afirmar("generarFirmaHTML devuelve un string no vacío", typeof html === "string" && html.length > 0);

/* 2) Contiene los datos principales. */
afirmar("La firma contiene el nombre", html.indexOf("Ana García") !== -1);
afirmar("La firma contiene el cargo", html.indexOf("Directora de Marketing") !== -1);
afirmar("La firma contiene la empresa", html.indexOf("Estudio Creativo S.A.") !== -1);
afirmar("La firma contiene el correo", html.indexOf("ana@empresa.com") !== -1);
afirmar("La firma contiene el teléfono", html.indexOf("+34 600 123 456") !== -1);

/* 3) Enlaces bien formados. */
afirmar("Incluye enlace mailto", html.indexOf('href="mailto:ana@empresa.com"') !== -1);
afirmar("Incluye enlace a la web con https", html.indexOf("https://www.empresa.com") !== -1);
afirmar("Incluye enlace a LinkedIn con https", html.indexOf("https://linkedin.com/in/anagarcia") !== -1);
afirmar("Incluye enlace a Twitter/X con https", html.indexOf("https://x.com/anagarcia") !== -1);

/* 4) Usa el color de acento elegido. */
afirmar("Aplica el color de acento en la firma", html.indexOf("#2563eb") !== -1);

/* 5) Es una tabla con estilos inline (compatibilidad email). */
afirmar("Genera una tabla HTML", html.indexOf("<table") !== -1);
afirmar("Usa estilos inline", html.indexOf("style=") !== -1);

/* 6) Campos opcionales vacíos no rompen la generación. */
var htmlMinimo = app.generarFirmaHTML({
  nombre: "Juan Pérez",
  cargo: "Freelancer",
  empresa: "Independiente",
  correo: "juan@correo.com",
});
afirmar("Funciona sin campos opcionales", htmlMinimo.indexOf("Juan Pérez") !== -1);
afirmar("Sin redes, no aparece LinkedIn", htmlMinimo.indexOf("LinkedIn") === -1);

/* 7) Validación de datos. */
afirmar("Valida OK con datos completos", app.validarDatos(datos) === "");
afirmar("Detecta nombre faltante", app.validarDatos({ cargo: "x", empresa: "y", correo: "a@b.com" }) !== "");
afirmar("Detecta correo inválido",
  app.validarDatos({ nombre: "a", cargo: "b", empresa: "c", correo: "no-es-correo" }) !== "");

/* 8) normalizarUrl. */
afirmar("normalizarUrl añade https://", app.normalizarUrl("empresa.com") === "https://empresa.com");
afirmar("normalizarUrl respeta http existente", app.normalizarUrl("http://x.com") === "http://x.com");
afirmar("normalizarUrl con vacío devuelve ''", app.normalizarUrl("") === "");

/* 9) escaparHTML evita inyección. */
var escapado = app.escaparHTML('<b>"hola"</b>');
afirmar("escaparHTML escapa < > y comillas",
  escapado.indexOf("<b>") === -1 && escapado.indexOf("&lt;") !== -1);

/* 10) La firma con datos peligrosos queda escapada (no inyecta etiquetas). */
var htmlPeligroso = app.generarFirmaHTML({
  nombre: "<script>alerta()</script>",
  cargo: "Cargo",
  empresa: "Empresa",
  correo: "a@b.com",
});
afirmar("Escapa contenido peligroso en el nombre",
  htmlPeligroso.indexOf("<script>alerta()") === -1 && htmlPeligroso.indexOf("&lt;script&gt;") !== -1);

/* 11) Simulación de "copiar": el texto a copiar es exactamente el HTML. */
var portapapelesSimulado = "";
function copiarSimulado(texto) {
  portapapelesSimulado = texto; // imita navigator.clipboard.writeText
  return true;
}
copiarSimulado(html);
afirmar("Copiar coloca el HTML de la firma en el portapapeles (simulado)",
  portapapelesSimulado === html && portapapelesSimulado.length > 0);

/* 12) Estructura de archivos base presente. */
["index.html", "style.css", "app.js"].forEach(function (archivo) {
  afirmar("Existe " + archivo, fs.existsSync(path.join(__dirname, archivo)));
});

/* Resumen. */
console.log("");
console.log("Resumen: " + pasadas + " pasadas, " + fallidas + " fallidas.");
if (fallidas === 0) {
  console.log("Todas las pruebas superadas.");
  process.exit(0);
} else {
  console.log("Hay pruebas fallidas.");
  process.exit(1);
}
