/*
 * app.js — Interfaz del Generador de Metadatos SEO.
 * Toda la lógica de negocio vive en src/seo.js; aquí solo hay DOM.
 */
(function () {
  'use strict';

  var CLAVE_GUARDADO = 'agc-metadatos-seo';

  var CAMPOS = [
    'titulo', 'descripcion', 'url', 'sitio', 'autor', 'imagen',
    'textoImagen', 'palabrasClave', 'tipo', 'idioma', 'tarjeta', 'usuarioTwitter'
  ];

  var EJEMPLO = {
    titulo: 'Zapatillas de running para principiantes | RunFácil',
    descripcion: 'Guía para elegir tus primeras zapatillas de running: tipos de pisada, amortiguación, tallas y las 8 mejores opciones por menos de 90 €.',
    url: 'runfacil.es/guias/zapatillas-para-principiantes',
    sitio: 'RunFácil',
    autor: 'Ana Torres',
    imagen: 'runfacil.es/img/portada-zapatillas.jpg',
    textoImagen: 'Zapatillas de running sobre asfalto al amanecer',
    palabrasClave: 'zapatillas de running, running para principiantes, guía de compra',
    tipo: 'article',
    idioma: 'es-ES',
    tarjeta: 'summary_large_image',
    usuarioTwitter: '@runfacil',
    indexar: true
  };

  var el = {};
  var redActiva = 'facebook';
  var codigoActivo = 'todo';
  var temporizadorAviso = null;

  function porId(id) { return document.getElementById(id); }

  /* ---------------------------------------------------------------- *
   * Lectura y escritura del formulario
   * ---------------------------------------------------------------- */

  function leerFormulario() {
    var datos = {};
    CAMPOS.forEach(function (campo) { datos[campo] = el[campo].value; });
    datos.indexar = el.indexar.checked;
    return datos;
  }

  function escribirFormulario(datos) {
    CAMPOS.forEach(function (campo) {
      el[campo].value = datos[campo] === undefined ? '' : datos[campo];
    });
    el.indexar.checked = datos.indexar !== false;
  }

  /* ---------------------------------------------------------------- *
   * Contadores de longitud
   * ---------------------------------------------------------------- */

  var CLASE_ESTADO = { ok: 'ok', corto: 'corto', largo: 'largo', vacio: '' };

  function pintarContador(nombre, analisis, maximo) {
    var contador = el['contador-' + nombre];
    var barra = el['barra-' + nombre];
    var ayuda = el['ayuda-' + nombre];
    var sufijo = CLASE_ESTADO[analisis.estado];

    contador.textContent = analisis.longitud + ' / ' + maximo +
      '  ·  ' + Math.round(analisis.pixeles) + ' px';
    contador.className = 'contador' + (sufijo ? ' contador--' + sufijo : '');

    barra.style.width = analisis.porcentaje + '%';
    barra.className = 'barra__relleno' + (sufijo ? ' barra__relleno--' + sufijo : '');

    ayuda.textContent = analisis.mensaje;
    ayuda.className = 'ayuda' + (sufijo ? ' ayuda--' + sufijo : '');
  }

  /* ---------------------------------------------------------------- *
   * Medidor de puntuación
   * ---------------------------------------------------------------- */

  var COLOR_NIVEL = { bueno: '#1fa463', medio: '#e4a11b', malo: '#d5453b' };
  var TEXTO_NIVEL = {
    bueno: 'Listo para publicar',
    medio: 'Mejorable',
    malo: 'Necesita trabajo'
  };

  function pintarAuditoria(auditoria) {
    el.medidor.style.setProperty('--valor', auditoria.puntuacion);
    el.medidor.style.setProperty('--color', COLOR_NIVEL[auditoria.nivel]);
    el['puntuacion-numero'].textContent = auditoria.puntuacion;
    el['puntuacion-etiqueta'].textContent = TEXTO_NIVEL[auditoria.nivel];

    var partes = [];
    if (auditoria.errores) partes.push(auditoria.errores + (auditoria.errores === 1 ? ' problema grave' : ' problemas graves'));
    if (auditoria.avisos) partes.push(auditoria.avisos + (auditoria.avisos === 1 ? ' aviso' : ' avisos'));
    el['puntuacion-detalle'].textContent = partes.length
      ? partes.join(' y ') + '.'
      : 'No hemos encontrado nada que corregir. ¡Bien hecho!';

    var lista = el['lista-problemas'];
    lista.textContent = '';
    var orden = { error: 0, aviso: 1, ok: 2 };
    auditoria.problemas
      .slice()
      .sort(function (a, b) { return orden[a.nivel] - orden[b.nivel]; })
      .forEach(function (problema) {
        var li = document.createElement('li');
        li.className = 'problema--' + problema.nivel;
        var marca = document.createElement('span');
        marca.className = 'marca';
        marca.setAttribute('aria-hidden', 'true');
        marca.textContent = problema.nivel === 'ok' ? '✓' : problema.nivel === 'aviso' ? '!' : '✕';
        var texto = document.createElement('span');
        var etiqueta = document.createElement('strong');
        etiqueta.textContent = problema.campo + ': ';
        texto.appendChild(etiqueta);
        texto.appendChild(document.createTextNode(problema.mensaje));
        li.appendChild(marca);
        li.appendChild(texto);
        lista.appendChild(li);
      });
  }

  /* ---------------------------------------------------------------- *
   * Vistas previas
   * ---------------------------------------------------------------- */

  function pintarPreviaGoogle(datos) {
    var previa = SEO.vistaPreviaGoogle(datos);
    el['g-sitio'].textContent = previa.dominio;
    el['g-migas'].textContent = previa.migas;
    el['g-titulo'].textContent = previa.titulo;
    el['g-descripcion'].textContent = previa.descripcion;
    el['aviso-noindex'].classList.toggle('oculto', previa.indexar);
  }

  /**
   * Muestra la imagen sólo si el navegador consigue descargarla; si no,
   * deja un mensaje claro en vez de un rectángulo gris vacío.
   */
  var urlImagenPedida = null;

  function pintarImagenSocial(url) {
    var caja = el['s-imagen'];
    var texto = caja.querySelector('.previa-social__vacia');
    urlImagenPedida = url;

    function vaciar(mensaje) {
      caja.style.backgroundImage = '';
      caja.classList.remove('previa-social__imagen--con-imagen');
      texto.textContent = mensaje;
    }

    if (!url) {
      vaciar('Sin imagen — añade una URL de imagen');
      return;
    }

    var prueba = new Image();
    prueba.onload = function () {
      if (urlImagenPedida !== url) return;   // el usuario ya cambió la URL
      caja.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")';
      caja.classList.add('previa-social__imagen--con-imagen');
    };
    prueba.onerror = function () {
      if (urlImagenPedida !== url) return;
      vaciar('La imagen no se pudo cargar. Comprueba la URL — el resto de etiquetas se genera igual.');
    };
    prueba.src = url;
  }

  function pintarPreviaSocial(datos) {
    var previa = SEO.vistaPreviaSocial(datos);
    var contenedor = el['previa-social'];

    contenedor.className = 'previa-social' +
      (redActiva === 'twitter' ? ' previa-social--twitter' : '') +
      (previa.tarjeta === 'summary' ? ' previa-social--compacta' : '');

    pintarImagenSocial(previa.imagen);

    el['s-dominio'].textContent = redActiva === 'twitter'
      ? previa.dominio.toLowerCase()
      : previa.dominio;
    el['s-titulo'].textContent = previa.titulo;
    el['s-descripcion'].textContent = previa.descripcion;
  }

  /* ---------------------------------------------------------------- *
   * Código generado
   * ---------------------------------------------------------------- */

  function codigoParaPestana(datos) {
    if (codigoActivo === 'meta') return SEO.generarMetaTags(datos);
    if (codigoActivo === 'jsonld') return SEO.generarJsonLdTexto(datos);
    return SEO.generarTodo(datos);
  }

  /* ---------------------------------------------------------------- *
   * Ciclo de actualización
   * ---------------------------------------------------------------- */

  function actualizar() {
    var datos = leerFormulario();
    var auditoria = SEO.auditar(datos);

    pintarContador('titulo', auditoria.titulo, SEO.LIMITES.titulo.max);
    pintarContador('descripcion', auditoria.descripcion, SEO.LIMITES.descripcion.max);
    pintarAuditoria(auditoria);
    pintarPreviaGoogle(datos);
    pintarPreviaSocial(datos);
    el['salida-codigo'].textContent = codigoParaPestana(datos);

    guardar(datos);
  }

  /* ---------------------------------------------------------------- *
   * Guardado local
   * ---------------------------------------------------------------- */

  function guardar(datos) {
    try {
      localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos));
    } catch (e) { /* modo privado o sin permisos: seguimos sin guardar */ }
  }

  function recuperar() {
    try {
      var crudo = localStorage.getItem(CLAVE_GUARDADO);
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------- *
   * Acciones
   * ---------------------------------------------------------------- */

  function mostrarAviso(texto) {
    el['aviso-copia'].textContent = texto;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () {
      el['aviso-copia'].textContent = '';
    }, 2600);
  }

  function copiarCodigo() {
    var texto = el['salida-codigo'].textContent;
    if (!texto) return;

    function respaldo() {
      var area = document.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var exito = false;
      try { exito = document.execCommand('copy'); } catch (e) { exito = false; }
      document.body.removeChild(area);
      mostrarAviso(exito ? '¡Código copiado!' : 'No se pudo copiar: selecciónalo a mano.');
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () {
        mostrarAviso('¡Código copiado!');
      })['catch'](respaldo);
    } else {
      respaldo();
    }
  }

  function descargarHtml() {
    var datos = leerFormulario();
    var contenido = '<!DOCTYPE html>\n<html lang="' + SEO.normalizarDatos(datos).idioma + '">\n<head>\n' +
      SEO.generarTodo(datos).split('\n').map(function (linea) {
        return linea ? '  ' + linea : '';
      }).join('\n') +
      '\n</head>\n<body>\n\n</body>\n</html>\n';

    var blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
    var enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'metadatos-seo.html';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(function () { URL.revokeObjectURL(enlace.href); }, 1000);
    mostrarAviso('Archivo descargado.');
  }

  function activarPestana(botones, boton) {
    botones.forEach(function (otro) {
      var activo = otro === boton;
      otro.classList.toggle('activa', activo);
      otro.setAttribute('aria-selected', activo ? 'true' : 'false');
    });
  }

  /* ---------------------------------------------------------------- *
   * Arranque
   * ---------------------------------------------------------------- */

  function iniciar() {
    var ids = CAMPOS.concat([
      'indexar', 'medidor', 'puntuacion-numero', 'puntuacion-etiqueta', 'puntuacion-detalle',
      'lista-problemas', 'g-sitio', 'g-migas', 'g-titulo', 'g-descripcion', 'aviso-noindex',
      'previa-social', 's-imagen', 's-dominio', 's-titulo', 's-descripcion',
      'salida-codigo', 'aviso-copia', 'btn-copiar', 'btn-descargar', 'btn-ejemplo', 'btn-limpiar',
      'contador-titulo', 'contador-descripcion', 'barra-titulo', 'barra-descripcion',
      'ayuda-titulo', 'ayuda-descripcion'
    ]);
    ids.forEach(function (id) { el[id] = porId(id); });

    CAMPOS.forEach(function (campo) {
      el[campo].addEventListener('input', actualizar);
      el[campo].addEventListener('change', actualizar);
    });
    el.indexar.addEventListener('change', actualizar);

    el['btn-copiar'].addEventListener('click', copiarCodigo);
    el['btn-descargar'].addEventListener('click', descargarHtml);

    el['btn-ejemplo'].addEventListener('click', function () {
      escribirFormulario(EJEMPLO);
      actualizar();
      mostrarAviso('Ejemplo cargado.');
    });

    el['btn-limpiar'].addEventListener('click', function () {
      escribirFormulario({ tipo: 'website', idioma: 'es-ES', tarjeta: 'summary_large_image', indexar: true });
      actualizar();
      mostrarAviso('Formulario vacío.');
    });

    var pestanasRed = Array.prototype.slice.call(document.querySelectorAll('[data-red]'));
    pestanasRed.forEach(function (boton) {
      boton.addEventListener('click', function () {
        redActiva = boton.getAttribute('data-red');
        activarPestana(pestanasRed, boton);
        pintarPreviaSocial(leerFormulario());
      });
    });

    var pestanasCodigo = Array.prototype.slice.call(document.querySelectorAll('[data-codigo]'));
    pestanasCodigo.forEach(function (boton) {
      boton.addEventListener('click', function () {
        codigoActivo = boton.getAttribute('data-codigo');
        activarPestana(pestanasCodigo, boton);
        el['salida-codigo'].textContent = codigoParaPestana(leerFormulario());
      });
    });

    // Primera carga: lo guardado, o el ejemplo si es la primera visita.
    var guardado = recuperar();
    escribirFormulario(guardado || EJEMPLO);
    actualizar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
