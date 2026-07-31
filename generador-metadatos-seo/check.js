/*
 * check.js — Verificación automática del motor SEO (sin navegador).
 *
 * Uso:  node check.js
 * Sale con código 0 si todo pasa, 1 si algo falla.
 */
'use strict';

var SEO = require('./src/seo.js');

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

/* ------------------------------------------------------------------ */
grupo('1. Escapado de HTML (seguridad en atributos)');

igual('escapa comillas dobles',
  SEO.escaparHtml('Dice "hola"'), 'Dice &quot;hola&quot;');
igual('escapa < > y &',
  SEO.escaparHtml('<b>Tom & Jerry</b>'), '&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;');
comprobar('una comilla en el título no rompe el atributo content',
  SEO.generarMetaTags({ descripcion: 'Es "el mejor" & <único>' })
    .indexOf('content="Es &quot;el mejor&quot; &amp; &lt;único&gt;"') !== -1);
comprobar('un intento de inyección de etiqueta queda neutralizado',
  SEO.generarMetaTags({ titulo: '</title><script>alert(1)</script>' })
    .indexOf('<script>') === -1);

/* ------------------------------------------------------------------ */
grupo('2. Limpieza de texto');

igual('colapsa saltos de línea y espacios',
  SEO.limpiar('  Hola\n\n  mundo   '), 'Hola mundo');
igual('valores nulos devuelven cadena vacía', SEO.limpiar(null), '');

/* ------------------------------------------------------------------ */
grupo('3. Normalización de URL');

igual('añade https:// si falta',
  SEO.normalizarUrl('ejemplo.com/blog'), 'https://ejemplo.com/blog');
igual('respeta http:// existente',
  SEO.normalizarUrl('http://ejemplo.com'), 'http://ejemplo.com');
igual('respeta https:// existente',
  SEO.normalizarUrl('https://ejemplo.com'), 'https://ejemplo.com');
igual('completa las URL con //', SEO.normalizarUrl('//cdn.com/a.png'), 'https://cdn.com/a.png');
igual('URL vacía devuelve cadena vacía', SEO.normalizarUrl('   '), '');
igual('extrae el dominio quitando www',
  SEO.dominioDeUrl('https://www.Ejemplo.com/blog/post?x=1'), 'ejemplo.com');
igual('construye las migas de pan',
  SEO.migasDeUrl('https://ejemplo.com/blog/seo-2026'), 'ejemplo.com › blog › seo-2026');
igual('sin ruta, las migas son solo el dominio',
  SEO.migasDeUrl('ejemplo.com'), 'ejemplo.com');

/* ------------------------------------------------------------------ */
grupo('4. Medición y recorte por píxeles');

comprobar('un texto más ancho tiene más píxeles',
  SEO.anchoTexto('mmmmm') > SEO.anchoTexto('iiiii'));
igual('texto vacío mide 0 px', SEO.anchoTexto(''), 0);

var largo = 'Guía completa de posicionamiento SEO para tiendas online en 2026 con ejemplos reales y plantillas';
var recortado = SEO.recortarAPixeles(largo, SEO.LIMITES.titulo.pixeles);
comprobar('recorta el texto largo', recortado.length < largo.length);
comprobar('el recorte termina en «…»', recortado.slice(-1) === '…');
comprobar('el recorte cabe en el ancho máximo',
  SEO.anchoTexto(recortado) <= SEO.LIMITES.titulo.pixeles,
  SEO.anchoTexto(recortado) + ' px');
igual('un texto corto no se recorta',
  SEO.recortarAPixeles('Título breve', 580), 'Título breve');

/* ------------------------------------------------------------------ */
grupo('5. Análisis de longitud');

igual('título vacío → estado "vacio"',
  SEO.analizarCampo('', SEO.LIMITES.titulo).estado, 'vacio');
igual('título de 10 caracteres → "corto"',
  SEO.analizarCampo('Corto aqui', SEO.LIMITES.titulo).estado, 'corto');
igual('título de 45 caracteres → "ok"',
  SEO.analizarCampo('Zapatillas de running para principiantes', SEO.LIMITES.titulo).estado, 'ok');
igual('título de 90 caracteres → "largo"',
  SEO.analizarCampo(largo, SEO.LIMITES.titulo).estado, 'largo');
comprobar('el porcentaje nunca pasa de 100',
  SEO.analizarCampo(largo + largo, SEO.LIMITES.titulo).porcentaje === 100);

// La descripción se pinta más pequeña que el título: 135 caracteres caben.
var desc135 = 'Guía para elegir tus primeras zapatillas de running: tipos de pisada, amortiguación, tallas y las 8 mejores opciones por menos de 90 €.';
igual('la descripción de ejemplo mide 135 caracteres', desc135.length, 135);
igual('una descripción de 135 caracteres es válida',
  SEO.analizarCampo(desc135, SEO.LIMITES.descripcion).estado, 'ok');
comprobar('la escala de la descripción reduce el ancho medido',
  SEO.anchoTexto(desc135, SEO.LIMITES.descripcion.escala) < SEO.anchoTexto(desc135),
  SEO.anchoTexto(desc135, SEO.LIMITES.descripcion.escala) + ' px vs ' + SEO.anchoTexto(desc135) + ' px');
// El recorte real de Google es por píxeles, no por número de caracteres: una
// descripción de 157 caracteres ya se pasa aunque el límite nominal sea 160.
var desc157 = desc135 + ' Envío gratis en 24 h.';
igual('la descripción larga mide 157 caracteres (por debajo del límite de 160)', desc157.length, 157);
comprobar('aun así desborda los 920 px y se marca como larga',
  SEO.analizarCampo(desc157, SEO.LIMITES.descripcion).estado === 'largo',
  SEO.anchoTexto(desc157, SEO.LIMITES.descripcion.escala) + ' px');
comprobar('la previa de Google recorta esa descripción',
  SEO.vistaPreviaGoogle({ descripcion: desc157 }).descripcion.slice(-1) === '…');

/* ------------------------------------------------------------------ */
grupo('6. Palabras clave');

igual('separa por comas y limpia espacios',
  SEO.separarPalabrasClave(' seo , marketing ,  web '), ['seo', 'marketing', 'web']);
igual('elimina duplicados sin distinguir mayúsculas',
  SEO.separarPalabrasClave('SEO, seo, Seo'), ['SEO']);
igual('cadena vacía → lista vacía', SEO.separarPalabrasClave(''), []);

/* ------------------------------------------------------------------ */
grupo('7. Generación de etiquetas meta');

var datosDemo = {
  titulo: 'Zapatillas de running para principiantes | RunFácil',
  descripcion: 'Guía para elegir tus primeras zapatillas de running: tipos de pisada, amortiguación, tallas y las 8 mejores opciones por menos de 90 €.',
  url: 'runfacil.es/guias/zapatillas-principiantes',
  sitio: 'RunFácil',
  autor: 'Ana Torres',
  imagen: 'runfacil.es/img/portada-zapatillas.jpg',
  textoImagen: 'Zapatillas de running sobre asfalto',
  palabrasClave: 'zapatillas de running, running principiantes, guía de compra',
  tipo: 'article',
  idioma: 'es-ES',
  tarjeta: 'summary_large_image',
  usuarioTwitter: '@runfacil',
  indexar: true
};

var metas = SEO.generarMetaTags(datosDemo);
comprobar('incluye <title>', metas.indexOf('<title>Zapatillas de running') !== -1);
comprobar('incluye meta description', metas.indexOf('<meta name="description"') !== -1);
comprobar('incluye canonical con https',
  metas.indexOf('<link rel="canonical" href="https://runfacil.es/guias/zapatillas-principiantes">') !== -1);
comprobar('incluye og:title', metas.indexOf('<meta property="og:title"') !== -1);
comprobar('incluye og:image absoluta',
  metas.indexOf('content="https://runfacil.es/img/portada-zapatillas.jpg"') !== -1);
comprobar('incluye og:image:alt', metas.indexOf('og:image:alt') !== -1);
comprobar('og:type de artículo es "article"',
  metas.indexOf('<meta property="og:type" content="article">') !== -1);
comprobar('incluye og:locale es_ES', metas.indexOf('content="es_ES"') !== -1);
comprobar('incluye twitter:card', metas.indexOf('name="twitter:card" content="summary_large_image"') !== -1);
comprobar('normaliza la arroba del usuario de Twitter',
  metas.indexOf('name="twitter:site" content="@runfacil"') !== -1);
comprobar('robots index por defecto',
  metas.indexOf('name="robots" content="index, follow"') !== -1);
comprobar('robots noindex cuando se desactiva',
  SEO.generarMetaTags({ indexar: false }).indexOf('content="noindex, nofollow"') !== -1);
comprobar('sin imagen no se emite og:image',
  SEO.generarMetaTags({ titulo: 'X' }).indexOf('og:image') === -1);

/* ------------------------------------------------------------------ */
grupo('8. Datos estructurados JSON-LD');

var jsonArticulo = SEO.generarJsonLd(datosDemo);
igual('@context correcto', jsonArticulo['@context'], 'https://schema.org');
igual('tipo Article', jsonArticulo['@type'], 'Article');
comprobar('Article usa "headline"', typeof jsonArticulo.headline === 'string');
igual('autor como Person', jsonArticulo.author['@type'], 'Person');
igual('publisher como Organization', jsonArticulo.publisher.name, 'RunFácil');

var jsonProducto = SEO.generarJsonLd({ titulo: 'Silla ergonómica', sitio: 'MueblePro', tipo: 'product' });
igual('tipo Product', jsonProducto['@type'], 'Product');
igual('Product usa "name"', jsonProducto.name, 'Silla ergonómica');
igual('Product incluye la marca', jsonProducto.brand.name, 'MueblePro');

igual('tipo Organization', SEO.generarJsonLd({ sitio: 'ACME', tipo: 'organization' })['@type'], 'Organization');
igual('tipo WebSite por defecto', SEO.generarJsonLd({ titulo: 'Hola' })['@type'], 'WebSite');
igual('un tipo desconocido cae en WebSite',
  SEO.generarJsonLd({ titulo: 'Hola', tipo: 'inventado' })['@type'], 'WebSite');

var jsonTexto = SEO.generarJsonLdTexto(datosDemo);
comprobar('el JSON-LD va dentro de un <script>',
  jsonTexto.indexOf('<script type="application/ld+json">') === 0);
comprobar('el JSON-LD es JSON válido y reparseable', (function () {
  var cuerpo = jsonTexto.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  try { JSON.parse(cuerpo); return true; } catch (e) { return false; }
})());

comprobar('generarTodo une metas y JSON-LD',
  SEO.generarTodo(datosDemo).indexOf('application/ld+json') !== -1 &&
  SEO.generarTodo(datosDemo).indexOf('<title>') !== -1);

/* ------------------------------------------------------------------ */
grupo('9. Vistas previas');

var previaGoogle = SEO.vistaPreviaGoogle(datosDemo);
comprobar('la previa de Google cabe en 580 px',
  SEO.anchoTexto(previaGoogle.titulo) <= SEO.LIMITES.titulo.pixeles);
igual('las migas usan el dominio real', previaGoogle.migas,
  'runfacil.es › guias › zapatillas-principiantes');
comprobar('sin datos muestra textos de ejemplo',
  SEO.vistaPreviaGoogle({}).dominio === 'ejemplo.com');

var previaSocial = SEO.vistaPreviaSocial(datosDemo);
igual('el dominio social va en mayúsculas', previaSocial.dominio, 'RUNFACIL.ES');
comprobar('la previa social conserva la imagen',
  previaSocial.imagen === 'https://runfacil.es/img/portada-zapatillas.jpg');

/* ------------------------------------------------------------------ */
grupo('10. Auditoría y puntuación');

var auditoriaBuena = SEO.auditar(datosDemo);
comprobar('una ficha completa puntúa 85 o más',
  auditoriaBuena.puntuacion >= 85, 'puntuación ' + auditoriaBuena.puntuacion);
igual('una ficha completa no tiene errores', auditoriaBuena.errores, 0);
igual('nivel "bueno"', auditoriaBuena.nivel, 'bueno');

var auditoriaVacia = SEO.auditar({});
comprobar('una ficha vacía puntúa bajo',
  auditoriaVacia.puntuacion <= 40, 'puntuación ' + auditoriaVacia.puntuacion);
igual('ficha vacía: 2 errores (título y descripción)', auditoriaVacia.errores, 2);
comprobar('la puntuación nunca baja de 0', auditoriaVacia.puntuacion >= 0);

comprobar('detecta noindex',
  SEO.auditar({ titulo: datosDemo.titulo, indexar: false }).problemas
    .some(function (p) { return p.campo === 'Robots'; }));
comprobar('detecta título y descripción idénticos',
  SEO.auditar({ titulo: 'Hola mundo', descripcion: 'Hola mundo' }).problemas
    .some(function (p) { return p.campo === 'Duplicado'; }));
comprobar('detecta palabra clave ausente del título',
  SEO.auditar({ titulo: 'Nuestra empresa', palabrasClave: 'fontanería madrid' }).problemas
    .some(function (p) { return p.nivel === 'aviso' && p.campo === 'Palabra clave'; }));
comprobar('detecta imagen sin texto alternativo',
  SEO.auditar({ imagen: 'ejemplo.com/a.png' }).problemas
    .some(function (p) { return p.campo === 'Texto alternativo'; }));
comprobar('detecta exceso de palabras clave',
  SEO.auditar({ palabrasClave: 'a,b,c,d,e,f,g,h,i,j,k,l' }).problemas
    .some(function (p) { return p.campo === 'Palabras clave'; }));

/* ------------------------------------------------------------------ */
grupo('11. Robustez con entradas raras');

comprobar('auditar(undefined) no lanza excepción', (function () {
  try { SEO.auditar(undefined); return true; } catch (e) { return false; }
})());
comprobar('generarMetaTags(undefined) no lanza excepción', (function () {
  try { SEO.generarMetaTags(undefined); return true; } catch (e) { return false; }
})());
comprobar('un idioma inválido cae en es-ES',
  SEO.normalizarDatos({ idioma: 'zz-ZZ' }).idioma === 'es-ES');
comprobar('una tarjeta inválida cae en summary_large_image',
  SEO.normalizarDatos({ tarjeta: 'otra' }).tarjeta === 'summary_large_image');

/* ------------------------------------------------------------------ */
console.log('\n----------------------------------------');
console.log('Pruebas pasadas: ' + pasadas);
console.log('Pruebas fallidas: ' + fallidas.length);
if (fallidas.length) {
  console.log('\nFallos:');
  fallidas.forEach(function (f) { console.log(' - ' + f); });
  process.exit(1);
}
console.log('RESULTADO: TODO OK');
process.exit(0);
