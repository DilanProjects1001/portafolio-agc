/* =========================================================
   Autotest del Generador de Ideas para Escritura Creativa
   Valida, sin necesidad de navegador, que los archivos del
   proyecto existan y contengan los elementos esenciales.
   Uso:  node check.js
   Sale con codigo 0 si todo pasa; 1 si algo falla.
   ========================================================= */

const fs = require("fs");
const path = require("path");

// Contadores de resultados
let pasadas = 0;
let fallidas = 0;

// Registra el resultado de una comprobacion
function comprobar(descripcion, condicion) {
  if (condicion) {
    console.log("  OK   - " + descripcion);
    pasadas++;
  } else {
    console.log("  FALLO- " + descripcion);
    fallidas++;
  }
}

// Lee un archivo del proyecto de forma segura
function leer(nombre) {
  const ruta = path.join(__dirname, nombre);
  return fs.readFileSync(ruta, "utf8");
}

console.log("== Autotest: generador-ideas-escritura ==\n");

// 1) Existencia de los archivos principales
const archivos = ["index.html", "style.css", "script.js", "README.md"];
archivos.forEach(function (archivo) {
  const existe = fs.existsSync(path.join(__dirname, archivo));
  comprobar("Existe el archivo " + archivo, existe);
});

// 2) La carpeta de capturas debe existir
comprobar(
  "Existe la carpeta ui_shots/",
  fs.existsSync(path.join(__dirname, "ui_shots"))
);

// 3) El HTML debe tener los elementos clave de la interfaz
try {
  const html = leer("index.html");
  comprobar("El HTML declara el idioma español (lang=\"es\")", /lang="es"/.test(html));
  comprobar("El HTML incluye el título de la app", /Generador de Ideas/.test(html));
  comprobar("El HTML enlaza la hoja de estilos", /style\.css/.test(html));
  comprobar("El HTML enlaza el script", /script\.js/.test(html));
  comprobar("Existe el botón Generar (id=btnGenerar)", /id="btnGenerar"/.test(html));
  comprobar("Existe el botón Copiar (id=btnCopiar)", /id="btnCopiar"/.test(html));
  comprobar("Existe el selector de tipo (id=tipo)", /id="tipo"/.test(html));
  comprobar("Existe el contenedor de la idea (id=idea)", /id="idea"/.test(html));
} catch (e) {
  comprobar("Se pudo leer index.html", false);
}

// 4) El script debe contener la lógica de generación
try {
  const js = leer("script.js");
  comprobar("El script define generarIdea()", /function generarIdea/.test(js));
  comprobar("El script tiene banco de personajes", /const PERSONAJES/.test(js));
  comprobar("El script tiene banco de lugares", /const LUGARES/.test(js));
  comprobar("El script tiene banco de conflictos", /const CONFLICTOS/.test(js));
} catch (e) {
  comprobar("Se pudo leer script.js", false);
}

// 5) Prueba funcional real de la lógica de generación.
//    Se extrae y evalúa la función generarIdea para confirmar
//    que produce texto no vacío para cada tipo de idea.
try {
  const js = leer("script.js");
  // Se aísla la parte de datos + generación (hasta la conexión con la UI)
  const corte = js.indexOf("/* -------- Conexión con la interfaz");
  const nucleo = corte > -1 ? js.slice(0, corte) : js;
  // Se evalúa en una función que devuelve generarIdea
  const construir = new Function(nucleo + "\nreturn generarIdea;");
  const generar = construir();

  const tipos = ["completa", "personaje", "lugar", "conflicto", "primeraLinea", "genero"];
  tipos.forEach(function (tipo) {
    const idea = generar(tipo);
    comprobar(
      "generarIdea('" + tipo + "') devuelve texto no vacío",
      typeof idea === "string" && idea.trim().length > 0
    );
  });
} catch (e) {
  comprobar("La lógica de generación se ejecuta sin errores (" + e.message + ")", false);
}

// Resumen final y código de salida
console.log("\n== Resultado: " + pasadas + " OK, " + fallidas + " fallidas ==");
if (fallidas > 0) {
  process.exit(1);
} else {
  console.log("Todas las comprobaciones pasaron correctamente.");
  process.exit(0);
}
