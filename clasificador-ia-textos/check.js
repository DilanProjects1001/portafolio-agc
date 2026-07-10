/**
 * check.js — Pruebas automáticas del Clasificador de Textos
 * -------------------------------------------------------------------------
 * Verifica la función `clasificarTexto` del clasificador por reglas. Usa
 * Node.js puro (sin npm ni librerías externas), importando la lógica de
 * script.js.
 *
 * Cómo correrlo:
 *   node check.js
 *
 * Sale con código 0 si TODAS las pruebas pasan, y con código 1 si alguna falla.
 */

var clasif = require("./script.js");
var clasificarTexto = clasif.clasificarTexto;

var fallos = 0;

/**
 * Comprueba que la categoría clasificada sea la esperada y que la confianza
 * esté en el rango 0-100.
 *
 * @param {string} descripcion
 * @param {string} texto            - Texto de entrada a clasificar.
 * @param {string} categoriaEsperada
 */
function verificarCategoria(descripcion, texto, categoriaEsperada) {
  var r = clasificarTexto(texto);
  var okCat = r.categoria === categoriaEsperada;
  var okConf = typeof r.confianza === "number" && r.confianza >= 0 && r.confianza <= 100;

  if (okCat && okConf) {
    console.log("  OK   " + descripcion + " -> " + r.categoria + " (" + r.confianza + "%)");
  } else {
    console.log("  FALLO " + descripcion);
    if (!okCat) {
      console.log("        categoría obtenida: " + r.categoria + ", esperada: " + categoriaEsperada);
    }
    if (!okConf) {
      console.log("        confianza fuera de rango 0-100: " + r.confianza);
    }
    fallos++;
  }
}

console.log("Ejecutando pruebas del clasificador de textos...\n");

// -------------------------------------------------------------------------
// Casos principales (uno por categoría).
// -------------------------------------------------------------------------
console.log("Clasificación por categoría");
verificarCategoria("'oferta especial' es spam", "¡Oferta especial! Gana dinero gratis", "spam");
verificarCategoria("'reunión mañana' es normal", "Reunión mañana a las 10 en la oficina", "normal");
verificarCategoria("'urge' es urgente", "Esto urge, es una emergencia, respondan ya mismo", "urgente");
verificarCategoria("'reclamo' es queja", "Quiero poner una queja: el producto llegó defectuoso, exijo reembolso", "queja");
verificarCategoria("'consulta' es consulta", "Tengo una duda, ¿cuánto cuesta el servicio?", "consulta");

// -------------------------------------------------------------------------
// Robustez: texto vacío no debe romper (cae en "normal").
// -------------------------------------------------------------------------
console.log("\nRobustez");
verificarCategoria("texto vacío no rompe", "", "normal");

// -------------------------------------------------------------------------
// La confianza siempre debe ser un número entre 0 y 100.
// -------------------------------------------------------------------------
console.log("\nRango de confianza");
var muestra = clasificarTexto("oferta gratis premio dinero");
if (muestra.confianza >= 0 && muestra.confianza <= 100) {
  console.log("  OK   confianza dentro de 0-100 (" + muestra.confianza + "%)");
} else {
  console.log("  FALLO confianza fuera de rango: " + muestra.confianza);
  fallos++;
}

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
