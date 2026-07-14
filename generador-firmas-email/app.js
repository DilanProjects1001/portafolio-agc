/* app.js — Generador de Firmas de Email
 * =====================================================================
 * Lógica de la aplicación. Funciona 100% en el navegador, sin CDNs ni
 * dependencias externas. Las funciones principales también se exportan
 * con module.exports para poder probarlas con Node en check.js.
 *
 * Flujo:
 *   1) El usuario rellena el formulario.
 *   2) generarFirmaHTML(datos) arma el HTML de la firma con tablas y
 *      estilos inline (compatibles con Gmail / Outlook).
 *   3) Se muestra la vista previa y se habilitan copiar / descargar.
 * ===================================================================== */

"use strict";

/**
 * Escapa caracteres especiales para insertar texto de forma segura en HTML.
 * @param {string} texto
 * @returns {string}
 */
function escaparHTML(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Normaliza una URL: si no empieza por http(s), le antepone https://.
 * Devuelve "" si el valor está vacío.
 * @param {string} valor
 * @returns {string}
 */
function normalizarUrl(valor) {
  var v = (valor || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return "https://" + v;
}

/**
 * Construye el HTML de la firma a partir de los datos del formulario.
 * Usa una tabla con estilos inline para máxima compatibilidad en clientes
 * de correo (Gmail, Outlook, Apple Mail...).
 * @param {Object} datos - Campos de la firma.
 * @returns {string} HTML de la firma listo para pegar.
 */
function generarFirmaHTML(datos) {
  datos = datos || {};
  var color = datos.color && /^#[0-9a-fA-F]{3,8}$/.test(datos.color) ? datos.color : "#2563eb";

  var nombre = escaparHTML(datos.nombre);
  var cargo = escaparHTML(datos.cargo);
  var empresa = escaparHTML(datos.empresa);
  var correo = (datos.correo || "").trim();
  var telefono = (datos.telefono || "").trim();

  var webUrl = normalizarUrl(datos.web);
  var linkedinUrl = normalizarUrl(datos.linkedin);
  var twitterUrl = normalizarUrl(datos.twitter);

  var fuente = "font-family:Arial,Helvetica,sans-serif;";

  // Línea de contacto (correo / teléfono / web).
  var lineasContacto = [];
  if (correo) {
    lineasContacto.push(
      '<a href="mailto:' + escaparHTML(correo) + '" style="color:' + color +
      ';text-decoration:none;">✉️ ' + escaparHTML(correo) + "</a>"
    );
  }
  if (telefono) {
    lineasContacto.push('<span style="color:#555555;">📞 ' + escaparHTML(telefono) + "</span>");
  }
  if (webUrl) {
    lineasContacto.push(
      '<a href="' + escaparHTML(webUrl) + '" style="color:' + color +
      ';text-decoration:none;">🌐 ' + escaparHTML(datos.web.trim()) + "</a>"
    );
  }

  var contactoHTML = "";
  if (lineasContacto.length) {
    contactoHTML =
      '<div style="' + fuente + 'font-size:13px;line-height:20px;color:#555555;margin-top:8px;">' +
      lineasContacto.join(' &nbsp;·&nbsp; ') +
      "</div>";
  }

  // Redes sociales (LinkedIn / Twitter).
  var redes = [];
  if (linkedinUrl) {
    redes.push(
      '<a href="' + escaparHTML(linkedinUrl) +
      '" style="color:' + color + ';text-decoration:none;font-weight:bold;">in · LinkedIn</a>'
    );
  }
  if (twitterUrl) {
    redes.push(
      '<a href="' + escaparHTML(twitterUrl) +
      '" style="color:' + color + ';text-decoration:none;font-weight:bold;">✕ · Twitter/X</a>'
    );
  }
  var redesHTML = "";
  if (redes.length) {
    redesHTML =
      '<div style="' + fuente + 'font-size:13px;line-height:20px;margin-top:6px;">' +
      redes.join(' &nbsp;|&nbsp; ') +
      "</div>";
  }

  // Firma completa: tabla de una fila, borde de color a la izquierda.
  var html =
    '<table cellpadding="0" cellspacing="0" border="0" style="' + fuente +
    'border-collapse:collapse;">' +
    "<tr>" +
    '<td style="border-left:4px solid ' + color + ';padding:4px 0 4px 14px;">' +
    '<div style="' + fuente + 'font-size:17px;font-weight:bold;color:#1a1a1a;">' + nombre + "</div>" +
    '<div style="' + fuente + 'font-size:14px;color:' + color + ';font-weight:bold;">' + cargo + "</div>" +
    '<div style="' + fuente + 'font-size:14px;color:#333333;">' + empresa + "</div>" +
    contactoHTML +
    redesHTML +
    "</td>" +
    "</tr>" +
    "</table>";

  return html;
}

/**
 * Lee los valores actuales del formulario y devuelve un objeto de datos.
 * Solo se usa en el navegador (usa document).
 * @returns {Object} Datos de la firma.
 */
function leerFormulario() {
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }
  return {
    nombre: val("nombre"),
    cargo: val("cargo"),
    empresa: val("empresa"),
    correo: val("correo"),
    telefono: val("telefono"),
    web: val("web"),
    linkedin: val("linkedin"),
    twitter: val("twitter"),
    color: val("color") || "#2563eb",
  };
}

/**
 * Valida que los campos obligatorios estén completos.
 * @param {Object} datos
 * @returns {string} Mensaje de error, o "" si todo está bien.
 */
function validarDatos(datos) {
  if (!datos.nombre) return "Falta el nombre completo.";
  if (!datos.cargo) return "Falta el cargo.";
  if (!datos.empresa) return "Falta la empresa.";
  if (!datos.correo) return "Falta el correo electrónico.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) return "El correo electrónico no parece válido.";
  return "";
}

/* Variable donde guardamos el último HTML generado (para copiar/descargar). */
var ultimaFirmaHTML = "";

/**
 * Refresca la vista previa de la firma en pantalla y habilita los botones.
 */
function actualizarVistaPrevia() {
  var datos = leerFormulario();
  var error = validarDatos(datos);
  var msgError = document.getElementById("mensaje-error");
  var contenedor = document.getElementById("vista-previa");
  var btnCopiar = document.getElementById("btn-copiar");
  var btnDescargar = document.getElementById("btn-descargar");

  if (error) {
    if (msgError) msgError.textContent = error;
    return;
  }
  if (msgError) msgError.textContent = "";

  ultimaFirmaHTML = generarFirmaHTML(datos);
  if (contenedor) contenedor.innerHTML = ultimaFirmaHTML;
  if (btnCopiar) btnCopiar.disabled = false;
  if (btnDescargar) btnDescargar.disabled = false;
}

/**
 * Copia el HTML de la firma al portapapeles.
 * Intenta la API moderna y, si falla, usa un textarea temporal.
 */
function copiarFirma() {
  var msg = document.getElementById("mensaje-copia");
  if (!ultimaFirmaHTML) {
    if (msg) msg.textContent = "Primero genera una firma.";
    return;
  }

  function exito() {
    if (msg) msg.textContent = "✅ ¡Firma copiada! Pégala en tu cliente de correo.";
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ultimaFirmaHTML).then(exito, function () {
      copiarConTextarea();
    });
  } else {
    copiarConTextarea();
  }

  function copiarConTextarea() {
    var area = document.createElement("textarea");
    area.value = ultimaFirmaHTML;
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      exito();
    } catch (e) {
      if (msg) msg.textContent = "No se pudo copiar automáticamente. Copia el HTML manualmente.";
    }
    document.body.removeChild(area);
  }
}

/**
 * Crea un archivo .html con la firma y lo descarga.
 */
function descargarHTML() {
  var msg = document.getElementById("mensaje-copia");
  if (!ultimaFirmaHTML) {
    if (msg) msg.textContent = "Primero genera una firma.";
    return;
  }
  var documentoCompleto =
    '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n' +
    "<title>Mi firma de correo</title>\n</head>\n<body>\n" +
    ultimaFirmaHTML +
    "\n</body>\n</html>\n";

  var blob = new Blob([documentoCompleto], { type: "text/html;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "firma-correo.html";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
  if (msg) msg.textContent = "⬇️ Archivo “firma-correo.html” descargado.";
}

/* Conexión con el DOM (solo en el navegador). */
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("formulario-firma");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        actualizarVistaPrevia();
      });
    }
    var btnCopiar = document.getElementById("btn-copiar");
    if (btnCopiar) btnCopiar.addEventListener("click", copiarFirma);
    var btnDescargar = document.getElementById("btn-descargar");
    if (btnDescargar) btnDescargar.addEventListener("click", descargarHTML);

    // Modo demo: con ?demo=1 en la URL, precarga datos de ejemplo y genera
    // la firma automáticamente (útil para probar y para las capturas).
    if (window.location && /[?&]demo=1/.test(window.location.search)) {
      var ejemplo = {
        nombre: "Ana García",
        cargo: "Directora de Marketing",
        empresa: "Estudio Creativo S.A.",
        correo: "ana@estudiocreativo.com",
        telefono: "+34 600 123 456",
        web: "www.estudiocreativo.com",
        linkedin: "linkedin.com/in/anagarcia",
        twitter: "x.com/anagarcia",
        color: "#2563eb",
      };
      Object.keys(ejemplo).forEach(function (clave) {
        var el = document.getElementById(clave);
        if (el) el.value = ejemplo[clave];
      });
      actualizarVistaPrevia();
    }
  });
}

/* Exportación para pruebas con Node (check.js). */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generarFirmaHTML: generarFirmaHTML,
    validarDatos: validarDatos,
    normalizarUrl: normalizarUrl,
    escaparHTML: escaparHTML,
  };
}
