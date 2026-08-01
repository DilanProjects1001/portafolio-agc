/*
 * diff.js — Motor de comparación de textos (algoritmo de Myers).
 *
 * Módulo puro: sin DOM, sin dependencias. Se usa igual en el navegador
 * (window.Diff) que en Node.js (require) para los tests de check.js.
 */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.Diff = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* Si un texto es enorme y muy distinto, el algoritmo exacto se vuelve caro.
     Por encima de este número de pasos se cae a un modo simple (todo
     eliminado + todo agregado) para no colgar la pestaña del navegador. */
  var MAX_PASOS = 2000;

  var OPCIONES_POR_DEFECTO = {
    ignorarMayusculas: false,
    ignorarEspacios: false,
    ignorarLineasVacias: false
  };

  function combinarOpciones(opciones) {
    var o = {}, k;
    for (k in OPCIONES_POR_DEFECTO) {
      if (Object.prototype.hasOwnProperty.call(OPCIONES_POR_DEFECTO, k)) o[k] = OPCIONES_POR_DEFECTO[k];
    }
    if (opciones) {
      for (k in opciones) {
        if (Object.prototype.hasOwnProperty.call(opciones, k)) o[k] = !!opciones[k];
      }
    }
    return o;
  }

  /* ------------------------------------------------------------------ *
   * Preparación del texto
   * ------------------------------------------------------------------ */

  /** Divide en líneas aceptando saltos de Windows (CRLF), Mac clásico (CR) y Unix (LF). */
  function dividirLineas(texto) {
    if (texto === null || texto === undefined) return [];
    var s = String(texto).replace(/\r\n?/g, '\n');
    if (s === '') return [];
    return s.split('\n');
  }

  /** Devuelve la versión de la línea que se usa para decidir si dos líneas son iguales. */
  function clave(linea, opciones) {
    var s = linea;
    if (opciones.ignorarEspacios) s = s.replace(/\s+/g, ' ').replace(/^ | $/g, '');
    if (opciones.ignorarMayusculas) s = s.toLowerCase();
    return s;
  }

  /**
   * Convierte un texto en la lista de líneas a comparar.
   * Devuelve { lineas, numeros, claves }: `numeros` guarda el número de línea
   * real del texto original (importante si se ignoran las líneas vacías).
   */
  function preparar(texto, opciones) {
    var todas = dividirLineas(texto);
    var lineas = [], numeros = [], claves = [];
    for (var i = 0; i < todas.length; i++) {
      if (opciones.ignorarLineasVacias && todas[i].replace(/\s+/g, '') === '') continue;
      lineas.push(todas[i]);
      numeros.push(i + 1);
      claves.push(clave(todas[i], opciones));
    }
    return { lineas: lineas, numeros: numeros, claves: claves, totalOriginal: todas.length };
  }

  /* ------------------------------------------------------------------ *
   * Algoritmo de Myers (O(ND)): la secuencia mínima de ediciones
   * ------------------------------------------------------------------ */

  /**
   * Compara dos listas de cadenas y devuelve las operaciones mínimas.
   * Cada operación es { t: '=' | '-' | '+', ia, ib } con los índices de origen.
   */
  function operaciones(a, b) {
    var n = a.length, m = b.length;
    var ops = [], i;

    if (n === 0 && m === 0) return ops;
    if (n === 0) {
      for (i = 0; i < m; i++) ops.push({ t: '+', ia: -1, ib: i });
      return ops;
    }
    if (m === 0) {
      for (i = 0; i < n; i++) ops.push({ t: '-', ia: i, ib: -1 });
      return ops;
    }

    /* Recorte de prefijo y sufijo comunes: acelera muchísimo el caso normal
       (dos versiones parecidas de un mismo documento). */
    var pre = 0;
    while (pre < n && pre < m && a[pre] === b[pre]) pre++;
    var suf = 0;
    while (suf < n - pre && suf < m - pre && a[n - 1 - suf] === b[m - 1 - suf]) suf++;

    var cenA = a.slice(pre, n - suf);
    var cenB = b.slice(pre, m - suf);

    for (i = 0; i < pre; i++) ops.push({ t: '=', ia: i, ib: i });
    var centro = nucleoMyers(cenA, cenB);
    for (i = 0; i < centro.length; i++) {
      var op = centro[i];
      ops.push({
        t: op.t,
        ia: op.ia < 0 ? -1 : op.ia + pre,
        ib: op.ib < 0 ? -1 : op.ib + pre
      });
    }
    for (i = 0; i < suf; i++) ops.push({ t: '=', ia: n - suf + i, ib: m - suf + i });
    return ops;
  }

  function nucleoMyers(a, b) {
    var n = a.length, m = b.length, i;
    var ops = [];
    if (n === 0 && m === 0) return ops;
    if (n === 0) {
      for (i = 0; i < m; i++) ops.push({ t: '+', ia: -1, ib: i });
      return ops;
    }
    if (m === 0) {
      for (i = 0; i < n; i++) ops.push({ t: '-', ia: i, ib: -1 });
      return ops;
    }

    var max = n + m;
    var tope = Math.min(max, MAX_PASOS);
    var v = new Int32Array(2 * max + 2);
    var traza = [];
    v[max + 1] = 0;

    for (var d = 0; d <= tope; d++) {
      traza.push(v.slice(0));
      for (var k = -d; k <= d; k += 2) {
        var x;
        if (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) {
          x = v[max + k + 1];          // bajar = insertar de B
        } else {
          x = v[max + k - 1] + 1;      // avanzar = eliminar de A
        }
        var y = x - k;
        while (x < n && y < m && a[x] === b[y]) { x++; y++; }
        v[max + k] = x;
        if (x >= n && y >= m) return reconstruir(traza, n, m, max);
      }
    }

    /* Demasiado distintos: modo simple, sin bloquear la interfaz. */
    for (i = 0; i < n; i++) ops.push({ t: '-', ia: i, ib: -1 });
    for (i = 0; i < m; i++) ops.push({ t: '+', ia: -1, ib: i });
    return ops;
  }

  function reconstruir(traza, n, m, max) {
    var ops = [];
    var x = n, y = m;
    for (var d = traza.length - 1; d >= 0; d--) {
      var v = traza[d];
      var k = x - y;
      var kPrev;
      if (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) kPrev = k + 1;
      else kPrev = k - 1;
      var xPrev = v[max + kPrev];
      var yPrev = xPrev - kPrev;
      while (x > xPrev && y > yPrev) { x--; y--; ops.push({ t: '=', ia: x, ib: y }); }
      if (d > 0) {
        if (x > xPrev) { x--; ops.push({ t: '-', ia: x, ib: -1 }); }
        else if (y > yPrev) { y--; ops.push({ t: '+', ia: -1, ib: y }); }
      }
    }
    ops.reverse();
    return ops;
  }

  /* ------------------------------------------------------------------ *
   * Diferencias dentro de una línea (palabra por palabra)
   * ------------------------------------------------------------------ */

  /** Parte una línea en palabras, espacios y signos, para resaltar solo lo que cambió. */
  function separarPalabras(linea) {
    if (!linea) return [];
    var partes = String(linea).match(/[0-9A-Za-zÀ-ÿ_]+|\s+|[^\s0-9A-Za-zÀ-ÿ_]/g);
    return partes || [];
  }

  /**
   * Compara dos líneas y devuelve dos listas de segmentos:
   * { a: [{texto, cambiado}], b: [{texto, cambiado}] }
   */
  function compararEnLinea(lineaA, lineaB, opciones) {
    var o = combinarOpciones(opciones);
    var pa = separarPalabras(lineaA);
    var pb = separarPalabras(lineaB);
    var ka = pa.map(function (t) { return clave(t, o); });
    var kb = pb.map(function (t) { return clave(t, o); });
    var ops = operaciones(ka, kb);

    var segA = [], segB = [];
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      if (op.t === '=') {
        empujar(segA, pa[op.ia], false);
        empujar(segB, pb[op.ib], false);
      } else if (op.t === '-') {
        empujar(segA, pa[op.ia], true);
      } else {
        empujar(segB, pb[op.ib], true);
      }
    }
    return { a: segA, b: segB };
  }

  function empujar(lista, texto, cambiado) {
    if (texto === undefined) return;
    var ultimo = lista[lista.length - 1];
    if (ultimo && ultimo.cambiado === cambiado) ultimo.texto += texto;
    else lista.push({ texto: texto, cambiado: cambiado });
  }

  /**
   * Parecido entre dos líneas, de 0 a 1, contando caracteres en común.
   * Se mide por caracteres y no por palabras porque un cambio pequeño
   * ("Hola" → "hola") no comparte ninguna palabra pero sí casi toda la línea.
   */
  function parecido(lineaA, lineaB) {
    var a = String(lineaA === null || lineaA === undefined ? '' : lineaA).slice(0, 400);
    var b = String(lineaB === null || lineaB === undefined ? '' : lineaB).slice(0, 400);
    if (a.length === 0 && b.length === 0) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    var ops = operaciones(a.split(''), b.split(''));
    var comunes = 0;
    for (var i = 0; i < ops.length; i++) if (ops[i].t === '=') comunes++;
    return (2 * comunes) / (a.length + b.length);
  }

  /* Por debajo de este parecido, dos líneas se consideran cosas distintas
     (una eliminación y una adición) en vez de una misma línea editada. */
  var UMBRAL_EDICION = 0.35;

  /* ------------------------------------------------------------------ *
   * Comparación completa, lista para pintar en pantalla
   * ------------------------------------------------------------------ */

  /**
   * Compara dos textos completos.
   * Devuelve { filas, resumen } donde cada fila es:
   *   { tipo: 'igual'|'agregada'|'eliminada'|'modificada',
   *     numA, numB, textoA, textoB, segmentosA, segmentosB }
   */
  function comparar(textoA, textoB, opciones) {
    var o = combinarOpciones(opciones);
    var A = preparar(textoA, o);
    var B = preparar(textoB, o);
    var ops = operaciones(A.claves, B.claves);

    /* Agrupa los bloques de eliminadas + agregadas seguidos para emparejarlos
       como "líneas modificadas" (así se puede resaltar palabra por palabra). */
    var filas = [];
    var i = 0;
    while (i < ops.length) {
      if (ops[i].t === '=') {
        filas.push({
          tipo: 'igual',
          numA: A.numeros[ops[i].ia], numB: B.numeros[ops[i].ib],
          textoA: A.lineas[ops[i].ia], textoB: B.lineas[ops[i].ib],
          segmentosA: null, segmentosB: null
        });
        i++;
        continue;
      }
      var quitadas = [], puestas = [];
      while (i < ops.length && ops[i].t === '-') { quitadas.push(ops[i].ia); i++; }
      while (i < ops.length && ops[i].t === '+') { puestas.push(ops[i].ib); i++; }
      volcarBloque(filas, quitadas, puestas, A, B, o);
    }

    return { filas: filas, resumen: resumir(filas, A, B) };
  }

  function volcarBloque(filas, quitadas, puestas, A, B, o) {
    var pares = Math.min(quitadas.length, puestas.length);
    var j;
    for (j = 0; j < pares; j++) {
      var la = A.lineas[quitadas[j]], lb = B.lineas[puestas[j]];
      /* Solo se consideran "la misma línea editada" si se parecen lo bastante;
         si no, se muestran como una eliminación y una adición separadas. */
      if (parecido(la, lb) >= UMBRAL_EDICION) {
        var seg = compararEnLinea(la, lb, o);
        filas.push({
          tipo: 'modificada',
          numA: A.numeros[quitadas[j]], numB: B.numeros[puestas[j]],
          textoA: la, textoB: lb,
          segmentosA: seg.a, segmentosB: seg.b
        });
      } else {
        filas.push(filaSimple('eliminada', A, quitadas[j]));
        filas.push(filaSimple('agregada', B, puestas[j]));
      }
    }
    for (j = pares; j < quitadas.length; j++) filas.push(filaSimple('eliminada', A, quitadas[j]));
    for (j = pares; j < puestas.length; j++) filas.push(filaSimple('agregada', B, puestas[j]));
  }

  function filaSimple(tipo, fuente, idx) {
    if (tipo === 'eliminada') {
      return {
        tipo: 'eliminada', numA: fuente.numeros[idx], numB: null,
        textoA: fuente.lineas[idx], textoB: null, segmentosA: null, segmentosB: null
      };
    }
    return {
      tipo: 'agregada', numA: null, numB: fuente.numeros[idx],
      textoA: null, textoB: fuente.lineas[idx], segmentosA: null, segmentosB: null
    };
  }

  function resumir(filas, A, B) {
    var iguales = 0, agregadas = 0, eliminadas = 0, modificadas = 0;
    for (var i = 0; i < filas.length; i++) {
      var t = filas[i].tipo;
      if (t === 'igual') iguales++;
      else if (t === 'agregada') agregadas++;
      else if (t === 'eliminada') eliminadas++;
      else modificadas++;
    }
    var total = A.lineas.length + B.lineas.length;
    var comunes = iguales * 2;
    var similitud = total === 0 ? 100 : Math.round((comunes / total) * 100);
    return {
      lineasA: A.lineas.length,
      lineasB: B.lineas.length,
      iguales: iguales,
      agregadas: agregadas,
      eliminadas: eliminadas,
      modificadas: modificadas,
      cambios: agregadas + eliminadas + modificadas,
      similitud: similitud,
      identicos: agregadas === 0 && eliminadas === 0 && modificadas === 0
    };
  }

  /* ------------------------------------------------------------------ *
   * Parche en formato unificado (compatible con `git apply` / `patch`)
   * ------------------------------------------------------------------ */

  /**
   * Genera un diff unificado a partir de dos textos.
   * ajustes: { nombreA, nombreB, contexto }
   */
  function diffUnificado(textoA, textoB, opciones, ajustes) {
    var o = combinarOpciones(opciones);
    var cfg = ajustes || {};
    var nombreA = cfg.nombreA || 'texto-a.txt';
    var nombreB = cfg.nombreB || 'texto-b.txt';
    var contexto = cfg.contexto === undefined ? 3 : Math.max(0, cfg.contexto | 0);

    var A = preparar(textoA, o);
    var B = preparar(textoB, o);
    var ops = operaciones(A.claves, B.claves);

    /* Marca qué operaciones entran en un bloque (los cambios y su contexto). */
    var dentro = new Array(ops.length);
    var i;
    for (i = 0; i < ops.length; i++) dentro[i] = false;
    for (i = 0; i < ops.length; i++) {
      if (ops[i].t === '=') continue;
      for (var j = Math.max(0, i - contexto); j <= Math.min(ops.length - 1, i + contexto); j++) dentro[j] = true;
    }

    var lineas = [];
    i = 0;
    while (i < ops.length) {
      if (!dentro[i]) { i++; continue; }
      var ini = i;
      while (i < ops.length && dentro[i]) i++;
      lineas.push(bloque(ops, ini, i, A, B));
    }
    if (lineas.length === 0) return '';

    var cabecera = '--- ' + nombreA + '\n+++ ' + nombreB + '\n';
    return cabecera + lineas.join('');
  }

  function bloque(ops, ini, fin, A, B) {
    var iniA = 0, iniB = 0, cuentaA = 0, cuentaB = 0, cuerpo = '', i;
    for (i = ini; i < fin; i++) {
      var op = ops[i];
      if (op.t === '=') {
        if (!cuentaA) iniA = A.numeros[op.ia];
        if (!cuentaB) iniB = B.numeros[op.ib];
        cuentaA++; cuentaB++;
        cuerpo += ' ' + A.lineas[op.ia] + '\n';
      } else if (op.t === '-') {
        if (!cuentaA) iniA = A.numeros[op.ia];
        cuentaA++;
        cuerpo += '-' + A.lineas[op.ia] + '\n';
      } else {
        if (!cuentaB) iniB = B.numeros[op.ib];
        cuentaB++;
        cuerpo += '+' + B.lineas[op.ib] + '\n';
      }
    }
    if (!cuentaA) iniA = 0;
    if (!cuentaB) iniB = 0;
    return '@@ -' + iniA + ',' + cuentaA + ' +' + iniB + ',' + cuentaB + ' @@\n' + cuerpo;
  }

  return {
    dividirLineas: dividirLineas,
    clave: clave,
    preparar: preparar,
    operaciones: operaciones,
    separarPalabras: separarPalabras,
    compararEnLinea: compararEnLinea,
    parecido: parecido,
    comparar: comparar,
    diffUnificado: diffUnificado
  };
});
