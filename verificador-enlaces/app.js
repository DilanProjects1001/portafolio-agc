/* ===== Lógica del Verificador de Enlaces Rotos (cliente) =====
   Envía la URL al servidor (POST /check). El servidor descarga la
   página, extrae los enlaces y verifica el código HTTP de cada uno.
   Aquí solo pintamos los resultados con su indicador de color. */

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnVerificar");
  const input = document.getElementById("urlInput");
  const contenedor = document.getElementById("resultados");

  btn.addEventListener("click", verificar);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") verificar();
  });

  function verificar() {
    const url = input.value.trim();

    if (!url) {
      mostrarAviso("Escribe una dirección web antes de verificar.");
      return;
    }

    mostrarCargando();
    btn.disabled = true;

    fetch("/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url })
    })
      .then(function (resp) {
        return resp.json();
      })
      .then(function (datos) {
        btn.disabled = false;

        if (datos.error) {
          mostrarAviso(datos.error);
          return;
        }
        if (!datos.enlaces || datos.enlaces.length === 0) {
          mostrarAviso(datos.mensaje || "No se encontraron enlaces en esa página.");
          return;
        }
        mostrarEnlaces(datos);
      })
      .catch(function () {
        btn.disabled = false;
        mostrarAviso("No se pudo conectar con el servidor. ¿Ejecutaste 'node server.js' y abriste http://localhost:3000?");
      });
  }

  /* Pinta el listado de enlaces con su indicador de estado */
  function mostrarEnlaces(datos) {
    contenedor.innerHTML = "";

    const roto = datos.enlaces.filter(function (e) { return !e.ok; }).length;
    const ok = datos.enlaces.length - roto;

    const resumen = document.createElement("div");
    resumen.className = "aviso resumen";
    let texto = "Se revisaron " + datos.enlaces.length + " enlaces de \"" + datos.pagina + "\": " +
      ok + " correctos, " + roto + " con problemas.";
    if (datos.total && datos.total > datos.enlaces.length) {
      texto += " (Se muestran los primeros " + datos.enlaces.length + " de " + datos.total + ".)";
    }
    resumen.textContent = "ℹ️ " + texto;
    contenedor.appendChild(resumen);

    datos.enlaces.forEach(function (enlace) {
      const clase = clasificar(enlace);
      const item = document.createElement("div");
      item.className = "item-enlace " + clase.tipo;

      const texto = document.createElement("span");
      texto.className = "url-texto";
      texto.textContent = enlace.url;

      const estado = document.createElement("span");
      estado.className = "estado " + clase.tipo;
      estado.textContent = clase.etiqueta;

      item.appendChild(texto);
      item.appendChild(estado);
      contenedor.appendChild(item);
    });
  }

  /* Decide el color/etiqueta según el estado del enlace */
  function clasificar(enlace) {
    if (enlace.status >= 200 && enlace.status < 400) {
      return { tipo: "ok", etiqueta: "OK (" + enlace.status + ")" };
    }
    if (enlace.status >= 400) {
      return { tipo: "roto", etiqueta: "Roto (" + enlace.status + ")" };
    }
    // status 0 o error de conexión/timeout
    return { tipo: "roto", etiqueta: "Fallo (" + (enlace.error || "sin respuesta") + ")" };
  }

  function mostrarCargando() {
    contenedor.innerHTML =
      '<div class="cargando"><span class="spinner" aria-hidden="true"></span>' +
      '<span>Verificando enlaces… esto puede tardar unos segundos.</span></div>';
  }

  function mostrarAviso(msg) {
    contenedor.innerHTML = '<div class="aviso">⚠️ ' + msg + "</div>";
  }
});
