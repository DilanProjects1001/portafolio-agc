/**
 * Motor de conversión de unidades.
 * Funciona tanto en el navegador (se carga con <script>) como en Node.js (require).
 * Sin dependencias externas.
 */
(function (raiz) {
  'use strict';

  // Cada categoría define sus unidades con un factor hacia la "unidad base".
  // Longitud -> base metro | Peso -> base kilogramo | Volumen -> base litro
  var CATEGORIAS = {
    longitud: {
      nombre: 'Longitud',
      icono: '📏',
      base: 'm',
      unidades: {
        m:  { etiqueta: 'Metros (m)',        factor: 1 },
        cm: { etiqueta: 'Centímetros (cm)',  factor: 0.01 },
        mm: { etiqueta: 'Milímetros (mm)',   factor: 0.001 },
        km: { etiqueta: 'Kilómetros (km)',   factor: 1000 },
        in: { etiqueta: 'Pulgadas (in)',     factor: 0.0254 },
        ft: { etiqueta: 'Pies (ft)',         factor: 0.3048 },
        yd: { etiqueta: 'Yardas (yd)',       factor: 0.9144 },
        mi: { etiqueta: 'Millas (mi)',       factor: 1609.344 }
      }
    },
    peso: {
      nombre: 'Peso',
      icono: '⚖️',
      base: 'kg',
      unidades: {
        kg: { etiqueta: 'Kilogramos (kg)', factor: 1 },
        g:  { etiqueta: 'Gramos (g)',      factor: 0.001 },
        lb: { etiqueta: 'Libras (lb)',     factor: 0.45359237 },
        oz: { etiqueta: 'Onzas (oz)',      factor: 0.028349523125 }
      }
    },
    temperatura: {
      nombre: 'Temperatura',
      icono: '🌡️',
      base: 'C',
      unidades: {
        C: { etiqueta: 'Celsius (°C)',    factor: null },
        F: { etiqueta: 'Fahrenheit (°F)', factor: null },
        K: { etiqueta: 'Kelvin (K)',      factor: null }
      }
    },
    volumen: {
      nombre: 'Volumen',
      icono: '🧪',
      base: 'L',
      unidades: {
        L:   { etiqueta: 'Litros (L)',           factor: 1 },
        mL:  { etiqueta: 'Mililitros (mL)',      factor: 0.001 },
        gal: { etiqueta: 'Galones EE.UU. (gal)', factor: 3.785411784 },
        qt:  { etiqueta: 'Cuartos (qt)',         factor: 0.946352946 },
        pt:  { etiqueta: 'Pintas (pt)',          factor: 0.473176473 },
        cup: { etiqueta: 'Tazas (cup)',          factor: 0.2365882365 }
      }
    }
  };

  /** Convierte cualquier temperatura a grados Celsius (unidad base interna). */
  function temperaturaACelsius(valor, unidad) {
    if (unidad === 'C') return valor;
    if (unidad === 'F') return (valor - 32) * 5 / 9;
    if (unidad === 'K') return valor - 273.15;
    throw new Error('Unidad de temperatura desconocida: ' + unidad);
  }

  /** Convierte grados Celsius a la unidad de temperatura indicada. */
  function celsiusA(valor, unidad) {
    if (unidad === 'C') return valor;
    if (unidad === 'F') return valor * 9 / 5 + 32;
    if (unidad === 'K') return valor + 273.15;
    throw new Error('Unidad de temperatura desconocida: ' + unidad);
  }

  /**
   * Convierte un valor entre dos unidades de la misma categoría.
   * @param {number} valor    Cantidad a convertir.
   * @param {string} desde    Clave de la unidad de origen (ej. 'km').
   * @param {string} hacia    Clave de la unidad de destino (ej. 'mi').
   * @param {string} categoria 'longitud' | 'peso' | 'temperatura' | 'volumen'
   * @returns {number} El valor convertido.
   */
  function convertir(valor, desde, hacia, categoria) {
    var cat = CATEGORIAS[categoria];
    if (!cat) throw new Error('Categoría desconocida: ' + categoria);

    var numero = typeof valor === 'number' ? valor : parseFloat(valor);
    if (!isFinite(numero)) throw new Error('El valor debe ser un número válido.');

    if (!cat.unidades[desde]) throw new Error('Unidad de origen inválida: ' + desde);
    if (!cat.unidades[hacia]) throw new Error('Unidad de destino inválida: ' + hacia);

    if (categoria === 'temperatura') {
      return celsiusA(temperaturaACelsius(numero, desde), hacia);
    }

    var enBase = numero * cat.unidades[desde].factor;
    return enBase / cat.unidades[hacia].factor;
  }

  /**
   * Da formato legible a un número: evita notación científica innecesaria,
   * recorta ceros sobrantes y usa exponencial solo en valores extremos.
   */
  function formatear(numero, decimales) {
    if (!isFinite(numero)) return '—';
    var maxDec = typeof decimales === 'number' ? decimales : 6;
    var abs = Math.abs(numero);

    if (abs !== 0 && (abs < 1e-6 || abs >= 1e12)) {
      return numero.toExponential(4);
    }
    var texto = numero.toFixed(maxDec);
    if (texto.indexOf('.') !== -1) {
      texto = texto.replace(/0+$/, '').replace(/\.$/, '');
    }
    return texto === '-0' ? '0' : texto;
  }

  var api = {
    CATEGORIAS: CATEGORIAS,
    convertir: convertir,
    formatear: formatear,
    temperaturaACelsius: temperaturaACelsius,
    celsiusA: celsiusA
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    raiz.Conversor = api;
  }
})(typeof self !== 'undefined' ? self : this);
