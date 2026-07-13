/*
 * Self test del Formateador JSON.
 * Ejecuta:  node check.js
 * Sale con código 0 si todo pasa, 1 si algo falla.
 */

"use strict";

const { formatear, minificar, resaltar } = require("./script.js");

let pasados = 0;
let fallidos = 0;

function ok(nombre, condicion, detalle) {
  if (condicion) {
    pasados++;
    console.log("  ✓ " + nombre);
  } else {
    fallidos++;
    console.log("  ✗ " + nombre + (detalle ? "  -> " + detalle : ""));
  }
}

console.log("== Self test: Formateador JSON ==\n");

// 1) Formatear produce JSON con sangría y saltos de línea.
(function () {
  const entrada = '{"a":1,"b":[1,2,3]}';
  const salida = formatear(entrada, 2);
  ok("formatear añade saltos de línea", salida.indexOf("\n") !== -1, salida);
  ok("formatear usa 2 espacios de sangría", salida.indexOf('\n  "a"') !== -1, salida);
  ok(
    "formatear conserva los datos (round-trip)",
    JSON.stringify(JSON.parse(salida)) === JSON.stringify(JSON.parse(entrada))
  );
})();

// 2) Sangría de 4 espacios y tabulación.
(function () {
  const entrada = '{"x":true}';
  ok("sangría de 4 espacios", formatear(entrada, 4).indexOf('\n    "x"') !== -1);
  ok("sangría con tabulación", formatear(entrada, "tab").indexOf('\n\t"x"') !== -1);
})();

// 3) Minificar elimina espacios.
(function () {
  const entrada = '{\n  "a": 1,\n  "b": 2\n}';
  const salida = minificar(entrada);
  ok("minificar quita espacios y saltos", salida === '{"a":1,"b":2}', salida);
})();

// 4) JSON inválido lanza error.
(function () {
  let lanzo = false;
  try {
    formatear("{no es json}", 2);
  } catch (e) {
    lanzo = true;
  }
  ok("JSON inválido lanza excepción", lanzo);
})();

// 5) Tipos de datos variados sobreviven al round-trip.
(function () {
  const entrada = '{"s":"hola","n":-3.14,"b":false,"z":null,"arr":[{"k":"v"}]}';
  const reformateado = formatear(entrada, 2);
  ok(
    "tipos variados (string, número, bool, null, array, objeto)",
    JSON.stringify(JSON.parse(reformateado)) === JSON.stringify(JSON.parse(entrada))
  );
})();

// 6) Resaltado: envuelve claves, strings, números, bool y null.
(function () {
  const formateado = formatear('{"nombre":"Ana","edad":30,"ok":true,"x":null}', 2);
  const html = resaltar(formateado);
  ok("resaltado marca claves", html.indexOf("syn-clave") !== -1);
  ok("resaltado marca strings", html.indexOf("syn-string") !== -1);
  ok("resaltado marca números", html.indexOf("syn-numero") !== -1);
  ok("resaltado marca booleanos", html.indexOf("syn-bool") !== -1);
  ok("resaltado marca null", html.indexOf("syn-null") !== -1);
})();

// 7) Resaltado escapa HTML para evitar inyección.
(function () {
  const html = resaltar('{"x":"<script>"}');
  ok("resaltado escapa < y >", html.indexOf("&lt;script&gt;") !== -1 && html.indexOf("<script>") === -1);
})();

console.log("\n-------------------------------------");
console.log("Pasados: " + pasados + "  |  Fallidos: " + fallidos);

if (fallidos > 0) {
  console.log("\nRESULTADO: FALLÓ\n");
  process.exit(1);
}
console.log("\nRESULTADO: TODO OK\n");
process.exit(0);
