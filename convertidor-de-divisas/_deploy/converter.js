/**
 * converter.js — Lógica de conversión de divisas (sin interfaz).
 *
 * Este archivo NO toca el DOM: sólo hace cuentas y da formato. Por eso se puede
 * usar en dos sitios a la vez:
 *   - en el navegador,  <script src="converter.js"></script>  ->  window.Conversor
 *   - en Node,          var C = require('./converter.js');
 * Así las pruebas de test/convertidor.test.js validan exactamente el mismo código
 * que ejecuta la página, no una copia parecida.
 */
(function (raiz, fabrica) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Conversor = fabrica();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Tasas fijas de demostración (offline, no son cotizaciones en tiempo real).
   * Se expresan siempre como "cuánto vale 1 USD" en esa moneda, así con una sola
   * columna de números salen las 25 combinaciones posibles sin tabla cruzada.
   */
  var TASAS = {
    USD: { porUSD: 1,      nombre: 'Dólar estadounidense', locale: 'en-US', decimales: 2 },
    EUR: { porUSD: 0.85,   nombre: 'Euro',                 locale: 'de-DE', decimales: 2 },
    GBP: { porUSD: 0.73,   nombre: 'Libra esterlina',      locale: 'en-GB', decimales: 2 },
    JPY: { porUSD: 149.50, nombre: 'Yen japonés',          locale: 'ja-JP', decimales: 0 },
    MXN: { porUSD: 17.50,  nombre: 'Peso mexicano',        locale: 'es-MX', decimales: 2 }
  };

  /** Orden en que las monedas se muestran en los desplegables. */
  var ORDEN = ['USD', 'EUR', 'GBP', 'JPY', 'MXN'];

  /** ¿Existe ese código de moneda? */
  function existe(codigo) {
    return Object.prototype.hasOwnProperty.call(TASAS, codigo);
  }

  /** Devuelve la ficha de una moneda (una copia, para que nadie altere la tabla). */
  function moneda(codigo) {
    if (!existe(codigo)) throw new Error('Moneda desconocida: ' + codigo);
    var m = TASAS[codigo];
    return { codigo: codigo, porUSD: m.porUSD, nombre: m.nombre, locale: m.locale, decimales: m.decimales };
  }

  /** Lista ordenada de las monedas soportadas, lista para pintar el <select>. */
  function listarMonedas() {
    return ORDEN.map(moneda);
  }

  /**
   * Convierte un monto entre dos monedas.
   * Fórmula: monto / tasa(origen) * tasa(destino), pasando por USD como base.
   */
  function convertir(monto, desde, hacia) {
    if (typeof monto !== 'number' || !isFinite(monto)) {
      throw new Error('El monto debe ser un número finito');
    }
    if (monto < 0) throw new Error('El monto no puede ser negativo');
    if (!existe(desde)) throw new Error('Moneda de origen desconocida: ' + desde);
    if (!existe(hacia)) throw new Error('Moneda de destino desconocida: ' + hacia);
    return monto / TASAS[desde].porUSD * TASAS[hacia].porUSD;
  }

  /** Cuánto vale 1 unidad de `desde` expresada en `hacia`. */
  function tasaEntre(desde, hacia) {
    return convertir(1, desde, hacia);
  }

  /**
   * Da formato de moneda local: símbolo, separadores y decimales correctos
   * (el yen sin decimales, el peso con separadores mexicanos, etc.).
   */
  function formatearMoneda(valor, codigo) {
    var info = moneda(codigo);
    if (typeof valor !== 'number' || !isFinite(valor)) {
      throw new Error('El valor a formatear debe ser un número finito');
    }
    try {
      return new Intl.NumberFormat(info.locale, {
        style: 'currency',
        currency: codigo,
        minimumFractionDigits: info.decimales,
        maximumFractionDigits: info.decimales
      }).format(valor);
    } catch (e) {
      /* Respaldo si el entorno no trae Intl completo: legible igualmente. */
      return valor.toFixed(info.decimales) + ' ' + codigo;
    }
  }

  /**
   * Valida lo que el usuario escribió en el campo del monto.
   * Devuelve { ok:true, valor:Number } o { ok:false, error:'mensaje en español' }.
   * La interfaz sólo tiene que mostrar `error`; las reglas viven aquí.
   */
  function validarMonto(bruto) {
    var texto = String(bruto === null || bruto === undefined ? '' : bruto).trim();
    if (texto === '') return { ok: false, error: 'Escribe un monto para poder convertir.' };
    /* Aceptamos coma decimal además del punto: "12,5" y "12.5" valen igual. */
    var normalizado = texto.replace(',', '.');
    var numero = Number(normalizado);
    if (normalizado === '' || isNaN(numero) || !isFinite(numero)) {
      return { ok: false, error: 'El monto debe ser un número válido.' };
    }
    if (numero < 0) return { ok: false, error: 'El monto no puede ser negativo.' };
    return { ok: true, valor: numero };
  }

  /**
   * Operación completa lista para pintar en pantalla: valida, convierte y formatea.
   * Devuelve { ok:false, error } o { ok:true, valor, textoResultado, textoDetalle, textoTasa }.
   */
  function operar(bruto, desde, hacia) {
    var v = validarMonto(bruto);
    if (!v.ok) return v;
    var resultado = convertir(v.valor, desde, hacia);
    return {
      ok: true,
      monto: v.valor,
      valor: resultado,
      textoResultado: formatearMoneda(resultado, hacia),
      textoDetalle: formatearMoneda(v.valor, desde) + ' equivale a ' + formatearMoneda(resultado, hacia),
      textoTasa: desde === hacia
        ? 'Ambas monedas son la misma: el monto no cambia.'
        : 'Tasa aplicada: 1 ' + desde + ' = ' + formatearMoneda(tasaEntre(desde, hacia), hacia) +
          ' (' + TASAS[hacia].nombre + ').'
    };
  }

  return {
    TASAS: TASAS,
    ORDEN: ORDEN,
    existe: existe,
    moneda: moneda,
    listarMonedas: listarMonedas,
    convertir: convertir,
    tasaEntre: tasaEntre,
    formatearMoneda: formatearMoneda,
    validarMonto: validarMonto,
    operar: operar
  };
}));
