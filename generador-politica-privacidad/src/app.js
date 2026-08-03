/*
 * app.js — Capa de interfaz.
 * Toda la lógica legal vive en generator.js; aquí solo leemos el formulario,
 * pintamos el resultado y gestionamos copiar/descargar/guardar.
 */
(function () {
  'use strict';

  var G = window.LegalGen;
  var CLAVE_GUARDADO = 'generador-politica-privacidad:v1';

  var estado = { docs: null, docActivo: 'privacidad', vista: 'formato' };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------------- Construcción dinámica del formulario ---------------- */

  function pintarSelectJurisdicciones() {
    var sel = $('jurisdiccion');
    Object.keys(G.JURISDICCIONES).forEach(function (clave) {
      var op = document.createElement('option');
      op.value = clave;
      op.textContent = G.JURISDICCIONES[clave].nombre + ' — ' + G.JURISDICCIONES[clave].leyCorta;
      sel.appendChild(op);
    });
    sel.value = 'es';
  }

  function pintarCasillas(contenedorId, catalogo, prefijo) {
    var cont = $(contenedorId);
    Object.keys(catalogo).forEach(function (clave) {
      var lab = document.createElement('label');
      lab.className = 'casilla';
      var inp = document.createElement('input');
      inp.type = 'checkbox';
      inp.value = clave;
      inp.dataset.grupo = prefijo;
      var span = document.createElement('span');
      span.textContent = catalogo[clave].etiqueta;
      lab.appendChild(inp);
      lab.appendChild(span);
      cont.appendChild(lab);
    });
  }

  function seleccionados(prefijo) {
    return Array.prototype.slice
      .call(document.querySelectorAll('input[data-grupo="' + prefijo + '"]:checked'))
      .map(function (i) { return i.value; });
  }

  /* ---------------- Lectura / escritura del formulario ---------------- */

  function leerFormulario() {
    return {
      empresa: $('empresa').value,
      titular: $('empresa').value,
      identificacion: $('identificacion').value,
      sitio: $('sitio').value,
      email: $('email').value,
      direccion: $('direccion').value,
      jurisdiccion: $('jurisdiccion').value,
      datos: seleccionados('datos'),
      terceros: seleccionados('terceros'),
      cookiesAnaliticas: $('cookiesAnaliticas').checked,
      cookiesMarketing: $('cookiesMarketing').checked,
      transferencias: $('transferencias').checked,
      newsletter: $('newsletter').checked,
      retencion: $('retencion').value,
      edadMinima: $('edadMinima').value,
      fecha: $('fecha').value || hoyISO()
    };
  }

  function escribirFormulario(d) {
    $('empresa').value = d.empresa || '';
    $('identificacion').value = d.identificacion || '';
    $('sitio').value = d.sitio || '';
    $('email').value = d.email || '';
    $('direccion').value = d.direccion || '';
    $('jurisdiccion').value = G.JURISDICCIONES[d.jurisdiccion] ? d.jurisdiccion : 'es';
    $('cookiesAnaliticas').checked = !!d.cookiesAnaliticas;
    $('cookiesMarketing').checked = !!d.cookiesMarketing;
    $('transferencias').checked = !!d.transferencias;
    $('newsletter').checked = !!d.newsletter;
    $('retencion').value = d.retencion || 24;
    $('edadMinima').value = d.edadMinima || 14;
    $('fecha').value = d.fecha || hoyISO();

    ['datos', 'terceros'].forEach(function (grupo) {
      var elegidos = d[grupo] || [];
      Array.prototype.forEach.call(
        document.querySelectorAll('input[data-grupo="' + grupo + '"]'),
        function (inp) { inp.checked = elegidos.indexOf(inp.value) !== -1; }
      );
    });
  }

  function hoyISO() {
    var f = new Date();
    var mm = String(f.getMonth() + 1).padStart(2, '0');
    var dd = String(f.getDate()).padStart(2, '0');
    return f.getFullYear() + '-' + mm + '-' + dd;
  }

  /* ---------------- Errores de validación ---------------- */

  function limpiarErrores() {
    ['empresa', 'sitio', 'email', 'datos', 'retencion', 'edadMinima'].forEach(function (campo) {
      var p = $('err-' + campo);
      if (p) p.textContent = '';
      var inp = $(campo);
      if (inp) inp.classList.remove('invalido');
    });
  }

  function mostrarErrores(errores) {
    limpiarErrores();
    errores.forEach(function (e) {
      var p = $('err-' + e.campo);
      if (p) p.textContent = e.mensaje;
      var inp = $(e.campo);
      if (inp && inp.tagName === 'INPUT') inp.classList.add('invalido');
    });
    var primero = $('err-' + errores[0].campo);
    if (primero) primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------------- Generación y pintado ---------------- */

  function generar() {
    var datos = leerFormulario();
    var v = G.validar(datos);
    if (!v.ok) {
      mostrarErrores(v.errores);
      return false;
    }
    limpiarErrores();
    estado.docs = G.generarTodo(datos);
    guardar(datos);
    pintar();
    return true;
  }

  function pintar() {
    if (!estado.docs) return;
    var md = estado.docs[estado.docActivo];
    $('salida').innerHTML = G.markdownAHtml(md);
    $('salida-md').textContent = md;
    $('salida').hidden = estado.vista !== 'formato';
    $('salida-md').hidden = estado.vista !== 'markdown';
    $('vista-formato').classList.toggle('activa', estado.vista === 'formato');
    $('vista-markdown').classList.toggle('activa', estado.vista === 'markdown');
  }

  function tituloDoc() {
    return { privacidad: 'Política de Privacidad', cookies: 'Política de Cookies', terminos: 'Aviso Legal y Términos de Uso' }[estado.docActivo];
  }

  /* ---------------- Descargas y portapapeles ---------------- */

  function descargar(nombre, contenido, tipo) {
    var blob = new Blob([contenido], { type: tipo + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function toast(mensaje) {
    var t = $('aviso-copia');
    t.textContent = mensaje;
    t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function copiar() {
    if (!estado.docs) { toast('Genera los documentos primero'); return; }
    var texto = estado.docs[estado.docActivo];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { toast('Copiado al portapapeles'); },
        function () { copiaManual(texto); });
    } else {
      copiaManual(texto);
    }
  }

  // Respaldo para navegadores sin API de portapapeles (o sin HTTPS).
  function copiaManual(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Copiado al portapapeles'); }
    catch (e) { toast('No se pudo copiar; selecciona el texto manualmente'); }
    document.body.removeChild(ta);
  }

  /* ---------------- Persistencia local ---------------- */

  function guardar(datos) {
    try { localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos)); } catch (e) { /* modo privado */ }
  }

  function cargar() {
    try {
      var crudo = localStorage.getItem(CLAVE_GUARDADO);
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) { return null; }
  }

  /* ---------------- Arranque ---------------- */

  function init() {
    pintarSelectJurisdicciones();
    pintarCasillas('grupo-datos', G.TIPOS_DATOS, 'datos');
    pintarCasillas('grupo-terceros', G.TERCEROS, 'terceros');
    $('fecha').value = hoyISO();

    // ?demo=1 rellena el formulario con el ejemplo (útil para enlazar una demo).
    var esDemo = /[?&]demo=1/.test(window.location.search);
    var guardado = esDemo ? null : cargar();

    if (esDemo) {
      var demo = G.datosEjemplo();
      demo.fecha = hoyISO();
      escribirFormulario(demo);
      generar();
    } else if (guardado) {
      escribirFormulario(guardado);
      $('nota-guardado').textContent = 'Se han recuperado los datos que guardaste en este navegador.';
      generar();
    }

    // Al cambiar de país, ajustamos la edad mínima por defecto de esa normativa.
    $('jurisdiccion').addEventListener('change', function () {
      $('edadMinima').value = G.JURISDICCIONES[this.value].edadMinima;
    });

    $('btn-generar').addEventListener('click', generar);

    $('btn-ejemplo').addEventListener('click', function () {
      var ej = G.datosEjemplo();
      ej.fecha = hoyISO();
      escribirFormulario(ej);
      limpiarErrores();
      generar();
    });

    $('btn-limpiar').addEventListener('click', function () {
      $('formulario').reset();
      Array.prototype.forEach.call(document.querySelectorAll('#formulario input[type="checkbox"]'),
        function (i) { i.checked = false; });
      $('jurisdiccion').value = 'es';
      $('retencion').value = 24;
      $('edadMinima').value = 14;
      $('fecha').value = hoyISO();
      limpiarErrores();
      estado.docs = null;
      $('salida').innerHTML = '<p class="vacio">Formulario vacío. Rellénalo y pulsa <strong>Generar documentos</strong>.</p>';
      $('salida-md').textContent = '';
      try { localStorage.removeItem(CLAVE_GUARDADO); } catch (e) { /* ignorar */ }
    });

    Array.prototype.forEach.call(document.querySelectorAll('.pestana'), function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(document.querySelectorAll('.pestana'), function (b) {
          b.classList.remove('activa');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('activa');
        btn.setAttribute('aria-selected', 'true');
        estado.docActivo = btn.dataset.doc;
        pintar();
      });
    });

    $('vista-formato').addEventListener('click', function () { estado.vista = 'formato'; pintar(); });
    $('vista-markdown').addEventListener('click', function () { estado.vista = 'markdown'; pintar(); });

    $('btn-copiar').addEventListener('click', copiar);

    $('btn-md').addEventListener('click', function () {
      if (!estado.docs) { toast('Genera los documentos primero'); return; }
      descargar(estado.docActivo + '.md', estado.docs[estado.docActivo], 'text/markdown');
    });

    $('btn-html').addEventListener('click', function () {
      if (!estado.docs) { toast('Genera los documentos primero'); return; }
      descargar(estado.docActivo + '.html',
        G.documentoHtmlCompleto(tituloDoc(), estado.docs[estado.docActivo]), 'text/html');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
