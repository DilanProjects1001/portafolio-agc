/**
 * Motor de conversión Base64 (sin dependencias).
 *
 * Este archivo lo usan LOS DOS lados del proyecto:
 *   - el navegador (index.html lo carga con <script src="base64.js">)
 *   - el autotest de Node.js (check.js lo carga con require)
 * Así las pruebas validan exactamente el mismo código que corre el usuario:
 * no hay una segunda copia que se pueda desincronizar.
 */
'use strict';

/* Alfabeto estándar de Base64 (RFC 4648). */
var ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/* Tabla inversa: código de carácter -> valor de 6 bits. Se construye una vez. */
var INVERSA = (function () {
  var tabla = new Int16Array(256);
  for (var i = 0; i < 256; i++) tabla[i] = -1;
  for (var j = 0; j < ALFABETO.length; j++) tabla[ALFABETO.charCodeAt(j)] = j;
  return tabla;
})();

/**
 * Normaliza cualquier entrada binaria razonable a Uint8Array.
 * Acepta Uint8Array, Buffer de Node, ArrayBuffer o array de números.
 */
function aBytes(entrada) {
  if (entrada instanceof Uint8Array) return entrada;
  if (entrada instanceof ArrayBuffer) return new Uint8Array(entrada);
  if (Array.isArray(entrada)) return Uint8Array.from(entrada);
  if (entrada && entrada.buffer instanceof ArrayBuffer) {
    return new Uint8Array(entrada.buffer, entrada.byteOffset || 0, entrada.byteLength);
  }
  throw new TypeError('Se esperaban bytes (Uint8Array, ArrayBuffer o array de números).');
}

/**
 * Codifica bytes en una cadena Base64.
 * Procesa de 3 en 3 bytes (24 bits) y los parte en 4 grupos de 6 bits;
 * si sobran 1 o 2 bytes al final, se rellena con '=' como manda el estándar.
 */
function bytesABase64(entrada) {
  var bytes = aBytes(entrada);
  var salida = '';
  var trozo = ''; // se acumula por trozos para no concatenar millones de veces
  var i = 0;
  var largo = bytes.length;
  var completos = largo - (largo % 3);

  for (i = 0; i < completos; i += 3) {
    var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    trozo += ALFABETO[(n >> 18) & 63] + ALFABETO[(n >> 12) & 63] +
             ALFABETO[(n >> 6) & 63] + ALFABETO[n & 63];
    if (trozo.length >= 8192) { salida += trozo; trozo = ''; }
  }

  var sobran = largo - completos;
  if (sobran === 1) {
    var a = bytes[largo - 1];
    trozo += ALFABETO[a >> 2] + ALFABETO[(a << 4) & 63] + '==';
  } else if (sobran === 2) {
    var b1 = bytes[largo - 2];
    var b2 = bytes[largo - 1];
    trozo += ALFABETO[b1 >> 2] +
             ALFABETO[((b1 << 4) | (b2 >> 4)) & 63] +
             ALFABETO[(b2 << 2) & 63] + '=';
  }

  return salida + trozo;
}

/**
 * Decodifica una cadena Base64 y devuelve los bytes originales.
 * Ignora espacios y saltos de línea; acepta también data URI completo.
 * Lanza un error claro si la cadena tiene caracteres inválidos.
 */
function base64ABytes(cadena) {
  if (typeof cadena !== 'string') throw new TypeError('Se esperaba una cadena Base64.');

  // Si viene un data URI ("data:image/png;base64,AAA..."), nos quedamos con la parte útil.
  var coma = cadena.indexOf('base64,');
  if (cadena.slice(0, 5) === 'data:' && coma !== -1) cadena = cadena.slice(coma + 7);

  var limpia = cadena.replace(/[\s\r\n]+/g, '');
  limpia = limpia.replace(/=+$/, ''); // el relleno no aporta bits

  var largo = limpia.length;
  if (largo % 4 === 1) throw new Error('La cadena Base64 está incompleta (longitud inválida).');

  var salida = new Uint8Array(Math.floor((largo * 3) / 4));
  var pos = 0;
  var acumulador = 0;
  var bits = 0;

  for (var i = 0; i < largo; i++) {
    var valor = INVERSA[limpia.charCodeAt(i) & 0xff];
    if (valor < 0) {
      throw new Error('Carácter no válido para Base64: "' + limpia[i] + '" en la posición ' + i + '.');
    }
    acumulador = (acumulador << 6) | valor;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      salida[pos++] = (acumulador >> bits) & 0xff;
    }
  }

  return salida.subarray(0, pos);
}

/* Firmas binarias (magic bytes) de los formatos de imagen más comunes. */
var FIRMAS = [
  { mime: 'image/png',    etiqueta: 'PNG',  extension: 'png',  bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/jpeg',   etiqueta: 'JPEG', extension: 'jpg',  bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif',    etiqueta: 'GIF',  extension: 'gif',  bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/bmp',    etiqueta: 'BMP',  extension: 'bmp',  bytes: [0x42, 0x4d] },
  { mime: 'image/x-icon', etiqueta: 'ICO',  extension: 'ico',  bytes: [0x00, 0x00, 0x01, 0x00] }
];

function empiezaCon(bytes, patron) {
  if (bytes.length < patron.length) return false;
  for (var i = 0; i < patron.length; i++) if (bytes[i] !== patron[i]) return false;
  return true;
}

/**
 * Detecta el tipo real de la imagen mirando sus primeros bytes,
 * no la extensión del nombre (que se puede falsear).
 * Devuelve { mime, etiqueta, extension, seguro }.
 */
function detectarTipo(entrada, nombreArchivo) {
  var bytes = aBytes(entrada);

  for (var i = 0; i < FIRMAS.length; i++) {
    if (empiezaCon(bytes, FIRMAS[i].bytes)) {
      return { mime: FIRMAS[i].mime, etiqueta: FIRMAS[i].etiqueta, extension: FIRMAS[i].extension, seguro: true };
    }
  }

  // WebP: "RIFF" .... "WEBP" (los 4 bytes del tamaño van en medio).
  if (empiezaCon(bytes, [0x52, 0x49, 0x46, 0x46]) && bytes.length >= 12 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { mime: 'image/webp', etiqueta: 'WebP', extension: 'webp', seguro: true };
  }

  // SVG: es texto; buscamos "<svg" dentro de los primeros bytes.
  var cabecera = '';
  var limite = Math.min(bytes.length, 300);
  for (var j = 0; j < limite; j++) cabecera += String.fromCharCode(bytes[j]);
  if (cabecera.indexOf('<svg') !== -1 || (cabecera.indexOf('<?xml') !== -1 && cabecera.indexOf('svg') !== -1)) {
    return { mime: 'image/svg+xml', etiqueta: 'SVG', extension: 'svg', seguro: true };
  }

  // Sin firma reconocida: caemos a la extensión del nombre, avisando que no es seguro.
  var ext = String(nombreArchivo || '').split('.').pop().toLowerCase();
  var porNombre = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml', ico: 'image/x-icon',
    avif: 'image/avif', tif: 'image/tiff', tiff: 'image/tiff'
  };
  if (porNombre[ext]) {
    return { mime: porNombre[ext], etiqueta: ext.toUpperCase(), extension: ext, seguro: false };
  }

  return { mime: 'application/octet-stream', etiqueta: 'Desconocido', extension: 'bin', seguro: false };
}

/** Arma el data URI listo para pegar en HTML o CSS. */
function construirDataUri(mime, base64) {
  return 'data:' + (mime || 'application/octet-stream') + ';base64,' + base64;
}

/** Tamaño legible para personas: 980 B, 1.4 KB, 2.31 MB... */
function formatearTamano(nBytes) {
  var n = Number(nBytes);
  if (!isFinite(n) || n < 0) throw new RangeError('Tamaño inválido.');
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Base64 ocupa 4 caracteres por cada 3 bytes: ~33 % más que el original.
 * Sirve para avisar al usuario cuánto crecerá su archivo.
 */
function estimarLargoBase64(nBytes) {
  var n = Number(nBytes);
  if (!isFinite(n) || n < 0) throw new RangeError('Tamaño inválido.');
  return Math.ceil(n / 3) * 4;
}

/** Parte la cadena en líneas de ancho fijo (útil para pegar en correo o CSS). */
function partirEnLineas(cadena, ancho) {
  var paso = ancho || 76;
  var partes = [];
  for (var i = 0; i < cadena.length; i += paso) partes.push(cadena.slice(i, i + paso));
  return partes.join('\n');
}

/* Exportación para Node.js; en el navegador las funciones quedan como globales. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ALFABETO: ALFABETO,
    bytesABase64: bytesABase64,
    base64ABytes: base64ABytes,
    detectarTipo: detectarTipo,
    construirDataUri: construirDataUri,
    formatearTamano: formatearTamano,
    estimarLargoBase64: estimarLargoBase64,
    partirEnLineas: partirEnLineas
  };
}
