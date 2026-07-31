/*
 * seo.js — Motor de generación y auditoría de metadatos SEO.
 *
 * Módulo puro (sin DOM, sin dependencias): se puede usar tanto en el navegador
 * (window.SEO) como en Node.js (require) para los tests de check.js.
 */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.SEO = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Límites recomendados
   * ------------------------------------------------------------------ */

  // "escala" ajusta la tabla de anchos (calibrada para el título, ~Arial 20 px)
  // al tamaño real de cada campo en el resultado de búsqueda: la descripción se
  // pinta a ~14 px, así que sus caracteres ocupan un 79 % de lo que ocupa un título.
  var LIMITES = {
    titulo: { min: 30, max: 60, pixeles: 580, escala: 1 },
    descripcion: { min: 70, max: 160, pixeles: 920, escala: 0.79 },
    palabrasClave: { max: 10 }
  };

  var TIPOS = {
    website: { etiqueta: 'Sitio web', og: 'website', schema: 'WebSite' },
    article: { etiqueta: 'Artículo / blog', og: 'article', schema: 'Article' },
    product: { etiqueta: 'Producto', og: 'product', schema: 'Product' },
    organization: { etiqueta: 'Empresa / negocio', og: 'website', schema: 'Organization' }
  };

  var IDIOMAS = {
    'es-ES': 'es_ES',
    'es-MX': 'es_MX',
    'es-AR': 'es_AR',
    'en-US': 'en_US',
    'pt-BR': 'pt_BR'
  };

  /* ------------------------------------------------------------------ *
   * Utilidades de texto
   * ------------------------------------------------------------------ */

  /** Escapa los caracteres que romperían un atributo HTML. */
  function escaparHtml(valor) {
    return String(valor === null || valor === undefined ? '' : valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Colapsa espacios y saltos de línea; recorta extremos. */
  function limpiar(valor) {
    return String(valor === null || valor === undefined ? '' : valor)
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Anchos aproximados (px) de cada carácter en la fuente de resultados de
  // Google (~Arial 20px para títulos). Sirve para estimar el recorte real,
  // que Google hace por píxeles y no por número de caracteres.
  var ANCHO_ESTRECHO = 'iljtI.,:;\'"`|![](){}';
  var ANCHO_ANCHO = 'mwMW@%';
  var ANCHO_MAYUS = 'ABCDEFGHKNOPQRSUVXYZÁÉÍÓÚÑ';

  function anchoCaracter(caracter) {
    if (caracter === ' ') return 4.5;
    if (ANCHO_ESTRECHO.indexOf(caracter) !== -1) return 4.2;
    if (ANCHO_ANCHO.indexOf(caracter) !== -1) return 14.5;
    if (ANCHO_MAYUS.indexOf(caracter) !== -1) return 11;
    if (caracter >= '0' && caracter <= '9') return 9.5;
    return 8.9;
  }

  /**
   * Ancho estimado en píxeles de un texto tal como lo mide Google.
   * @param {string} texto
   * @param {number} [escala] factor de tamaño de fuente (1 = título).
   */
  function anchoTexto(texto, escala) {
    var factor = typeof escala === 'number' ? escala : 1;
    var total = 0;
    var cadena = String(texto || '');
    for (var i = 0; i < cadena.length; i++) {
      total += anchoCaracter(cadena.charAt(i)) * factor;
    }
    return Math.round(total * 10) / 10;
  }

  /** Recorta un texto al ancho de píxeles disponible, añadiendo puntos suspensivos. */
  function recortarAPixeles(texto, pixelesMax, escala) {
    var factor = typeof escala === 'number' ? escala : 1;
    var cadena = limpiar(texto);
    if (anchoTexto(cadena, factor) <= pixelesMax) return cadena;
    var anchoPuntos = anchoTexto('…', factor);
    var acumulado = 0;
    var corte = 0;
    for (var i = 0; i < cadena.length; i++) {
      acumulado += anchoCaracter(cadena.charAt(i)) * factor;
      if (acumulado + anchoPuntos > pixelesMax) break;
      corte = i + 1;
    }
    // No cortar una palabra por la mitad si se puede evitar.
    var recortado = cadena.slice(0, corte);
    var ultimoEspacio = recortado.lastIndexOf(' ');
    if (ultimoEspacio > corte * 0.6) recortado = recortado.slice(0, ultimoEspacio);
    return recortado.replace(/[\s,.;:–-]+$/, '') + '…';
  }

  /* ------------------------------------------------------------------ *
   * Utilidades de URL
   * ------------------------------------------------------------------ */

  /** Añade https:// si falta y limpia espacios. Devuelve '' si no hay nada. */
  function normalizarUrl(url) {
    var cadena = limpiar(url);
    if (!cadena) return '';
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cadena)) return cadena;
    if (/^\/\//.test(cadena)) return 'https:' + cadena;
    return 'https://' + cadena.replace(/^\/+/, '');
  }

  /** Devuelve el dominio sin protocolo ni "www.". */
  function dominioDeUrl(url) {
    var cadena = normalizarUrl(url);
    if (!cadena) return '';
    var sinProtocolo = cadena.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    var dominio = sinProtocolo.split(/[/?#]/)[0];
    return dominio.replace(/^www\./i, '').toLowerCase();
  }

  /** Ruta estilo "migas de pan" como la muestra Google: dominio › blog › post */
  function migasDeUrl(url) {
    var cadena = normalizarUrl(url);
    if (!cadena) return '';
    var dominio = dominioDeUrl(cadena);
    var sinProtocolo = cadena.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    var resto = sinProtocolo.split(/[?#]/)[0].split('/').slice(1);
    var partes = resto.filter(function (parte) { return parte.length > 0; });
    if (!partes.length) return dominio;
    return dominio + ' › ' + partes.join(' › ');
  }

  /* ------------------------------------------------------------------ *
   * Análisis de campos
   * ------------------------------------------------------------------ */

  /**
   * Analiza un texto contra sus límites.
   * Estados posibles: 'vacio' | 'corto' | 'ok' | 'largo'.
   */
  function analizarCampo(texto, limites) {
    var valor = limpiar(texto);
    var longitud = valor.length;
    var pixeles = anchoTexto(valor, limites.escala);
    var estado;
    var mensaje;

    if (!longitud) {
      estado = 'vacio';
      mensaje = 'Vacío: escribe entre ' + limites.min + ' y ' + limites.max + ' caracteres.';
    } else if (longitud < limites.min) {
      estado = 'corto';
      mensaje = 'Corto: te faltan ' + (limites.min - longitud) + ' caracteres para el mínimo recomendado.';
    } else if (longitud > limites.max || pixeles > limites.pixeles) {
      estado = 'largo';
      mensaje = 'Largo: Google puede recortarlo con «…».';
    } else {
      estado = 'ok';
      mensaje = 'Longitud correcta.';
    }

    return {
      texto: valor,
      longitud: longitud,
      pixeles: pixeles,
      pixelesMax: limites.pixeles,
      porcentaje: Math.min(100, Math.round((pixeles / limites.pixeles) * 100)),
      estado: estado,
      mensaje: mensaje
    };
  }

  /** Convierte una cadena "a, b, c" en un array limpio y sin duplicados. */
  function separarPalabrasClave(valor) {
    return limpiar(valor)
      .split(',')
      .map(function (parte) { return parte.trim(); })
      .filter(function (parte) { return parte.length > 0; })
      .filter(function (parte, indice, lista) {
        return lista.findIndex(function (otra) {
          return otra.toLowerCase() === parte.toLowerCase();
        }) === indice;
      });
  }

  /* ------------------------------------------------------------------ *
   * Datos normalizados
   * ------------------------------------------------------------------ */

  /** Toma los datos crudos del formulario y devuelve una versión limpia. */
  function normalizarDatos(datos) {
    var origen = datos || {};
    var tipo = TIPOS[origen.tipo] ? origen.tipo : 'website';
    var idioma = IDIOMAS[origen.idioma] ? origen.idioma : 'es-ES';
    return {
      titulo: limpiar(origen.titulo),
      descripcion: limpiar(origen.descripcion),
      url: normalizarUrl(origen.url),
      sitio: limpiar(origen.sitio),
      autor: limpiar(origen.autor),
      imagen: normalizarUrl(origen.imagen),
      textoImagen: limpiar(origen.textoImagen),
      palabrasClave: separarPalabrasClave(origen.palabrasClave),
      tipo: tipo,
      idioma: idioma,
      tarjeta: origen.tarjeta === 'summary' ? 'summary' : 'summary_large_image',
      usuarioTwitter: limpiar(origen.usuarioTwitter).replace(/^@+/, ''),
      indexar: origen.indexar !== false
    };
  }

  /* ------------------------------------------------------------------ *
   * Generación de etiquetas
   * ------------------------------------------------------------------ */

  function etiquetaMeta(clave, atributo, valor) {
    return '<meta ' + atributo + '="' + clave + '" content="' + escaparHtml(valor) + '">';
  }

  /** Genera el bloque completo de etiquetas <meta> listo para pegar en <head>. */
  function generarMetaTags(datos) {
    var d = normalizarDatos(datos);
    var tipo = TIPOS[d.tipo];
    var lineas = [];

    lineas.push('<!-- SEO básico -->');
    lineas.push('<meta charset="utf-8">');
    lineas.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
    if (d.titulo) lineas.push('<title>' + escaparHtml(d.titulo) + '</title>');
    if (d.descripcion) lineas.push(etiquetaMeta('description', 'name', d.descripcion));
    if (d.palabrasClave.length) {
      lineas.push(etiquetaMeta('keywords', 'name', d.palabrasClave.join(', ')));
    }
    if (d.autor) lineas.push(etiquetaMeta('author', 'name', d.autor));
    lineas.push(etiquetaMeta('robots', 'name', d.indexar ? 'index, follow' : 'noindex, nofollow'));
    if (d.url) lineas.push('<link rel="canonical" href="' + escaparHtml(d.url) + '">');

    lineas.push('');
    lineas.push('<!-- Open Graph (Facebook, LinkedIn, WhatsApp) -->');
    lineas.push('<meta property="og:type" content="' + tipo.og + '">');
    if (d.titulo) lineas.push('<meta property="og:title" content="' + escaparHtml(d.titulo) + '">');
    if (d.descripcion) lineas.push('<meta property="og:description" content="' + escaparHtml(d.descripcion) + '">');
    if (d.url) lineas.push('<meta property="og:url" content="' + escaparHtml(d.url) + '">');
    if (d.sitio) lineas.push('<meta property="og:site_name" content="' + escaparHtml(d.sitio) + '">');
    if (d.imagen) {
      lineas.push('<meta property="og:image" content="' + escaparHtml(d.imagen) + '">');
      if (d.textoImagen) {
        lineas.push('<meta property="og:image:alt" content="' + escaparHtml(d.textoImagen) + '">');
      }
    }
    lineas.push('<meta property="og:locale" content="' + IDIOMAS[d.idioma] + '">');

    lineas.push('');
    lineas.push('<!-- Twitter / X -->');
    lineas.push(etiquetaMeta('twitter:card', 'name', d.tarjeta));
    if (d.titulo) lineas.push(etiquetaMeta('twitter:title', 'name', d.titulo));
    if (d.descripcion) lineas.push(etiquetaMeta('twitter:description', 'name', d.descripcion));
    if (d.imagen) lineas.push(etiquetaMeta('twitter:image', 'name', d.imagen));
    if (d.usuarioTwitter) lineas.push(etiquetaMeta('twitter:site', 'name', '@' + d.usuarioTwitter));

    return lineas.join('\n');
  }

  /** Construye el objeto JSON-LD (schema.org) según el tipo de contenido. */
  function generarJsonLd(datos) {
    var d = normalizarDatos(datos);
    var tipo = TIPOS[d.tipo];
    var json = { '@context': 'https://schema.org', '@type': tipo.schema };

    if (tipo.schema === 'Product') {
      if (d.titulo) json.name = d.titulo;
    } else if (tipo.schema === 'Organization') {
      json.name = d.sitio || d.titulo;
    } else if (tipo.schema === 'Article') {
      if (d.titulo) json.headline = d.titulo;
    } else if (d.titulo) {
      json.name = d.titulo;
    }

    if (d.descripcion) json.description = d.descripcion;
    if (d.url) json.url = d.url;
    if (d.imagen) json.image = d.imagen;
    if (d.idioma) json.inLanguage = d.idioma;

    if (d.autor && (tipo.schema === 'Article' || tipo.schema === 'WebSite')) {
      json.author = { '@type': 'Person', name: d.autor };
    }
    if (d.sitio && tipo.schema === 'Article') {
      json.publisher = { '@type': 'Organization', name: d.sitio };
    }
    if (tipo.schema === 'Product' && d.sitio) {
      json.brand = { '@type': 'Brand', name: d.sitio };
    }
    if (tipo.schema === 'WebSite' && d.sitio) {
      json.name = d.titulo || d.sitio;
      json.alternateName = d.sitio;
    }
    if (d.palabrasClave.length && tipo.schema !== 'Organization') {
      json.keywords = d.palabrasClave.join(', ');
    }

    return json;
  }

  /** Devuelve el JSON-LD ya envuelto en su <script>. */
  function generarJsonLdTexto(datos) {
    return '<script type="application/ld+json">\n' +
      JSON.stringify(generarJsonLd(datos), null, 2) +
      '\n<\/script>';
  }

  /** Bloque completo: metas + JSON-LD. */
  function generarTodo(datos) {
    return generarMetaTags(datos) + '\n\n<!-- Datos estructurados -->\n' + generarJsonLdTexto(datos);
  }

  /* ------------------------------------------------------------------ *
   * Vistas previas
   * ------------------------------------------------------------------ */

  /** Datos ya recortados tal como se verían en un resultado de Google. */
  function vistaPreviaGoogle(datos) {
    var d = normalizarDatos(datos);
    return {
      titulo: recortarAPixeles(d.titulo || 'Título sin definir',
        LIMITES.titulo.pixeles, LIMITES.titulo.escala),
      descripcion: recortarAPixeles(
        d.descripcion || 'Añade una descripción para ver cómo aparecería tu página en Google.',
        LIMITES.descripcion.pixeles, LIMITES.descripcion.escala
      ),
      migas: migasDeUrl(d.url) || 'ejemplo.com',
      dominio: dominioDeUrl(d.url) || 'ejemplo.com',
      indexar: d.indexar
    };
  }

  /** Datos de la tarjeta social (Open Graph / Twitter). */
  function vistaPreviaSocial(datos) {
    var d = normalizarDatos(datos);
    return {
      // Facebook recorta el título a ~2 líneas de 16 px en negrita y la
      // descripción a ~2 líneas de 14 px.
      titulo: recortarAPixeles(d.titulo || 'Título sin definir', 780, 0.85),
      descripcion: recortarAPixeles(d.descripcion || 'Sin descripción.', 840, 0.72),
      dominio: (dominioDeUrl(d.url) || 'ejemplo.com').toUpperCase(),
      imagen: d.imagen,
      sitio: d.sitio,
      tarjeta: d.tarjeta
    };
  }

  /* ------------------------------------------------------------------ *
   * Auditoría
   * ------------------------------------------------------------------ */

  var PENALIZACION = { error: 22, aviso: 8 };

  /**
   * Revisa los datos y devuelve una puntuación 0-100 con la lista de problemas.
   * Cada problema tiene { nivel: 'error'|'aviso'|'ok', campo, mensaje }.
   */
  function auditar(datos) {
    var d = normalizarDatos(datos);
    var titulo = analizarCampo(d.titulo, LIMITES.titulo);
    var descripcion = analizarCampo(d.descripcion, LIMITES.descripcion);
    var problemas = [];

    function anotar(nivel, campo, mensaje) {
      problemas.push({ nivel: nivel, campo: campo, mensaje: mensaje });
    }

    if (titulo.estado === 'vacio') {
      anotar('error', 'Título', 'Falta el título: es la señal SEO más importante.');
    } else if (titulo.estado === 'ok') {
      anotar('ok', 'Título', 'Título con longitud óptima (' + titulo.longitud + ' caracteres).');
    } else {
      anotar('aviso', 'Título', titulo.mensaje);
    }

    if (descripcion.estado === 'vacio') {
      anotar('error', 'Descripción', 'Falta la meta descripción: Google inventará un fragmento.');
    } else if (descripcion.estado === 'ok') {
      anotar('ok', 'Descripción', 'Descripción con longitud óptima (' + descripcion.longitud + ' caracteres).');
    } else {
      anotar('aviso', 'Descripción', descripcion.mensaje);
    }

    if (!d.url) {
      anotar('aviso', 'URL', 'Sin URL canónica: ayuda a evitar contenido duplicado.');
    } else {
      anotar('ok', 'URL', 'URL canónica definida.');
    }

    if (!d.imagen) {
      anotar('aviso', 'Imagen', 'Sin imagen social: al compartir el enlace saldrá una tarjeta gris.');
    } else {
      anotar('ok', 'Imagen', 'Imagen social definida (recomendado 1200×630 px).');
    }

    if (!d.sitio) {
      anotar('aviso', 'Nombre del sitio', 'Añade el nombre del sitio para las tarjetas sociales.');
    }

    if (d.titulo && d.descripcion && d.titulo.toLowerCase() === d.descripcion.toLowerCase()) {
      anotar('aviso', 'Duplicado', 'El título y la descripción son idénticos: escribe textos distintos.');
    }

    if (d.palabrasClave.length && d.titulo) {
      var principal = d.palabrasClave[0].toLowerCase();
      if (d.titulo.toLowerCase().indexOf(principal) === -1) {
        anotar('aviso', 'Palabra clave', 'La palabra clave principal («' + d.palabrasClave[0] + '») no aparece en el título.');
      } else {
        anotar('ok', 'Palabra clave', 'La palabra clave principal aparece en el título.');
      }
    }

    if (d.palabrasClave.length > LIMITES.palabrasClave.max) {
      anotar('aviso', 'Palabras clave', 'Demasiadas palabras clave (' + d.palabrasClave.length + '): usa como mucho ' + LIMITES.palabrasClave.max + '.');
    }

    if (!d.indexar) {
      anotar('aviso', 'Robots', 'Marcado como «noindex»: esta página NO aparecerá en Google.');
    }

    if (d.imagen && !d.textoImagen) {
      anotar('aviso', 'Texto alternativo', 'La imagen no tiene texto alternativo (og:image:alt).');
    }

    var puntuacion = 100;
    problemas.forEach(function (problema) {
      if (problema.nivel === 'error') puntuacion -= PENALIZACION.error;
      else if (problema.nivel === 'aviso') puntuacion -= PENALIZACION.aviso;
    });
    puntuacion = Math.max(0, Math.min(100, puntuacion));

    return {
      puntuacion: puntuacion,
      nivel: puntuacion >= 85 ? 'bueno' : puntuacion >= 60 ? 'medio' : 'malo',
      titulo: titulo,
      descripcion: descripcion,
      problemas: problemas,
      errores: problemas.filter(function (p) { return p.nivel === 'error'; }).length,
      avisos: problemas.filter(function (p) { return p.nivel === 'aviso'; }).length
    };
  }

  /* ------------------------------------------------------------------ *
   * API pública
   * ------------------------------------------------------------------ */

  return {
    LIMITES: LIMITES,
    TIPOS: TIPOS,
    IDIOMAS: IDIOMAS,
    escaparHtml: escaparHtml,
    limpiar: limpiar,
    anchoTexto: anchoTexto,
    recortarAPixeles: recortarAPixeles,
    normalizarUrl: normalizarUrl,
    dominioDeUrl: dominioDeUrl,
    migasDeUrl: migasDeUrl,
    analizarCampo: analizarCampo,
    separarPalabrasClave: separarPalabrasClave,
    normalizarDatos: normalizarDatos,
    generarMetaTags: generarMetaTags,
    generarJsonLd: generarJsonLd,
    generarJsonLdTexto: generarJsonLdTexto,
    generarTodo: generarTodo,
    vistaPreviaGoogle: vistaPreviaGoogle,
    vistaPreviaSocial: vistaPreviaSocial,
    auditar: auditar
  };
});
