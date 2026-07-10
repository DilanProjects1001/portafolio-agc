/**
 * check.js — Pruebas automáticas del Generador de Contraseñas
 * -----------------------------------------------------------
 * Este script NO necesita navegador ni dependencias externas.
 * Importa la función `generarContrasena` desde script.js (mediante
 * module.exports) y ejecuta una serie de pruebas.
 *
 * Cómo ejecutarlo:
 *     node check.js
 *
 * Si TODAS las pruebas pasan, el script termina con código de salida 0.
 * Si alguna falla, termina con código de salida 1.
 */

// Importamos la función a probar desde script.js.
var modulo = require("./script.js");
var generarContrasena = modulo.generarContrasena;
var calcularFuerza = modulo.calcularFuerza;

// Contadores para el resumen final.
var pruebasPasadas = 0;
var pruebasFallidas = 0;

/**
 * Función auxiliar de aserción: registra el resultado y lo imprime.
 * @param {string} nombre - Descripción de la prueba.
 * @param {boolean} condicion - Debe ser true para que la prueba pase.
 */
function afirmar(nombre, condicion) {
  if (condicion) {
    pruebasPasadas++;
    console.log("  [OK]   " + nombre);
  } else {
    pruebasFallidas++;
    console.log("  [FALLO] " + nombre);
  }
}

console.log("==============================================");
console.log("  Pruebas del Generador de Contraseñas");
console.log("==============================================\n");

// -------------------------------------------------------------------------
// Prueba 1: La contraseña respeta la longitud solicitada.
// -------------------------------------------------------------------------
console.log("Prueba 1: Respeta la longitud pedida");
(function () {
  var contrasena = generarContrasena({
    longitud: 20,
    minusculas: true,
    mayusculas: true,
    numeros: true,
    simbolos: true
  });
  afirmar("La longitud es exactamente 20", contrasena.length === 20);
})();

// -------------------------------------------------------------------------
// Prueba 2: Solo números cuando solo se piden números.
// -------------------------------------------------------------------------
console.log("\nPrueba 2: Solo números activados");
(function () {
  var contrasena = generarContrasena({
    longitud: 16,
    minusculas: false,
    mayusculas: false,
    numeros: true,
    simbolos: false
  });
  afirmar("Contiene solo dígitos 0-9", /^[0-9]+$/.test(contrasena));
  afirmar("Longitud correcta (16)", contrasena.length === 16);
})();

// -------------------------------------------------------------------------
// Prueba 3: Presencia de cada tipo de carácter cuando se activan todos.
// -------------------------------------------------------------------------
console.log("\nPrueba 3: Incluye todos los tipos de caracteres");
(function () {
  // Generamos varias veces para reducir la probabilidad de un falso negativo
  // (aunque la función garantiza al menos uno de cada grupo activo).
  var contrasena = generarContrasena({
    longitud: 40,
    minusculas: true,
    mayusculas: true,
    numeros: true,
    simbolos: true
  });
  afirmar("Contiene al menos una minúscula", /[a-z]/.test(contrasena));
  afirmar("Contiene al menos una mayúscula", /[A-Z]/.test(contrasena));
  afirmar("Contiene al menos un número", /[0-9]/.test(contrasena));
  afirmar("Contiene al menos un símbolo", /[^a-zA-Z0-9]/.test(contrasena));
})();

// -------------------------------------------------------------------------
// Prueba 4: Sin ningún tipo de carácter, debe lanzar un error controlado.
// -------------------------------------------------------------------------
console.log("\nPrueba 4: Error si no se elige ningún tipo de carácter");
(function () {
  var lanzoError = false;
  try {
    generarContrasena({
      longitud: 12,
      minusculas: false,
      mayusculas: false,
      numeros: false,
      simbolos: false
    });
  } catch (e) {
    lanzoError = true;
  }
  afirmar("Lanza un error como se espera", lanzoError === true);
})();

// -------------------------------------------------------------------------
// Prueba 5: Longitud inválida (demasiado corta) debe lanzar error.
// -------------------------------------------------------------------------
console.log("\nPrueba 5: Error con longitud demasiado corta");
(function () {
  var lanzoError = false;
  try {
    generarContrasena({ longitud: 2, minusculas: true });
  } catch (e) {
    lanzoError = true;
  }
  afirmar("Rechaza longitud menor a 4", lanzoError === true);
})();

// -------------------------------------------------------------------------
// Prueba 6: Aleatoriedad — dos contraseñas seguidas no deberían ser iguales.
// -------------------------------------------------------------------------
console.log("\nPrueba 6: Genera contraseñas distintas (aleatoriedad)");
(function () {
  var a = generarContrasena({ longitud: 24, minusculas: true, numeros: true });
  var b = generarContrasena({ longitud: 24, minusculas: true, numeros: true });
  afirmar("Dos contraseñas consecutivas son diferentes", a !== b);
})();

// -------------------------------------------------------------------------
// Prueba 7: La medida de fuerza responde de forma coherente.
// -------------------------------------------------------------------------
console.log("\nPrueba 7: Cálculo de fuerza coherente");
(function () {
  var debil = calcularFuerza("abc");
  var fuerte = calcularFuerza("Abcd1234!xyzQW");
  afirmar("Una contraseña corta es más débil que una larga y variada", fuerte > debil);
})();

// -------------------------------------------------------------------------
// Resumen final y código de salida.
// -------------------------------------------------------------------------
console.log("\n==============================================");
console.log("  Resultado: " + pruebasPasadas + " pasadas, " + pruebasFallidas + " fallidas");
console.log("==============================================");

if (pruebasFallidas === 0) {
  console.log("\n✅ TODAS LAS PRUEBAS PASARON.");
  process.exit(0);
} else {
  console.log("\n❌ HAY PRUEBAS FALLIDAS.");
  process.exit(1);
}
