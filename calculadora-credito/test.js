/**
 * test.js — Pruebas automáticas de la Calculadora de Crédito
 * ----------------------------------------------------------
 * Ejecuta varios casos con resultados conocidos y verifica que la función
 * `calcularPrestamo` devuelve los valores esperados.
 *
 * No usa npm ni librerías externas: solo Node.js y `console.assert`.
 *
 * Cómo correrlo:
 *   node test.js
 *
 * Sale con código 0 si TODAS las pruebas pasan, y con código 1 si alguna falla.
 */

var calc = require("./script.js");
var calcularPrestamo = calc.calcularPrestamo;

// Contador de fallos. Empieza en 0 y sube si alguna aserción falla.
var fallos = 0;

/**
 * Compara dos números permitiendo una pequeña tolerancia (por los decimales).
 * Si no coinciden, marca el fallo y lo muestra en consola.
 *
 * @param {string} descripcion - Qué se está probando.
 * @param {number} obtenido    - Valor devuelto por la función.
 * @param {number} esperado    - Valor esperado (calculado a mano/con referencia).
 * @param {number} tolerancia  - Diferencia máxima aceptable (por defecto 0.02).
 */
function verificar(descripcion, obtenido, esperado, tolerancia) {
  tolerancia = tolerancia === undefined ? 0.02 : tolerancia;
  var ok = Math.abs(obtenido - esperado) <= tolerancia;
  console.assert(ok, "FALLO: " + descripcion + " -> obtenido " + obtenido + ", esperado " + esperado);
  if (ok) {
    console.log("  OK   " + descripcion + " = " + obtenido);
  } else {
    fallos++;
  }
}

console.log("Ejecutando pruebas de la calculadora de crédito...\n");

// -------------------------------------------------------------------------
// Caso 1: préstamo de $10,000 al 12% anual a 24 meses.
// Valores de referencia (amortización francesa):
//   cuota mensual ≈ 470.73, total pagado ≈ 11297.63, intereses ≈ 1297.63
// -------------------------------------------------------------------------
console.log("Caso 1: $10,000 al 12% anual, 24 meses");
var c1 = calcularPrestamo(10000, 12, 24);
verificar("pago mensual", c1.pagoMensual, 470.73);
verificar("total pagado", c1.totalPagado, 11297.63, 0.05);
verificar("total intereses", c1.totalInteres, 1297.63, 0.05);

// -------------------------------------------------------------------------
// Caso 2: préstamo SIN intereses (0%). $1,200 a 12 meses.
// La cuota debe ser exactamente 100, sin intereses.
// -------------------------------------------------------------------------
console.log("\nCaso 2: $1,200 al 0% anual, 12 meses (sin intereses)");
var c2 = calcularPrestamo(1200, 0, 12);
verificar("pago mensual", c2.pagoMensual, 100);
verificar("total pagado", c2.totalPagado, 1200);
verificar("total intereses", c2.totalInteres, 0);

// -------------------------------------------------------------------------
// Caso 3: préstamo de $5,000 al 6% anual a 12 meses.
// Valores de referencia:
//   cuota mensual ≈ 430.33, total pagado ≈ 5163.98, intereses ≈ 163.98
// -------------------------------------------------------------------------
console.log("\nCaso 3: $5,000 al 6% anual, 12 meses");
var c3 = calcularPrestamo(5000, 6, 12);
verificar("pago mensual", c3.pagoMensual, 430.33);
verificar("total pagado", c3.totalPagado, 5163.98, 0.05);
verificar("total intereses", c3.totalInteres, 163.98, 0.05);

// -------------------------------------------------------------------------
// Caso 4: verificación de que se rechazan datos inválidos (monto negativo).
// -------------------------------------------------------------------------
console.log("\nCaso 4: datos inválidos (monto negativo) deben lanzar error");
var lanzoError = false;
try {
  calcularPrestamo(-100, 10, 12);
} catch (e) {
  lanzoError = true;
}
console.assert(lanzoError, "FALLO: no lanzó error con monto negativo");
if (lanzoError) {
  console.log("  OK   se rechazó el monto negativo correctamente");
} else {
  fallos++;
}

// -------------------------------------------------------------------------
// Resultado final: exit 0 si todo pasó, exit 1 si hubo algún fallo.
// -------------------------------------------------------------------------
console.log("");
if (fallos === 0) {
  console.log("✅ TODAS LAS PRUEBAS PASARON");
  process.exit(0);
} else {
  console.log("❌ FALLARON " + fallos + " PRUEBA(S)");
  process.exit(1);
}
