/**
 * test/convertidor.test.js — Pruebas de la lógica de conversión.
 * Ejecutar desde la carpeta del proyecto:   node test/convertidor.test.js
 *
 * Carga converter.js (el MISMO archivo que usa la página en el navegador) y
 * valida las conversiones, el formato de moneda y la validación de entradas.
 * No abre navegador ni necesita dependencias.
 *
 * Sale con código 0 si todo pasa, 1 si algo falla.
 */
'use strict';

var C = require('../converter.js');

var pasadas = 0;
var fallidas = 0;

function ok(nombre, detalle) {
  pasadas++;
  console.log('  OK    ' + nombre + (detalle ? '  ->  ' + detalle : ''));
}
function falla(nombre, detalle) {
  fallidas++;
  console.error('  FALLA ' + nombre + (detalle ? '  ->  ' + detalle : ''));
}
function cierto(nombre, condicion, detalle) {
  if (condicion) ok(nombre, detalle); else falla(nombre, detalle || 'la condición no se cumplió');
}
function igual(nombre, obtenido, esperado) {
  if (obtenido === esperado) ok(nombre, String(obtenido));
  else falla(nombre, 'esperado ' + JSON.stringify(esperado) + ', obtenido ' + JSON.stringify(obtenido));
}
function casiIgual(nombre, obtenido, esperado, tolerancia) {
  var t = tolerancia === undefined ? 1e-9 : tolerancia;
  if (typeof obtenido === 'number' && Math.abs(obtenido - esperado) <= t) ok(nombre, obtenido.toFixed(4));
  else falla(nombre, 'esperado ~' + esperado + ', obtenido ' + obtenido);
}
function lanza(nombre, fn) {
  try {
    fn();
    falla(nombre, 'se esperaba un error y no ocurrió');
  } catch (e) {
    ok(nombre, 'error esperado: ' + e.message);
  }
}

var MONEDAS = ['USD', 'EUR', 'GBP', 'JPY', 'MXN'];

/* ------------------------------------------------------------------ */
console.log('\n=== A) LA TABLA DE MONEDAS ===');

igual('converter.js exporta las 5 monedas pedidas', Object.keys(C.TASAS).length, 5);
MONEDAS.forEach(function (c) {
  cierto('existe la moneda ' + c, C.existe(c) && C.TASAS[c].porUSD > 0,
    C.existe(c) ? String(C.TASAS[c].porUSD) : 'ausente');
});
igual('el orden de los desplegables es USD, EUR, GBP, JPY, MXN', C.ORDEN.join(','), 'USD,EUR,GBP,JPY,MXN');
igual('la base USD vale exactamente 1', C.TASAS.USD.porUSD, 1);
igual('listarMonedas() devuelve 5 fichas', C.listarMonedas().length, 5);
cierto('cada ficha trae código, nombre y decimales',
  C.listarMonedas().every(function (m) {
    return typeof m.codigo === 'string' && typeof m.nombre === 'string' && typeof m.decimales === 'number';
  }));
igual('el yen se define sin decimales', C.moneda('JPY').decimales, 0);
lanza('moneda() rechaza un código inexistente', function () { C.moneda('ABC'); });

/* La tabla devuelta es una copia: modificarla no debe corromper el módulo. */
var copia = C.moneda('EUR');
copia.porUSD = 999;
igual('moneda() devuelve una copia, no la tabla interna', C.TASAS.EUR.porUSD, 0.85);

/* ------------------------------------------------------------------ */
console.log('\n=== B) CONVERSIONES CONCRETAS ===');

casiIgual('100 USD -> EUR = 85', C.convertir(100, 'USD', 'EUR'), 85);
casiIgual('100 USD -> GBP = 73', C.convertir(100, 'USD', 'GBP'), 73);
casiIgual('1 USD -> JPY = 149.50', C.convertir(1, 'USD', 'JPY'), 149.5);
casiIgual('100 USD -> MXN = 1750', C.convertir(100, 'USD', 'MXN'), 1750);
casiIgual('85 EUR -> USD = 100 (vuelta exacta)', C.convertir(85, 'EUR', 'USD'), 100, 1e-12);
casiIgual('1750 MXN -> USD = 100', C.convertir(1750, 'MXN', 'USD'), 100, 1e-12);
casiIgual('100 EUR -> MXN', C.convertir(100, 'EUR', 'MXN'), 100 / 0.85 * 17.5, 1e-9);
casiIgual('0 de cualquier moneda sigue siendo 0', C.convertir(0, 'GBP', 'MXN'), 0);
casiIgual('montos con decimales: 12.5 USD -> EUR', C.convertir(12.5, 'USD', 'EUR'), 10.625);
casiIgual('montos grandes: 1.000.000 USD -> JPY', C.convertir(1e6, 'USD', 'JPY'), 149500000, 1e-3);

/* ------------------------------------------------------------------ */
console.log('\n=== C) PROPIEDADES QUE SIEMPRE DEBEN CUMPLIRSE ===');

/* Identidad: convertir una moneda a sí misma no cambia nada. */
MONEDAS.forEach(function (a) {
  casiIgual('identidad ' + a + ' -> ' + a, C.convertir(250, a, a), 250);
});

/* Ida y vuelta en las 25 combinaciones: A->B->A debe recuperar el monto. */
var fallosVuelta = [];
MONEDAS.forEach(function (a) {
  MONEDAS.forEach(function (b) {
    var vuelta = C.convertir(C.convertir(500, a, b), b, a);
    if (Math.abs(vuelta - 500) > 1e-6) fallosVuelta.push(a + '->' + b + '->' + a + ' = ' + vuelta);
  });
});
cierto('ida y vuelta correcta en las 25 combinaciones', fallosVuelta.length === 0,
  fallosVuelta.length ? fallosVuelta.join(' | ') : '500 recuperado en todas');

/* Transitividad: A->B->C debe dar lo mismo que A->C directo. */
var fallosTrans = [];
MONEDAS.forEach(function (a) {
  MONEDAS.forEach(function (b) {
    MONEDAS.forEach(function (c) {
      var encadenado = C.convertir(C.convertir(80, a, b), b, c);
      var directo = C.convertir(80, a, c);
      if (Math.abs(encadenado - directo) > 1e-6) fallosTrans.push(a + '->' + b + '->' + c);
    });
  });
});
cierto('transitividad en las 125 rutas A->B->C', fallosTrans.length === 0,
  fallosTrans.length ? fallosTrans.join(' | ') : '125 rutas coinciden con la directa');

/* Proporcionalidad: el doble de monto da el doble de resultado. */
casiIgual('convertir(200) es el doble de convertir(100)',
  C.convertir(200, 'EUR', 'JPY'), C.convertir(100, 'EUR', 'JPY') * 2, 1e-9);

/* tasaEntre() debe coincidir con convertir(1, ...). */
casiIgual('tasaEntre(USD,MXN) = convertir(1,USD,MXN)',
  C.tasaEntre('USD', 'MXN'), C.convertir(1, 'USD', 'MXN'));

/* ------------------------------------------------------------------ */
console.log('\n=== D) ENTRADAS INVÁLIDAS ===');

lanza('convertir rechaza moneda de origen desconocida', function () { C.convertir(10, 'XXX', 'USD'); });
lanza('convertir rechaza moneda de destino desconocida', function () { C.convertir(10, 'USD', 'XXX'); });
lanza('convertir rechaza montos negativos', function () { C.convertir(-5, 'USD', 'EUR'); });
lanza('convertir rechaza texto en vez de número', function () { C.convertir('100', 'USD', 'EUR'); });
lanza('convertir rechaza NaN', function () { C.convertir(NaN, 'USD', 'EUR'); });
lanza('convertir rechaza Infinity', function () { C.convertir(Infinity, 'USD', 'EUR'); });

/* ------------------------------------------------------------------ */
console.log('\n=== E) VALIDACIÓN DE LO QUE ESCRIBE EL USUARIO ===');

igual('validarMonto("100") acepta', C.validarMonto('100').valor, 100);
igual('validarMonto("  42  ") ignora espacios', C.validarMonto('  42  ').valor, 42);
igual('validarMonto("12,5") acepta coma decimal', C.validarMonto('12,5').valor, 12.5);
igual('validarMonto("12.5") acepta punto decimal', C.validarMonto('12.5').valor, 12.5);
igual('validarMonto("0") acepta el cero', C.validarMonto('0').valor, 0);
cierto('validarMonto("") avisa que falta el monto',
  C.validarMonto('').ok === false && /Escribe un monto/.test(C.validarMonto('').error),
  C.validarMonto('').error);
cierto('validarMonto("abc") avisa que no es un número',
  C.validarMonto('abc').ok === false && /número válido/.test(C.validarMonto('abc').error),
  C.validarMonto('abc').error);
cierto('validarMonto("-5") avisa que no puede ser negativo',
  C.validarMonto('-5').ok === false && /negativo/.test(C.validarMonto('-5').error),
  C.validarMonto('-5').error);
cierto('validarMonto(null) no revienta', C.validarMonto(null).ok === false, C.validarMonto(null).error);
cierto('validarMonto(undefined) no revienta', C.validarMonto(undefined).ok === false,
  C.validarMonto(undefined).error);
cierto('los mensajes de error están en español',
  ['', 'abc', '-5'].every(function (v) { return /[áéíóúñ]|monto|número/i.test(C.validarMonto(v).error); }));

/* ------------------------------------------------------------------ */
console.log('\n=== F) FORMATO DE MONEDA ===');

var fUSD = C.formatearMoneda(1234.5, 'USD');
var fEUR = C.formatearMoneda(1234.5, 'EUR');
var fGBP = C.formatearMoneda(1234.5, 'GBP');
var fJPY = C.formatearMoneda(1234.5, 'JPY');
var fMXN = C.formatearMoneda(1234.5, 'MXN');

cierto('USD lleva el símbolo $', /\$/.test(fUSD), fUSD);
cierto('EUR lleva el símbolo €', /€/.test(fEUR), fEUR);
cierto('GBP lleva el símbolo £', /£/.test(fGBP), fGBP);
/* El locale ja-JP usa el yen de ancho completo (￥, U+FFE5), no el estrecho (¥, U+00A5). */
cierto('JPY lleva el símbolo del yen', /[¥￥]/.test(fJPY), fJPY);
cierto('MXN lleva el símbolo $', /\$/.test(fMXN), fMXN);

/* El yen no usa decimales: 1234.5 debe redondear a 1235 sin parte decimal. */
cierto('el yen se muestra sin decimales', /1[.,]?235/.test(fJPY) && !/235[.,]\d/.test(fJPY), fJPY);
cierto('el dólar se muestra con 2 decimales', /1,234\.50/.test(fUSD), fUSD);
cierto('el euro usa separadores europeos (1.234,50)', /1\.234,50/.test(fEUR), fEUR);

igual('formatear 0 no falla', typeof C.formatearMoneda(0, 'USD'), 'string');
lanza('formatearMoneda rechaza una moneda inexistente', function () { C.formatearMoneda(1, 'ZZZ'); });
lanza('formatearMoneda rechaza un valor no numérico', function () { C.formatearMoneda('x', 'USD'); });

/* ------------------------------------------------------------------ */
console.log('\n=== G) OPERACIÓN COMPLETA (lo que pinta la interfaz) ===');

var op = C.operar('100', 'USD', 'EUR');
cierto('operar("100", USD, EUR) tiene éxito', op.ok === true);
casiIgual('operar devuelve el valor numérico 85', op.valor, 85);
cierto('operar devuelve el resultado ya formateado', /€/.test(op.textoResultado), op.textoResultado);
cierto('operar devuelve el detalle de la operación', /equivale a/.test(op.textoDetalle), op.textoDetalle);
cierto('operar devuelve la tasa aplicada', /Tasa aplicada: 1 USD/.test(op.textoTasa), op.textoTasa);

var opIgual = C.operar('50', 'MXN', 'MXN');
casiIgual('convertir a la misma moneda deja el monto igual', opIgual.valor, 50);
cierto('avisa cuando origen y destino son la misma moneda',
  /Ambas monedas son la misma/.test(opIgual.textoTasa), opIgual.textoTasa);

var opMal = C.operar('', 'USD', 'EUR');
cierto('operar con monto vacío devuelve error, no excepción',
  opMal.ok === false && typeof opMal.error === 'string', opMal.error);
var opNeg = C.operar('-3', 'USD', 'EUR');
cierto('operar con monto negativo devuelve error', opNeg.ok === false, opNeg.error);

/* ------------------------------------------------------------------ */
console.log('\n=== H) EL MÓDULO ES AUTÓNOMO ===');

var fs = require('fs');
var path = require('path');
var fuente = fs.readFileSync(path.join(__dirname, '..', 'converter.js'), 'utf8');

/* Los comentarios del archivo mencionan `require(` y `window.Conversor` como
   documentación de uso; hay que quitarlos antes de escanear el código real. */
function sinComentarios(txt) {
  return txt
    .replace(/\/\*[\s\S]*?\*\//g, '')   /* bloques  /* ... *\/ */
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');  /* línea // ... (sin romper "http://") */
}
var codigo = sinComentarios(fuente);

var requires = codigo.match(/require\s*\(/g) || [];
cierto('converter.js no depende de paquetes externos', requires.length === 0, requires.length + ' require()');
cierto('converter.js no toca el DOM (sirve en Node y en el navegador)',
  !/document\.|window\./.test(codigo));
cierto('converter.js se exporta para ambos entornos',
  /module\.exports/.test(fuente) && /raiz\.Conversor/.test(fuente));

/* ------------------------------------------------------------------ */
console.log('\n--------------------------------------------------');
console.log('Resultado: ' + pasadas + ' pruebas pasadas, ' + fallidas + ' fallidas.');
console.log('--------------------------------------------------\n');

process.exit(fallidas === 0 ? 0 : 1);
