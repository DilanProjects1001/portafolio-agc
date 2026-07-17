// script.js — Lógica de la interfaz (conecta el DOM con las funciones de counter.js).
// counter.js expone las funciones en window.Contador.

(function () {
  'use strict';

  const Contador = window.Contador;

  // Referencias al DOM
  const areaTexto = document.getElementById('texto');
  const btnContar = document.getElementById('btn-contar');
  const btnEjemplo = document.getElementById('btn-ejemplo');
  const btnLimpiar = document.getElementById('btn-limpiar');

  const salida = {
    palabras: document.getElementById('res-palabras'),
    caracteres: document.getElementById('res-caracteres'),
    caracteresSin: document.getElementById('res-caracteres-sin'),
    frases: document.getElementById('res-frases'),
    parrafos: document.getElementById('res-parrafos'),
  };
  const listaFrecuentes = document.getElementById('lista-frecuentes');

  const TEXTO_EJEMPLO =
    'La inteligencia artificial está cambiando el mundo. ' +
    'Cada día aparecen nuevas herramientas que nos ayudan a trabajar mejor.\n\n' +
    '¿Sabías que puedes automatizar tareas repetitivas? ' +
    '¡Es más fácil de lo que parece! La clave está en empezar con algo pequeño ' +
    'y mejorar poco a poco. La práctica hace al maestro.';

  // Formatea números grandes con separador de miles en español (1.234).
  function formatear(numero) {
    return numero.toLocaleString('es-ES');
  }

  // Pinta las estadísticas en pantalla.
  function actualizar() {
    const texto = areaTexto.value;
    const r = Contador.analizarTexto(texto);

    salida.palabras.textContent = formatear(r.palabras);
    salida.caracteres.textContent = formatear(r.caracteres);
    salida.caracteresSin.textContent = formatear(r.caracteresSinEspacios);
    salida.frases.textContent = formatear(r.frases);
    salida.parrafos.textContent = formatear(r.parrafos);

    pintarFrecuentes(r.frecuentes);
  }

  // Dibuja la lista de las palabras más frecuentes con una barra proporcional.
  function pintarFrecuentes(frecuentes) {
    listaFrecuentes.innerHTML = '';

    if (!frecuentes || frecuentes.length === 0) {
      const li = document.createElement('li');
      li.className = 'vacio';
      li.textContent = 'Aún no hay texto para analizar.';
      listaFrecuentes.appendChild(li);
      return;
    }

    const maximo = frecuentes[0].cantidad;

    frecuentes.forEach((item, indice) => {
      const li = document.createElement('li');

      const puesto = document.createElement('span');
      puesto.className = 'puesto';
      puesto.textContent = String(indice + 1);

      const palabra = document.createElement('span');
      palabra.className = 'palabra-texto';
      palabra.textContent = item.palabra;

      const barraContenedor = document.createElement('span');
      barraContenedor.className = 'barra-contenedor';
      const barra = document.createElement('span');
      barra.className = 'barra';
      const porcentaje = maximo > 0 ? (item.cantidad / maximo) * 100 : 0;
      barra.style.width = porcentaje + '%';
      barraContenedor.appendChild(barra);

      const cantidad = document.createElement('span');
      cantidad.className = 'palabra-cantidad';
      cantidad.textContent = String(item.cantidad);

      li.appendChild(puesto);
      li.appendChild(palabra);
      li.appendChild(barraContenedor);
      li.appendChild(cantidad);
      listaFrecuentes.appendChild(li);
    });
  }

  // --- Eventos ---
  btnContar.addEventListener('click', actualizar);

  // Actualización en vivo mientras se escribe.
  areaTexto.addEventListener('input', actualizar);

  btnEjemplo.addEventListener('click', function () {
    areaTexto.value = TEXTO_EJEMPLO;
    actualizar();
    areaTexto.focus();
  });

  btnLimpiar.addEventListener('click', function () {
    areaTexto.value = '';
    actualizar();
    areaTexto.focus();
  });

  // Estado inicial.
  actualizar();
})();
