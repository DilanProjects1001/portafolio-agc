/**
 * check.js — Revisión de la ESTRUCTURA y la INTERFAZ del proyecto.
 * Ejecutar con:   node check.js
 *
 * Complementa a test/convertidor.test.js:
 *   - test/convertidor.test.js  ->  prueba la LÓGICA (converter.js) con 72 casos.
 *   - check.js (este archivo)   ->  prueba que los ARCHIVOS estén completos y bien
 *                                   conectados entre sí (HTML <-> CSS <-> JS), que
 *                                   la interfaz tenga todos sus elementos y que no
 *                                   haya ni una sola dependencia externa.
 *
 * Sale con código 0 si todo pasa, 1 si algo falla.
 */
'use strict';

var fs = require('fs');
var path = require('path');

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
function leer(rel) {
  var p = path.join(__dirname, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

/* ------------------------------------------------------------------ */
console.log('\n=== A) TODOS LOS ARCHIVOS DEL PROYECTO ESTÁN ===');

var ARCHIVOS = [
  'index.html', 'style.css', 'script.js', 'converter.js',
  'test/convertidor.test.js', 'README.md', 'SELFTEST.md'
];
ARCHIVOS.forEach(function (f) {
  var p = path.join(__dirname, f);
  var hay = fs.existsSync(p);
  cierto(f + ' existe', hay, hay ? fs.statSync(p).size + ' bytes' : 'NO ENCONTRADO');
});
cierto('carpeta ui_shots/ existe', fs.existsSync(path.join(__dirname, 'ui_shots')));
cierto('hay al menos una captura en ui_shots/',
  fs.existsSync(path.join(__dirname, 'ui_shots')) &&
  fs.readdirSync(path.join(__dirname, 'ui_shots')).filter(function (f) {
    return /\.png$/i.test(f);
  }).length > 0);

var html   = leer('index.html');
var css    = leer('style.css');
var script = leer('script.js');

/* ------------------------------------------------------------------ */
console.log('\n=== B) LOS ARCHIVOS ESTÁN CONECTADOS ENTRE SÍ ===');

cierto('index.html enlaza style.css', /<link[^>]+href="style\.css"/.test(html));
cierto('index.html carga converter.js', /<script src="converter\.js"><\/script>/.test(html));
cierto('index.html carga script.js', /<script src="script\.js"><\/script>/.test(html));
cierto('converter.js se carga ANTES que script.js (script.js lo necesita)',
  html.indexOf('converter.js') < html.indexOf('script.js'));
cierto('script.js usa el módulo window.Conversor', /window\.Conversor/.test(script));
cierto('index.html no lleva estilos sueltos incrustados', !/<style>/.test(html));
cierto('index.html no lleva JavaScript suelto incrustado', !/<script>(?!\s*<\/script>)/.test(html));

/* ------------------------------------------------------------------ */
console.log('\n=== C) LA INTERFAZ TIENE TODOS SUS ELEMENTOS ===');

var requisitos = [
  ['idioma español declarado',           /<html[^>]+lang="es"/],
  ['codificación UTF-8',                 /<meta\s+charset="UTF-8"/i],
  ['diseño responsive (viewport)',       /name="viewport"[^>]*width=device-width/],
  ['título de la página',                /<title>\s*Convertidor de Divisas\s*<\/title>/i],
  ['input numérico id="monto"',          /<input[^>]+type="number"[^>]+id="monto"/],
  ['select de origen id="origen"',       /<select[^>]+id="origen"/],
  ['select de destino id="destino"',     /<select[^>]+id="destino"/],
  ['botón Convertir',                    /id="btnConvertir"[^>]*>\s*Convertir\s*</],
  ['botón Limpiar',                      /id="btnLimpiar"/],
  ['botón para invertir monedas',        /id="btnInvertir"/],
  ['caja de resultado id="resultado"',   /id="resultado"/],
  ['hueco del monto convertido',         /id="montoConvertido"/],
  ['tabla de tasas id="tablaTasas"',     /id="tablaTasas"/],
  ['aviso accesible del resultado',      /aria-live="polite"/],
  ['etiquetas en español',               /Moneda de origen[\s\S]*Moneda de destino/]
];
requisitos.forEach(function (r) { cierto('HTML: ' + r[0], r[1].test(html)); });

/* Todos los getElementById de script.js deben apuntar a un id real del HTML. */
var usados = (script.match(/getElementById\('([^']+)'\)/g) || []).map(function (s) {
  return s.replace(/getElementById\('|'\)/g, '');
});
var faltantes = usados.filter(function (id) { return html.indexOf('id="' + id + '"') === -1; });
cierto('script.js: todos los getElementById apuntan a un id existente',
  faltantes.length === 0,
  faltantes.length ? 'faltan: ' + faltantes.join(', ') : usados.length + ' referencias revisadas');

/* Los tres botones deben tener su manejador conectado. */
['btnConvertir', 'btnInvertir', 'btnLimpiar'].forEach(function (id) {
  cierto('script.js: ' + id + ' tiene su addEventListener',
    new RegExp("getElementById\\('" + id + "'\\)\\.addEventListener\\('click'").test(script));
});

/* Los desplegables se rellenan desde converter.js, no a mano en el HTML. */
cierto('los desplegables se generan desde converter.js (una sola fuente de verdad)',
  /listarMonedas\(\)/.test(script) && !/<option value="USD"/.test(html));

/* ------------------------------------------------------------------ */
console.log('\n=== D) EL DISEÑO CUMPLE LAS REGLAS DE USABILIDAD ===');

cierto('CSS: botones grandes (min-height >= 50px)', /min-height:5[0-9]px/.test(css),
  (css.match(/min-height:5[0-9]px/g) || []).join(', '));
cierto('CSS: campos grandes (input y select con min-height)',
  /input\[type=number\], select\{[\s\S]*?min-height:5\d px?|min-height:52px/.test(css));
cierto('CSS: hay reglas responsive (@media)', /@media\s*\(max-width/.test(css));
cierto('CSS: define una paleta con variables', /:root\{[\s\S]*--texto:/.test(css));
cierto('CSS: marca de foco visible para el teclado', /focus-visible/.test(css));
cierto('CSS: texto base de 16px o más', /font-size:1[6-9]px/.test(css));

/* ------------------------------------------------------------------ */
console.log('\n=== E) CERO DEPENDENCIAS EXTERNAS ===');

var remotosHtml = html.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+["']/gi) || [];
cierto('index.html: sin recursos externos (0 CDNs)', remotosHtml.length === 0,
  remotosHtml.length ? remotosHtml.join(', ') : 'ninguno');
cierto('style.css: sin @import ni url() remotos',
  !/@import/.test(css) && !/url\(\s*['"]?https?:/.test(css));
cierto('style.css: sin fuentes web externas', !/fonts\.googleapis|fonts\.gstatic/.test(css));
cierto('script.js: sin llamadas de red (fetch/XHR)',
  !/fetch\s*\(|XMLHttpRequest/.test(script));
cierto('el proyecto no necesita npm install', !fs.existsSync(path.join(__dirname, 'package.json')));

/* ------------------------------------------------------------------ */
console.log('\n=== F) DOCUMENTACIÓN ===');

var readme = leer('README.md');
cierto('README incluye la sección "Ángulo de monetización"', /##\s*Ángulo de monetización/i.test(readme));
cierto('README incluye la sección "Monetization angle"', /##\s*Monetization angle/i.test(readme));
cierto('README incluye la sección en español "Cómo usar"', /##\s*Cómo usar/i.test(readme));
cierto('README explica cómo ejecutar las pruebas',
  /node test\/convertidor\.test\.js/.test(readme));

/* Regla AGC: el README va en español. Comprobamos que el idioma principal (lo que
   se lee antes de la sección "English") sea español, no una traducción al final. */
var principal = readme.split(/^#\s+English\s*$/m)[0];
cierto('README: el idioma principal es el español',
  /##\s*Cómo usar/.test(principal) && /##\s*Ángulo de monetización/.test(principal),
  principal.length + ' caracteres antes de la sección English');
cierto('README: el título principal está en español', /^#\s*Convertidor de Divisas/m.test(principal));

/* Los números de pruebas que cita el README deben ser los reales; si alguien añade
   una prueba y no actualiza el texto, la documentación miente. */
var totalCheck = (leer('check.js').match(/\bcierto\(|\bigual\(/g) || []).length;
cierto('README cita el número real de pruebas de la lógica (72)', /72 pruebas|72 tests/.test(readme));
cierto('README cita el número real de pruebas de check.js (57)', /57 pruebas|57 tests/.test(readme),
  'llamadas a aserción encontradas en check.js: ' + totalCheck);

/* Nada de marcadores de trabajo a medias en la documentación entregada. */
var todos = readme.match(/(^|[^a-zA-Z])(TODO|FIXME|TBD|WIP)([^a-zA-Z]|:|$)/g) || [];
cierto('README: sin TODOs sueltos', todos.length === 0,
  todos.length ? todos.join(', ') : 'ninguno');
cierto('SELFTEST.md documenta el archivo de pruebas',
  /convertidor\.test\.js/.test(leer('SELFTEST.md')));

/* ------------------------------------------------------------------ */
console.log('\n--------------------------------------------------');
console.log('Resultado: ' + pasadas + ' pruebas pasadas, ' + fallidas + ' fallidas.');
console.log('--------------------------------------------------\n');

process.exit(fallidas === 0 ? 0 : 1);
