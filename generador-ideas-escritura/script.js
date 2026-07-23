/* =========================================================
   Generador de Ideas para Escritura Creativa
   Lógica de la aplicación. Todo funciona en el navegador,
   sin conexión ni dependencias externas.
   ========================================================= */

/* -------- Bancos de datos para construir las ideas -------- */

// Personajes: quién protagoniza la historia
const PERSONAJES = [
  "una relojera que oye el futuro en el tic-tac",
  "un cartero que entrega cartas a personas ya fallecidas",
  "una niña que colecciona sombras ajenas",
  "un exastronauta con miedo a las alturas",
  "una bibliotecaria que puede entrar en los libros",
  "un chef que cocina recuerdos en lugar de platos",
  "un detective que solo resuelve casos mientras duerme",
  "una jardinera que hace crecer plantas imposibles",
  "un músico que perdió la capacidad de oír silencio",
  "una anciana que envejece al revés cada luna llena",
  "un pintor daltónico que ve colores que no existen",
  "una traductora de idiomas que ya nadie habla",
];

// Lugares: dónde ocurre la acción
const LUGARES = [
  "en un faro que solo aparece con niebla",
  "en una estación de tren abandonada bajo el mar",
  "en un pueblo donde nunca amanece",
  "en una ciudad flotante hecha de globos",
  "en un bosque cuyos árboles susurran secretos",
  "en un hotel donde cada habitación es otra década",
  "en un mercado que solo existe los días bisiestos",
  "en una isla que se mueve cada noche",
  "en un rascacielos infinito sin planta baja",
  "en un desierto de arena que canta al viento",
  "en una biblioteca subterránea sin salida conocida",
  "en un tren que viaja entre recuerdos",
];

// Conflictos: qué problema mueve la trama
const CONFLICTOS = [
  "debe elegir entre salvar su pasado o su futuro",
  "descubre que todos a su alrededor son copias",
  "tiene 24 horas antes de olvidarlo todo",
  "recibe un mensaje escrito con su propia letra futura",
  "encuentra una puerta que solo abre desde dentro",
  "se da cuenta de que su reflejo actúa por su cuenta",
  "hereda un objeto que nadie debería poseer",
  "debe mentir para proteger una verdad peligrosa",
  "descubre que el tiempo se agota más rápido para él",
  "encuentra un mapa que lleva a un lugar que ya no existe",
  "debe reconciliarse con alguien que aún no ha conocido",
  "pierde algo que jamás recuerda haber tenido",
];

// Primeras líneas listas para arrancar un relato
const PRIMERAS_LINEAS = [
  "La última carta llegó tres días después de mi funeral.",
  "Nadie en el pueblo recordaba haber construido aquella puerta.",
  "El reloj marcó las trece y todos supimos que algo iba mal.",
  "Cuando desperté, mi sombra ya se había ido sin mí.",
  "El mapa estaba en blanco, pero yo sabía exactamente adónde ir.",
  "Ella coleccionaba tormentas en frascos de mermelada.",
  "El silencio de aquella casa tenía un nombre, y era el mío.",
  "Aquella mañana, el mar amaneció del revés.",
  "Dijeron que la biblioteca no existía, pero yo tenía su llave.",
  "El tren nunca paraba, salvo por mí.",
];

// Retos por género: consigna creativa según el estilo
const RETOS_GENERO = [
  "Terror: escribe una escena donde el peligro nunca se ve, solo se intuye.",
  "Romance: dos personas se enamoran sin cruzar jamás una palabra.",
  "Ciencia ficción: una tecnología cotidiana empieza a cobrar vida.",
  "Misterio: el culpable confiesa en la primera línea, pero nadie le cree.",
  "Fantasía: la magia tiene un precio que el protagonista aún no conoce.",
  "Aventura: un viaje que debía durar un día se alarga toda una vida.",
  "Drama: una familia guarda un secreto que se revela en una cena.",
  "Comedia: un malentendido pequeño desata un caos enorme.",
  "Histórico: cuenta un gran evento desde los ojos de alguien invisible.",
  "Distopía: una regla absurda gobierna toda la sociedad.",
];

/* -------- Utilidades -------- */

// Devuelve un elemento aleatorio de un arreglo
function alAzar(arreglo) {
  const indice = Math.floor(Math.random() * arreglo.length);
  return arreglo[indice];
}

// Pone en mayúscula la primera letra de un texto
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* -------- Generación de ideas según el tipo elegido -------- */

function generarIdea(tipo) {
  switch (tipo) {
    case "personaje":
      return capitalizar(alAzar(PERSONAJES)) + ".";
    case "lugar":
      return "La historia transcurre " + alAzar(LUGARES) + ".";
    case "conflicto":
      return "El personaje " + alAzar(CONFLICTOS) + ".";
    case "primeraLinea":
      return alAzar(PRIMERAS_LINEAS);
    case "genero":
      return alAzar(RETOS_GENERO);
    case "completa":
    default:
      // Combina personaje + lugar + conflicto en una sola idea
      return (
        capitalizar(alAzar(PERSONAJES)) +
        " " +
        alAzar(LUGARES) +
        " y " +
        alAzar(CONFLICTOS) +
        "."
      );
  }
}

/* -------- Conexión con la interfaz -------- */

document.addEventListener("DOMContentLoaded", function () {
  const selectorTipo = document.getElementById("tipo");
  const textoIdea = document.getElementById("idea");
  const btnGenerar = document.getElementById("btnGenerar");
  const btnCopiar = document.getElementById("btnCopiar");
  const aviso = document.getElementById("aviso");

  // Genera y muestra una nueva idea
  function mostrarNuevaIdea() {
    const tipo = selectorTipo.value;
    textoIdea.textContent = generarIdea(tipo);
    aviso.textContent = ""; // limpia el aviso previo
  }

  // Copia la idea actual al portapapeles
  function copiarIdea() {
    const texto = textoIdea.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(
        function () {
          aviso.textContent = "¡Idea copiada al portapapeles!";
        },
        function () {
          aviso.textContent = "No se pudo copiar automáticamente.";
        }
      );
    } else {
      // Alternativa para navegadores sin API de portapapeles
      aviso.textContent = "Copia manualmente: " + texto;
    }
  }

  btnGenerar.addEventListener("click", mostrarNuevaIdea);
  btnCopiar.addEventListener("click", copiarIdea);

  // Genera una primera idea al cargar para que no quede vacío
  mostrarNuevaIdea();
});
