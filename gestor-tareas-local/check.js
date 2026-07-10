/**
 * check.js — Pruebas automáticas del Gestor de Tareas Local
 * ---------------------------------------------------------
 * No necesita navegador ni dependencias externas (solo Node).
 *
 * Hace dos tipos de verificación:
 *   1) ESTRUCTURA: lee index.html y comprueba que tenga los elementos
 *      clave (div#app, campo de entrada, lista, uso de localStorage, etc.).
 *   2) LÓGICA REAL: extrae el bloque de "lógica pura" del index.html,
 *      lo ejecuta en Node con un simulador de localStorage, y prueba
 *      agregar / completar / eliminar / persistencia de verdad.
 *
 * Cómo ejecutarlo:
 *     node check.js
 *
 * Si TODAS las pruebas pasan, termina con código de salida 0.
 * Si alguna falla, termina con código de salida 1.
 */

var fs = require("fs");
var path = require("path");

// Contadores para el resumen final.
var pruebasPasadas = 0;
var pruebasFallidas = 0;

/**
 * Aserción simple: registra e imprime el resultado.
 * @param {string} nombre - Descripción de la prueba.
 * @param {boolean} condicion - Debe ser true para pasar.
 */
function afirmar(nombre, condicion) {
  if (condicion) {
    pruebasPasadas++;
    console.log("  [OK]   " + nombre);
  } else {
    pruebasFallidas++;
    console.log("  [FALLO] " + nombre);
  }
}

console.log("==============================================");
console.log("  Pruebas del Gestor de Tareas Local");
console.log("==============================================\n");

// -------------------------------------------------------------------------
// Cargamos el HTML una sola vez.
// -------------------------------------------------------------------------
var rutaHtml = path.join(__dirname, "index.html");
var html = fs.readFileSync(rutaHtml, "utf8");

// =========================================================================
// GRUPO 1: Estructura del index.html
// =========================================================================
console.log("Grupo 1: Estructura del index.html");
afirmar('Existe el contenedor <div id="app">', /<div\s+id=["']app["']/.test(html));
afirmar('Existe el campo de entrada #campo-tarea', /id=["']campo-tarea["']/.test(html));
afirmar('Existe el botón agregar #btn-agregar', /id=["']btn-agregar["']/.test(html));
afirmar('Existe la lista de tareas #lista-tareas', /id=["']lista-tareas["']/.test(html));
afirmar("Usa localStorage para persistencia", /localStorage\.(setItem|getItem)/.test(html));
afirmar("Declara el idioma español (lang=\"es\")", /<html\s+lang=["']es["']/.test(html));
afirmar("No usa CDNs externos (sin http(s) en src/href)", !/(src|href)\s*=\s*["']https?:/i.test(html));

// =========================================================================
// GRUPO 2: Extraer la lógica pura y probarla de verdad
// =========================================================================
console.log("\nGrupo 2: Lógica real (agregar/completar/eliminar/persistir)");

// Extraemos el bloque marcado entre los comentarios de LOGICA PURA.
var inicio = html.indexOf("// ===== LOGICA PURA INICIO =====");
var fin = html.indexOf("// ===== LOGICA PURA FIN =====");
afirmar("Se encuentra el bloque de lógica pura en el HTML", inicio !== -1 && fin !== -1 && fin > inicio);

var api = null;
if (inicio !== -1 && fin !== -1 && fin > inicio) {
  var codigo = html.substring(inicio, fin);

  // Simulador mínimo de localStorage (guarda en memoria).
  var almacenSimulado = {};
  var localStorageFalso = {
    setItem: function (clave, valor) { almacenSimulado[clave] = String(valor); },
    getItem: function (clave) {
      return Object.prototype.hasOwnProperty.call(almacenSimulado, clave)
        ? almacenSimulado[clave] : null;
    },
    removeItem: function (clave) { delete almacenSimulado[clave]; }
  };

  // Ejecutamos el código extraído en un ámbito controlado y recogemos su API.
  // Envolvemos en una función que recibe localStorage falso y devuelve las
  // funciones, evitando cualquier dependencia del DOM.
  var envoltura = new Function("localStorage",
    codigo + "\n return {" +
    "agregarTarea: agregarTarea," +
    "alternarCompletada: alternarCompletada," +
    "eliminarTarea: eliminarTarea," +
    "limpiarCompletadas: limpiarCompletadas," +
    "filtrarTareas: filtrarTareas," +
    "contarPendientes: contarPendientes," +
    "guardarEnAlmacen: guardarEnAlmacen," +
    "cargarDeAlmacen: cargarDeAlmacen" +
    "};"
  );
  api = envoltura(localStorageFalso);
}

if (api) {
  // Prueba: agregar tareas.
  var lista = [];
  lista = api.agregarTarea(lista, "Comprar pan", 1);
  lista = api.agregarTarea(lista, "Llamar al banco", 2);
  afirmar("Agregar dos tareas deja 2 elementos", lista.length === 2);
  afirmar("La primera tarea guarda su texto", lista[0].texto === "Comprar pan");
  afirmar("Las tareas nuevas empiezan sin completar", lista[0].completada === false);

  // Prueba: texto vacío no se agrega.
  var listaIgual = api.agregarTarea(lista, "   ", 99);
  afirmar("Texto vacío/espacios no agrega nada", listaIgual.length === 2);

  // Prueba: marcar como completada.
  lista = api.alternarCompletada(lista, 1);
  afirmar("Marcar completada actualiza el estado", lista[0].completada === true);
  lista = api.alternarCompletada(lista, 1);
  afirmar("Volver a marcar la desmarca (alterna)", lista[0].completada === false);

  // Prueba: contar pendientes.
  afirmar("Cuenta 2 pendientes al inicio", api.contarPendientes(lista) === 2);

  // Prueba: eliminar.
  lista = api.eliminarTarea(lista, 1);
  afirmar("Eliminar deja 1 tarea", lista.length === 1);
  afirmar("Se eliminó la tarea correcta", lista[0].id === 2);

  // Prueba: filtros.
  var base = api.agregarTarea([], "A", 1);
  base = api.agregarTarea(base, "B", 2);
  base = api.alternarCompletada(base, 2); // completa la B
  afirmar("Filtro 'pendientes' devuelve solo 1", api.filtrarTareas(base, "pendientes").length === 1);
  afirmar("Filtro 'completadas' devuelve solo 1", api.filtrarTareas(base, "completadas").length === 1);
  afirmar("Filtro 'todas' devuelve 2", api.filtrarTareas(base, "todas").length === 2);

  // Prueba: limpiar completadas.
  var limpia = api.limpiarCompletadas(base);
  afirmar("Limpiar completadas deja solo pendientes", limpia.length === 1 && limpia[0].texto === "A");

  // Prueba: persistencia (guardar y volver a cargar).
  api.guardarEnAlmacen(base);
  var recuperada = api.cargarDeAlmacen();
  afirmar("Persistencia: se recuperan 2 tareas guardadas", recuperada.length === 2);
  afirmar("Persistencia: el texto sobrevive al guardado", recuperada[0].texto === "A");

  // Prueba: cargar sin datos previos devuelve lista vacía.
  var apiVacia = (function () {
    var mem = {};
    var lsFalso = {
      setItem: function (k, v) { mem[k] = String(v); },
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      removeItem: function (k) { delete mem[k]; }
    };
    var codigo2 = html.substring(inicio, fin);
    var env2 = new Function("localStorage", codigo2 + "\n return { cargarDeAlmacen: cargarDeAlmacen };");
    return env2(lsFalso);
  })();
  afirmar("Sin datos guardados, cargar devuelve lista vacía", apiVacia.cargarDeAlmacen().length === 0);
} else {
  afirmar("No se pudo extraer/ejecutar la lógica pura", false);
}

// =========================================================================
// Resumen final y código de salida.
// =========================================================================
console.log("\n==============================================");
console.log("  Resultado: " + pruebasPasadas + " pasadas, " + pruebasFallidas + " fallidas");
console.log("==============================================");

if (pruebasFallidas === 0) {
  console.log("\n✅ TODAS LAS PRUEBAS PASARON.");
  process.exit(0);
} else {
  console.log("\n❌ HAY PRUEBAS FALLIDAS.");
  process.exit(1);
}
