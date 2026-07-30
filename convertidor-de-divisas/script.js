/**
 * script.js — Interfaz del Convertidor de Divisas.
 *
 * Sólo se ocupa del DOM: leer los campos, pedirle el cálculo a converter.js
 * (window.Conversor) y pintar el resultado. Toda la matemática y las reglas de
 * validación viven en converter.js, que es lo que prueban los tests de Node.
 */
(function () {
  'use strict';

  var C = window.Conversor;
  if (!C) {
    /* Si converter.js no cargó, avisamos en pantalla en vez de fallar en silencio. */
    document.getElementById('montoConvertido').textContent =
      'No se pudo cargar converter.js. Comprueba que esté junto a index.html.';
    return;
  }

  var elMonto      = document.getElementById('monto');
  var elOrigen     = document.getElementById('origen');
  var elDestino    = document.getElementById('destino');
  var elResultado  = document.getElementById('resultado');
  var elConvertido = document.getElementById('montoConvertido');
  var elDetalle    = document.getElementById('detalleOperacion');
  var elTasaTexto  = document.getElementById('tasaTexto');
  var elTabla      = document.getElementById('tablaTasas');

  /* ---------- Construcción inicial de la página ---------- */

  /* Los desplegables y la tabla salen de la MISMA lista que usa el cálculo,
     así nunca pueden mostrar una moneda o una tasa que no exista de verdad. */
  function pintarOpciones() {
    var monedas = C.listarMonedas();
    [elOrigen, elDestino].forEach(function (select) {
      select.innerHTML = '';
      monedas.forEach(function (m) {
        var op = document.createElement('option');
        op.value = m.codigo;
        op.textContent = m.codigo + ' — ' + m.nombre;
        select.appendChild(op);
      });
    });
  }

  function pintarTablaTasas() {
    elTabla.innerHTML = '';
    C.listarMonedas().forEach(function (m) {
      var fila = document.createElement('tr');
      var tdNombre = document.createElement('td');
      var tdCodigo = document.createElement('td');
      var tdValor  = document.createElement('td');
      tdNombre.textContent = m.nombre;
      tdCodigo.textContent = m.codigo;
      tdValor.textContent = m.porUSD.toFixed(2);
      tdValor.className = 'numero';
      fila.appendChild(tdNombre);
      fila.appendChild(tdCodigo);
      fila.appendChild(tdValor);
      elTabla.appendChild(fila);
    });
  }

  /* ---------- Pintado del resultado ---------- */

  /* estado: '' (éxito) | 'vacio' (reposo) | 'error' */
  function mostrar(estado, texto, detalle) {
    elResultado.className = estado;
    elConvertido.textContent = texto;
    elDetalle.textContent = detalle || '';
  }

  function actualizarTasaTexto() {
    var desde = elOrigen.value, hacia = elDestino.value;
    if (desde === hacia) {
      elTasaTexto.textContent = 'Ambas monedas son la misma: el monto no cambia.';
      return;
    }
    elTasaTexto.textContent = 'Tasa aplicada: 1 ' + desde + ' = ' +
      C.formatearMoneda(C.tasaEntre(desde, hacia), hacia) + ' (' + C.moneda(hacia).nombre + ').';
  }

  function alConvertir() {
    var r = C.operar(elMonto.value, elOrigen.value, elDestino.value);
    if (!r.ok) {
      mostrar('error', r.error, '');
      return;
    }
    mostrar('', r.textoResultado, r.textoDetalle);
    elTasaTexto.textContent = r.textoTasa;
  }

  function alInvertir() {
    var tmp = elOrigen.value;
    elOrigen.value = elDestino.value;
    elDestino.value = tmp;
    alConvertir();
  }

  function alLimpiar() {
    elMonto.value = '';
    elOrigen.value = 'USD';
    elDestino.value = 'EUR';
    mostrar('vacio', 'Escribe un monto y pulsa «Convertir».', '');
    actualizarTasaTexto();
    elMonto.focus();
  }

  /* ---------- Conexión de los controles ---------- */

  document.getElementById('btnConvertir').addEventListener('click', alConvertir);
  document.getElementById('btnInvertir').addEventListener('click', alInvertir);
  document.getElementById('btnLimpiar').addEventListener('click', alLimpiar);
  elOrigen.addEventListener('change', actualizarTasaTexto);
  elDestino.addEventListener('change', actualizarTasaTexto);
  /* Enter dentro del monto convierte, como en cualquier calculadora. */
  elMonto.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); alConvertir(); }
  });

  /* ---------- Arranque: 100 USD -> EUR ya convertidos ---------- */
  pintarOpciones();
  pintarTablaTasas();
  elOrigen.value = 'USD';
  elDestino.value = 'EUR';
  alConvertir();
}());
