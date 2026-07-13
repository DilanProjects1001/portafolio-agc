/*
 * Formateador JSON — lógica pura + interfaz.
 *
 * Las funciones "puras" (formatear, minificar, resaltar) no dependen del DOM,
 * así que pueden probarse con Node (ver check.js). La parte de interfaz se
 * activa solo cuando existe `document` (dentro del navegador).
 */

(function (global) {
  "use strict";

  // --- Lógica pura ---------------------------------------------------------

  /**
   * Formatea (beautify) una cadena JSON.
   * @param {string} texto  JSON de entrada.
   * @param {number|string} sangria  número de espacios o "tab".
   * @returns {string} JSON formateado.
   */
  function formatear(texto, sangria) {
    var datos = JSON.parse(texto);
    var espacios = sangria === "tab" ? "\t" : Number(sangria) || 2;
    return JSON.stringify(datos, null, espacios);
  }

  /**
   * Minifica una cadena JSON (sin espacios ni saltos de línea).
   * @param {string} texto  JSON de entrada.
   * @returns {string} JSON minificado.
   */
  function minificar(texto) {
    var datos = JSON.parse(texto);
    return JSON.stringify(datos);
  }

  // Escapa caracteres peligrosos para insertar texto en HTML.
  function escaparHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /**
   * Envuelve los tokens de un JSON en <span> con clases de color.
   * Recibe texto JSON ya formateado o minificado y devuelve HTML seguro.
   * @param {string} jsonTexto
   * @returns {string} HTML con resaltado.
   */
  function resaltar(jsonTexto) {
    var escapado = escaparHtml(jsonTexto);

    // Regex por partes: strings (con posible ":" detrás = clave), números,
    // booleanos, null y signos de puntuación.
    var patron = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],])/g;

    return escapado.replace(patron, function (match, cadena, dosPuntos, bool, nulo, numero, signo) {
      if (cadena !== undefined) {
        if (dosPuntos !== undefined) {
          // Es una clave (va seguida de ":")
          return '<span class="syn-clave">' + cadena + '</span><span class="syn-signo">' + dosPuntos + "</span>";
        }
        return '<span class="syn-string">' + cadena + "</span>";
      }
      if (bool !== undefined) return '<span class="syn-bool">' + bool + "</span>";
      if (nulo !== undefined) return '<span class="syn-null">' + nulo + "</span>";
      if (numero !== undefined) return '<span class="syn-numero">' + numero + "</span>";
      if (signo !== undefined) return '<span class="syn-signo">' + signo + "</span>";
      return match;
    });
  }

  var api = {
    formatear: formatear,
    minificar: minificar,
    resaltar: resaltar,
    escaparHtml: escaparHtml,
  };

  // Exporta para Node (check.js). En el navegador no hay `module`.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  // --- Interfaz (solo en el navegador) ------------------------------------

  if (typeof document === "undefined") return;

  document.addEventListener("DOMContentLoaded", function () {
    var entrada = document.getElementById("entrada");
    var salida = document.getElementById("salida");
    var mensaje = document.getElementById("mensaje");
    var selSangria = document.getElementById("sangria");

    var EJEMPLO = {
      proyecto: "Formateador JSON",
      version: 1.0,
      activo: true,
      autor: null,
      tags: ["json", "herramienta", "desarrollo"],
      config: { sangria: 2, tema: "oscuro", maxItems: 100 },
    };

    function mostrarMensaje(texto, tipo) {
      mensaje.textContent = texto;
      mensaje.className = "mensaje" + (tipo ? " " + tipo : "");
    }

    function pintarSalida(jsonTexto) {
      salida.innerHTML = resaltar(jsonTexto);
    }

    function procesar(modo) {
      var texto = entrada.value.trim();
      if (!texto) {
        mostrarMensaje("Pega primero un JSON en el área de entrada.", "error");
        return;
      }
      try {
        var resultado =
          modo === "min"
            ? minificar(texto)
            : formatear(texto, selSangria.value);
        pintarSalida(resultado);
        var kb = (new Blob([resultado]).size / 1024).toFixed(2);
        mostrarMensaje(
          (modo === "min" ? "JSON minificado" : "JSON formateado") +
            " correctamente · " + kb + " KB",
          "ok"
        );
      } catch (e) {
        salida.innerHTML = '<span class="placeholder">Corrige el error para ver el resultado…</span>';
        mostrarMensaje("JSON inválido: " + e.message, "error");
      }
    }

    document.getElementById("btnFormatear").addEventListener("click", function () {
      procesar("beautify");
    });
    document.getElementById("btnMinificar").addEventListener("click", function () {
      procesar("min");
    });

    document.getElementById("btnEjemplo").addEventListener("click", function () {
      entrada.value = JSON.stringify(EJEMPLO);
      mostrarMensaje('Ejemplo cargado. Pulsa "Formatear".', "ok");
    });

    document.getElementById("btnLimpiar").addEventListener("click", function () {
      entrada.value = "";
      salida.innerHTML = '<span class="placeholder">El resultado aparecerá aquí…</span>';
      mostrarMensaje("", "");
      entrada.focus();
    });

    document.getElementById("btnPegar").addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function (t) {
          entrada.value = t;
          mostrarMensaje("Texto pegado desde el portapapeles.", "ok");
        }).catch(function () {
          mostrarMensaje("No se pudo leer el portapapeles. Pega con Ctrl+V.", "error");
        });
      } else {
        mostrarMensaje("Tu navegador no permite pegar automáticamente. Usa Ctrl+V.", "error");
      }
    });

    document.getElementById("btnCopiar").addEventListener("click", function () {
      var texto = salida.textContent;
      if (!texto || texto.indexOf("aparecerá aquí") !== -1) {
        mostrarMensaje("No hay nada que copiar todavía.", "error");
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(function () {
          mostrarMensaje("Resultado copiado al portapapeles.", "ok");
        }).catch(function () {
          mostrarMensaje("No se pudo copiar automáticamente.", "error");
        });
      } else {
        mostrarMensaje("Tu navegador no permite copiar automáticamente.", "error");
      }
    });

    // Ctrl+Enter formatea rápido
    entrada.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        procesar("beautify");
      }
    });

    // Estado inicial: carga el ejemplo formateado para que se vea bonito.
    entrada.value = JSON.stringify(EJEMPLO);
    pintarSalida(formatear(entrada.value, "2"));
    mostrarMensaje('Ejemplo listo. Prueba "Formatear" o "Minificar".', "ok");
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
