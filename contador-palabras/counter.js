// counter.js — Funciones puras de conteo (sin dependencias, sin DOM).
// Se exportan para poder probarlas con Node (ver check.js) y reutilizarlas en la UI.

/**
 * Cuenta las palabras de un texto.
 * Una "palabra" es cualquier secuencia separada por espacios, tabulaciones o
 * saltos de línea. El texto vacío o solo con espacios cuenta 0.
 * @param {string} texto
 * @returns {number}
 */
function contarPalabras(texto) {
  if (typeof texto !== 'string') return 0;
  const limpio = texto.trim();
  if (limpio === '') return 0;
  // Separa por cualquier bloque de espacios en blanco (espacios, tabs, saltos).
  return limpio.split(/\s+/).length;
}

/**
 * Cuenta los caracteres del texto, INCLUYENDO los espacios y saltos de línea.
 * @param {string} texto
 * @returns {number}
 */
function contarCaracteres(texto) {
  if (typeof texto !== 'string') return 0;
  // Usamos el spread para contar por "code points" (emojis, tildes, etc.).
  return [...texto].length;
}

/**
 * Cuenta los caracteres del texto SIN contar espacios ni saltos de línea.
 * @param {string} texto
 * @returns {number}
 */
function contarCaracteresSinEspacios(texto) {
  if (typeof texto !== 'string') return 0;
  return [...texto.replace(/\s/g, '')].length;
}

/**
 * Cuenta las frases (oraciones) de un texto.
 * Una frase termina en punto (.), signo de interrogación (?) o exclamación (!).
 * Varios signos seguidos (p. ej. "!!!" o "?!") cuentan como una sola frase.
 * Si hay texto pero sin ningún signo final, se considera 1 frase.
 * @param {string} texto
 * @returns {number}
 */
function contarFrases(texto) {
  if (typeof texto !== 'string') return 0;
  const limpio = texto.trim();
  if (limpio === '') return 0;
  // Buscamos grupos de terminadores de frase seguidos de contenido restante.
  const coincidencias = limpio.match(/[^.!?]+[.!?]+/g);
  if (!coincidencias) {
    // Hay texto pero sin signos de puntuación final: es 1 frase.
    return 1;
  }
  // Puede quedar texto "colgando" después del último signo (sin terminador).
  const restante = limpio.replace(/[^.!?]+[.!?]+/g, '').trim();
  return coincidencias.length + (restante !== '' ? 1 : 0);
}

/**
 * Cuenta los párrafos de un texto.
 * Un párrafo se separa de otro por una línea en blanco (doble salto de línea).
 * Los bloques vacíos se ignoran.
 * @param {string} texto
 * @returns {number}
 */
function contarParrafos(texto) {
  if (typeof texto !== 'string') return 0;
  const limpio = texto.trim();
  if (limpio === '') return 0;
  // Normalizamos saltos de línea de Windows (\r\n) a \n.
  const normalizado = limpio.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Separamos por una o más líneas en blanco.
  const bloques = normalizado
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b !== '');
  return bloques.length;
}

/**
 * Devuelve las palabras más frecuentes del texto.
 * - Case-insensitive (Hola y hola cuentan igual).
 * - Ignora la puntuación (comas, puntos, comillas, etc.).
 * - Ordena de mayor a menor frecuencia; a igualdad, orden alfabético.
 * @param {string} texto
 * @param {number} [limite=10] cuántas palabras devolver como máximo
 * @returns {Array<{palabra: string, cantidad: number}>}
 */
function palabrasFrecuentes(texto, limite = 10) {
  if (typeof texto !== 'string' || texto.trim() === '') return [];

  const minusculas = texto.toLowerCase();

  // Extraemos "palabras": letras (incluye acentos y ñ), números y apóstrofos internos.
  const encontradas = minusculas.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  if (!encontradas) return [];

  const conteo = new Map();
  for (const palabra of encontradas) {
    conteo.set(palabra, (conteo.get(palabra) || 0) + 1);
  }

  return [...conteo.entries()]
    .map(([palabra, cantidad]) => ({ palabra, cantidad }))
    .sort((a, b) => {
      if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad;
      return a.palabra.localeCompare(b.palabra, 'es');
    })
    .slice(0, limite);
}

/**
 * Calcula todas las estadísticas de una sola vez.
 * @param {string} texto
 * @returns {object}
 */
function analizarTexto(texto) {
  return {
    palabras: contarPalabras(texto),
    caracteres: contarCaracteres(texto),
    caracteresSinEspacios: contarCaracteresSinEspacios(texto),
    frases: contarFrases(texto),
    parrafos: contarParrafos(texto),
    frecuentes: palabrasFrecuentes(texto, 10),
  };
}

// Exportación compatible con Node (CommonJS) y con navegador (window/global).
const API = {
  contarPalabras,
  contarCaracteres,
  contarCaracteresSinEspacios,
  contarFrases,
  contarParrafos,
  palabrasFrecuentes,
  analizarTexto,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
if (typeof window !== 'undefined') {
  window.Contador = API;
}
