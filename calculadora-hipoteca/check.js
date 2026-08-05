/**
 * check.js — Verificación del motor de cálculo hipotecario.
 * Sin navegador y sin dependencias.
 *
 * Uso: node check.js   → exit 0 si todo pasa, exit 1 si algo falla.
 *
 * Importa el MISMO script.js que usa la interfaz (en Node no hay `document`,
 * así que solo se carga el motor y no el cableado de la UI).
 */
'use strict';

var H = require('./script.js');

var pasadas = 0;
var fallos = 0;

function ok(nombre, condicion, detalle) {
  if (condicion) {
    pasadas++;
    console.log('  OK    ' + nombre);
  } else {
    fallos++;
    console.log('  FALLA ' + nombre + (detalle !== undefined ? ' -> ' + detalle : ''));
  }
}

function casi(a, b, tolerancia) {
  return Math.abs(a - b) <= (tolerancia === undefined ? 0.01 : tolerancia);
}

/** Suma una propiedad de todas las filas de la tabla. */
function sumar(tabla, prop) {
  return tabla.reduce(function (acc, f) { return acc + f[prop]; }, 0);
}

console.log('\n== Calculadora de hipoteca: verificacion del motor ==\n');

// --- 1. Caso conocido: 200.000 al 6% a 30 años ----------------------------
// Referencia clásica de manual: la cuota es 1199.10 (redondeada a céntimos).
console.log('[1] Caso conocido: 200000, 6% anual, 30 anios');
var cuota1 = H.calcularPagoMensual(200000, 6, 30);
console.log('      cuota calculada = ' + cuota1.toFixed(6));
ok('pago mensual = 1199.10', casi(cuota1, 1199.10, 0.01), cuota1.toFixed(4));

var r1 = H.calcularHipoteca({ monto: 200000, tasaAnual: 6, anios: 30 });
ok('360 pagos en la tabla', r1.numeroPagos === 360, r1.numeroPagos);
ok('primer mes: interes = 1000.00', casi(r1.tabla[0].pagoInteres, 1000), r1.tabla[0].pagoInteres);
ok('primer mes: capital = 199.10', casi(r1.tabla[0].pagoCapital, 199.10, 0.01), r1.tabla[0].pagoCapital);
ok('saldo final = 0', casi(r1.tabla[359].saldoRestante, 0, 0.005), r1.tabla[359].saldoRestante);
// 360 x 1199.10 = 431676  ->  431676 - 200000 = 231676 de intereses
ok('intereses totales ~ 231676', casi(r1.interesTotal, 231676, 2), r1.interesTotal.toFixed(2));
ok('total pagado ~ 431676', casi(r1.totalPagado, 431676, 2), r1.totalPagado.toFixed(2));
console.log('      intereses totales = ' + r1.interesTotal.toFixed(2) +
            ' | total pagado = ' + r1.totalPagado.toFixed(2));

// --- 2. Segundo caso conocido: 150.000 al 4.5% a 15 años ------------------
// M = 150000 · 0.00375 · 1.00375^180 / (1.00375^180 − 1) = 1147.49
console.log('\n[2] Caso conocido: 150000, 4.5% anual, 15 anios');
var cuota2 = H.calcularPagoMensual(150000, 4.5, 15);
console.log('      cuota calculada = ' + cuota2.toFixed(6));
ok('pago mensual = 1147.49', casi(cuota2, 1147.49, 0.01), cuota2.toFixed(4));

var r2 = H.calcularHipoteca({ monto: 150000, tasaAnual: 4.5, anios: 15 });
ok('180 pagos en la tabla', r2.numeroPagos === 180, r2.numeroPagos);
ok('primer mes: interes = 562.50', casi(r2.tabla[0].pagoInteres, 562.50), r2.tabla[0].pagoInteres);
ok('saldo final = 0', casi(r2.tabla[179].saldoRestante, 0, 0.005), r2.tabla[179].saldoRestante);
console.log('      intereses totales = ' + r2.interesTotal.toFixed(2));

// --- 3. Coherencia interna de la tabla de amortización --------------------
// Si la tabla está bien construida, la suma del capital devuelto tiene que
// ser exactamente el préstamo, y capital + interes = cuota en cada fila.
console.log('\n[3] Coherencia de la tabla de amortizacion');
var sumaCapital = sumar(r1.tabla, 'pagoCapital');
ok('suma de capital = monto prestado', casi(sumaCapital, 200000, 0.01), sumaCapital.toFixed(4));

var sumaInteres = sumar(r1.tabla, 'pagoInteres');
ok('suma de intereses = interesTotal', casi(sumaInteres, r1.interesTotal, 0.001), sumaInteres.toFixed(4));
ok('capital + intereses = total pagado',
  casi(sumaCapital + sumaInteres, r1.totalPagado, 0.01), (sumaCapital + sumaInteres).toFixed(2));

var filasCuadran = r1.tabla.every(function (f) {
  return casi(f.pagoCapital + f.pagoInteres, f.pago, 1e-6);
});
ok('en cada fila capital + interes = cuota', filasCuadran);

var saldoDecrece = r1.tabla.every(function (f, k) {
  return k === 0 ? f.saldoRestante < 200000 : f.saldoRestante < r1.tabla[k - 1].saldoRestante;
});
ok('el saldo baja todos los meses', saldoDecrece);

// El interés del mes k debe ser el saldo del mes anterior por la tasa mensual.
var i1 = 6 / 100 / 12;
var interesCoherente = r1.tabla.every(function (f, k) {
  var saldoPrevio = k === 0 ? 200000 : r1.tabla[k - 1].saldoRestante;
  return casi(f.pagoInteres, saldoPrevio * i1, 1e-6);
});
ok('interes del mes = saldo previo x tasa mensual', interesCoherente);

// Sistema francés: al principio manda el interés, al final el capital.
ok('mes 1: se paga mas interes que capital',
  r1.tabla[0].pagoInteres > r1.tabla[0].pagoCapital);
ok('mes 360: se paga mas capital que interes',
  r1.tabla[359].pagoCapital > r1.tabla[359].pagoInteres);
ok('acumulados coherentes al final',
  casi(r1.tabla[359].capitalAcumulado, 200000, 0.01) &&
  casi(r1.tabla[359].interesAcumulado, r1.interesTotal, 0.01));

// --- 4. Interés 0%: caso límite que rompe la fórmula general --------------
// Con i = 0 la fórmula da 0/0, hay que repartir el capital a partes iguales.
console.log('\n[4] Prestamo sin intereses (0%)');
var sin = H.calcularHipoteca({ monto: 120000, tasaAnual: 0, anios: 10 });
ok('cuota = monto / meses = 1000', casi(sin.pagoMensual, 1000), sin.pagoMensual);
ok('sin intereses el interes total es 0', casi(sin.interesTotal, 0), sin.interesTotal);
ok('total pagado = monto prestado', casi(sin.totalPagado, 120000), sin.totalPagado);
ok('saldo final = 0', casi(sin.tabla[119].saldoRestante, 0), sin.tabla[119].saldoRestante);

// --- 5. Relaciones que siempre deben cumplirse ---------------------------
console.log('\n[5] Relaciones logicas');
var corto = H.calcularHipoteca({ monto: 200000, tasaAnual: 6, anios: 15 });
ok('menos plazo => cuota mas alta', corto.pagoMensual > r1.pagoMensual,
  corto.pagoMensual.toFixed(2) + ' vs ' + r1.pagoMensual.toFixed(2));
ok('menos plazo => menos intereses', corto.interesTotal < r1.interesTotal,
  corto.interesTotal.toFixed(2) + ' vs ' + r1.interesTotal.toFixed(2));

var caro = H.calcularHipoteca({ monto: 200000, tasaAnual: 8, anios: 30 });
ok('mas tasa => cuota mas alta', caro.pagoMensual > r1.pagoMensual,
  caro.pagoMensual.toFixed(2) + ' vs ' + r1.pagoMensual.toFixed(2));

var doble = H.calcularPagoMensual(400000, 6, 30);
ok('doble monto => doble cuota (es lineal)', casi(doble, cuota1 * 2, 0.01), doble.toFixed(2));
ok('total pagado > monto prestado', r1.totalPagado > r1.monto);
ok('coste por euro prestado ~ 1.158', casi(r1.costePorEuro, 1.158, 0.001), r1.costePorEuro.toFixed(4));

// --- 6. Entradas inválidas: no revientan, se sanean ----------------------
console.log('\n[6] Robustez con entradas invalidas');
ok('monto 0 => cuota 0', H.calcularPagoMensual(0, 6, 30) === 0);
ok('plazo 0 => cuota 0', H.calcularPagoMensual(200000, 6, 0) === 0);
ok('monto negativo => cuota 0', H.calcularPagoMensual(-5000, 6, 30) === 0);
ok('texto no numerico => cuota 0', H.calcularPagoMensual('abc', 6, 30) === 0);
ok('tabla vacia si el monto es 0', H.generarTablaAmortizacion(0, 6, 30).length === 0);

var vacio = H.calcularHipoteca({});
ok('sin datos no da NaN', isFinite(vacio.pagoMensual) && isFinite(vacio.interesTotal), vacio.pagoMensual);
ok('sin datos la tabla esta vacia', vacio.tabla.length === 0, vacio.tabla.length);
ok('sin datos no divide por cero en costePorEuro', vacio.costePorEuro === 0, vacio.costePorEuro);

var decimal = H.calcularHipoteca({ monto: '250000', tasaAnual: '5,5', anios: '20' });
ok('acepta numeros como texto y coma decimal', isFinite(decimal.pagoMensual) && decimal.pagoMensual > 0,
  decimal.pagoMensual.toFixed(2));
ok('coma decimal se lee como 5.5%', casi(decimal.pagoMensual, H.calcularPagoMensual(250000, 5.5, 20), 0.001));

// --- 7. Formato de dinero -------------------------------------------------
console.log('\n[7] Formato de dinero (es-ES)');
ok('1199.1 -> 1.199,10', H.formatearDinero(1199.1) === '1.199,10', H.formatearDinero(1199.1));
ok('con simbolo', H.formatearDinero(231676.38, '€') === '€ 231.676,38', H.formatearDinero(231676.38, '€'));
ok('millones con separadores', H.formatearDinero(1234567.89) === '1.234.567,89', H.formatearDinero(1234567.89));
ok('NaN -> 0,00', H.formatearDinero(NaN) === '0,00', H.formatearDinero(NaN));
ok('negativo conserva el signo', H.formatearDinero(-50.5) === '-50,50', H.formatearDinero(-50.5));

// --- Resumen --------------------------------------------------------------
console.log('\n-----------------------------------------');
console.log('Pruebas pasadas: ' + pasadas + ' | fallidas: ' + fallos);
if (fallos > 0) {
  console.log('RESULTADO: FALLO\n');
  process.exit(1);
}
console.log('RESULTADO: TODO OK\n');
process.exit(0);
