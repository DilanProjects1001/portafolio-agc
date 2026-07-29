/**
 * Autotest del Conversor de Imagen a Base64.
 * Ejecutar con:   node check.js
 *
 * Verifica dos cosas SIN abrir un navegador:
 *   A) el motor (base64.js) hace bien su trabajo, comparándolo contra el
 *      codificador nativo de Node (Buffer), que es la referencia oficial;
 *   B) index.html contiene todos los elementos que la interfaz necesita
 *      y no depende de ningún recurso externo (nada de CDNs).
 *
 * Sale con código 0 si todo pasa, 1 si algo falla.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var motor = require('./base64.js');

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
function igual(nombre, obtenido, esperado) {
  if (obtenido === esperado) ok(nombre, JSON.stringify(recortar(obtenido)));
  else falla(nombre, 'esperado ' + JSON.stringify(recortar(esperado)) + ', obtenido ' + JSON.stringify(recortar(obtenido)));
}
function cierto(nombre, condicion, detalle) {
  if (condicion) ok(nombre, detalle); else falla(nombre, detalle || 'la condición no se cumplió');
}
function lanza(nombre, fn) {
  try {
    fn();
    falla(nombre, 'se esperaba un error y no ocurrió');
  } catch (e) {
    ok(nombre, 'error esperado: ' + e.message);
  }
}
function recortar(v) {
  var s = String(v);
  return s.length > 70 ? s.slice(0, 67) + '...' : s;
}

/* Generador pseudoaleatorio determinista: mismas pruebas en cada ejecución. */
function bytesDePrueba(n, semilla) {
  var s = semilla || 1;
  var b = Buffer.alloc(n);
  for (var i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    b[i] = (s >> 16) & 0xff;
  }
  return b;
}

console.log('\n=== A) CODIFICACIÓN: nuestro motor vs. Buffer de Node ===');
[0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 255, 1024, 6151, 12345].forEach(function (n) {
  var buf = bytesDePrueba(n, n + 7);
  var nuestro = motor.bytesABase64(new Uint8Array(buf));
  var oficial = buf.toString('base64');
  if (nuestro === oficial) ok(n + ' bytes codificados igual que Node', nuestro.length + ' caracteres');
  else falla(n + ' bytes codificados igual que Node', 'difieren');
});

igual('texto "Hola" -> Base64', motor.bytesABase64(Buffer.from('Hola', 'utf8')), 'SG9sYQ==');
igual('relleno de 1 byte termina en "=="', motor.bytesABase64(Buffer.from([0x41])).slice(-2), '==');
igual('relleno de 2 bytes deja un solo "="', motor.bytesABase64(Buffer.from([0x41, 0x42])), 'QUI=');
igual('3 bytes no llevan relleno', motor.bytesABase64(Buffer.from([0x41, 0x42, 0x43])), 'QUJD');
igual('alfabeto Base64 completo', motor.ALFABETO.length, 64);

console.log('\n=== B) DECODIFICACIÓN E IDA Y VUELTA ===');
[1, 2, 3, 100, 4097].forEach(function (n) {
  var buf = bytesDePrueba(n, n + 31);
  var vuelta = Buffer.from(motor.base64ABytes(motor.bytesABase64(new Uint8Array(buf))));
  cierto(n + ' bytes sobreviven ida y vuelta', vuelta.equals(buf), vuelta.length + ' bytes idénticos');
});
igual('decodifica "SG9sYQ=="', Buffer.from(motor.base64ABytes('SG9sYQ==')).toString('utf8'), 'Hola');
igual('ignora saltos de línea', Buffer.from(motor.base64ABytes('SG9s\nYQ==')).toString('utf8'), 'Hola');
igual('acepta un data URI completo',
  Buffer.from(motor.base64ABytes('data:image/png;base64,SG9sYQ==')).toString('utf8'), 'Hola');
lanza('rechaza caracteres inválidos', function () { motor.base64ABytes('SG9s*QQ=='); });
lanza('rechaza longitud imposible', function () { motor.base64ABytes('SG9sYQA'.slice(0, 5)); });
lanza('rechaza una entrada que no es cadena', function () { motor.base64ABytes(123); });

console.log('\n=== C) DETECCIÓN DEL FORMATO POR SUS BYTES ===');
var muestras = [
  ['PNG',  [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0], 'image/png'],
  ['JPEG', [0xff,0xd8,0xff,0xe0,0,0,0,0], 'image/jpeg'],
  ['GIF',  [0x47,0x49,0x46,0x38,0x39,0x61], 'image/gif'],
  ['BMP',  [0x42,0x4d,0x36,0x00], 'image/bmp'],
  ['ICO',  [0x00,0x00,0x01,0x00,0x01,0x00], 'image/x-icon']
];
muestras.forEach(function (m) {
  var t = motor.detectarTipo(Uint8Array.from(m[1]), 'sin-extension');
  igual('detecta ' + m[0], t.mime, m[2]);
});
var webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
igual('detecta WebP', motor.detectarTipo(new Uint8Array(webp), 'x').mime, 'image/webp');
igual('detecta SVG', motor.detectarTipo(Buffer.from('<svg xmlns="..."></svg>'), 'x').mime, 'image/svg+xml');
igual('formato desconocido con extensión .jpg',
  motor.detectarTipo(Buffer.from([1, 2, 3, 4]), 'foto.jpg').mime, 'image/jpeg');
igual('formato desconocido sin pistas marca seguro=false',
  motor.detectarTipo(Buffer.from([1, 2, 3, 4]), 'archivo').seguro, false);
igual('un PNG real se marca como seguro=true',
  motor.detectarTipo(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), 'x.txt').seguro, true);

console.log('\n=== D) AYUDAS DE PRESENTACIÓN ===');
igual('formatearTamano(512)', motor.formatearTamano(512), '512 B');
igual('formatearTamano(2048)', motor.formatearTamano(2048), '2.0 KB');
igual('formatearTamano(1572864)', motor.formatearTamano(1572864), '1.50 MB');
lanza('formatearTamano rechaza negativos', function () { motor.formatearTamano(-1); });
igual('estimarLargoBase64(3 bytes)', motor.estimarLargoBase64(3), 4);
igual('estimarLargoBase64(100 bytes)', motor.estimarLargoBase64(100), 136);
cierto('estimación coincide con el largo real',
  motor.estimarLargoBase64(1000) === motor.bytesABase64(bytesDePrueba(1000, 3)).length,
  'ambos = ' + motor.estimarLargoBase64(1000));
igual('construirDataUri', motor.construirDataUri('image/png', 'AAA'), 'data:image/png;base64,AAA');
igual('partirEnLineas parte cada 4', motor.partirEnLineas('abcdefgh', 4), 'abcd\nefgh');

console.log('\n=== E) LA INTERFAZ (index.html) TIENE LO QUE NECESITA ===');
var rutaHtml = path.join(__dirname, 'index.html');
cierto('index.html existe', fs.existsSync(rutaHtml), rutaHtml);
var html = fs.existsSync(rutaHtml) ? fs.readFileSync(rutaHtml, 'utf8') : '';

var requisitos = [
  ['idioma español declarado',        /<html[^>]+lang="es"/],
  ['codificación UTF-8',              /<meta\s+charset="UTF-8"/i],
  ['diseño responsive (viewport)',    /name="viewport"/],
  ['título de la página',             /<title>.*Base64.*<\/title>/i],
  ['input de archivo id="archivo"',   /<input[^>]+type="file"[^>]+id="archivo"/],
  ['acepta sólo imágenes',            /accept="image\/\*"/],
  ['botón Convertir',                 /id="btnConvertir"[\s\S]{0,80}Convertir a Base64/],
  ['botón Copiar',                    /id="btnCopiar"/],
  ['botón Descargar .txt',            /id="btnDescargar"/],
  ['botón Limpiar',                   /id="btnLimpiar"/],
  ['zona de previsualización',        /id="previsualizacion"/],
  ['textarea del resultado',          /<textarea[^>]+id="salida"/],
  ['opción de prefijo data:',         /id="optDataUri"/],
  ['carga el motor base64.js',        /<script src="base64\.js">/],
  ['estilos incrustados (sin CDN)',   /<style>[\s\S]{500,}<\/style>/],
  ['arrastrar y soltar',              /addEventListener\('drop'/],
  ['textos de la interfaz en español',/Convertir a Base64/]
];
requisitos.forEach(function (r) {
  cierto('HTML: ' + r[0], r[1].test(html));
});

/* Ningún recurso remoto: el proyecto debe funcionar sin conexión. */
var remotos = html.match(/(?:src|href)\s*=\s*"https?:\/\/[^"]+"/gi) || [];
cierto('HTML: sin recursos externos (0 CDNs)', remotos.length === 0,
  remotos.length ? remotos.join(', ') : 'ninguno');

/* El motor no debe depender de paquetes de terceros. */
var motorTxt = fs.readFileSync(path.join(__dirname, 'base64.js'), 'utf8');
var requires = motorTxt.match(/require\(/g) || [];
cierto('base64.js: sin dependencias externas', requires.length === 0, requires.length + ' require()');

/* Todos los identificadores usados por el JS existen realmente en el HTML. */
var ids = motorTxt ? [] : [];
var usados = (html.match(/getElementById\('([^']+)'\)/g) || []).map(function (s) {
  return s.replace(/getElementById\('|'\)/g, '');
});
var faltantes = usados.filter(function (id) {
  return html.indexOf('id="' + id + '"') === -1;
});
cierto('HTML: todos los getElementById apuntan a un id existente',
  faltantes.length === 0, faltantes.length ? 'faltan: ' + faltantes.join(', ') : usados.length + ' ids revisados');
void ids;

console.log('\n--------------------------------------------------');
console.log('Resultado: ' + pasadas + ' pruebas pasadas, ' + fallidas + ' fallidas.');
console.log('--------------------------------------------------\n');

process.exit(fallidas === 0 ? 0 : 1);
