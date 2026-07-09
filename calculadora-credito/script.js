/**
 * script.js — Lógica de la Calculadora de Crédito
 * ------------------------------------------------
 * Contiene la función principal `calcularPrestamo`, que calcula el pago
 * mensual de un préstamo usando el sistema de amortización francesa (cuota
 * fija: la persona paga siempre el mismo importe cada mes).
 *
 * El archivo funciona en DOS entornos:
 *   1. En el navegador (conectado a la interfaz de index.html).
 *   2. En Node.js (para las pruebas automáticas de test.js).
 *
 * Por eso, al final se exporta la función con `module.exports` solo cuando
 * estamos en Node (comprobando que `module` exista).
 */

/**
 * Calcula la cuota de un préstamo con amortización francesa.
 *
 * Fórmula de la cuota mensual (sistema francés / cuota constante):
 *
 *            i · (1 + i)^n
 *   C = P · -----------------
 *            (1 + i)^n − 1
 *
 * donde:
 *   P = monto del préstamo (capital / principal)
 *   i = tasa de interés MENSUAL en tanto por uno (tasa anual / 12 / 100)
 *   n = número total de cuotas (meses)
 *   C = cuota (pago) mensual
 *
 * Caso especial: si la tasa es 0, no hay intereses y la cuota es simplemente
 * el monto dividido entre el número de meses.
 *
 * @param {number} monto      - Capital del préstamo (por ejemplo 10000).
 * @param {number} tasaAnual  - Tasa de interés anual en PORCENTAJE (por ejemplo 12 = 12%).
 * @param {number} meses      - Plazo del préstamo en número de meses (por ejemplo 24).
 * @returns {{pagoMensual: number, totalPagado: number, totalInteres: number}}
 *          Objeto con la cuota mensual, el total pagado al final y los intereses totales.
 */
function calcularPrestamo(monto, tasaAnual, meses) {
  // Convertimos las entradas a número por si llegan como texto desde la interfaz.
  var P = Number(monto);
  var tasa = Number(tasaAnual);
  var n = Number(meses);

  // Validaciones básicas: los valores deben ser números válidos y positivos.
  if (!isFinite(P) || !isFinite(tasa) || !isFinite(n)) {
    throw new Error("Los valores deben ser números válidos.");
  }
  if (P <= 0) {
    throw new Error("El monto del préstamo debe ser mayor que cero.");
  }
  if (n <= 0) {
    throw new Error("El plazo en meses debe ser mayor que cero.");
  }
  if (tasa < 0) {
    throw new Error("La tasa de interés no puede ser negativa.");
  }

  // Tasa de interés MENSUAL en tanto por uno.
  // Ejemplo: 12% anual -> 12 / 100 / 12 = 0.01 (1% mensual).
  var i = tasa / 100 / 12;

  var pagoMensual;

  if (i === 0) {
    // Sin intereses: la cuota es el reparto simple del capital entre los meses.
    pagoMensual = P / n;
  } else {
    // Amortización francesa: aplicamos la fórmula de la cuota constante.
    var factor = Math.pow(1 + i, n); // (1 + i)^n
    pagoMensual = P * (i * factor) / (factor - 1);
  }

  // El total pagado es la cuota multiplicada por el número de meses.
  var totalPagado = pagoMensual * n;

  // Los intereses son la diferencia entre lo pagado y el capital prestado.
  var totalInteres = totalPagado - P;

  // Redondeamos a 2 decimales (céntimos) para mostrar valores monetarios limpios.
  return {
    pagoMensual: redondear2(pagoMensual),
    totalPagado: redondear2(totalPagado),
    totalInteres: redondear2(totalInteres)
  };
}

/**
 * Redondea un número a 2 decimales evitando errores de coma flotante.
 * @param {number} valor
 * @returns {number}
 */
function redondear2(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Da formato de moneda a un número (separadores de miles y 2 decimales).
 * Se usa solo en el navegador para mostrar los resultados de forma legible.
 * @param {number} valor
 * @returns {string}
 */
function formatoMoneda(valor) {
  return "$" + Number(valor).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// -------------------------------------------------------------------------
// Conexión con la interfaz (solo se ejecuta en el navegador).
// -------------------------------------------------------------------------
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    var formulario = document.getElementById("formulario");
    var resultado = document.getElementById("resultado");
    var mensajeError = document.getElementById("mensaje-error");

    if (!formulario) {
      return;
    }

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault(); // Evita que la página se recargue al enviar.

      // Limpiamos mensajes previos.
      mensajeError.textContent = "";

      var monto = document.getElementById("monto").value;
      var tasa = document.getElementById("tasa").value;
      var meses = document.getElementById("meses").value;

      try {
        var datos = calcularPrestamo(monto, tasa, meses);

        // Volcamos los resultados en la interfaz con formato de moneda.
        document.getElementById("pago-mensual").textContent = formatoMoneda(datos.pagoMensual);
        document.getElementById("total-pagado").textContent = formatoMoneda(datos.totalPagado);
        document.getElementById("total-interes").textContent = formatoMoneda(datos.totalInteres);

        // Mostramos el bloque de resultados (si estaba oculto).
        resultado.classList.add("visible");
      } catch (error) {
        // Si algo va mal, mostramos el mensaje y ocultamos resultados.
        resultado.classList.remove("visible");
        mensajeError.textContent = error.message;
      }
    });
  });
}

// -------------------------------------------------------------------------
// Exportación para Node.js (usada por test.js). En el navegador `module`
// no existe, así que esta parte se ignora sin causar errores.
// -------------------------------------------------------------------------
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calcularPrestamo: calcularPrestamo,
    redondear2: redondear2
  };
}
