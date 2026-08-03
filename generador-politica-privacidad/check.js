/*
 * check.js — Autotest sin navegador ni dependencias.
 *   Uso:  node check.js      (exit 0 = todo correcto, exit 1 = algo falló)
 *
 * Comprueba la lógica que de verdad importa: validación de entradas,
 * contenido de los tres documentos, adaptación por país, conversión a HTML
 * y que no queden marcadores sin sustituir.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const G = require('./src/generator.js');

let pasadas = 0;
const fallos = [];

function test(nombre, fn) {
  try {
    fn();
    pasadas++;
    console.log('  ok   ' + nombre);
  } catch (e) {
    fallos.push(nombre + ' → ' + e.message);
    console.log('  FALLA ' + nombre + ' → ' + e.message);
  }
}

function assert(cond, mensaje) {
  if (!cond) throw new Error(mensaje || 'condición falsa');
}
function contiene(texto, fragmento) {
  assert(texto.indexOf(fragmento) !== -1, 'no se encontró: "' + fragmento + '"');
}
function noContiene(texto, fragmento) {
  assert(texto.indexOf(fragmento) === -1, 'no debería aparecer: "' + fragmento + '"');
}

const base = G.datosEjemplo();

console.log('\n=== Generador de Política de Privacidad — autotest ===\n');

console.log('[1] Validación de datos de entrada');

test('los datos de ejemplo son válidos', () => {
  assert(G.validar(base).ok, 'el ejemplo debería validar');
});

test('rechaza empresa vacía', () => {
  const r = G.validar(Object.assign({}, base, { empresa: '  ' }));
  assert(!r.ok, 'debería fallar');
  assert(r.errores.some(e => e.campo === 'empresa'), 'falta el error de empresa');
});

test('rechaza URL sin protocolo', () => {
  const r = G.validar(Object.assign({}, base, { sitio: 'estudionova.com' }));
  assert(!r.ok && r.errores.some(e => e.campo === 'sitio'), 'debería marcar el sitio');
});

test('acepta URL con http y con https', () => {
  assert(G.validar(Object.assign({}, base, { sitio: 'http://x.dev' })).ok, 'http válido');
  assert(G.validar(Object.assign({}, base, { sitio: 'https://sub.dominio.io/ruta' })).ok, 'https válido');
});

test('rechaza correo mal formado', () => {
  const r = G.validar(Object.assign({}, base, { email: 'hola@@nada' }));
  assert(!r.ok && r.errores.some(e => e.campo === 'email'), 'debería marcar el email');
});

test('rechaza no seleccionar ningún dato', () => {
  const r = G.validar(Object.assign({}, base, { datos: [] }));
  assert(!r.ok && r.errores.some(e => e.campo === 'datos'), 'debería exigir al menos un dato');
});

test('rechaza retención fuera de rango', () => {
  assert(!G.validar(Object.assign({}, base, { retencion: 500 })).ok, '500 meses es demasiado');
});

test('ignora claves de datos inventadas', () => {
  const n = G.normalizar(Object.assign({}, base, { datos: ['email', 'telepatia'] }));
  assert(n.datos.length === 1 && n.datos[0] === 'email', 'debería filtrar claves desconocidas');
});

console.log('\n[2] Política de Privacidad');

const priv = G.generarPrivacidad(base);

test('incluye título y responsable', () => {
  contiene(priv, '# Política de Privacidad');
  contiene(priv, 'Estudio Nova S.L.');
  contiene(priv, 'privacidad@estudionova.com');
  contiene(priv, 'B-12345678');
});

test('lista los datos seleccionados y solo esos', () => {
  contiene(priv, 'Nombre y apellidos');
  contiene(priv, 'Correo electrónico');
  contiene(priv, 'Dirección IP y datos de navegación');
  noContiene(priv, 'Currículum y datos profesionales');
});

test('incluye las 7 secciones obligatorias del RGPD', () => {
  ['## 1. Responsable', '## 2. Qué datos', '## 3. Cuánto tiempo', '## 4. Con quién',
    '## 5. Sus derechos', '## 6. Seguridad', '## 7. Menores'].forEach(s => contiene(priv, s));
});

test('cita la ley y la autoridad de la jurisdicción elegida', () => {
  contiene(priv, 'LOPDGDD');
  contiene(priv, 'Agencia Española de Protección de Datos');
});

test('refleja el plazo de conservación indicado', () => {
  contiene(priv, '**24 meses**');
  contiene(G.generarPrivacidad(Object.assign({}, base, { retencion: 6 })), '**6 meses**');
});

test('incluye los derechos RGPD completos', () => {
  ['Acceso', 'Rectificación', 'Supresión', 'Limitación', 'Portabilidad', 'Oposición']
    .forEach(d => contiene(priv, '**' + d));
});

test('la sección de newsletter aparece solo si está activada', () => {
  contiene(priv, 'Comunicaciones comerciales');
  noContiene(G.generarPrivacidad(Object.assign({}, base, { newsletter: false })), 'Comunicaciones comerciales');
});

test('las transferencias internacionales dependen de la opción', () => {
  contiene(priv, 'Transferencias internacionales');
  noContiene(G.generarPrivacidad(Object.assign({}, base, { transferencias: false })), 'Transferencias internacionales');
});

test('sin terceros declara que no cede datos', () => {
  const sinTerceros = G.generarPrivacidad(Object.assign({}, base, { terceros: [] }));
  contiene(sinTerceros, 'No cedemos sus datos personales a terceros');
  noContiene(sinTerceros, 'Google Analytics');
});

test('con terceros los enumera con su enlace', () => {
  contiene(priv, '**Google Analytics**');
  contiene(priv, 'https://policies.google.com/privacy');
});

console.log('\n[3] Adaptación por jurisdicción');

test('México usa LFPDPPP, INAI y derechos ARCO', () => {
  const mx = G.generarPrivacidad(Object.assign({}, base, { jurisdiccion: 'mx' }));
  contiene(mx, 'LFPDPPP');
  contiene(mx, 'INAI');
  contiene(mx, '**Cancelación o supresión:**');
  noContiene(mx, 'Portabilidad');
});

test('California usa CCPA y derechos de opt-out', () => {
  const us = G.generarPrivacidad(Object.assign({}, base, { jurisdiccion: 'us' }));
  contiene(us, 'California Consumer Privacy Act');
  contiene(us, 'no vendemos sus datos personales');
});

test('cada jurisdicción genera los 3 documentos sin errores', () => {
  Object.keys(G.JURISDICCIONES).forEach(j => {
    const docs = G.generarTodo(Object.assign({}, base, { jurisdiccion: j }));
    ['privacidad', 'cookies', 'terminos'].forEach(k => {
      assert(typeof docs[k] === 'string' && docs[k].length > 800,
        j + '/' + k + ' salió demasiado corto (' + (docs[k] || '').length + ')');
    });
  });
});

test('jurisdicción desconocida cae en España por defecto', () => {
  assert(G.normalizar({ jurisdiccion: 'atlantida' }).jurisdiccion === 'es', 'debería usar es');
});

console.log('\n[4] Política de Cookies');

test('la tabla refleja las cookies activadas', () => {
  const conAmbas = G.generarCookies(Object.assign({}, base, { cookiesAnaliticas: true, cookiesMarketing: true }));
  contiene(conAmbas, '| Analíticas | Sí |');
  contiene(conAmbas, '| Publicitarias o de marketing | Sí |');
});

test('sin analíticas ni marketing avisa de que solo hay técnicas', () => {
  const soloTec = G.generarCookies(Object.assign({}, base, { cookiesAnaliticas: false, cookiesMarketing: false }));
  contiene(soloTec, 'Solo usamos cookies técnicas imprescindibles');
  contiene(soloTec, '| Analíticas | No |');
});

test('explica cómo borrarlas en los navegadores principales', () => {
  const c = G.generarCookies(base);
  ['Chrome', 'Firefox', 'Safari', 'Edge'].forEach(n => contiene(c, '**' + n + ':**'));
});

console.log('\n[5] Aviso Legal y Términos');

const ter = G.generarTerminos(base);

test('incluye objeto, propiedad intelectual y jurisdicción', () => {
  contiene(ter, '# Aviso Legal y Términos de Uso');
  contiene(ter, '## 2. Objeto');
  contiene(ter, '## 4. Propiedad intelectual');
  contiene(ter, '## 9. Legislación aplicable');
  contiene(ter, 'España');
});

console.log('\n[6] Robustez del texto generado');

test('ningún documento deja marcadores sin sustituir', () => {
  const todos = Object.values(G.generarTodo(base)).join('\n');
  [/\{\{/, /\[\s*\]/, /undefined/, /\bnull\b/, /NaN/, /TODO/].forEach(re => {
    assert(!re.test(todos), 'aparece un marcador o valor inválido: ' + re);
  });
});

test('la fecha se escribe en formato largo en español', () => {
  assert(G.fechaLarga('2026-08-03') === '3 de agosto de 2026', 'obtenido: ' + G.fechaLarga('2026-08-03'));
  contiene(priv, '3 de agosto de 2026');
});

test('el HTML del usuario se escapa (no hay inyección)', () => {
  const malicioso = Object.assign({}, base, { empresa: '<script>alert(1)</script>Acme' });
  const html = G.markdownAHtml(G.generarPrivacidad(malicioso));
  noContiene(html, '<script>');
  contiene(html, '&lt;script&gt;');
});

console.log('\n[7] Conversión Markdown → HTML');

test('convierte títulos, listas, negritas y enlaces', () => {
  const html = G.markdownAHtml('# Título\n\n- uno\n- **dos**\n\n[web](https://ejemplo.com)');
  contiene(html, '<h1>Título</h1>');
  contiene(html, '<li>uno</li>');
  contiene(html, '<strong>dos</strong>');
  contiene(html, '<a href="https://ejemplo.com"');
});

test('convierte tablas markdown en <table> con cabecera', () => {
  const html = G.markdownAHtml('| A | B |\n|---|---|\n| 1 | 2 |');
  contiene(html, '<table>');
  contiene(html, '<th>A</th>');
  contiene(html, '<td>1</td>');
  noContiene(html, '---');
});

test('el HTML descargable es un documento completo y bien formado', () => {
  const doc = G.documentoHtmlCompleto('Política de Privacidad', priv);
  contiene(doc, '<!DOCTYPE html>');
  contiene(doc, '<html lang="es">');
  contiene(doc, '<title>Política de Privacidad</title>');
  contiene(doc, '</html>');
  const abiertas = (doc.match(/<h2>/g) || []).length;
  const cerradas = (doc.match(/<\/h2>/g) || []).length;
  assert(abiertas === cerradas && abiertas > 0, 'etiquetas h2 descompensadas');
});

console.log('\n[8] Integridad del proyecto');

test('todos los archivos esperados existen', () => {
  ['index.html', 'styles.css', 'src/generator.js', 'src/app.js', 'README.md', 'SELFTEST.md']
    .forEach(f => assert(fs.existsSync(path.join(__dirname, f)), 'falta ' + f));
});

test('el HTML no carga recursos externos (sin CDNs)', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert(!/(src|href)\s*=\s*["']https?:\/\//i.test(html), 'se detectó un recurso remoto en index.html');
});

/* ---------------- Resumen ---------------- */
console.log('\n' + '='.repeat(52));
if (fallos.length === 0) {
  console.log('RESULTADO: ' + pasadas + '/' + pasadas + ' pruebas correctas ✔');
  console.log('='.repeat(52) + '\n');
  process.exit(0);
} else {
  console.log('RESULTADO: ' + pasadas + ' correctas, ' + fallos.length + ' FALLIDAS ✘');
  fallos.forEach(f => console.log('  - ' + f));
  console.log('='.repeat(52) + '\n');
  process.exit(1);
}
