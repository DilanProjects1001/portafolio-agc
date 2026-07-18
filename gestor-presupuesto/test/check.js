/*
 * check.js — Autotest del Gestor de Presupuesto.
 *
 * Verifica la lógica de app.js sin necesidad de navegador:
 *   1. Con presupuesto de 1000 y gastos de 200 y 300 -> total 500, restante 500.
 *   2. Tras eliminar el gasto de 300 -> total 200.
 *
 * Sale con código 0 si todo pasa; con código 1 si algo falla.
 */

var app = require('../src/app.js');

var errores = 0;

function verificar(descripcion, obtenido, esperado) {
  if (obtenido === esperado) {
    console.log('  OK  - ' + descripcion + ' (= ' + obtenido + ')');
  } else {
    errores++;
    console.log('FALLA - ' + descripcion + ' -> esperado ' + esperado + ', obtenido ' + obtenido);
  }
}

console.log('== Autotest Gestor de Presupuesto ==');

var PRESUPUESTO = 1000;

// Paso 1: agregar gastos de 200 y 300.
app.addExpense('Supermercado', 200);
app.addExpense('Transporte', 300);

verificar('Total de gastos tras agregar 200 y 300', app.getTotalExpenses(), 500);
verificar('Restante con presupuesto 1000', app.getRemaining(PRESUPUESTO), 500);

// Paso 2: eliminar el gasto de 300 (índice 1) -> total 200.
app.removeExpense(1);

verificar('Total de gastos tras eliminar uno', app.getTotalExpenses(), 200);
verificar('Restante tras eliminar', app.getRemaining(PRESUPUESTO), 800);

console.log('====================================');

if (errores === 0) {
  console.log('RESULTADO: TODAS LAS PRUEBAS PASARON ✔');
  process.exit(0);
} else {
  console.log('RESULTADO: ' + errores + ' PRUEBA(S) FALLARON X');
  process.exit(1);
}
