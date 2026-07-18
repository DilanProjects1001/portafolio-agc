/*
 * test.js — Autotest de la lógica de la calculadora de propinas.
 *
 * No necesita navegador ni dependencias externas. Importa la función pura
 * `calculateTip` desde src/script.js y verifica varios casos.
 *
 * Ejecutar con:   node test.js
 * Sale con código 0 si TODAS las pruebas pasan; con código 1 si alguna falla.
 */

const { calculateTip } = require('./src/script.js');

let fallos = 0;
let pruebas = 0;

// Pequeño ayudante de aserción con mensaje claro.
function verificar(descripcion, condicion) {
  pruebas++;
  if (condicion) {
    console.log(`  ✓ ${descripcion}`);
  } else {
    fallos++;
    console.error(`  ✗ FALLÓ: ${descripcion}`);
  }
}

// Compara dos números con tolerancia (por la coma flotante).
function iguales(a, b) {
  return Math.abs(a - b) < 0.001;
}

console.log('Ejecutando pruebas de calculateTip...\n');

// 1. Caso típico: 100 al 15% => propina 15, total 115.
let r = calculateTip(100, 15);
verificar('100 al 15% -> propina = 15', iguales(r.propina, 15));
verificar('100 al 15% -> total = 115', iguales(r.total, 115));

// 2. Al 20% con monto 50 => propina 10, total 60.
r = calculateTip(50, 20);
verificar('50 al 20% -> propina = 10', iguales(r.propina, 10));
verificar('50 al 20% -> total = 60', iguales(r.total, 60));

// 3. Porcentaje 0 => sin propina, total igual al monto.
r = calculateTip(80, 0);
verificar('80 al 0% -> propina = 0', iguales(r.propina, 0));
verificar('80 al 0% -> total = 80', iguales(r.total, 80));

// 4. Monto 0 => todo en cero.
r = calculateTip(0, 15);
verificar('0 al 15% -> total = 0', iguales(r.total, 0));

// 5. División entre personas: 90 al 10% => total 99, entre 3 = 33.
r = calculateTip(90, 10, 3);
verificar('90 al 10% entre 3 -> total = 99', iguales(r.total, 99));
verificar('90 al 10% entre 3 -> por persona = 33', iguales(r.porPersona, 33));

// 6. Redondeo a 2 decimales: 33.33 al 15% => propina 5.00 (33.33*0.15=4.9995).
r = calculateTip(33.33, 15);
verificar('33.33 al 15% -> propina redondeada a 5.00', iguales(r.propina, 5));

// 7. Decimales con coma flotante: 10.10 al 10% => propina 1.01.
r = calculateTip(10.1, 10);
verificar('10.10 al 10% -> propina = 1.01', iguales(r.propina, 1.01));

// 8. Entradas inválidas deben lanzar error.
function lanzaError(fn) {
  try { fn(); return false; } catch (_) { return true; }
}
verificar('monto negativo lanza error', lanzaError(() => calculateTip(-5, 15)));
verificar('porcentaje no numérico lanza error', lanzaError(() => calculateTip(100, 'x')));
verificar('personas = 0 lanza error', lanzaError(() => calculateTip(100, 15, 0)));

// --- Resumen final ---
console.log(`\nResultado: ${pruebas - fallos}/${pruebas} pruebas pasaron.`);

if (fallos > 0) {
  console.error(`\n❌ ${fallos} prueba(s) fallaron.`);
  process.exit(1);
}
console.log('\n✅ Todas las pruebas pasaron.');
process.exit(0);
