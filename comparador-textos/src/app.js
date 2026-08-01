/*
 * app.js — Interfaz del Comparador de Textos.
 *
 * Toda la lógica de comparación vive en src/diff.js; aquí solo se recogen los
 * datos del formulario y se pinta el resultado en el DOM.
 */
(function () {
  'use strict';

  var LIMITE_FILAS = 4000;   // tope de filas pintadas, para no congelar el navegador
  var CONTEXTO = 2;          // líneas iguales que se dejan alrededor de cada cambio

  var $ = function (id) { return document.getElementById(id); };

  var textoA = $('texto-a');
  var textoB = $('texto-b');
  var salida = $('salida');
  var resumen = $('resumen');

  var opciones = {
    ignorarMayusculas: $('op-mayusculas'),
    ignorarEspacios: $('op-espacios'),
    ignorarLineasVacias: $('op-vacias')
  };
  var soloCambios = $('op-solo-cambios');

  var vista = 'lado';
  var ultimoResultado = null;
  var temporizador = null;

  /* ------------------------------------------------------------------ *
   * Utilidades de DOM
   * ------------------------------------------------------------------ */

  function elemento(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined && texto !== null) el.appendChild(document.createTextNode(texto));
    return el;
  }

  function vaciar(nodo) {
    while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
  }

  /* ------------------------------------------------------------------ *
   * Comparación
   * ------------------------------------------------------------------ */

  function leerOpciones() {
    return {
      ignorarMayusculas: opciones.ignorarMayusculas.checked,
      ignorarEspacios: opciones.ignorarEspacios.checked,
      ignorarLineasVacias: opciones.ignorarLineasVacias.checked
    };
  }

  function comparar() {
    var a = textoA.value, b = textoB.value;
    actualizarContadores();

    if (a === '' && b === '') {
      ultimoResultado = null;
      mostrarVacio();
      return;
    }

    var opts = leerOpciones();
    ultimoResultado = Diff.comparar(a, b, opts);
    pintarResumen(ultimoResultado.resumen);
    pintarDiferencias(ultimoResultado.filas);
  }

  function comparaConRetraso() {
    if (temporizador) clearTimeout(temporizador);
    temporizador = setTimeout(comparar, 180);
  }

  function actualizarContadores() {
    $('info-a').textContent = describir(textoA.value);
    $('info-b').textContent = describir(textoB.value);
  }

  function describir(texto) {
    var lineas = texto === '' ? 0 : Diff.dividirLineas(texto).length;
    return lineas + (lineas === 1 ? ' línea · ' : ' líneas · ') +
      texto.length + (texto.length === 1 ? ' caracter' : ' caracteres');
  }

  /* ------------------------------------------------------------------ *
   * Resumen
   * ------------------------------------------------------------------ */

  function mostrarVacio() {
    vaciar(resumen);
    resumen.appendChild(elemento('p', 'resumen__vacio',
      'Escribe o pega texto en los dos lados para ver las diferencias.'));
    vaciar(salida);
    salida.appendChild(elemento('p', 'salida__mensaje', 'Aquí aparecerán las diferencias.'));
  }

  function pintarResumen(r) {
    vaciar(resumen);

    if (r.identicos) {
      resumen.appendChild(elemento('p', 'aviso',
        '✔ Los dos textos son idénticos' + (algunaOpcionActiva() ? ' con las opciones activas.' : '.')));
    }

    ficha('similitud', r.similitud + '%', 'de parecido');
    ficha('eliminadas', r.eliminadas, r.eliminadas === 1 ? 'línea quitada' : 'líneas quitadas');
    ficha('agregadas', r.agregadas, r.agregadas === 1 ? 'línea añadida' : 'líneas añadidas');
    ficha('modificadas', r.modificadas, r.modificadas === 1 ? 'línea editada' : 'líneas editadas');
    ficha('iguales', r.iguales, r.iguales === 1 ? 'línea sin cambios' : 'líneas sin cambios');
  }

  function ficha(tipo, valor, nombre) {
    var caja = elemento('div', 'ficha ficha--' + tipo);
    caja.appendChild(elemento('span', 'ficha__valor', String(valor)));
    caja.appendChild(elemento('span', 'ficha__nombre', nombre));
    resumen.appendChild(caja);
  }

  function algunaOpcionActiva() {
    var o = leerOpciones();
    return o.ignorarMayusculas || o.ignorarEspacios || o.ignorarLineasVacias;
  }

  /* ------------------------------------------------------------------ *
   * Pintado de las diferencias
   * ------------------------------------------------------------------ */

  /** Si está activo "ver solo lo que cambió", recorta los tramos largos sin cambios. */
  function filtrarFilas(filas) {
    if (!soloCambios.checked) return filas.map(function (f) { return { fila: f }; });

    var mantener = new Array(filas.length);
    var i, j;
    for (i = 0; i < filas.length; i++) mantener[i] = false;
    for (i = 0; i < filas.length; i++) {
      if (filas[i].tipo === 'igual') continue;
      for (j = Math.max(0, i - CONTEXTO); j <= Math.min(filas.length - 1, i + CONTEXTO); j++) mantener[j] = true;
    }

    var salidaFilas = [];
    i = 0;
    while (i < filas.length) {
      if (mantener[i]) { salidaFilas.push({ fila: filas[i] }); i++; continue; }
      var ini = i;
      while (i < filas.length && !mantener[i]) i++;
      salidaFilas.push({ salto: i - ini });
    }
    return salidaFilas;
  }

  function pintarDiferencias(filas) {
    vaciar(salida);

    var lista = filtrarFilas(filas);
    if (lista.length === 0) {
      salida.appendChild(elemento('p', 'salida__mensaje', 'No hay nada que mostrar.'));
      return;
    }

    var recortado = false;
    if (lista.length > LIMITE_FILAS) {
      lista = lista.slice(0, LIMITE_FILAS);
      recortado = true;
    }

    var tabla = elemento('table', 'diff diff--' + (vista === 'lado' ? 'lado' : 'unificada'));
    var cuerpo = document.createElement('tbody');

    for (var i = 0; i < lista.length; i++) {
      if (lista[i].salto) cuerpo.appendChild(filaSalto(lista[i].salto));
      else if (vista === 'lado') cuerpo.appendChild(filaLadoALado(lista[i].fila));
      else cuerpo.appendChild(filaUnificada(lista[i].fila));
    }

    tabla.appendChild(cuerpo);
    salida.appendChild(tabla);

    if (recortado) {
      salida.appendChild(elemento('p', 'salida__mensaje',
        'Se muestran las primeras ' + LIMITE_FILAS + ' filas. Descarga el parche para verlo completo.'));
    }
  }

  function filaSalto(cuantas) {
    var tr = elemento('tr', 'diff__salto');
    var td = elemento('td', null, '⋯ ' + cuantas + (cuantas === 1 ? ' línea igual oculta' : ' líneas iguales ocultas'));
    td.colSpan = 4;
    tr.appendChild(td);
    return tr;
  }

  /** Celda de texto con los trozos cambiados resaltados (sin usar innerHTML). */
  function celdaTexto(texto, segmentos, tipoMarca, clase) {
    var td = elemento('td', 'diff__texto' + (clase ? ' ' + clase : ''));
    if (texto === null || texto === undefined) return td;
    if (!segmentos) {
      td.appendChild(document.createTextNode(texto === '' ? ' ' : texto));
      return td;
    }
    for (var i = 0; i < segmentos.length; i++) {
      var s = segmentos[i];
      if (s.cambiado) td.appendChild(elemento('span', 'marca marca--' + tipoMarca, s.texto));
      else td.appendChild(document.createTextNode(s.texto));
    }
    return td;
  }

  function celdaNumero(valor) {
    return elemento('td', 'diff__num', valor === null || valor === undefined ? '' : String(valor));
  }

  function filaLadoALado(f) {
    var tr = elemento('tr', 'fila--' + f.tipo);
    var claseA = '', claseB = '';
    if (f.tipo === 'eliminada') claseA = 'lado--eliminado';
    else if (f.tipo === 'agregada') claseB = 'lado--agregado';
    else if (f.tipo === 'modificada') { claseA = 'lado--editado'; claseB = 'lado--editado'; }

    tr.appendChild(celdaNumero(f.numA));
    tr.appendChild(celdaTexto(f.textoA, f.segmentosA, 'quitada', claseA));
    tr.appendChild(celdaNumero(f.numB));
    tr.appendChild(celdaTexto(f.textoB, f.segmentosB, 'puesta', claseB));
    return tr;
  }

  /* En vista de una sola columna, una línea editada se muestra como dos filas
     (la vieja y la nueva), igual que en un diff clásico. */
  function filaUnificada(f) {
    var fragmento = document.createDocumentFragment();
    if (f.tipo === 'igual') {
      fragmento.appendChild(lineaUnica('igual', ' ', f.numA, f.numB, f.textoA, null, null));
    } else if (f.tipo === 'eliminada') {
      fragmento.appendChild(lineaUnica('eliminada', '−', f.numA, null, f.textoA, null, 'quitada'));
    } else if (f.tipo === 'agregada') {
      fragmento.appendChild(lineaUnica('agregada', '+', null, f.numB, f.textoB, null, 'puesta'));
    } else {
      fragmento.appendChild(lineaUnica('eliminada', '−', f.numA, null, f.textoA, f.segmentosA, 'quitada'));
      fragmento.appendChild(lineaUnica('agregada', '+', null, f.numB, f.textoB, f.segmentosB, 'puesta'));
    }
    return fragmento;
  }

  function lineaUnica(tipo, signo, numA, numB, texto, segmentos, marca) {
    var tr = elemento('tr', 'fila--' + tipo);
    tr.appendChild(celdaNumero(numA));
    tr.appendChild(celdaNumero(numB));
    tr.appendChild(elemento('td', 'diff__signo', signo));
    tr.appendChild(celdaTexto(texto, segmentos, marca, ''));
    return tr;
  }

  /* ------------------------------------------------------------------ *
   * Parche unificado: copiar y descargar
   * ------------------------------------------------------------------ */

  function generarParche() {
    return Diff.diffUnificado(textoA.value, textoB.value, leerOpciones(), {
      nombreA: 'texto-original.txt',
      nombreB: 'texto-nuevo.txt',
      contexto: 3
    });
  }

  function avisar(boton, mensaje) {
    var original = boton.getAttribute('data-original') || boton.textContent;
    boton.setAttribute('data-original', original);
    boton.textContent = mensaje;
    setTimeout(function () { boton.textContent = original; }, 1600);
  }

  function copiarParche() {
    var boton = $('btn-copiar');
    var parche = generarParche();
    if (!parche) { avisar(boton, 'No hay diferencias'); return; }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(parche).then(
        function () { avisar(boton, '¡Copiado!'); },
        function () { copiaDeRespaldo(parche, boton); }
      );
    } else {
      copiaDeRespaldo(parche, boton);
    }
  }

  /* Si el navegador bloquea el portapapeles (pasa al abrir el HTML como archivo
     local), se copia con el método antiguo de selección. */
  function copiaDeRespaldo(texto, boton) {
    var area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    avisar(boton, ok ? '¡Copiado!' : 'No se pudo copiar');
  }

  function descargarParche() {
    var boton = $('btn-descargar');
    var parche = generarParche();
    if (!parche) { avisar(boton, 'No hay diferencias'); return; }

    var blob = new Blob([parche], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'cambios.diff';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ------------------------------------------------------------------ *
   * Archivos: botón y arrastrar-soltar
   * ------------------------------------------------------------------ */

  function conectarArchivo(idEntrada, destino) {
    $(idEntrada).addEventListener('change', function (ev) {
      var archivo = ev.target.files && ev.target.files[0];
      if (archivo) leerArchivo(archivo, destino);
      ev.target.value = '';
    });
  }

  function leerArchivo(archivo, destino) {
    var lector = new FileReader();
    lector.onload = function () {
      destino.value = String(lector.result);
      comparar();
    };
    lector.readAsText(archivo);
  }

  function conectarArrastre(area, destino) {
    ['dragenter', 'dragover'].forEach(function (evt) {
      area.addEventListener(evt, function (e) { e.preventDefault(); area.classList.add('is-arrastrando'); });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      area.addEventListener(evt, function () { area.classList.remove('is-arrastrando'); });
    });
    area.addEventListener('drop', function (e) {
      var archivo = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (archivo) { e.preventDefault(); leerArchivo(archivo, destino); }
    });
  }

  /* ------------------------------------------------------------------ *
   * Ejemplo de demostración
   * ------------------------------------------------------------------ */

  var EJEMPLO_A = [
    'CONTRATO DE SERVICIOS',
    '',
    'Cláusula 1. El proveedor entregará el sitio web en un plazo de 30 días.',
    'Cláusula 2. El precio total es de 1.200 EUR más impuestos.',
    'Cláusula 3. El pago se hará en dos partes: 50% al inicio y 50% al entregar.',
    'Cláusula 4. Se incluyen dos rondas de correcciones.',
    'Cláusula 5. El proveedor conserva los derechos hasta el pago completo.',
    '',
    'Firmado en Madrid.'
  ].join('\n');

  var EJEMPLO_B = [
    'CONTRATO DE SERVICIOS',
    '',
    'Cláusula 1. El proveedor entregará el sitio web en un plazo de 45 días.',
    'Cláusula 2. El precio total es de 1.500 EUR más impuestos.',
    'Cláusula 3. El pago se hará en dos partes: 30% al inicio y 70% al entregar.',
    'Cláusula 4. Se incluye una sola ronda de correcciones.',
    'Cláusula 5. El proveedor conserva los derechos hasta el pago completo.',
    'Cláusula 6. Cualquier retraso imputable al cliente amplía el plazo.',
    '',
    'Firmado en Madrid.'
  ].join('\n');

  /* ------------------------------------------------------------------ *
   * Arranque
   * ------------------------------------------------------------------ */

  textoA.addEventListener('input', comparaConRetraso);
  textoB.addEventListener('input', comparaConRetraso);

  Object.keys(opciones).forEach(function (k) { opciones[k].addEventListener('change', comparar); });
  soloCambios.addEventListener('change', function () {
    if (ultimoResultado) pintarDiferencias(ultimoResultado.filas);
  });

  Array.prototype.forEach.call(document.querySelectorAll('.segmentado__opcion'), function (boton) {
    boton.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.segmentado__opcion'), function (b) {
        b.classList.remove('is-activa');
      });
      boton.classList.add('is-activa');
      vista = boton.getAttribute('data-vista');
      if (ultimoResultado) pintarDiferencias(ultimoResultado.filas);
    });
  });

  $('btn-ejemplo').addEventListener('click', function () {
    textoA.value = EJEMPLO_A;
    textoB.value = EJEMPLO_B;
    comparar();
  });

  $('btn-intercambiar').addEventListener('click', function () {
    var tmp = textoA.value;
    textoA.value = textoB.value;
    textoB.value = tmp;
    comparar();
  });

  $('btn-limpiar').addEventListener('click', function () {
    textoA.value = '';
    textoB.value = '';
    comparar();
    textoA.focus();
  });

  $('btn-copiar').addEventListener('click', copiarParche);
  $('btn-descargar').addEventListener('click', descargarParche);

  conectarArchivo('archivo-a', textoA);
  conectarArchivo('archivo-b', textoB);
  Array.prototype.forEach.call(document.querySelectorAll('.entrada'), function (area, i) {
    conectarArrastre(area, i === 0 ? textoA : textoB);
  });

  /* Se arranca con el ejemplo cargado para que la herramienta se entienda de un vistazo. */
  textoA.value = EJEMPLO_A;
  textoB.value = EJEMPLO_B;
  comparar();
})();
