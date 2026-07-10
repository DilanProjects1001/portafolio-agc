/**
 * script.js — Clasificador de Textos con IA (por reglas + opción LLM)
 * -------------------------------------------------------------------------
 * Clasifica un texto en una de varias categorías (spam, urgente, queja,
 * consulta o normal) usando un sistema de REGLAS basado en palabras clave y
 * puntuación. No necesita internet ni dependencias.
 *
 * Ángulo IA:
 *   - Por defecto usa el clasificador por reglas (funciona siempre, offline).
 *   - Si se configura una clave de API de un LLM (ver .env.example), se podría
 *     delegar la clasificación a un modelo de lenguaje. Como el navegador no
 *     puede leer .env, aquí queda un flag `usarLLM` (false por defecto) y, más
 *     abajo, un ejemplo COMENTADO de cómo se haría la llamada desde un backend.
 *
 * El archivo funciona en DOS entornos:
 *   1. En el navegador (interfaz de index.html).
 *   2. En Node.js (para las pruebas automáticas de check.js).
 */

/* =========================================================================
   DEFINICIÓN DE CATEGORÍAS Y PALABRAS CLAVE
   -------------------------------------------------------------------------
   Cada categoría tiene una lista de palabras/expresiones clave y una
   etiqueta legible. La categoría "normal" es el resultado por defecto cuando
   ningún grupo de palabras clave obtiene puntuación.
   ========================================================================= */

var CATEGORIAS = {
  spam: {
    etiqueta: "Spam / Promoción",
    color: "#dc2626",
    claves: [
      "oferta", "ofertas", "gratis", "promoción", "promocion", "descuento",
      "descuentos", "gana", "ganar", "premio", "premios", "dinero", "click aquí",
      "click aqui", "haz clic", "compra ahora", "oportunidad única", "oportunidad unica",
      "felicidades", "ganaste", "loteria", "lotería", "viagra", "crédito fácil",
      "credito facil", "100% gratis", "suscríbete", "suscribete", "rebaja", "€", "$$$"
    ]
  },
  urgente: {
    etiqueta: "Urgente",
    color: "#ea580c",
    claves: [
      "urge", "urgente", "urgencia", "inmediato", "inmediata", "ya mismo",
      "cuanto antes", "cuánto antes", "emergencia", "ahora mismo", "de inmediato",
      "lo antes posible", "asap", "crítico", "critico", "importante", "prioridad",
      "no puede esperar", "rápido", "rapido"
    ]
  },
  queja: {
    etiqueta: "Queja / Reclamo",
    color: "#b45309",
    claves: [
      "queja", "reclamo", "reclamación", "reclamacion", "molesto", "molesta",
      "pésimo", "pesimo", "terrible", "horrible", "no funciona", "defectuoso",
      "estafa", "engaño", "engano", "devolución", "devolucion", "reembolso",
      "inaceptable", "decepcionado", "decepcionada", "mal servicio", "protesto",
      "exijo", "indignado", "indignada"
    ]
  },
  consulta: {
    etiqueta: "Consulta / Pregunta",
    color: "#2563eb",
    claves: [
      "consulta", "pregunta", "duda", "información", "informacion", "cómo",
      "como puedo", "quisiera saber", "me gustaría saber", "me gustaria saber",
      "podrían", "podrian", "podría", "podria", "cuánto cuesta", "cuanto cuesta",
      "disponible", "horario", "cuándo", "cuando abren", "necesito saber", "?"
    ]
  }
};

/* Orden de prioridad si hay empate de puntuación (de mayor a menor). */
var PRIORIDAD = ["urgente", "queja", "spam", "consulta"];

/* =========================================================================
   NORMALIZACIÓN DE TEXTO
   ========================================================================= */

/**
 * Pasa el texto a minúsculas y le quita los acentos, para que la comparación
 * de palabras clave sea tolerante ("Urgentísimo" ~ "urgentisimo").
 * @param {string} texto
 * @returns {string}
 */
function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/* =========================================================================
   CLASIFICADOR POR REGLAS
   ========================================================================= */

/**
 * Clasifica un texto en una categoría con un nivel de confianza (0-100).
 *
 * Cómo funciona:
 *   1. Normaliza el texto (minúsculas, sin acentos).
 *   2. Cuenta cuántas palabras clave de cada categoría aparecen.
 *   3. La categoría con más coincidencias gana (con desempate por prioridad).
 *   4. La confianza sube con el nº de coincidencias y su peso frente al total.
 *
 * @param {string} texto - Texto a clasificar.
 * @returns {{categoria:string, etiqueta:string, confianza:number,
 *            coincidencias:string[], puntuaciones:Object}}
 */
function clasificarTexto(texto) {
  var textoNorm = " " + normalizar(texto) + " ";
  var puntuaciones = {};
  var coincidenciasPorCat = {};
  var totalCoincidencias = 0;

  // Contamos coincidencias de palabras clave por categoría.
  Object.keys(CATEGORIAS).forEach(function (cat) {
    var claves = CATEGORIAS[cat].claves;
    var puntos = 0;
    var encontradas = [];
    for (var i = 0; i < claves.length; i++) {
      var claveNorm = normalizar(claves[i]);
      if (claveNorm && textoNorm.indexOf(claveNorm) !== -1) {
        puntos++;
        encontradas.push(claves[i]);
      }
    }
    puntuaciones[cat] = puntos;
    coincidenciasPorCat[cat] = encontradas;
    totalCoincidencias += puntos;
  });

  // Si no hubo ninguna coincidencia -> categoría "normal".
  if (totalCoincidencias === 0) {
    return {
      categoria: "normal",
      etiqueta: "Normal",
      confianza: 60,
      coincidencias: [],
      puntuaciones: puntuaciones
    };
  }

  // Buscamos la categoría con más puntos (desempate por PRIORIDAD).
  var mejorCat = null;
  var mejorPuntos = -1;
  PRIORIDAD.forEach(function (cat) {
    if (puntuaciones[cat] > mejorPuntos) {
      mejorPuntos = puntuaciones[cat];
      mejorCat = cat;
    }
  });

  // Confianza: base + peso por nº de coincidencias + dominancia sobre el total.
  // Se mantiene en el rango 50-99.
  var dominancia = mejorPuntos / totalCoincidencias; // 0..1
  var confianza = 50 + mejorPuntos * 12 + dominancia * 25;
  confianza = Math.round(Math.min(99, Math.max(50, confianza)));

  return {
    categoria: mejorCat,
    etiqueta: CATEGORIAS[mejorCat].etiqueta,
    confianza: confianza,
    coincidencias: coincidenciasPorCat[mejorCat],
    puntuaciones: puntuaciones
  };
}

/* =========================================================================
   OPCIÓN LLM (deshabilitada por defecto)
   -------------------------------------------------------------------------
   El navegador NO puede leer .env por seguridad. Para usar un LLM real, la
   clasificación debería hacerse en un backend que lea LLM_API_KEY y LLM_MODEL
   del entorno (ver .env.example). Aquí dejamos el flag y el ejemplo comentado.
   ========================================================================= */

var usarLLM = false; // Por defecto: clasificador por reglas (offline, siempre disponible).

/*
// Ejemplo de cómo se conectaría a un LLM desde un BACKEND (Node/servidor):
//
//   async function clasificarConLLM(texto) {
//     const apiKey = process.env.LLM_API_KEY;      // definido en .env
//     const modelo = process.env.LLM_MODEL;        // ej. "gpt-3.5-turbo"
//     const resp = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": "Bearer " + apiKey
//       },
//       body: JSON.stringify({
//         model: modelo,
//         messages: [
//           { role: "system", content: "Clasifica el texto en: spam, urgente, queja, consulta o normal. Responde en JSON {categoria, confianza}." },
//           { role: "user", content: texto }
//         ]
//       })
//     });
//     const data = await resp.json();
//     return JSON.parse(data.choices[0].message.content);
//   }
//
// NUNCA se debe poner la clave real en el código del navegador: quedaría
// expuesta a cualquiera. Por eso se usa .env y un backend.
*/

/* =========================================================================
   CONEXIÓN CON LA INTERFAZ  (solo en el navegador)
   ========================================================================= */

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    var entrada = document.getElementById("entrada");
    var btnClasificar = document.getElementById("btn-clasificar");
    var btnLimpiar = document.getElementById("btn-limpiar");
    var resultado = document.getElementById("resultado");
    var badge = document.getElementById("badge-categoria");
    var barraRelleno = document.getElementById("barra-relleno");
    var confianzaTexto = document.getElementById("confianza-texto");
    var detalleCoincidencias = document.getElementById("detalle-coincidencias");
    var modoTexto = document.getElementById("modo-texto");

    if (!entrada) {
      return;
    }

    // Indica al usuario qué motor está activo.
    modoTexto.textContent = usarLLM
      ? "Modo: LLM (API configurada)"
      : "Modo: reglas (sin conexión)";

    // Ejemplos rápidos para probar la app.
    var ejemplos = document.querySelectorAll("[data-ejemplo]");
    ejemplos.forEach(function (el) {
      el.addEventListener("click", function () {
        entrada.value = el.getAttribute("data-ejemplo");
        clasificarYMostrar();
      });
    });

    function clasificarYMostrar() {
      var texto = entrada.value.trim();
      if (texto === "") {
        resultado.classList.remove("visible");
        entrada.focus();
        return;
      }

      var r = clasificarTexto(texto);

      // Color según categoría (la "normal" usa un gris neutro).
      var color = r.categoria === "normal" ? "#475569" : CATEGORIAS[r.categoria].color;

      badge.textContent = r.etiqueta;
      badge.style.background = color;

      barraRelleno.style.width = r.confianza + "%";
      barraRelleno.style.background = color;
      confianzaTexto.textContent = "Confianza: " + r.confianza + "%";

      if (r.coincidencias.length > 0) {
        detalleCoincidencias.textContent =
          "Palabras detectadas: " + r.coincidencias.join(", ");
      } else {
        detalleCoincidencias.textContent =
          "Sin palabras clave especiales: se clasifica como texto normal.";
      }

      resultado.classList.add("visible");
    }

    btnClasificar.addEventListener("click", clasificarYMostrar);

    btnLimpiar.addEventListener("click", function () {
      entrada.value = "";
      resultado.classList.remove("visible");
      entrada.focus();
    });

    // Enlace compartible: si la URL trae ?texto=..., se clasifica al cargar.
    // Ej.: index.html?texto=Oferta%20gratis
    try {
      var params = new URLSearchParams(window.location.search);
      var textoParam = params.get("texto");
      if (textoParam) {
        entrada.value = textoParam;
        clasificarYMostrar();
      }
    } catch (e) {
      // Navegadores muy antiguos sin URLSearchParams: se ignora.
    }
  });
}

/* =========================================================================
   EXPORTACIÓN PARA NODE.js  (usada por check.js)
   ========================================================================= */

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    clasificarTexto: clasificarTexto,
    normalizar: normalizar,
    CATEGORIAS: CATEGORIAS
  };
}
