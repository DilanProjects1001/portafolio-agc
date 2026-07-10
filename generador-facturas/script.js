/**
 * script.js — Generador de Facturas y Presupuestos
 * -------------------------------------------------------------------------
 * Maneja los ítems de la factura (agregar/eliminar filas), calcula subtotal,
 * impuesto (IVA) y total, guarda todo en localStorage para que no se pierda al
 * recargar, y permite imprimir/exportar a PDF con window.print().
 *
 * Funciona en DOS entornos:
 *   1. En el navegador (interfaz de index.html).
 *   2. En Node.js (para pruebas automáticas: se exportan las funciones puras
 *      de cálculo al final del archivo).
 *
 * Sin dependencias externas ni CDNs: todo es JavaScript nativo.
 */

/* =========================================================================
   FUNCIONES PURAS DE CÁLCULO  (probables sin navegador)
   ========================================================================= */

/**
 * Convierte un texto a número de forma tolerante: acepta coma o punto como
 * separador decimal y devuelve 0 si no es un número válido.
 *
 * @param {*} valor
 * @returns {number}
 */
function parsearNumero(valor) {
  if (typeof valor === "number") {
    return isFinite(valor) ? valor : 0;
  }
  if (typeof valor !== "string") {
    return 0;
  }
  // Quitamos espacios (incluidos separadores de miles) y normalizamos la coma
  // decimal a punto.
  var limpio = valor.trim().replace(/\s/g, "").replace(",", ".");
  var n = parseFloat(limpio);
  return isFinite(n) ? n : 0;
}

/**
 * Redondea a 2 decimales evitando errores de coma flotante.
 * @param {number} valor
 * @returns {number}
 */
function redondear2(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el importe de una línea (cantidad × precio).
 * @param {number|string} cantidad
 * @param {number|string} precio
 * @returns {number}
 */
function importeLinea(cantidad, precio) {
  return redondear2(parsearNumero(cantidad) * parsearNumero(precio));
}

/**
 * Calcula subtotal, impuesto (IVA) y total a partir de una lista de ítems.
 *
 * Cada ítem aporta su `importe` (cantidad × precio, ya calculado con
 * `importeLinea`). El subtotal es la suma de esos importes; el IVA se aplica
 * sobre el subtotal según el porcentaje indicado; el total es subtotal + IVA.
 *
 * @param {Array<{importe:(number|string)}>} items
 * @param {number|string} ivaPorcentaje - Porcentaje de impuesto (ej. 21).
 * @returns {{subtotal:number, iva:number, total:number}}
 */
function calcularTotales(items, ivaPorcentaje) {
  var subtotal = 0;
  for (var i = 0; i < items.length; i++) {
    subtotal += parsearNumero(items[i].importe);
  }

  var iva = subtotal * parsearNumero(ivaPorcentaje) / 100;
  var total = subtotal + iva;

  return { subtotal: subtotal, iva: iva, total: total };
}

/**
 * Formatea un número como importe en formato español: 2 decimales con coma y
 * separador de miles con punto (1234.5 -> "1.234,50"). Implementación manual
 * para que el resultado sea idéntico en cualquier entorno (no depende de ICU).
 * @param {number|string} valor
 * @returns {string}
 */
function formatearMoneda(valor) {
  var n = Number(valor);
  if (!isFinite(n)) {
    n = 0;
  }
  var negativo = n < 0;
  n = Math.abs(n);

  var partes = n.toFixed(2).split(".");
  var entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (negativo ? "-" : "") + entero + "," + partes[1];
}

/* =========================================================================
   INTERFAZ  (solo en el navegador)
   ========================================================================= */

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    var CLAVE_STORAGE = "generador-facturas-datos";

    var cuerpoItems = document.getElementById("cuerpo-items");
    var ivaInput = document.getElementById("iva-porcentaje");
    var etiquetaIva = document.getElementById("etiqueta-iva");
    var avisoGuardado = document.getElementById("aviso-guardado");

    var btnAgregar = document.getElementById("btn-agregar");
    var btnCalcular = document.getElementById("btn-calcular");
    var btnImprimir = document.getElementById("btn-imprimir");
    var btnLimpiar = document.getElementById("btn-limpiar");

    // Todos los campos "sueltos" (no de la tabla) que queremos guardar.
    var camposMeta = Array.prototype.slice.call(
      document.querySelectorAll("[data-clave]")
    );

    /**
     * Crea una fila de ítem en la tabla.
     * @param {{descripcion?:string, cantidad?:string, precio?:string}} [datos]
     */
    function crearFila(datos) {
      datos = datos || {};
      var tr = document.createElement("tr");

      var tdDesc = document.createElement("td");
      var inDesc = document.createElement("input");
      inDesc.type = "text";
      inDesc.className = "desc";
      inDesc.placeholder = "Descripción del producto o servicio";
      inDesc.value = datos.descripcion || "";
      tdDesc.appendChild(inDesc);

      var tdCant = document.createElement("td");
      var inCant = document.createElement("input");
      inCant.type = "text";
      inCant.className = "cant";
      inCant.inputMode = "decimal";
      inCant.placeholder = "1";
      inCant.value = datos.cantidad || "";
      tdCant.appendChild(inCant);

      var tdPrecio = document.createElement("td");
      var inPrecio = document.createElement("input");
      inPrecio.type = "text";
      inPrecio.className = "precio";
      inPrecio.inputMode = "decimal";
      inPrecio.placeholder = "0,00";
      inPrecio.value = datos.precio || "";
      tdPrecio.appendChild(inPrecio);

      var tdImporte = document.createElement("td");
      tdImporte.className = "importe";
      tdImporte.textContent = "0,00";

      var tdQuitar = document.createElement("td");
      tdQuitar.className = "no-imprimir";
      var btnQuitar = document.createElement("button");
      btnQuitar.type = "button";
      btnQuitar.className = "btn-quitar";
      btnQuitar.textContent = "×";
      btnQuitar.title = "Eliminar fila";
      btnQuitar.addEventListener("click", function () {
        tr.parentNode.removeChild(tr);
        recalcular();
        guardar();
      });
      tdQuitar.appendChild(btnQuitar);

      tr.appendChild(tdDesc);
      tr.appendChild(tdCant);
      tr.appendChild(tdPrecio);
      tr.appendChild(tdImporte);
      tr.appendChild(tdQuitar);

      // Recalcular y guardar mientras el usuario escribe.
      [inDesc, inCant, inPrecio].forEach(function (input) {
        input.addEventListener("input", function () {
          recalcular();
          guardar();
        });
      });

      cuerpoItems.appendChild(tr);
      return tr;
    }

    /**
     * Lee todas las filas de la tabla como objetos.
     * @returns {Array<{descripcion:string, cantidad:string, precio:string}>}
     */
    function leerItems() {
      var filas = cuerpoItems.querySelectorAll("tr");
      var items = [];
      for (var i = 0; i < filas.length; i++) {
        items.push({
          descripcion: filas[i].querySelector(".desc").value,
          cantidad: filas[i].querySelector(".cant").value,
          precio: filas[i].querySelector(".precio").value
        });
      }
      return items;
    }

    /**
     * Recalcula importes por fila y los totales, y actualiza la interfaz.
     */
    function recalcular() {
      var filas = cuerpoItems.querySelectorAll("tr");
      var items = [];
      for (var i = 0; i < filas.length; i++) {
        var cant = filas[i].querySelector(".cant").value;
        var precio = filas[i].querySelector(".precio").value;
        var imp = importeLinea(cant, precio);
        filas[i].querySelector(".importe").textContent = formatearMoneda(imp);
        items.push({ importe: imp });
      }

      var totales = calcularTotales(items, ivaInput.value);
      document.getElementById("tot-subtotal").textContent = formatearMoneda(totales.subtotal);
      document.getElementById("tot-iva").textContent = formatearMoneda(totales.iva);
      document.getElementById("tot-total").textContent = formatearMoneda(totales.total);

      etiquetaIva.textContent = "IVA (" + parsearNumero(ivaInput.value) + "%)";
    }

    /**
     * Guarda todo el estado en localStorage.
     */
    function guardar() {
      var meta = {};
      camposMeta.forEach(function (el) {
        if (el.tagName === "SELECT" || el.tagName === "INPUT") {
          meta[el.dataset.clave] = el.value;
        } else {
          meta[el.dataset.clave] = el.textContent;
        }
      });

      var estado = { meta: meta, items: leerItems() };
      try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
        mostrarAviso("Guardado ✓");
      } catch (e) {
        mostrarAviso("No se pudo guardar");
      }
    }

    var temporizadorAviso = null;
    function mostrarAviso(texto) {
      avisoGuardado.textContent = texto;
      if (temporizadorAviso) {
        clearTimeout(temporizadorAviso);
      }
      temporizadorAviso = setTimeout(function () {
        avisoGuardado.textContent = "";
      }, 1500);
    }

    /**
     * Carga el estado guardado (si existe). Devuelve true si cargó algo.
     */
    function cargar() {
      var crudo = null;
      try {
        crudo = localStorage.getItem(CLAVE_STORAGE);
      } catch (e) {
        crudo = null;
      }
      if (!crudo) {
        return false;
      }

      var estado;
      try {
        estado = JSON.parse(crudo);
      } catch (e) {
        return false;
      }

      if (estado.meta) {
        camposMeta.forEach(function (el) {
          var clave = el.dataset.clave;
          if (estado.meta[clave] === undefined) {
            return;
          }
          if (el.tagName === "SELECT" || el.tagName === "INPUT") {
            el.value = estado.meta[clave];
          } else {
            el.textContent = estado.meta[clave];
          }
        });
      }

      cuerpoItems.innerHTML = "";
      var items = estado.items && estado.items.length ? estado.items : [{}];
      items.forEach(function (it) {
        crearFila(it);
      });
      return true;
    }

    // ---- Eventos de los botones ----
    btnAgregar.addEventListener("click", function () {
      crearFila();
      guardar();
    });

    btnCalcular.addEventListener("click", function () {
      recalcular();
      mostrarAviso("Total calculado ✓");
    });

    btnImprimir.addEventListener("click", function () {
      window.print();
    });

    btnLimpiar.addEventListener("click", function () {
      var ok = window.confirm(
        "¿Seguro que quieres limpiar todo? Se borrarán los datos guardados."
      );
      if (!ok) {
        return;
      }
      try {
        localStorage.removeItem(CLAVE_STORAGE);
      } catch (e) {
        // Ignorar: si no hay storage, no pasa nada.
      }
      cuerpoItems.innerHTML = "";
      crearFila();
      crearFila();
      recalcular();
      mostrarAviso("Limpiado ✓");
    });

    // Recalcular/guardar cuando cambian los campos meta o el IVA.
    camposMeta.forEach(function (el) {
      var evento = el.isContentEditable ? "input" : "change";
      el.addEventListener(evento, function () {
        recalcular();
        guardar();
      });
    });
    ivaInput.addEventListener("input", function () {
      recalcular();
      guardar();
    });

    // ---- Arranque ----
    var habiaDatos = cargar();
    if (!habiaDatos) {
      // Estado inicial: dos filas vacías de ejemplo.
      crearFila();
      crearFila();
    }
    recalcular();
  });
}

/* =========================================================================
   EXPORTACIÓN PARA NODE.js  (usada por el futuro check.js)
   ========================================================================= */

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parsearNumero: parsearNumero,
    redondear2: redondear2,
    importeLinea: importeLinea,
    calcularTotales: calcularTotales,
    formatearMoneda: formatearMoneda
  };
}
