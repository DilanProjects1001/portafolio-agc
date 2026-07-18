/*
 * script.js — Lógica de la calculadora de propinas (tip-calculator)
 *
 * Este archivo cumple DOS roles:
 *   1. Exporta la función pura `calculateTip` para poder probarla desde Node.js
 *      (ver ../test.js) sin necesidad de un navegador.
 *   2. Cuando se carga en el navegador (dentro de index.html), conecta esa lógica
 *      con la interfaz gráfica.
 *
 * Mantener la lógica de cálculo separada de la interfaz permite testearla de forma
 * fiable y reutilizarla en otros contextos.
 */

/**
 * Calcula la propina y el total a pagar.
 *
 * @param {number} monto      Monto de la cuenta (debe ser >= 0).
 * @param {number} porcentaje Porcentaje de propina (ej: 15 para 15%).
 * @param {number} [personas=1] Número de personas para dividir la cuenta (>= 1).
 * @returns {{propina:number, total:number, porPersona:number}}
 *          propina    = importe de la propina redondeado a 2 decimales.
 *          total      = monto + propina redondeado a 2 decimales.
 *          porPersona = total dividido entre las personas, a 2 decimales.
 * @throws {Error} Si los argumentos no son números válidos o están fuera de rango.
 */
function calculateTip(monto, porcentaje, personas = 1) {
  // Validación: rechazamos entradas no numéricas o negativas para evitar
  // resultados sin sentido (NaN, propinas negativas, división por cero, etc.).
  if (typeof monto !== 'number' || !isFinite(monto) || monto < 0) {
    throw new Error('El monto debe ser un número mayor o igual a 0.');
  }
  if (typeof porcentaje !== 'number' || !isFinite(porcentaje) || porcentaje < 0) {
    throw new Error('El porcentaje debe ser un número mayor o igual a 0.');
  }
  if (typeof personas !== 'number' || !isFinite(personas) || personas < 1) {
    throw new Error('El número de personas debe ser un número mayor o igual a 1.');
  }

  // Cálculo principal: propina = monto * (porcentaje / 100).
  const propina = redondear2(monto * (porcentaje / 100));
  const total = redondear2(monto + propina);
  // Redondeamos por persona sobre el total ya calculado.
  const porPersona = redondear2(total / personas);

  return { propina, total, porPersona };
}

/**
 * Redondea un número a 2 decimales evitando errores clásicos de coma flotante
 * (por ejemplo 1.005 que en binario no es exacto). Sumar Number.EPSILON antes
 * de redondear corrige la mayoría de esos casos límite.
 */
function redondear2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// --- Exportación para Node.js (test) ---
// En navegador `module` no existe, por eso comprobamos su presencia.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateTip, redondear2 };
}

// --- Conexión con la interfaz (solo en navegador) ---
// `document` solo existe en el navegador; en Node este bloque se ignora.
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const inputMonto = document.getElementById('monto');
    const inputPersonas = document.getElementById('personas');
    const botonesPorcentaje = document.querySelectorAll('.btn-porcentaje');
    const inputPorcentajePersonal = document.getElementById('porcentaje-personal');
    const salidaPropina = document.getElementById('res-propina');
    const salidaTotal = document.getElementById('res-total');
    const salidaPorPersona = document.getElementById('res-por-persona');
    const mensajeError = document.getElementById('mensaje-error');

    // Porcentaje seleccionado actualmente (por defecto 15%).
    let porcentajeActual = 15;

    // Formatea un número como moneda simple con 2 decimales.
    const formatoMoneda = (n) => n.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Recalcula y actualiza la pantalla con los valores actuales.
    function actualizar() {
      const monto = parseFloat(inputMonto.value);
      const personas = parseInt(inputPersonas.value, 10) || 1;

      // Si aún no hay monto válido, mostramos ceros sin marcar error.
      if (isNaN(monto) || inputMonto.value.trim() === '') {
        mensajeError.textContent = '';
        salidaPropina.textContent = formatoMoneda(0);
        salidaTotal.textContent = formatoMoneda(0);
        salidaPorPersona.textContent = formatoMoneda(0);
        return;
      }

      try {
        const r = calculateTip(monto, porcentajeActual, personas);
        mensajeError.textContent = '';
        salidaPropina.textContent = formatoMoneda(r.propina);
        salidaTotal.textContent = formatoMoneda(r.total);
        salidaPorPersona.textContent = formatoMoneda(r.porPersona);
      } catch (e) {
        // Mostramos el mensaje de la excepción de forma clara al usuario.
        mensajeError.textContent = e.message;
      }
    }

    // Marca visualmente el botón activo y guarda su porcentaje.
    function seleccionarBoton(boton, valor) {
      botonesPorcentaje.forEach((b) => b.classList.remove('activo'));
      if (boton) boton.classList.add('activo');
      porcentajeActual = valor;
      // Limpiamos el campo personal si se usa un preajuste.
      if (boton) inputPorcentajePersonal.value = '';
      actualizar();
    }

    // Eventos de los botones de porcentaje predefinidos.
    botonesPorcentaje.forEach((boton) => {
      boton.addEventListener('click', () => {
        seleccionarBoton(boton, parseFloat(boton.dataset.valor));
      });
    });

    // Porcentaje personalizado escrito a mano.
    inputPorcentajePersonal.addEventListener('input', () => {
      const valor = parseFloat(inputPorcentajePersonal.value);
      botonesPorcentaje.forEach((b) => b.classList.remove('activo'));
      porcentajeActual = isNaN(valor) ? 0 : valor;
      actualizar();
    });

    // Recalcular cuando cambian monto o personas.
    inputMonto.addEventListener('input', actualizar);
    inputPersonas.addEventListener('input', actualizar);

    // Estado inicial: 15% activo y pantalla en cero.
    const botonPorDefecto = document.querySelector('.btn-porcentaje[data-valor="15"]');
    seleccionarBoton(botonPorDefecto, 15);
  });
}
