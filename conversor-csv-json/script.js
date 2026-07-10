/**
 * script.js — Lógica del Conversor CSV ↔ JSON
 * -------------------------------------------------------------------------
 * Contiene las funciones que convierten datos entre dos formatos muy comunes:
 *
 *   - CSV  → texto con filas y columnas separadas por comas (lo que exporta Excel).
 *   - JSON → estructura de datos que usan los programas y las webs.
 *
 * El archivo funciona en DOS entornos:
 *   1. En el navegador (conectado a la interfaz de index.html).
 *   2. En Node.js (para las pruebas automáticas de check.js).
 *
 * Por eso, al final se exporta con `module.exports` solo cuando estamos en Node.
 *
 * Todo el análisis de CSV se hace "a mano" (sin librerías) y respeta las reglas
 * habituales: campos entre comillas, comas dentro de comillas, comillas dobles
 * escapadas ("") y saltos de línea dentro de un campo entrecomillado.
 */

/* =========================================================================
   PARSEO DE CSV  (texto CSV  ->  filas de celdas)
   ========================================================================= */

/**
 * Convierte un texto CSV en un arreglo de filas, y cada fila en un arreglo de
 * celdas. Es un parser robusto que entiende comillas y saltos de línea.
 *
 * Ejemplo:
 *   'nombre,edad\n"García, Ana",30'  ->  [["nombre","edad"], ["García, Ana","30"]]
 *
 * @param {string} texto        - Contenido CSV completo.
 * @param {string} delimitador  - Separador de columnas (por defecto ",").
 * @returns {string[][]} Arreglo de filas; cada fila es un arreglo de celdas.
 */
function parsearCSV(texto, delimitador) {
  delimitador = delimitador || ",";

  var filas = [];
  var filaActual = [];
  var campoActual = "";
  var dentroComillas = false;
  var i = 0;
  var n = texto.length;

  while (i < n) {
    var ch = texto[i];

    if (dentroComillas) {
      if (ch === '"') {
        // Dos comillas seguidas dentro de comillas = una comilla literal.
        if (texto[i + 1] === '"') {
          campoActual += '"';
          i += 2;
          continue;
        }
        // Una comilla sola cierra el campo entrecomillado.
        dentroComillas = false;
        i++;
        continue;
      }
      campoActual += ch;
      i++;
      continue;
    }

    // Fuera de comillas:
    if (ch === '"') {
      dentroComillas = true;
      i++;
      continue;
    }
    if (ch === delimitador) {
      filaActual.push(campoActual);
      campoActual = "";
      i++;
      continue;
    }
    if (ch === '\r') {
      // Ignoramos el retorno de carro (Windows usa \r\n).
      i++;
      continue;
    }
    if (ch === '\n') {
      filaActual.push(campoActual);
      filas.push(filaActual);
      filaActual = [];
      campoActual = "";
      i++;
      continue;
    }
    campoActual += ch;
    i++;
  }

  // Cerramos el último campo/fila, salvo que el archivo terminara justo en un
  // salto de línea (en cuyo caso no queremos una fila vacía sobrante).
  if (!(filaActual.length === 0 && campoActual === "")) {
    filaActual.push(campoActual);
    filas.push(filaActual);
  }

  return filas;
}

/* =========================================================================
   CSV  ->  JSON
   ========================================================================= */

/**
 * Convierte texto CSV en un arreglo de objetos JSON.
 *
 * @param {string} texto - Contenido CSV.
 * @param {Object} [opciones]
 * @param {string} [opciones.delimitador=","] - Separador de columnas.
 * @param {boolean} [opciones.encabezados=true] - Si la primera fila son los
 *        nombres de las columnas. Si es false, devuelve un arreglo de arreglos.
 * @returns {Array} Arreglo de objetos (o de arreglos si encabezados=false).
 * @throws {Error} Si la entrada está vacía.
 */
function csvAJson(texto, opciones) {
  opciones = opciones || {};
  var delimitador = opciones.delimitador || ",";
  var conEncabezados = opciones.encabezados !== false;

  if (typeof texto !== "string" || texto.trim() === "") {
    throw new Error("La entrada CSV está vacía.");
  }

  var filas = parsearCSV(texto, delimitador);
  if (filas.length === 0) {
    throw new Error("No se encontraron filas en el CSV.");
  }

  if (!conEncabezados) {
    return filas;
  }

  var cabeceras = filas[0];
  var objetos = [];
  for (var r = 1; r < filas.length; r++) {
    var fila = filas[r];
    var obj = {};
    for (var c = 0; c < cabeceras.length; c++) {
      var clave = cabeceras[c];
      obj[clave] = fila[c] !== undefined ? fila[c] : "";
    }
    objetos.push(obj);
  }
  return objetos;
}

/* =========================================================================
   JSON  ->  CSV
   ========================================================================= */

/**
 * Escapa una celda para CSV: si contiene el delimitador, comillas o saltos de
 * línea, la envuelve en comillas y duplica las comillas internas.
 *
 * @param {*} valor
 * @param {string} delimitador
 * @returns {string}
 */
function escaparCampo(valor, delimitador) {
  if (valor === null || valor === undefined) {
    valor = "";
  } else if (typeof valor === "object") {
    // Objetos y arreglos anidados se guardan como su texto JSON.
    valor = JSON.stringify(valor);
  } else {
    valor = String(valor);
  }

  var necesitaComillas =
    valor.indexOf(delimitador) !== -1 ||
    valor.indexOf('"') !== -1 ||
    valor.indexOf("\n") !== -1 ||
    valor.indexOf("\r") !== -1;

  if (necesitaComillas) {
    return '"' + valor.replace(/"/g, '""') + '"';
  }
  return valor;
}

/**
 * Convierte datos JSON (arreglo de objetos) en texto CSV.
 *
 * @param {string|Array|Object} datos - Texto JSON, arreglo de objetos, o un
 *        objeto suelto (que se trata como un arreglo de un elemento).
 * @param {Object} [opciones]
 * @param {string} [opciones.delimitador=","] - Separador de columnas.
 * @returns {string} Texto CSV con encabezados en la primera fila.
 * @throws {Error} Si el JSON no es válido o no es un arreglo de objetos.
 */
function jsonACsv(datos, opciones) {
  opciones = opciones || {};
  var delimitador = opciones.delimitador || ",";

  var arr;
  if (typeof datos === "string") {
    if (datos.trim() === "") {
      throw new Error("La entrada JSON está vacía.");
    }
    try {
      arr = JSON.parse(datos);
    } catch (e) {
      throw new Error("El JSON no es válido: " + e.message);
    }
  } else {
    arr = datos;
  }

  // Un objeto suelto se convierte en un arreglo de un elemento.
  if (arr && typeof arr === "object" && !Array.isArray(arr)) {
    arr = [arr];
  }
  if (!Array.isArray(arr)) {
    throw new Error("El JSON debe ser un arreglo de objetos.");
  }
  if (arr.length === 0) {
    return "";
  }

  // Reunimos TODAS las claves que aparecen en cualquier objeto, en orden.
  var claves = [];
  var vistas = {};
  for (var k = 0; k < arr.length; k++) {
    var item = arr[k];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("El elemento " + k + " no es un objeto.");
    }
    var propias = Object.keys(item);
    for (var p = 0; p < propias.length; p++) {
      var nombre = propias[p];
      if (!vistas[nombre]) {
        vistas[nombre] = true;
        claves.push(nombre);
      }
    }
  }

  var lineas = [];

  // Fila de encabezados.
  var cabecera = [];
  for (var h = 0; h < claves.length; h++) {
    cabecera.push(escaparCampo(claves[h], delimitador));
  }
  lineas.push(cabecera.join(delimitador));

  // Filas de datos.
  for (var f = 0; f < arr.length; f++) {
    var fila = [];
    for (var q = 0; q < claves.length; q++) {
      var celda = arr[f][claves[q]];
      fila.push(escaparCampo(celda, delimitador));
    }
    lineas.push(fila.join(delimitador));
  }

  return lineas.join("\n");
}

/* =========================================================================
   VALIDACIÓN  (avisos que ayudan al usuario, sin bloquear la conversión)
   ========================================================================= */

/**
 * Revisa un CSV y devuelve una lista de avisos legibles (filas con distinto
 * número de columnas, encabezados vacíos o duplicados, etc.).
 *
 * @param {string} texto
 * @param {Object} [opciones] - { delimitador }
 * @returns {string[]} Lista de avisos (vacía si todo está bien).
 */
function validarCSV(texto, opciones) {
  opciones = opciones || {};
  var delimitador = opciones.delimitador || ",";
  var avisos = [];

  if (typeof texto !== "string" || texto.trim() === "") {
    return ["La entrada está vacía."];
  }

  var filas = parsearCSV(texto, delimitador);
  if (filas.length === 0) {
    return ["No se encontraron filas."];
  }

  var cabeceras = filas[0];
  var numCols = cabeceras.length;

  // Encabezados vacíos.
  for (var c = 0; c < cabeceras.length; c++) {
    if (cabeceras[c].trim() === "") {
      avisos.push("La columna " + (c + 1) + " no tiene nombre en el encabezado.");
    }
  }

  // Encabezados duplicados.
  var vistos = {};
  for (var d = 0; d < cabeceras.length; d++) {
    var nombre = cabeceras[d];
    if (vistos[nombre]) {
      avisos.push('El encabezado "' + nombre + '" está repetido.');
    }
    vistos[nombre] = true;
  }

  // Filas con distinto número de columnas.
  for (var r = 1; r < filas.length; r++) {
    if (filas[r].length !== numCols) {
      avisos.push(
        "La fila " + (r + 1) + " tiene " + filas[r].length +
        " columnas, pero el encabezado tiene " + numCols + "."
      );
    }
  }

  return avisos;
}

/* =========================================================================
   CONEXIÓN CON LA INTERFAZ  (solo en el navegador)
   ========================================================================= */

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    var entrada = document.getElementById("entrada");
    var salida = document.getElementById("salida");
    var selDelimitador = document.getElementById("delimitador");
    var chkEncabezados = document.getElementById("encabezados");
    var mensajes = document.getElementById("mensajes");
    var btnCsvJson = document.getElementById("btn-csv-json");
    var btnJsonCsv = document.getElementById("btn-json-csv");
    var btnCopiar = document.getElementById("btn-copiar");
    var btnDescargar = document.getElementById("btn-descargar");
    var btnLimpiar = document.getElementById("btn-limpiar");
    var btnEjemplo = document.getElementById("btn-ejemplo");

    if (!entrada) {
      return;
    }

    // Recuerda en qué formato quedó la salida, para descargar con la extensión
    // correcta (.json o .csv).
    var formatoSalida = "json";

    function mostrarMensajes(lista, tipo) {
      mensajes.innerHTML = "";
      mensajes.className = "mensajes " + (tipo || "");
      if (!lista || lista.length === 0) {
        return;
      }
      var ul = document.createElement("ul");
      for (var i = 0; i < lista.length; i++) {
        var li = document.createElement("li");
        li.textContent = lista[i];
        ul.appendChild(li);
      }
      mensajes.appendChild(ul);
    }

    function opciones() {
      return {
        delimitador: selDelimitador.value === "tab" ? "\t" : selDelimitador.value,
        encabezados: chkEncabezados.checked
      };
    }

    btnCsvJson.addEventListener("click", function () {
      try {
        var avisos = validarCSV(entrada.value, opciones());
        var datos = csvAJson(entrada.value, opciones());
        salida.value = JSON.stringify(datos, null, 2);
        formatoSalida = "json";
        if (avisos.length > 0) {
          mostrarMensajes(
            ["Convertido con avisos (revisa tus datos):"].concat(avisos),
            "aviso"
          );
        } else {
          mostrarMensajes(["✅ CSV convertido a JSON correctamente."], "exito");
        }
      } catch (e) {
        salida.value = "";
        mostrarMensajes(["❌ " + e.message], "error");
      }
    });

    btnJsonCsv.addEventListener("click", function () {
      try {
        var csv = jsonACsv(entrada.value, opciones());
        salida.value = csv;
        formatoSalida = "csv";
        mostrarMensajes(["✅ JSON convertido a CSV correctamente."], "exito");
      } catch (e) {
        salida.value = "";
        mostrarMensajes(["❌ " + e.message], "error");
      }
    });

    btnCopiar.addEventListener("click", function () {
      if (!salida.value) {
        return;
      }
      salida.select();
      try {
        document.execCommand("copy");
        mostrarMensajes(["📋 Resultado copiado al portapapeles."], "exito");
      } catch (e) {
        mostrarMensajes(["Selecciona el texto y cópialo manualmente."], "aviso");
      }
    });

    btnDescargar.addEventListener("click", function () {
      if (!salida.value) {
        return;
      }
      var tipo = formatoSalida === "json" ? "application/json" : "text/csv";
      var blob = new Blob([salida.value], { type: tipo + ";charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "resultado." + formatoSalida;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    btnLimpiar.addEventListener("click", function () {
      entrada.value = "";
      salida.value = "";
      mostrarMensajes([], "");
      entrada.focus();
    });

    btnEjemplo.addEventListener("click", function () {
      entrada.value =
        "nombre,edad,ciudad\n" +
        '"García, Ana",30,Madrid\n' +
        "Luis,25,Bogotá\n" +
        'Marta,41,"Ciudad de México"';
      selDelimitador.value = ",";
      chkEncabezados.checked = true;
      salida.value = "";
      mostrarMensajes(["Ejemplo cargado. Pulsa «CSV → JSON»."], "aviso");
    });
  });
}

/* =========================================================================
   EXPORTACIÓN PARA NODE.js  (usada por check.js)
   ========================================================================= */

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parsearCSV: parsearCSV,
    csvAJson: csvAJson,
    jsonACsv: jsonACsv,
    escaparCampo: escaparCampo,
    validarCSV: validarCSV
  };
}
