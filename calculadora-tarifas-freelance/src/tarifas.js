/**
 * tarifas.js — Motor de cálculo de tarifas para freelancers.
 *
 * Sin dependencias. Funciona igual en el navegador (script clásico, expone
 * `window.Tarifas`) y en Node (module.exports), para que el mismo código que
 * usa la interfaz sea el que verifican los tests.
 */
(function (global) {
  'use strict';

  var SEMANAS_POR_ANIO = 52;

  /** Convierte a número finito; devuelve `porDefecto` si el valor no sirve. */
  function num(valor, porDefecto) {
    var n = typeof valor === 'string' ? Number(valor.replace(',', '.')) : Number(valor);
    return isFinite(n) ? n : porDefecto;
  }

  /** Limita un número al rango [min, max]. */
  function limitar(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  /**
   * Calcula la tarifa mínima que necesita cobrar un freelance para cubrir
   * su sueldo objetivo, sus gastos, sus impuestos y su margen.
   *
   * La clave del cálculo son las HORAS REALMENTE FACTURABLES: nadie factura
   * 8 h/día los 365 días. Se descuentan vacaciones, festivos, días de baja y
   * el tiempo no facturable (administración, ventas, formación).
   *
   * @param {Object} entrada
   * @param {number} entrada.sueldoMensual   Sueldo neto mensual objetivo.
   * @param {number} entrada.gastosMensuales Gastos fijos del negocio al mes.
   * @param {number} entrada.diasSemana      Días trabajados por semana (1-7).
   * @param {number} entrada.horasDia        Horas de trabajo al día (1-16).
   * @param {number} entrada.diasVacaciones  Días de vacaciones al año.
   * @param {number} entrada.diasFestivos    Festivos al año.
   * @param {number} entrada.diasEnfermedad  Colchón de días de baja al año.
   * @param {number} entrada.utilizacion     % del tiempo que sí es facturable (1-100).
   * @param {number} entrada.impuestos       % de impuestos sobre el ingreso bruto (0-90).
   * @param {number} entrada.margen          % de margen/beneficio extra (0-200).
   * @returns {Object} desglose completo del cálculo.
   */
  function calcularTarifa(entrada) {
    var e = entrada || {};

    var sueldoMensual = Math.max(0, num(e.sueldoMensual, 0));
    var gastosMensuales = Math.max(0, num(e.gastosMensuales, 0));
    var diasSemana = limitar(num(e.diasSemana, 5), 1, 7);
    var horasDia = limitar(num(e.horasDia, 8), 0.5, 16);
    var diasVacaciones = Math.max(0, num(e.diasVacaciones, 0));
    var diasFestivos = Math.max(0, num(e.diasFestivos, 0));
    var diasEnfermedad = Math.max(0, num(e.diasEnfermedad, 0));
    var utilizacion = limitar(num(e.utilizacion, 100), 1, 100);
    var impuestos = limitar(num(e.impuestos, 0), 0, 90);
    var margen = limitar(num(e.margen, 0), 0, 200);

    // --- Días y horas disponibles -----------------------------------------
    var diasBrutos = diasSemana * SEMANAS_POR_ANIO;
    var diasLibres = diasVacaciones + diasFestivos + diasEnfermedad;
    // Nunca dejamos el año en cero días: al menos 1 día trabajado.
    var diasTrabajados = Math.max(1, diasBrutos - diasLibres);
    var horasTrabajadas = diasTrabajados * horasDia;
    var horasFacturables = horasTrabajadas * (utilizacion / 100);

    // --- Dinero necesario --------------------------------------------------
    var sueldoAnual = sueldoMensual * 12;
    var gastosAnuales = gastosMensuales * 12;
    var costeAnual = sueldoAnual + gastosAnuales;

    // El margen se aplica sobre el coste (colchón de beneficio del negocio)...
    var conMargen = costeAnual * (1 + margen / 100);
    // ...y los impuestos se despejan del bruto: bruto - bruto*t = conMargen.
    var ingresoBrutoNecesario = conMargen / (1 - impuestos / 100);

    var tarifaHora = ingresoBrutoNecesario / horasFacturables;
    var tarifaDia = tarifaHora * horasDia;
    var tarifaSemana = tarifaDia * diasSemana * (utilizacion / 100);
    var facturacionMensual = ingresoBrutoNecesario / 12;

    return {
      diasTrabajados: diasTrabajados,
      diasLibres: diasLibres,
      horasTrabajadas: redondear(horasTrabajadas, 1),
      horasFacturables: redondear(horasFacturables, 1),
      horasFacturablesMes: redondear(horasFacturables / 12, 1),
      sueldoAnual: redondear(sueldoAnual, 2),
      gastosAnuales: redondear(gastosAnuales, 2),
      costeAnual: redondear(costeAnual, 2),
      impuestosAnuales: redondear(ingresoBrutoNecesario - conMargen, 2),
      margenAnual: redondear(conMargen - costeAnual, 2),
      ingresoBrutoNecesario: redondear(ingresoBrutoNecesario, 2),
      facturacionMensual: redondear(facturacionMensual, 2),
      tarifaHora: redondear(tarifaHora, 2),
      tarifaDia: redondear(tarifaDia, 2),
      tarifaSemana: redondear(tarifaSemana, 2)
    };
  }

  /**
   * Cotiza un proyecto a partir de horas estimadas.
   * Añade un colchón de riesgo (los proyectos siempre se alargan) y permite
   * un descuento comercial. Devuelve además el precio por hora efectivo, que
   * es lo que de verdad acabas cobrando tras el descuento.
   *
   * @param {Object} entrada
   * @param {number} entrada.horas     Horas estimadas de trabajo.
   * @param {number} entrada.tarifaHora Tarifa por hora a aplicar.
   * @param {number} entrada.riesgo    % de colchón por imprevistos (0-100).
   * @param {number} entrada.descuento % de descuento comercial (0-90).
   * @returns {Object} desglose de la cotización.
   */
  function cotizarProyecto(entrada) {
    var e = entrada || {};
    var horas = Math.max(0, num(e.horas, 0));
    var tarifaHora = Math.max(0, num(e.tarifaHora, 0));
    var riesgo = limitar(num(e.riesgo, 0), 0, 100);
    var descuento = limitar(num(e.descuento, 0), 0, 90);

    var horasConRiesgo = horas * (1 + riesgo / 100);
    var subtotal = horasConRiesgo * tarifaHora;
    var importeDescuento = subtotal * (descuento / 100);
    var total = subtotal - importeDescuento;
    // Precio/hora real: el total repartido entre las horas que estimaste tú,
    // no entre las horas con colchón (así ves si el descuento te deja bajo tarifa).
    var tarifaEfectiva = horas > 0 ? total / horas : 0;

    return {
      horas: redondear(horas, 2),
      horasConRiesgo: redondear(horasConRiesgo, 2),
      subtotal: redondear(subtotal, 2),
      importeDescuento: redondear(importeDescuento, 2),
      total: redondear(total, 2),
      tarifaEfectiva: redondear(tarifaEfectiva, 2)
    };
  }

  /**
   * Compara la tarifa que cobras hoy con la tarifa mínima calculada y traduce
   * la diferencia a dinero al año (que es donde se nota de verdad).
   *
   * @param {Object} entrada
   * @param {number} entrada.tarifaActual     Lo que cobras ahora por hora.
   * @param {number} entrada.tarifaMinima     Tarifa mínima calculada.
   * @param {number} entrada.horasFacturables Horas facturables al año.
   * @returns {Object} diferencia por hora, al año y veredicto ('baja'|'justa'|'buena').
   */
  function compararTarifa(entrada) {
    var e = entrada || {};
    var actual = Math.max(0, num(e.tarifaActual, 0));
    var minima = Math.max(0, num(e.tarifaMinima, 0));
    var horas = Math.max(0, num(e.horasFacturables, 0));

    var diferenciaHora = actual - minima;
    var diferenciaAnual = diferenciaHora * horas;

    // Margen de tolerancia del 2%: por debajo es "baja", por encima "buena".
    var veredicto = 'justa';
    if (minima > 0) {
      if (actual < minima * 0.98) veredicto = 'baja';
      else if (actual > minima * 1.02) veredicto = 'buena';
    }

    return {
      tarifaActual: redondear(actual, 2),
      diferenciaHora: redondear(diferenciaHora, 2),
      diferenciaAnual: redondear(diferenciaAnual, 2),
      ingresoAnualActual: redondear(actual * horas, 2),
      veredicto: veredicto
    };
  }

  /** Redondeo estable a N decimales (evita 0.1+0.2 = 0.30000000000000004). */
  function redondear(n, decimales) {
    if (!isFinite(n)) return 0;
    var f = Math.pow(10, decimales);
    return Math.round((n + Number.EPSILON) * f) / f;
  }

  /** Formatea un número como dinero con separador de miles en formato es-ES. */
  function formatearDinero(n, simbolo) {
    var s = simbolo === undefined ? '' : simbolo;
    var valor = isFinite(n) ? n : 0;
    var texto = valor.toFixed(2);
    var partes = texto.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (s ? s + ' ' : '') + partes[0] + ',' + partes[1];
  }

  var API = {
    calcularTarifa: calcularTarifa,
    cotizarProyecto: cotizarProyecto,
    compararTarifa: compararTarifa,
    formatearDinero: formatearDinero,
    redondear: redondear
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
  } else {
    global.Tarifas = API;
  }
})(typeof window !== 'undefined' ? window : globalThis);
