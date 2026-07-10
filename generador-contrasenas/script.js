/**
 * script.js — Lógica del Generador de Contraseñas
 * -------------------------------------------------
 * Contiene la función principal `generarContrasena`, que crea una contraseña
 * aleatoria según las opciones elegidas por la persona usuaria.
 *
 * El archivo está pensado para funcionar en DOS entornos:
 *   1. En el navegador (conectado a la interfaz de index.html).
 *   2. En Node.js (para las pruebas automáticas de check.js).
 *
 * Por eso, al final del archivo se exporta la función con `module.exports`
 * solo cuando estamos en Node (comprobando que `module` exista).
 */

// Conjuntos de caracteres disponibles para armar la contraseña.
// Se separan por tipo para poder activarlos o desactivarlos según las opciones.
var GRUPOS_CARACTERES = {
  minusculas: "abcdefghijklmnopqrstuvwxyz",
  mayusculas: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numeros: "0123456789",
  simbolos: "!@#$%^&*()-_=+[]{};:,.<>?/"
};

/**
 * Devuelve un número entero aleatorio entre 0 (incluido) y `max` (excluido).
 * Se usa una fuente segura de aleatoriedad cuando está disponible:
 *   - En el navegador: window.crypto.getRandomValues
 *   - En Node.js:      require('crypto').randomBytes
 * Si ninguna está disponible, cae a Math.random como último recurso.
 *
 * @param {number} max - Límite superior (excluido).
 * @returns {number} Entero aleatorio en el rango [0, max).
 */
function enteroAleatorio(max) {
  // Caso navegador o entornos con la API Web Crypto.
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    var buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % max;
  }

  // Caso Node.js: usamos el módulo 'crypto' nativo.
  if (typeof require !== "undefined") {
    try {
      var nodeCrypto = require("crypto");
      return nodeCrypto.randomBytes(4).readUInt32BE(0) % max;
    } catch (e) {
      // Si por alguna razón falla, seguimos al respaldo de abajo.
    }
  }

  // Último recurso (menos seguro, pero garantiza que la app no se rompa).
  return Math.floor(Math.random() * max);
}

/**
 * Genera una contraseña aleatoria según las opciones indicadas.
 *
 * @param {Object} opciones - Configuración de la contraseña.
 * @param {number} opciones.longitud - Cantidad de caracteres (por defecto 12).
 * @param {boolean} opciones.mayusculas - Incluir letras mayúsculas.
 * @param {boolean} opciones.minusculas - Incluir letras minúsculas.
 * @param {boolean} opciones.numeros - Incluir dígitos 0-9.
 * @param {boolean} opciones.simbolos - Incluir símbolos especiales.
 * @returns {string} La contraseña generada.
 * @throws {Error} Si la longitud es inválida o no se eligió ningún tipo de carácter.
 */
function generarContrasena(opciones) {
  // Normalizamos las opciones para evitar valores indefinidos.
  opciones = opciones || {};
  var longitud = parseInt(opciones.longitud, 10);
  if (isNaN(longitud)) {
    longitud = 12; // Valor por defecto razonable.
  }

  // Validamos la longitud: debe ser un número positivo y con un tope sensato.
  if (longitud < 4) {
    throw new Error("La longitud mínima recomendada es 4 caracteres.");
  }
  if (longitud > 128) {
    throw new Error("La longitud máxima permitida es 128 caracteres.");
  }

  // Armamos la lista de grupos activos según las casillas marcadas.
  var gruposActivos = [];
  if (opciones.minusculas) gruposActivos.push(GRUPOS_CARACTERES.minusculas);
  if (opciones.mayusculas) gruposActivos.push(GRUPOS_CARACTERES.mayusculas);
  if (opciones.numeros) gruposActivos.push(GRUPOS_CARACTERES.numeros);
  if (opciones.simbolos) gruposActivos.push(GRUPOS_CARACTERES.simbolos);

  // Si no se eligió ningún tipo de carácter, no podemos generar nada.
  if (gruposActivos.length === 0) {
    throw new Error("Debes elegir al menos un tipo de carácter.");
  }

  // Para asegurar que la contraseña incluya AL MENOS un carácter de cada
  // grupo activo, primero colocamos uno de cada grupo y luego rellenamos.
  var caracteres = [];
  for (var g = 0; g < gruposActivos.length; g++) {
    var grupo = gruposActivos[g];
    caracteres.push(grupo.charAt(enteroAleatorio(grupo.length)));
  }

  // Juntamos todos los caracteres posibles en un solo "saco" para el relleno.
  var sacoCompleto = gruposActivos.join("");

  // Rellenamos hasta alcanzar la longitud deseada.
  while (caracteres.length < longitud) {
    caracteres.push(sacoCompleto.charAt(enteroAleatorio(sacoCompleto.length)));
  }

  // Mezclamos el arreglo (algoritmo Fisher-Yates) para que los caracteres
  // garantizados no queden siempre al principio.
  for (var i = caracteres.length - 1; i > 0; i--) {
    var j = enteroAleatorio(i + 1);
    var temporal = caracteres[i];
    caracteres[i] = caracteres[j];
    caracteres[j] = temporal;
  }

  return caracteres.join("");
}

/**
 * Calcula una fuerza aproximada de la contraseña (0 a 4) para mostrar
 * una barra visual en la interfaz. No es una medida criptográfica exacta,
 * solo una guía sencilla para la persona usuaria.
 *
 * @param {string} contrasena
 * @returns {number} Nivel de 0 (muy débil) a 4 (muy fuerte).
 */
function calcularFuerza(contrasena) {
  var puntaje = 0;
  if (!contrasena) return 0;
  if (contrasena.length >= 8) puntaje++;
  if (contrasena.length >= 14) puntaje++;
  if (/[a-z]/.test(contrasena) && /[A-Z]/.test(contrasena)) puntaje++;
  if (/[0-9]/.test(contrasena)) puntaje++;
  if (/[^a-zA-Z0-9]/.test(contrasena)) puntaje++;
  // Limitamos el máximo a 4.
  return Math.min(puntaje, 4);
}

// -------------------------------------------------------------------------
// Conexión con la interfaz (solo se ejecuta en el navegador, donde existe
// `document`). En Node.js este bloque se salta por completo.
// -------------------------------------------------------------------------
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    var formulario = document.getElementById("formulario");
    var entradaLongitud = document.getElementById("longitud");
    var valorLongitud = document.getElementById("valor-longitud");
    var resultado = document.getElementById("resultado");
    var botonCopiar = document.getElementById("boton-copiar");
    var barraFuerza = document.getElementById("barra-fuerza");
    var textoFuerza = document.getElementById("texto-fuerza");
    var mensaje = document.getElementById("mensaje");

    // Actualiza el número mostrado junto al deslizador de longitud.
    if (entradaLongitud && valorLongitud) {
      valorLongitud.textContent = entradaLongitud.value;
      entradaLongitud.addEventListener("input", function () {
        valorLongitud.textContent = entradaLongitud.value;
      });
    }

    // Nombres legibles y colores para cada nivel de fuerza.
    var nivelesFuerza = [
      { texto: "Muy débil", clase: "fuerza-0" },
      { texto: "Débil", clase: "fuerza-1" },
      { texto: "Aceptable", clase: "fuerza-2" },
      { texto: "Fuerte", clase: "fuerza-3" },
      { texto: "Muy fuerte", clase: "fuerza-4" }
    ];

    // Manejador del envío del formulario: genera y muestra la contraseña.
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();
      mensaje.textContent = "";

      var opciones = {
        longitud: parseInt(entradaLongitud.value, 10),
        mayusculas: document.getElementById("mayusculas").checked,
        minusculas: document.getElementById("minusculas").checked,
        numeros: document.getElementById("numeros").checked,
        simbolos: document.getElementById("simbolos").checked
      };

      try {
        var contrasena = generarContrasena(opciones);
        resultado.value = contrasena;

        // Actualizamos la barra de fuerza.
        var fuerza = calcularFuerza(contrasena);
        var nivel = nivelesFuerza[fuerza];
        barraFuerza.className = "barra-fuerza " + nivel.clase;
        barraFuerza.style.width = ((fuerza + 1) / 5) * 100 + "%";
        textoFuerza.textContent = "Seguridad: " + nivel.texto;
      } catch (error) {
        // Mostramos el error de forma amable en la interfaz.
        mensaje.textContent = error.message;
        resultado.value = "";
        barraFuerza.style.width = "0%";
        textoFuerza.textContent = "";
      }
    });

    // Botón para copiar la contraseña al portapapeles.
    if (botonCopiar) {
      botonCopiar.addEventListener("click", function () {
        if (!resultado.value) {
          mensaje.textContent = "Primero genera una contraseña.";
          return;
        }
        resultado.select();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(resultado.value).then(function () {
            mensaje.textContent = "¡Copiada al portapapeles!";
          });
        } else {
          // Respaldo para navegadores sin la API moderna.
          document.execCommand("copy");
          mensaje.textContent = "¡Copiada al portapapeles!";
        }
      });
    }
  });
}

// -------------------------------------------------------------------------
// Exportación para Node.js (usada por check.js). En el navegador `module`
// no existe, así que esta parte se ignora sin causar errores.
// -------------------------------------------------------------------------
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generarContrasena: generarContrasena,
    calcularFuerza: calcularFuerza,
    GRUPOS_CARACTERES: GRUPOS_CARACTERES
  };
}
