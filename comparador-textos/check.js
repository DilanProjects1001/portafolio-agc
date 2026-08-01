/*
 * check.js — Verificación automática del motor de comparación (sin navegador).
 *
 * Uso:  node check.js
 * Sale con código 0 si todo pasa, 1 si algo falla.
 */
'use strict';

var Diff = require('./src/diff.js');

var pasadas = 0;
var fallidas = [];

function comprobar(nombre, condicion, detalle) {
  if (condicion) {
    pasadas++;
    console.log('  ok   ' + nombre);
  } else {
    fallidas.push(nombre + (detalle ? ' → ' + detalle : ''));
    console.log('  FALLA ' + nombre + (detalle ? ' → ' + detalle : ''));
  }
}

function igual(nombre, obtenido, esperado) {
  comprobar(
    nombre,
    JSON.stringify(obtenido) === JSON.stringify(esperado),
    'esperado ' + JSON.stringify(esperado) + ', obtenido ' + JSON.stringify(obtenido)
  );
}

function grupo(titulo) {
  console.log('\n' + titulo);
}

/** Aplica una lista de operaciones sobre A y devuelve el texto B reconstruido. */
function reconstruirB(ops, a, b) {
  var salida = [];
  for (var i = 0; i < ops.length; i++) {
    if (ops[i].t === '=') salida.push(a[ops[i].ia]);
    else if (ops[i].t === '+') salida.push(b[ops[i].ib]);
  }
  return salida;
}

function reconstruirA(ops, a) {
  var salida = [];
  for (var i = 0; i < ops.length; i++) {
    if (ops[i].t === '=' || ops[i].t === '-') salida.push(a[ops[i].ia]);
  }
  return salida;
}

/* ------------------------------------------------------------------ */
grupo('1. División de líneas (saltos de Windows, Mac y Unix)');

igual('CRLF se trata igual que LF', Diff.dividirLineas('a\r\nb'), ['a', 'b']);
igual('CR suelto (Mac clásico) también', Diff.dividirLineas('a\rb'), ['a', 'b']);
igual('texto vacío no produce líneas', Diff.dividirLineas(''), []);
igual('null no rompe', Diff.dividirLineas(null), []);
igual('una línea final vacía se conserva', Diff.dividirLineas('a\n'), ['a', '']);

/* ------------------------------------------------------------------ */
grupo('2. Operaciones mínimas (algoritmo de Myers)');

igual('listas idénticas → todo igual',
  Diff.operaciones(['a', 'b'], ['a', 'b']).map(function (o) { return o.t; }).join(''), '==');
igual('una inserción en medio',
  Diff.operaciones(['a', 'c'], ['a', 'b', 'c']).map(function (o) { return o.t; }).join(''), '=+=');
igual('una eliminación en medio',
  Diff.operaciones(['a', 'b', 'c'], ['a', 'c']).map(function (o) { return o.t; }).join(''), '=-=');
igual('de vacío a lleno son solo adiciones',
  Diff.operaciones([], ['a', 'b']).map(function (o) { return o.t; }).join(''), '++');
igual('de lleno a vacío son solo eliminaciones',
  Diff.operaciones(['a', 'b'], []).map(function (o) { return o.t; }).join(''), '--');

var a1 = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];
var b1 = ['uno', 'DOS', 'tres', 'cinco', 'seis'];
var ops1 = Diff.operaciones(a1, b1);
igual('aplicando las operaciones se reconstruye B exacto', reconstruirB(ops1, a1, b1), b1);
igual('ignorando las adiciones se reconstruye A exacto', reconstruirA(ops1, a1), a1);
comprobar('la solución es mínima (4 ediciones para este par)',
  ops1.filter(function (o) { return o.t !== '='; }).length === 4,
  'ediciones = ' + ops1.filter(function (o) { return o.t !== '='; }).length);

/* Propiedad general: sobre 200 pares aleatorios, aplicar el diff siempre da B. */
(function pruebaAleatoria() {
  var alfabeto = 'abcdefg'.split('');
  var semilla = 12345;
  function aleatorio() { // generador determinista, para que el test sea reproducible
    semilla = (semilla * 1103515245 + 12345) % 2147483648;
    return semilla / 2147483648;
  }
  function lista(n) {
    var r = [];
    for (var i = 0; i < n; i++) r.push(alfabeto[Math.floor(aleatorio() * alfabeto.length)]);
    return r;
  }
  var fallos = 0, minimo = true;
  for (var caso = 0; caso < 200; caso++) {
    var x = lista(Math.floor(aleatorio() * 12));
    var y = lista(Math.floor(aleatorio() * 12));
    var ops = Diff.operaciones(x, y);
    if (JSON.stringify(reconstruirB(ops, x, y)) !== JSON.stringify(y)) fallos++;
    if (JSON.stringify(reconstruirA(ops, x)) !== JSON.stringify(x)) fallos++;
    // Nunca puede haber más ediciones que borrar todo y escribir todo.
    if (ops.filter(function (o) { return o.t !== '='; }).length > x.length + y.length) minimo = false;
  }
  comprobar('200 pares aleatorios: el diff siempre reconstruye ambos lados', fallos === 0, fallos + ' fallos');
  comprobar('200 pares aleatorios: nunca peor que borrar y reescribir', minimo);
})();

/* ------------------------------------------------------------------ */
grupo('3. Comparación de textos completa');

var r = Diff.comparar('uno\ndos\ntres', 'uno\ndos\ntres');
comprobar('dos textos iguales se marcan como idénticos', r.resumen.identicos === true);
igual('similitud de textos iguales = 100', r.resumen.similitud, 100);
igual('sin cambios', r.resumen.cambios, 0);

r = Diff.comparar('uno\ndos\ntres', 'uno\ndos cambiado\ntres');
igual('una línea editada se marca como modificada', r.resumen.modificadas, 1);
igual('las otras dos siguen iguales', r.resumen.iguales, 2);
comprobar('la línea modificada resalta solo la palabra nueva',
  r.filas[1].segmentosB.filter(function (s) { return s.cambiado; })
    .map(function (s) { return s.texto; }).join('|').indexOf('cambiado') !== -1,
  JSON.stringify(r.filas[1].segmentosB));
comprobar('la parte común de la línea NO se resalta',
  r.filas[1].segmentosB.some(function (s) { return !s.cambiado && s.texto.indexOf('dos') !== -1; }));

r = Diff.comparar('uno\ndos', 'uno\ndos\ntres');
igual('línea añadida al final', r.resumen.agregadas, 1);
igual('numeración del lado B correcta', r.filas[2].numB, 3);
igual('la fila añadida no tiene número en A', r.filas[2].numA, null);

r = Diff.comparar('uno\ndos\ntres', 'uno\ntres');
igual('línea eliminada', r.resumen.eliminadas, 1);
igual('numeración del lado A correcta', r.filas[1].numA, 2);

r = Diff.comparar('hola mundo', 'adiós planeta');
igual('dos líneas sin nada en común no se emparejan como edición',
  r.resumen.modificadas, 0);
igual('se cuentan como una eliminación y una adición',
  [r.resumen.eliminadas, r.resumen.agregadas], [1, 1]);

/* ------------------------------------------------------------------ */
grupo('4. Opciones de comparación');

r = Diff.comparar('Hola Mundo', 'hola mundo');
igual('sin opciones, mayúsculas cuentan como diferencia', r.resumen.cambios, 1);
igual('y se muestra como una línea editada, no como dos líneas distintas',
  r.resumen.modificadas, 1);
r = Diff.comparar('Hola Mundo', 'hola mundo', { ignorarMayusculas: true });
comprobar('con "ignorar mayúsculas" son idénticos', r.resumen.identicos === true);

r = Diff.comparar('  hola   mundo  ', 'hola mundo');
igual('sin opciones, los espacios de más cuentan', r.resumen.cambios, 1);
r = Diff.comparar('  hola   mundo  ', 'hola mundo', { ignorarEspacios: true });
comprobar('con "ignorar espacios" son idénticos', r.resumen.identicos === true);

r = Diff.comparar('uno\n\n\ndos', 'uno\ndos', { ignorarLineasVacias: true });
comprobar('con "ignorar líneas vacías" son idénticos', r.resumen.identicos === true);
igual('los números de línea siguen siendo los del texto original',
  [r.filas[0].numA, r.filas[1].numA], [1, 4]);

/* ------------------------------------------------------------------ */
grupo('5. Diferencias palabra por palabra');

var seg = Diff.compararEnLinea('el gato duerme', 'el perro duerme');
igual('lo cambiado en A es solo "gato"',
  seg.a.filter(function (s) { return s.cambiado; }).map(function (s) { return s.texto; }), ['gato']);
igual('lo cambiado en B es solo "perro"',
  seg.b.filter(function (s) { return s.cambiado; }).map(function (s) { return s.texto; }), ['perro']);
igual('los segmentos de A reconstruyen la línea original',
  seg.a.map(function (s) { return s.texto; }).join(''), 'el gato duerme');
igual('los segmentos de B reconstruyen la línea original',
  seg.b.map(function (s) { return s.texto; }).join(''), 'el perro duerme');

seg = Diff.compararEnLinea('total: 100 USD', 'total: 250 USD');
igual('detecta el cambio de una cifra',
  seg.b.filter(function (s) { return s.cambiado; }).map(function (s) { return s.texto; }), ['250']);

comprobar('el parecido de dos líneas iguales es 1', Diff.parecido('a b c', 'a b c') === 1);
comprobar('el parecido de dos líneas ajenas es bajo (< 0.35)',
  Diff.parecido('hola mundo', 'adiós planeta') < 0.35, String(Diff.parecido('hola mundo', 'adiós planeta')));
comprobar('el parecido de un cambio de mayúsculas es alto (> 0.7)',
  Diff.parecido('Hola Mundo', 'hola mundo') > 0.7, String(Diff.parecido('Hola Mundo', 'hola mundo')));
comprobar('el parecido con una línea vacía es 0', Diff.parecido('', 'hola') === 0);

/* ------------------------------------------------------------------ */
grupo('6. Parche en formato unificado');

var parche = Diff.diffUnificado('uno\ndos\ntres', 'uno\nDOS\ntres', null, {
  nombreA: 'a.txt', nombreB: 'b.txt', contexto: 1
});
comprobar('empieza con las cabeceras --- y +++',
  parche.indexOf('--- a.txt\n+++ b.txt\n') === 0, JSON.stringify(parche.slice(0, 30)));
comprobar('incluye una cabecera de bloque @@', /@@ -\d+,\d+ \+\d+,\d+ @@/.test(parche), parche);
comprobar('marca la línea vieja con -', parche.indexOf('\n-dos\n') !== -1, parche);
comprobar('marca la línea nueva con +', parche.indexOf('\n+DOS\n') !== -1, parche);
comprobar('el contexto va con un espacio delante', parche.indexOf('\n uno\n') !== -1, parche);
igual('sin diferencias el parche va vacío', Diff.diffUnificado('igual', 'igual'), '');

/* Los contadores del bloque deben cuadrar con las líneas que lleva dentro. */
(function verificarContadores() {
  var texto = Diff.diffUnificado(
    'l1\nl2\nl3\nl4\nl5\nl6\nl7\nl8\nl9\nl10',
    'l1\nl2\nX\nl4\nl5\nl6\nl7\nl8\nl9\nl10\nl11',
    null, { contexto: 2 }
  );
  var lineas = texto.split('\n');
  var ok = true, bloques = 0;
  for (var i = 0; i < lineas.length; i++) {
    var m = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/.exec(lineas[i]);
    if (!m) continue;
    bloques++;
    var viejas = 0, nuevas = 0, j = i + 1;
    for (; j < lineas.length && !/^@@/.test(lineas[j]); j++) {
      if (lineas[j] === '' && j === lineas.length - 1) break;
      var c = lineas[j].charAt(0);
      if (c === ' ') { viejas++; nuevas++; }
      else if (c === '-') viejas++;
      else if (c === '+') nuevas++;
    }
    if (viejas !== Number(m[2]) || nuevas !== Number(m[4])) ok = false;
  }
  comprobar('se generan 2 bloques separados (cambios lejanos entre sí)', bloques === 2, 'bloques=' + bloques);
  comprobar('los contadores de cada bloque cuadran con su contenido', ok, texto);
})();

/* ------------------------------------------------------------------ */
grupo('7. Casos límite y rendimiento');

r = Diff.comparar('', '');
comprobar('dos textos vacíos son idénticos', r.resumen.identicos === true);
igual('y la similitud es 100', r.resumen.similitud, 100);

r = Diff.comparar('', 'hola');
igual('de vacío a texto: 1 línea agregada', r.resumen.agregadas, 1);
igual('similitud 0', r.resumen.similitud, 0);

(function rendimiento() {
  var lineas = [];
  for (var i = 0; i < 3000; i++) lineas.push('línea número ' + i + ' con algo de contenido');
  var A = lineas.join('\n');
  var copia = lineas.slice();
  copia[1500] = 'línea número 1500 EDITADA';
  copia.splice(2000, 0, 'una línea nueva en medio');
  var B = copia.join('\n');
  var t0 = Date.now();
  var res = Diff.comparar(A, B);
  var ms = Date.now() - t0;
  comprobar('3000 líneas con 2 cambios: detecta exactamente esos cambios',
    res.resumen.modificadas === 1 && res.resumen.agregadas === 1 && res.resumen.eliminadas === 0,
    JSON.stringify(res.resumen));
  comprobar('y tarda menos de 2 segundos (' + ms + ' ms)', ms < 2000, ms + ' ms');
})();

(function textosMuyDistintos() {
  var A = [], B = [];
  for (var i = 0; i < 1200; i++) { A.push('aaa ' + i); B.push('zzz ' + (i * 7)); }
  var t0 = Date.now();
  var res = Diff.comparar(A.join('\n'), B.join('\n'));
  var ms = Date.now() - t0;
  comprobar('1200 líneas totalmente distintas: no se cuelga (' + ms + ' ms)', ms < 5000, ms + ' ms');
  comprobar('y reporta que no hay nada en común', res.resumen.iguales === 0);
})();

/* ------------------------------------------------------------------ */
grupo('8. Archivos del proyecto');

var fs = require('fs');
var path = require('path');
['index.html', 'src/diff.js', 'src/app.js', 'src/styles.css', 'README.md', 'SELFTEST.md'].forEach(function (f) {
  comprobar('existe ' + f, fs.existsSync(path.join(__dirname, f)));
});

var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
comprobar('el HTML no usa CDNs ni recursos externos',
  !/(src|href)\s*=\s*["']https?:\/\//i.test(html));
comprobar('el HTML carga el motor y la app', html.indexOf('src/diff.js') !== -1 && html.indexOf('src/app.js') !== -1);
comprobar('la página está declarada en español', /<html[^>]+lang="es"/.test(html));

var app = fs.readFileSync(path.join(__dirname, 'src/app.js'), 'utf8');
comprobar('la interfaz no inserta texto del usuario con innerHTML sin escapar',
  app.indexOf('innerHTML = ') === -1 || app.indexOf('escaparHtml') !== -1);

/* ------------------------------------------------------------------ */
console.log('\n────────────────────────────────────────');
console.log('Pruebas superadas: ' + pasadas);
if (fallidas.length) {
  console.log('Pruebas fallidas:  ' + fallidas.length);
  fallidas.forEach(function (f) { console.log('  - ' + f); });
  process.exit(1);
}
console.log('Resultado: TODO CORRECTO ✔');
process.exit(0);
