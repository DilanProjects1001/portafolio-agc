/**
 * Pruebas del motor de conversión (Node.js, sin dependencias externas).
 * Ejecutar con:  node test.js
 * Sale con código 0 si todo pasa, 1 si algo falla.
 */
'use strict';

const { convertir, formatear } = require('./conversiones.js');

let pasadas = 0;
let fallidas = 0;

function casi(nombre, obtenido, esperado, tolerancia = 1e-9) {
  const diferencia = Math.abs(obtenido - esperado);
  if (diferencia <= tolerancia) {
    pasadas++;
    console.log(`  OK   ${nombre}  ->  ${obtenido}`);
  } else {
    fallidas++;
    console.error(`  FALLA ${nombre}  esperado ${esperado}, obtenido ${obtenido} (dif ${diferencia})`);
  }
}

function igual(nombre, obtenido, esperado) {
  if (obtenido === esperado) {
    pasadas++;
    console.log(`  OK   ${nombre}  ->  ${JSON.stringify(obtenido)}`);
  } else {
    fallidas++;
    console.error(`  FALLA ${nombre}  esperado ${JSON.stringify(esperado)}, obtenido ${JSON.stringify(obtenido)}`);
  }
}

function lanza(nombre, fn) {
  try {
    fn();
    fallidas++;
    console.error(`  FALLA ${nombre}  se esperaba un error y no ocurrió`);
  } catch (e) {
    pasadas++;
    console.log(`  OK   ${nombre}  ->  error esperado: ${e.message}`);
  }
}

console.log('\n=== LONGITUD ===');
casi('1 km -> m', convertir(1, 'km', 'm', 'longitud'), 1000);
casi('100 cm -> m', convertir(100, 'cm', 'm', 'longitud'), 1);
casi('1 m -> mm', convertir(1, 'm', 'mm', 'longitud'), 1000, 1e-9);
casi('1 in -> cm', convertir(1, 'in', 'cm', 'longitud'), 2.54, 1e-9);
casi('1 ft -> in', convertir(1, 'ft', 'in', 'longitud'), 12, 1e-9);
casi('1 yd -> ft', convertir(1, 'yd', 'ft', 'longitud'), 3, 1e-9);
casi('1 mi -> km', convertir(1, 'mi', 'km', 'longitud'), 1.609344, 1e-9);
casi('5 m -> m (misma unidad)', convertir(5, 'm', 'm', 'longitud'), 5);

console.log('\n=== PESO ===');
casi('1 kg -> g', convertir(1, 'kg', 'g', 'peso'), 1000, 1e-9);
casi('1 lb -> kg', convertir(1, 'lb', 'kg', 'peso'), 0.45359237, 1e-9);
casi('1 kg -> lb', convertir(1, 'kg', 'lb', 'peso'), 2.20462262185, 1e-8);
casi('16 oz -> lb', convertir(16, 'oz', 'lb', 'peso'), 1, 1e-9);
casi('1 oz -> g', convertir(1, 'oz', 'g', 'peso'), 28.349523125, 1e-9);

console.log('\n=== TEMPERATURA ===');
casi('0 C -> F', convertir(0, 'C', 'F', 'temperatura'), 32, 1e-9);
casi('100 C -> F', convertir(100, 'C', 'F', 'temperatura'), 212, 1e-9);
casi('-40 C -> F', convertir(-40, 'C', 'F', 'temperatura'), -40, 1e-9);
casi('0 C -> K', convertir(0, 'C', 'K', 'temperatura'), 273.15, 1e-9);
casi('212 F -> C', convertir(212, 'F', 'C', 'temperatura'), 100, 1e-9);
casi('98.6 F -> C', convertir(98.6, 'F', 'C', 'temperatura'), 37, 1e-9);
casi('300 K -> C', convertir(300, 'K', 'C', 'temperatura'), 26.85, 1e-9);
casi('373.15 K -> F', convertir(373.15, 'K', 'F', 'temperatura'), 212, 1e-9);

console.log('\n=== VOLUMEN ===');
casi('1 L -> mL', convertir(1, 'L', 'mL', 'volumen'), 1000, 1e-9);
casi('1 gal -> L', convertir(1, 'gal', 'L', 'volumen'), 3.785411784, 1e-9);
casi('1 gal -> qt', convertir(1, 'gal', 'qt', 'volumen'), 4, 1e-9);
casi('1 qt -> pt', convertir(1, 'qt', 'pt', 'volumen'), 2, 1e-9);
casi('1 pt -> cup', convertir(1, 'pt', 'cup', 'volumen'), 2, 1e-9);
casi('1 cup -> mL', convertir(1, 'cup', 'mL', 'volumen'), 236.5882365, 1e-7);

console.log('\n=== IDA Y VUELTA (round-trip) ===');
casi('123.456 m -> mi -> m', convertir(convertir(123.456, 'm', 'mi', 'longitud'), 'mi', 'm', 'longitud'), 123.456, 1e-9);
casi('37 C -> F -> C', convertir(convertir(37, 'C', 'F', 'temperatura'), 'F', 'C', 'temperatura'), 37, 1e-9);
casi('2.5 gal -> mL -> gal', convertir(convertir(2.5, 'gal', 'mL', 'volumen'), 'mL', 'gal', 'volumen'), 2.5, 1e-9);

console.log('\n=== FORMATO DE SALIDA ===');
igual('formatear(1000)', formatear(1000), '1000');
igual('formatear(2.54)', formatear(2.54), '2.54');
igual('formatear(0.5)', formatear(0.5), '0.5');
igual('formatear(-0.0000001)', formatear(-0.0000001), '-1.0000e-7');

console.log('\n=== ERRORES CONTROLADOS ===');
lanza('categoría inexistente', () => convertir(1, 'm', 'km', 'distancia'));
lanza('unidad de origen inválida', () => convertir(1, 'parsec', 'm', 'longitud'));
lanza('unidad de destino inválida', () => convertir(1, 'm', 'parsec', 'longitud'));
lanza('valor no numérico', () => convertir('hola', 'm', 'km', 'longitud'));

console.log('\n--------------------------------------------');
console.log(`Resultado: ${pasadas} pruebas pasadas, ${fallidas} fallidas.`);
console.log('--------------------------------------------\n');

process.exit(fallidas === 0 ? 0 : 1);
