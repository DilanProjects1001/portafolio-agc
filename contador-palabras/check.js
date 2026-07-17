// check.js — Autotest de las funciones puras de counter.js.
// Ejecuta: node check.js
// Sale con exit 0 si TODOS los tests pasan; exit 1 si alguno falla.

const C = require('./counter.js');

let pasados = 0;
let fallados = 0;

function comprobar(descripcion, obtenido, esperado) {
  const iguales = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (iguales) {
    pasados++;
    console.log(`  OK   ${descripcion}`);
  } else {
    fallados++;
    console.log(`  FALLA ${descripcion}`);
    console.log(`        esperado: ${JSON.stringify(esperado)}`);
    console.log(`        obtenido: ${JSON.stringify(obtenido)}`);
  }
}

console.log('Ejecutando tests del contador de palabras...\n');

// --- Palabras ---
comprobar('palabras: texto vacío = 0', C.contarPalabras(''), 0);
comprobar('palabras: solo espacios = 0', C.contarPalabras('   \n  '), 0);
comprobar('palabras: "hola mundo" = 2', C.contarPalabras('hola mundo'), 2);
comprobar('palabras: separadas por saltos de línea', C.contarPalabras('uno\ndos\ntres'), 3);
comprobar('palabras: espacios múltiples cuentan una vez', C.contarPalabras('  hola    mundo  '), 2);

// --- Caracteres ---
comprobar('caracteres: "hola" = 4', C.contarCaracteres('hola'), 4);
comprobar('caracteres: incluye espacios', C.contarCaracteres('a b c'), 5);
comprobar('caracteres: cadena vacía = 0', C.contarCaracteres(''), 0);
comprobar('caracteres sin espacios: "a b c" = 3', C.contarCaracteresSinEspacios('a b c'), 3);

// --- Frases ---
comprobar('frases: una frase con punto', C.contarFrases('Hola mundo.'), 1);
comprobar('frases: tres frases con . ? !', C.contarFrases('Hola. ¿Cómo estás? ¡Bien!'), 3);
comprobar('frases: texto sin signo final = 1', C.contarFrases('Esto no tiene punto'), 1);
comprobar('frases: signos repetidos cuentan uno', C.contarFrases('¡Genial!!! Vamos.'), 2);
comprobar('frases: vacío = 0', C.contarFrases('   '), 0);

// --- Párrafos ---
comprobar('párrafos: uno solo', C.contarParrafos('Un solo párrafo aquí.'), 1);
comprobar('párrafos: dos separados por línea en blanco', C.contarParrafos('Párrafo uno.\n\nPárrafo dos.'), 2);
comprobar('párrafos: ignora líneas en blanco extra', C.contarParrafos('A\n\n\n\nB'), 2);
comprobar('párrafos: salto simple NO separa párrafo', C.contarParrafos('línea 1\nlínea 2'), 1);
comprobar('párrafos: vacío = 0', C.contarParrafos(''), 0);

// --- Palabras frecuentes ---
comprobar(
  'frecuentes: case-insensitive e ignora puntuación',
  C.palabrasFrecuentes('Hola hola, HOLA! mundo mundo. adiós', 10),
  [
    { palabra: 'hola', cantidad: 3 },
    { palabra: 'mundo', cantidad: 2 },
    { palabra: 'adiós', cantidad: 1 },
  ]
);
comprobar('frecuentes: texto vacío = []', C.palabrasFrecuentes(''), []);
comprobar(
  'frecuentes: respeta el límite',
  C.palabrasFrecuentes('a b c d e f', 3).length,
  3
);
comprobar(
  'frecuentes: empate se ordena alfabéticamente',
  C.palabrasFrecuentes('zorro abeja', 10),
  [
    { palabra: 'abeja', cantidad: 1 },
    { palabra: 'zorro', cantidad: 1 },
  ]
);

// --- analizarTexto (integración) ---
const analisis = C.analizarTexto('Hola mundo. Hola de nuevo.');
comprobar('analizarTexto: palabras', analisis.palabras, 5);
comprobar('analizarTexto: frases', analisis.frases, 2);
comprobar('analizarTexto: párrafos', analisis.parrafos, 1);

// --- Resultado final ---
console.log(`\n${pasados} pasados, ${fallados} fallados.`);

if (fallados === 0) {
  console.log('\n✔ Todos los tests pasaron');
  process.exit(0);
} else {
  console.log('\nX Hubo tests fallidos');
  process.exit(1);
}
