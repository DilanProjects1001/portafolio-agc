/**
 * check.js — Pruebas automáticas del Conversor CSV ↔ JSON
 * -------------------------------------------------------------------------
 * Ejecuta casos con resultados conocidos y verifica que las funciones de
 * conversión (`csvAJson`, `jsonACsv`, `validarCSV`) devuelven lo esperado.
 *
 * No usa npm ni librerías externas: solo Node.js.
 *
 * Cómo correrlo:
 *   node check.js
 *
 * Sale con código 0 si TODAS las pruebas pasan, y con código 1 si alguna falla.
 */

var conv = require("./script.js");
var csvAJson = conv.csvAJson;
var jsonACsv = conv.jsonACsv;
var validarCSV = conv.validarCSV;

var fallos = 0;

/**
 * Compara dos valores por su representación JSON (sirve para objetos y arreglos).
 */
function verificar(descripcion, obtenido, esperado) {
  var a = JSON.stringify(obtenido);
  var b = JSON.stringify(esperado);
  var ok = a === b;
  if (ok) {
    console.log("  OK   " + descripcion);
  } else {
    console.log("  FALLO " + descripcion);
    console.log("        obtenido: " + a);
    console.log("        esperado: " + b);
    fallos++;
  }
}

/**
 * Verifica que una función lanza un error (validación de datos inválidos).
 */
function verificarError(descripcion, fn) {
  var lanzo = false;
  try {
    fn();
  } catch (e) {
    lanzo = true;
  }
  if (lanzo) {
    console.log("  OK   " + descripcion);
  } else {
    console.log("  FALLO " + descripcion + " (no lanzó error)");
    fallos++;
  }
}

console.log("Ejecutando pruebas del conversor CSV ↔ JSON...\n");

// -------------------------------------------------------------------------
// Caso 1: CSV simple -> JSON.
// -------------------------------------------------------------------------
console.log("Caso 1: CSV simple a JSON");
verificar(
  "3 columnas, 2 filas",
  csvAJson("nombre,edad,ciudad\nAna,30,Madrid\nLuis,25,Bogotá"),
  [
    { nombre: "Ana", edad: "30", ciudad: "Madrid" },
    { nombre: "Luis", edad: "25", ciudad: "Bogotá" }
  ]
);

// -------------------------------------------------------------------------
// Caso 2: CSV con comas y comillas dentro de un campo.
// -------------------------------------------------------------------------
console.log("\nCaso 2: CSV con comas y comillas dentro de campos");
verificar(
  'campo "García, Ana" con coma interna',
  csvAJson('nombre,edad\n"García, Ana",30'),
  [{ nombre: "García, Ana", edad: "30" }]
);
verificar(
  'comillas dobles escapadas ("")',
  csvAJson('texto\n"Dijo ""hola"""'),
  [{ texto: 'Dijo "hola"' }]
);

// -------------------------------------------------------------------------
// Caso 3: JSON -> CSV.
// -------------------------------------------------------------------------
console.log("\nCaso 3: JSON a CSV");
verificar(
  "arreglo de objetos a CSV",
  jsonACsv('[{"nombre":"Ana","edad":30},{"nombre":"Luis","edad":25}]'),
  "nombre,edad\nAna,30\nLuis,25"
);
verificar(
  "campo con coma se entrecomilla al exportar",
  jsonACsv('[{"lugar":"Ciudad, País"}]'),
  'lugar\n"Ciudad, País"'
);

// -------------------------------------------------------------------------
// Caso 4: ida y vuelta (round-trip) CSV -> JSON -> CSV.
// -------------------------------------------------------------------------
console.log("\nCaso 4: ida y vuelta CSV -> JSON -> CSV");
var csvOriginal = "a,b\n1,2\n3,4";
var vuelta = jsonACsv(csvAJson(csvOriginal));
verificar("el CSV se conserva tras convertir a JSON y volver", vuelta, csvOriginal);

// -------------------------------------------------------------------------
// Caso 5: claves distintas en distintos objetos (se unen todas las columnas).
// -------------------------------------------------------------------------
console.log("\nCaso 5: objetos con claves distintas");
verificar(
  "columnas faltantes quedan vacías",
  jsonACsv('[{"a":1},{"b":2}]'),
  "a,b\n1,\n,2"
);

// -------------------------------------------------------------------------
// Caso 6: validación de CSV (avisos).
// -------------------------------------------------------------------------
console.log("\nCaso 6: validación de CSV");
verificar(
  "CSV correcto no genera avisos",
  validarCSV("a,b\n1,2\n3,4"),
  []
);
var avisos = validarCSV("a,b,c\n1,2");
verificar(
  "detecta fila con columnas de menos",
  avisos.length > 0,
  true
);

// -------------------------------------------------------------------------
// Caso 7: entradas inválidas deben lanzar error.
// -------------------------------------------------------------------------
console.log("\nCaso 7: entradas inválidas");
verificarError("CSV vacío lanza error", function () {
  csvAJson("");
});
verificarError("JSON inválido lanza error", function () {
  jsonACsv("{esto no es json}");
});
verificarError("JSON que no es arreglo de objetos lanza error", function () {
  jsonACsv("[1,2,3]");
});

// -------------------------------------------------------------------------
// Resultado final.
// -------------------------------------------------------------------------
console.log("");
if (fallos === 0) {
  console.log("✅ TODAS LAS PRUEBAS PASARON");
  process.exit(0);
} else {
  console.log("❌ FALLARON " + fallos + " PRUEBA(S)");
  process.exit(1);
}
