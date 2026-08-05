/**
 * script.js — Calculadora de crédito hipotecario.
 *
 * Contiene dos cosas:
 *   1) El motor de cálculo puro (sistema francés: cuota fija). Sin dependencias.
 *   2) El cableado de la interfaz, que solo se activa si hay `document`.
 *
 * Gracias a eso el mismo archivo funciona en el navegador (expone
 * `window.Hipoteca`) y en Node (`module.exports`), así que `check.js` verifica
 * exactamente el código que usa la interfaz, no una copia que puede quedar
 * desincronizada.
 */
(function (global) {
  'use strict';

  var MESES_POR_ANIO = 12;

  /** Convierte a número finito; devuelve `porDefecto` si el valor no sirve. */
  function num(valor, porDefecto) {
    var n = typeof valor === 'string' ? Number(valor.replace(',', '.')) : Number(valor);
    return isFinite(n) ? n : (porDefecto === undefined ? 0 : porDefecto);
  }

  /** Redondea a `decimales` (2 por defecto) evitando restos binarios feos. */
  function redondear(valor, decimales) {
    var d = decimales === undefined ? 2 : decimales;
    var factor = Math.pow(10, d);
    return Math.round((num(valor) + Number.EPSILON) * factor) / factor;
  }

  /**
   * Cuota mensual por el sistema francés (cuota constante):
   *
   *        P · i · (1+i)^n
   *   M = ------------------      i = tasa anual / 12 / 100 ,  n = años · 12
   *         (1+i)^n − 1
   *
   * Con tasa 0% la fórmula se indetermina (0/0), así que se reparte el capital
   * a partes iguales: M = P / n.
   *
   * @param {number} monto      Capital prestado.
   * @param {number} tasaAnual  Interés nominal anual en porcentaje (6 = 6%).
   * @param {number} anios      Plazo en años.
   * @returns {number} Cuota mensual SIN redondear (el redondeo se aplica al mostrar).
   */
  function calcularPagoMensual(monto, tasaAnual, anios) {
    var P = num(monto);
    var n = Math.round(num(anios) * MESES_POR_ANIO);
    if (P <= 0 || n <= 0) return 0;

    var i = num(tasaAnual) / 100 / MESES_POR_ANIO;
    if (i <= 0) return P / n;

    var factor = Math.pow(1 + i, n);
    return (P * i * factor) / (factor - 1);
  }

  /**
   * Genera la tabla de amortización mes a mes.
   *
   * El último mes se ajusta contra el saldo real pendiente: al trabajar con
   * decimales, arrastrar la cuota teórica 360 veces deja un resto de céntimos.
   * Cerrando el último pago contra el saldo, la suma de capital cuadra
   * exactamente con el préstamo y el saldo final es 0.
   *
   * @returns {Array<{mes, pago, pagoCapital, pagoInteres, saldoRestante,
   *                  capitalAcumulado, interesAcumulado}>}
   */
  function generarTablaAmortizacion(monto, tasaAnual, anios) {
    var P = num(monto);
    var n = Math.round(num(anios) * MESES_POR_ANIO);
    if (P <= 0 || n <= 0) return [];

    var i = num(tasaAnual) / 100 / MESES_POR_ANIO;
    if (i < 0) i = 0;

    var cuota = calcularPagoMensual(P, tasaAnual, anios);
    var saldo = P;
    var capitalAcumulado = 0;
    var interesAcumulado = 0;
    var tabla = [];

    for (var mes = 1; mes <= n; mes++) {
      var interes = saldo * i;
      var pago = cuota;
      var capital = pago - interes;

      // Último mes (o si el redondeo dejó el saldo por debajo de la cuota):
      // se salda lo que quede exactamente.
      if (mes === n || capital >= saldo) {
        capital = saldo;
        pago = capital + interes;
      }

      saldo = saldo - capital;
      if (Math.abs(saldo) < 1e-9) saldo = 0;

      capitalAcumulado += capital;
      interesAcumulado += interes;

      tabla.push({
        mes: mes,
        pago: pago,
        pagoCapital: capital,
        pagoInteres: interes,
        saldoRestante: saldo,
        capitalAcumulado: capitalAcumulado,
        interesAcumulado: interesAcumulado
      });

      if (saldo === 0) break;
    }

    return tabla;
  }

  /**
   * Resumen completo del préstamo: cuota, intereses totales, total pagado y
   * la tabla de amortización lista para pintar.
   */
  function calcularHipoteca(datos) {
    var d = datos || {};
    var monto = num(d.monto);
    var tasaAnual = num(d.tasaAnual);
    var anios = num(d.anios);

    var cuota = calcularPagoMensual(monto, tasaAnual, anios);
    var tabla = generarTablaAmortizacion(monto, tasaAnual, anios);

    var interesTotal = 0;
    var totalPagado = 0;
    for (var k = 0; k < tabla.length; k++) {
      interesTotal += tabla[k].pagoInteres;
      totalPagado += tabla[k].pago;
    }

    return {
      monto: monto,
      tasaAnual: tasaAnual,
      anios: anios,
      numeroPagos: tabla.length,
      pagoMensual: cuota,
      interesTotal: interesTotal,
      totalPagado: totalPagado,
      // Cuántos euros de interés se pagan por cada euro prestado.
      costePorEuro: monto > 0 ? interesTotal / monto : 0,
      tabla: tabla
    };
  }

  /** Formatea dinero al estilo español: 1.234,56 */
  function formatearDinero(valor, simbolo) {
    var v = num(valor);
    var s = simbolo || '';
    var negativo = v < 0;
    var texto = Math.abs(v).toFixed(2);
    var partes = texto.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (negativo ? '-' : '') + (s ? s + ' ' : '') + partes[0] + ',' + partes[1];
  }

  var API = {
    calcularPagoMensual: calcularPagoMensual,
    generarTablaAmortizacion: generarTablaAmortizacion,
    calcularHipoteca: calcularHipoteca,
    formatearDinero: formatearDinero,
    redondear: redondear
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
  } else {
    global.Hipoteca = API;
  }

  // ==========================================================================
  // Interfaz. Solo se ejecuta en el navegador; en Node no hay `document`.
  // ==========================================================================
  if (typeof document === 'undefined') return;

  var MESES_NOMBRE = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  var estado = { resultado: null, simbolo: '€' };

  function $(id) { return document.getElementById(id); }

  function dinero(v) { return formatearDinero(v, estado.simbolo); }

  /** Etiqueta "Año 3 · May" a partir del número de mes (1-based). */
  function etiquetaMes(mes) {
    var anio = Math.ceil(mes / 12);
    return 'Año ' + anio + ' · ' + MESES_NOMBRE[(mes - 1) % 12];
  }

  function leerFormulario() {
    return {
      monto: num($('monto').value),
      tasaAnual: num($('tasa').value),
      anios: num($('anios').value)
    };
  }

  /** Valida y devuelve un mensaje de error, o null si todo está bien. */
  function validar(datos) {
    if (!(datos.monto > 0)) return 'Introduce un monto de préstamo mayor que 0.';
    if (datos.tasaAnual < 0) return 'La tasa de interés no puede ser negativa.';
    if (datos.tasaAnual > 100) return 'La tasa de interés parece demasiado alta (máximo 100%).';
    if (!(datos.anios > 0)) return 'El plazo debe ser de al menos 1 año.';
    if (datos.anios > 50) return 'El plazo máximo admitido es de 50 años.';
    return null;
  }

  function mostrarError(mensaje) {
    var caja = $('error');
    if (mensaje) {
      caja.textContent = mensaje;
      caja.hidden = false;
    } else {
      caja.hidden = true;
    }
  }

  function pintarResumen(r) {
    $('res-cuota').textContent = dinero(r.pagoMensual);
    $('res-interes').textContent = dinero(r.interesTotal);
    $('res-total').textContent = dinero(r.totalPagado);
    $('res-pagos').textContent = r.numeroPagos + ' pagos';
    $('res-capital').textContent = dinero(r.monto);
    // Símbolo pospuesto en los dos importes para que la frase se lea natural.
    $('res-coste').textContent = 'Por cada 1 ' + estado.simbolo + ' prestado devuelves ' +
      formatearDinero(r.costePorEuro) + ' ' + estado.simbolo + ' solo en intereses.';

    // Barra capital vs intereses sobre el total pagado.
    var pctCapital = r.totalPagado > 0 ? (r.monto / r.totalPagado) * 100 : 0;
    $('barra-capital').style.width = pctCapital.toFixed(2) + '%';
    $('barra-capital').textContent = Math.round(pctCapital) + '% capital';
    $('barra-interes').textContent = Math.round(100 - pctCapital) + '% intereses';
  }

  function pintarTabla(tabla) {
    var cuerpo = $('tabla-cuerpo');
    // Construir el HTML de golpe: 360 inserciones nodo a nodo se notan.
    var filas = [];
    for (var k = 0; k < tabla.length; k++) {
      var f = tabla[k];
      var claseAnio = f.mes % 12 === 1 ? ' class="inicio-anio"' : '';
      filas.push(
        '<tr' + claseAnio + '>' +
          '<td class="col-mes"><strong>' + f.mes + '</strong><span>' + etiquetaMes(f.mes) + '</span></td>' +
          '<td>' + dinero(f.pago) + '</td>' +
          '<td class="col-capital">' + dinero(f.pagoCapital) + '</td>' +
          '<td class="col-interes">' + dinero(f.pagoInteres) + '</td>' +
          '<td class="col-saldo">' + dinero(f.saldoRestante) + '</td>' +
        '</tr>'
      );
    }
    cuerpo.innerHTML = filas.join('');
    $('tabla-conteo').textContent = tabla.length + ' meses';
  }

  /**
   * Gráfico de saldo restante con <canvas> nativo: área bajo la curva del
   * saldo + línea de intereses acumulados, con ejes y rejilla.
   */
  function pintarGrafico(r) {
    var canvas = $('grafico');
    if (!canvas || !canvas.getContext) return;

    // Escalar el buffer al devicePixelRatio para que no se vea borroso.
    var dpr = global.devicePixelRatio || 1;
    var anchoCSS = canvas.clientWidth || 800;
    var altoCSS = canvas.clientHeight || 320;
    canvas.width = Math.round(anchoCSS * dpr);
    canvas.height = Math.round(altoCSS * dpr);

    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, anchoCSS, altoCSS);

    var margen = { arriba: 20, derecha: 18, abajo: 42, izquierda: 76 };
    var ancho = anchoCSS - margen.izquierda - margen.derecha;
    var alto = altoCSS - margen.arriba - margen.abajo;
    if (ancho <= 0 || alto <= 0) return;

    var tabla = r.tabla;
    var n = tabla.length;
    if (n === 0) return;

    var maxY = Math.max(r.monto, r.interesTotal);
    if (maxY <= 0) return;

    function px(mes) { return margen.izquierda + (mes / n) * ancho; }
    function py(valor) { return margen.arriba + alto - (valor / maxY) * alto; }

    // --- Rejilla horizontal + etiquetas del eje Y ---
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var LINEAS = 5;
    for (var g = 0; g <= LINEAS; g++) {
      var valor = (maxY / LINEAS) * g;
      var y = py(valor);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margen.izquierda, y);
      ctx.lineTo(margen.izquierda + ancho, y);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.fillText(abreviar(valor), margen.izquierda - 10, y);
    }

    // --- Área de saldo restante ---
    ctx.beginPath();
    ctx.moveTo(px(0), py(r.monto));
    for (var k = 0; k < n; k++) ctx.lineTo(px(tabla[k].mes), py(tabla[k].saldoRestante));
    var relleno = ctx.createLinearGradient(0, margen.arriba, 0, margen.arriba + alto);
    relleno.addColorStop(0, 'rgba(29, 78, 216, .30)');
    relleno.addColorStop(1, 'rgba(29, 78, 216, .04)');
    ctx.lineTo(px(n), py(0));
    ctx.lineTo(px(0), py(0));
    ctx.closePath();
    ctx.fillStyle = relleno;
    ctx.fill();

    // Línea del saldo por encima del área.
    ctx.beginPath();
    ctx.moveTo(px(0), py(r.monto));
    for (var k2 = 0; k2 < n; k2++) ctx.lineTo(px(tabla[k2].mes), py(tabla[k2].saldoRestante));
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // --- Línea de intereses acumulados ---
    ctx.beginPath();
    ctx.moveTo(px(0), py(0));
    for (var k3 = 0; k3 < n; k3++) ctx.lineTo(px(tabla[k3].mes), py(tabla[k3].interesAcumulado));
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Ejes ---
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margen.izquierda, margen.arriba);
    ctx.lineTo(margen.izquierda, margen.arriba + alto);
    ctx.lineTo(margen.izquierda + ancho, margen.arriba + alto);
    ctx.stroke();

    // --- Etiquetas del eje X (en años) ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#64748b';
    var aniosTotales = Math.round(n / 12);
    var paso = aniosTotales <= 10 ? 1 : (aniosTotales <= 20 ? 2 : 5);
    for (var a = 0; a <= aniosTotales; a += paso) {
      var xa = px(Math.min(a * 12, n));
      ctx.fillText(a + (a === 0 ? '' : ''), xa, margen.arriba + alto + 10);
    }
    ctx.fillText('años', margen.izquierda + ancho / 2, margen.arriba + alto + 26);
  }

  /** 1234567 -> "1,23 M" ; 45000 -> "45 mil" — para ejes legibles. */
  function abreviar(valor) {
    var v = Math.abs(num(valor));
    if (v >= 1e6) return (valor / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace('.', ',') + ' M';
    if (v >= 1000) return Math.round(valor / 1000) + ' mil';
    return String(Math.round(valor));
  }

  function calcular() {
    var datos = leerFormulario();
    var error = validar(datos);
    if (error) {
      mostrarError(error);
      $('resultados').hidden = true;
      return;
    }
    mostrarError(null);

    var r = calcularHipoteca(datos);
    estado.resultado = r;

    $('resultados').hidden = false;
    pintarResumen(r);
    pintarTabla(r.tabla);
    pintarGrafico(r);
  }

  function iniciar() {
    $('formulario').addEventListener('submit', function (e) {
      e.preventDefault();
      calcular();
    });

    // Recalcular al cambiar cualquier campo: el resultado sigue al usuario.
    ['monto', 'tasa', 'anios'].forEach(function (id) {
      $(id).addEventListener('input', calcular);
    });

    $('moneda').addEventListener('change', function () {
      estado.simbolo = this.value;
      $('simbolo-monto').textContent = this.value;
      calcular();
    });

    // Redibujar el gráfico si cambia el tamaño de la ventana.
    global.addEventListener('resize', function () {
      if (estado.resultado) pintarGrafico(estado.resultado);
    });

    // Cálculo de ejemplo precargado: la app se abre ya mostrando resultados.
    calcular();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})(typeof window !== 'undefined' ? window : globalThis);
