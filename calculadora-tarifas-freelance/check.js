/**
 * check.js — Verificación del motor de cálculo (sin navegador, sin dependencias).
 * Uso: node check.js   → exit 0 si todo pasa, exit 1 si algo falla.
 */
'use strict';

var T = require('./src/tarifas.js');

var pasadas = 0;
var fallos = 0;

function ok(nombre, condicion, detalle) {
  if (condicion) {
    pasadas++;
    console.log('  OK   ' + nombre);
  } else {
    fallos++;
    console.log('  FALLA ' + nombre + (detalle ? ' -> ' + detalle : ''));
  }
}

function casi(a, b, tolerancia) {
  return Math.abs(a - b) <= (tolerancia === undefined ? 0.01 : tolerancia);
}

console.log('\n== Calculadora de tarifas freelance: verificacion ==\n');

// --- 1. Caso base sin impuestos ni margen ---------------------------------
console.log('[1] Caso base (sin impuestos, sin margen, 100% facturable)');
var base = T.calcularTarifa({
  sueldoMensual: 2000, gastosMensuales: 0,
  diasSemana: 5, horasDia: 8,
  diasVacaciones: 0, diasFestivos: 0, diasEnfermedad: 0,
  utilizacion: 100, impuestos: 0, margen: 0
});
ok('260 dias trabajados (5 x 52)', base.diasTrabajados === 260, base.diasTrabajados);
ok('2080 horas facturables', casi(base.horasFacturables, 2080), base.horasFacturables);
ok('coste anual = 24000', casi(base.costeAnual, 24000), base.costeAnual);
// 24000 / 2080 = 11.538461...
ok('tarifa/hora = 11.54', casi(base.tarifaHora, 11.54), base.tarifaHora);
ok('tarifa/dia = tarifa/hora x 8', casi(base.tarifaDia, base.tarifaHora * 8, 0.02), base.tarifaDia);
ok('sin impuestos el bruto = coste', casi(base.ingresoBrutoNecesario, 24000), base.ingresoBrutoNecesario);

// --- 2. Días libres reducen horas y suben la tarifa ------------------------
console.log('\n[2] Vacaciones y festivos');
var conVacaciones = T.calcularTarifa({
  sueldoMensual: 2000, gastosMensuales: 0,
  diasSemana: 5, horasDia: 8,
  diasVacaciones: 20, diasFestivos: 10, diasEnfermedad: 5,
  utilizacion: 100, impuestos: 0, margen: 0
});
ok('35 dias libres descontados', conVacaciones.diasLibres === 35, conVacaciones.diasLibres);
ok('225 dias trabajados', conVacaciones.diasTrabajados === 225, conVacaciones.diasTrabajados);
ok('menos dias => tarifa mayor', conVacaciones.tarifaHora > base.tarifaHora,
  conVacaciones.tarifaHora + ' vs ' + base.tarifaHora);
ok('mismo coste anual', casi(conVacaciones.costeAnual, base.costeAnual), conVacaciones.costeAnual);

// --- 3. Utilización (tiempo no facturable) --------------------------------
console.log('\n[3] Utilizacion al 50%');
var mitad = T.calcularTarifa({
  sueldoMensual: 2000, gastosMensuales: 0,
  diasSemana: 5, horasDia: 8,
  diasVacaciones: 0, diasFestivos: 0, diasEnfermedad: 0,
  utilizacion: 50, impuestos: 0, margen: 0
});
ok('horas facturables = la mitad', casi(mitad.horasFacturables, 1040), mitad.horasFacturables);
ok('tarifa = el doble', casi(mitad.tarifaHora, base.tarifaHora * 2, 0.02), mitad.tarifaHora);

// --- 4. Impuestos: se despejan del bruto, no se suman encima ---------------
console.log('\n[4] Impuestos al 20%');
var conImpuestos = T.calcularTarifa({
  sueldoMensual: 2000, gastosMensuales: 0,
  diasSemana: 5, horasDia: 8,
  diasVacaciones: 0, diasFestivos: 0, diasEnfermedad: 0,
  utilizacion: 100, impuestos: 20, margen: 0
});
// 24000 / 0.8 = 30000: al pagar el 20% del bruto quedan los 24000 necesarios.
ok('bruto necesario = 30000', casi(conImpuestos.ingresoBrutoNecesario, 30000),
  conImpuestos.ingresoBrutoNecesario);
ok('impuestos anuales = 6000', casi(conImpuestos.impuestosAnuales, 6000),
  conImpuestos.impuestosAnuales);
ok('bruto - impuestos = coste',
  casi(conImpuestos.ingresoBrutoNecesario - conImpuestos.impuestosAnuales, 24000),
  conImpuestos.ingresoBrutoNecesario - conImpuestos.impuestosAnuales);

// --- 5. Gastos y margen ----------------------------------------------------
console.log('\n[5] Gastos fijos y margen');
var completo = T.calcularTarifa({
  sueldoMensual: 2000, gastosMensuales: 500,
  diasSemana: 5, horasDia: 8,
  diasVacaciones: 0, diasFestivos: 0, diasEnfermedad: 0,
  utilizacion: 100, impuestos: 0, margen: 10
});
ok('gastos anuales = 6000', casi(completo.gastosAnuales, 6000), completo.gastosAnuales);
ok('coste anual = 30000', casi(completo.costeAnual, 30000), completo.costeAnual);
ok('margen anual = 3000', casi(completo.margenAnual, 3000), completo.margenAnual);
ok('bruto = 33000', casi(completo.ingresoBrutoNecesario, 33000), completo.ingresoBrutoNecesario);
ok('facturacion mensual = 2750', casi(completo.facturacionMensual, 2750), completo.facturacionMensual);

// --- 6. Entradas inválidas: no revientan, se sanean -----------------------
console.log('\n[6] Robustez con entradas invalidas');
var vacio = T.calcularTarifa({});
ok('sin datos no da NaN', isFinite(vacio.tarifaHora), vacio.tarifaHora);
ok('sin datos la tarifa es 0', vacio.tarifaHora === 0, vacio.tarifaHora);
var raro = T.calcularTarifa({
  sueldoMensual: -500, gastosMensuales: 'abc',
  diasSemana: 99, horasDia: 500,
  diasVacaciones: 9999, utilizacion: 0, impuestos: 999, margen: -5
});
ok('valores absurdos siguen dando numero finito', isFinite(raro.tarifaHora), raro.tarifaHora);
ok('dias por semana se limita a 7', raro.diasTrabajados <= 7 * 52, raro.diasTrabajados);
ok('al menos 1 dia trabajado', raro.diasTrabajados >= 1, raro.diasTrabajados);
ok('texto no numerico se ignora (gastos=0)', raro.gastosAnuales === 0, raro.gastosAnuales);

// --- 7. Cotización de proyecto --------------------------------------------
console.log('\n[7] Cotizacion de proyecto');
var cot = T.cotizarProyecto({ horas: 40, tarifaHora: 50, riesgo: 20, descuento: 0 });
ok('40h + 20% riesgo = 48h', casi(cot.horasConRiesgo, 48), cot.horasConRiesgo);
ok('48h x 50 = 2400', casi(cot.total, 2400), cot.total);
ok('tarifa efectiva sube con riesgo', casi(cot.tarifaEfectiva, 60), cot.tarifaEfectiva);

var conDescuento = T.cotizarProyecto({ horas: 40, tarifaHora: 50, riesgo: 0, descuento: 10 });
ok('descuento 10% sobre 2000 = 200', casi(conDescuento.importeDescuento, 200),
  conDescuento.importeDescuento);
ok('total con descuento = 1800', casi(conDescuento.total, 1800), conDescuento.total);
ok('descuento baja la tarifa efectiva a 45', casi(conDescuento.tarifaEfectiva, 45),
  conDescuento.tarifaEfectiva);
var cero = T.cotizarProyecto({ horas: 0, tarifaHora: 50 });
ok('0 horas no divide por cero', cero.tarifaEfectiva === 0, cero.tarifaEfectiva);

// --- 8. Comparador con la tarifa actual ------------------------------------
console.log('\n[8] Comparacion con lo que cobras hoy');
var porDebajo = T.compararTarifa({ tarifaActual: 30, tarifaMinima: 40, horasFacturables: 1000 });
ok('diferencia por hora = -10', casi(porDebajo.diferenciaHora, -10), porDebajo.diferenciaHora);
ok('pierde 10000 al ano', casi(porDebajo.diferenciaAnual, -10000), porDebajo.diferenciaAnual);
ok('veredicto: baja', porDebajo.veredicto === 'baja', porDebajo.veredicto);

var porEncima = T.compararTarifa({ tarifaActual: 55, tarifaMinima: 40, horasFacturables: 1000 });
ok('gana 15000 extra al ano', casi(porEncima.diferenciaAnual, 15000), porEncima.diferenciaAnual);
ok('veredicto: buena', porEncima.veredicto === 'buena', porEncima.veredicto);

var justa = T.compararTarifa({ tarifaActual: 40, tarifaMinima: 40, horasFacturables: 1000 });
ok('veredicto: justa (tolerancia 2%)', justa.veredicto === 'justa', justa.veredicto);
ok('ingreso anual actual = 40000', casi(justa.ingresoAnualActual, 40000), justa.ingresoAnualActual);
var sinDatos = T.compararTarifa({});
ok('comparador sin datos no da NaN', isFinite(sinDatos.diferenciaAnual), sinDatos.diferenciaAnual);

// --- 9. Formato de dinero --------------------------------------------------
console.log('\n[9] Formato de dinero (es-ES)');
ok('1234.5 -> 1.234,50', T.formatearDinero(1234.5) === '1.234,50', T.formatearDinero(1234.5));
ok('con simbolo', T.formatearDinero(1000000, '$') === '$ 1.000.000,00', T.formatearDinero(1000000, '$'));
ok('NaN -> 0,00', T.formatearDinero(NaN) === '0,00', T.formatearDinero(NaN));

// --- Resumen ---------------------------------------------------------------
console.log('\n-----------------------------------------');
console.log('Pruebas pasadas: ' + pasadas + ' | fallidas: ' + fallos);
if (fallos > 0) {
  console.log('RESULTADO: FALLO\n');
  process.exit(1);
}
console.log('RESULTADO: TODO OK\n');
process.exit(0);
