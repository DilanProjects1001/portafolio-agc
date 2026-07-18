/*
 * app.js — Lógica del Gestor de Presupuesto Mensual.
 *
 * Mantiene un array interno de gastos, cada uno con la forma { name, amount }.
 * Funciona tanto en el navegador (funciones globales usadas por index.html)
 * como en Node.js (se exportan con module.exports para poder probarlas).
 */

// Array interno de gastos: cada elemento es { name: string, amount: number }.
var expenses = [];

/**
 * Agrega un gasto a la lista.
 * @param {string} name   Nombre del gasto.
 * @param {number} amount Monto del gasto (se normaliza a número).
 * @returns {Object} El gasto agregado { name, amount }.
 */
function addExpense(name, amount) {
  var gasto = { name: String(name), amount: Number(amount) };
  expenses.push(gasto);
  return gasto;
}

/**
 * Elimina el gasto ubicado en el índice indicado.
 * @param {number} index Posición del gasto a eliminar.
 * @returns {boolean} true si se eliminó, false si el índice no es válido.
 */
function removeExpense(index) {
  if (index < 0 || index >= expenses.length) {
    return false;
  }
  expenses.splice(index, 1);
  return true;
}

/**
 * Suma todos los montos de los gastos.
 * @returns {number} Total de gastos.
 */
function getTotalExpenses() {
  return expenses.reduce(function (suma, gasto) {
    return suma + gasto.amount;
  }, 0);
}

/**
 * Calcula cuánto queda del presupuesto tras restar los gastos.
 * @param {number} budget Presupuesto mensual.
 * @returns {number} Restante (puede ser negativo si hay sobregiro).
 */
function getRemaining(budget) {
  return Number(budget) - getTotalExpenses();
}

/**
 * Devuelve una copia del array de gastos (usado por la interfaz para renderizar).
 * @returns {Array<Object>} Lista de gastos.
 */
function getExpenses() {
  return expenses.slice();
}

// Exportación para Node.js (pruebas). En el navegador este bloque se ignora.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addExpense: addExpense,
    removeExpense: removeExpense,
    getTotalExpenses: getTotalExpenses,
    getRemaining: getRemaining,
    getExpenses: getExpenses
  };
}
