/**
 * app.js — Conecta la interfaz con el motor de cálculo (src/tarifas.js).
 * Todo ocurre en el navegador; no hay peticiones de red.
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // Valores por defecto: sirven para el botón "Restablecer".
  var DEFECTOS = {
    sueldo: 2000, gastos: 400, diasSemana: 5, horasDia: 8,
    vacaciones: 22, festivos: 12, enfermedad: 5,
    utilizacion: 60, impuestos: 25, margen: 15,
    tarifaActual: 30,
    pHoras: 40, pRiesgo: 20, pDescuento: 0
  };

  var CAMPOS = Object.keys(DEFECTOS);

  function valor(id) { return Number($(id).value); }

  function simbolo() { return $('moneda').value; }

  function dinero(n) { return Tarifas.formatearDinero(n, simbolo()); }

  /** Lee el formulario y devuelve la entrada del motor de cálculo. */
  function leerEntrada() {
    return {
      sueldoMensual: valor('sueldo'),
      gastosMensuales: valor('gastos'),
      diasSemana: valor('diasSemana'),
      horasDia: valor('horasDia'),
      diasVacaciones: valor('vacaciones'),
      diasFestivos: valor('festivos'),
      diasEnfermedad: valor('enfermedad'),
      utilizacion: valor('utilizacion'),
      impuestos: valor('impuestos'),
      margen: valor('margen')
    };
  }

  /** Recalcula tarifa y cotización y pinta todo en pantalla. */
  function actualizar() {
    var r = Tarifas.calcularTarifa(leerEntrada());

    // Símbolo de moneda en los campos de entrada
    Array.prototype.forEach.call(document.querySelectorAll('[data-simbolo]'), function (el) {
      el.textContent = simbolo();
    });
    $('utilizacionVal').textContent = valor('utilizacion');

    // Bloque principal
    $('rTarifaHora').textContent = dinero(r.tarifaHora);
    $('rTarifaDia').textContent = dinero(r.tarifaDia);
    $('rMensual').textContent = dinero(r.facturacionMensual);
    $('rHorasMes').textContent = r.horasFacturablesMes + ' h';
    $('rDias').textContent = r.diasTrabajados + ' días';

    // Desglose anual
    $('rSueldo').textContent = dinero(r.sueldoAnual);
    $('rGastos').textContent = dinero(r.gastosAnuales);
    $('rMargen').textContent = dinero(r.margenAnual);
    $('rImpuestos').textContent = dinero(r.impuestosAnuales);
    $('rBruto').textContent = dinero(r.ingresoBrutoNecesario);

    mostrarAviso(r);
    actualizarComparador(r);
    actualizarCotizacion(r.tarifaHora);
  }

  /** Compara la tarifa que cobra hoy el usuario con la mínima calculada. */
  function actualizarComparador(r) {
    var c = Tarifas.compararTarifa({
      tarifaActual: valor('tarifaActual'),
      tarifaMinima: r.tarifaHora,
      horasFacturables: r.horasFacturables
    });

    var difHora = $('rDifHora');
    var difAnual = $('rDifAnual');
    var signo = c.diferenciaHora >= 0 ? '+' : '−';

    difHora.textContent = signo + ' ' + dinero(Math.abs(c.diferenciaHora));
    difAnual.textContent = signo + ' ' + dinero(Math.abs(c.diferenciaAnual));
    difHora.className = c.diferenciaHora < 0 ? 'negativo' : 'positivo';
    difAnual.className = c.diferenciaHora < 0 ? 'negativo' : 'positivo';

    var textos = {
      baja: 'Estás cobrando por debajo de tu mínimo: dejas de ganar ' +
            dinero(Math.abs(c.diferenciaAnual)) + ' al año.',
      justa: 'Tu tarifa está justo en el mínimo: cubres costes, pero sin colchón para imprevistos.',
      buena: 'Vas bien: cobras por encima de tu mínimo y ganas ' +
             dinero(c.diferenciaAnual) + ' extra al año.'
    };

    var v = $('veredicto');
    v.textContent = r.tarifaHora === 0 ? 'Introduce tus datos para comparar.' : textos[c.veredicto];
    v.className = 'veredicto ' + (r.tarifaHora === 0 ? '' : c.veredicto);
  }

  /** Avisos útiles cuando los números no cuadran con la realidad. */
  function mostrarAviso(r) {
    var aviso = $('aviso');
    var texto = '';

    if (r.tarifaHora === 0) {
      texto = 'Introduce un sueldo o unos gastos para ver tu tarifa.';
    } else if (valor('utilizacion') >= 90) {
      texto = 'Un ' + valor('utilizacion') + '% de tiempo facturable es muy optimista: ' +
              'la mayoría de freelancers factura entre el 50% y el 70% de su jornada.';
    } else if (r.horasFacturablesMes < 40) {
      texto = 'Con tan pocas horas facturables al mes la tarifa se dispara. ' +
              'Revisa los días libres o el porcentaje facturable.';
    } else if (valor('margen') === 0) {
      texto = 'Sin margen de beneficio cubres justo los costes: cualquier imprevisto ' +
              'lo pagas tú. Un 10-20% es lo habitual.';
    }

    aviso.textContent = texto;
    aviso.hidden = texto === '';
  }

  /** Cotización del proyecto usando la tarifa recién calculada. */
  function actualizarCotizacion(tarifaHora) {
    var c = Tarifas.cotizarProyecto({
      horas: valor('pHoras'),
      tarifaHora: tarifaHora,
      riesgo: valor('pRiesgo'),
      descuento: valor('pDescuento')
    });

    $('cHoras').textContent = c.horasConRiesgo + ' h';
    $('cSubtotal').textContent = dinero(c.subtotal);
    $('cDescuento').textContent = '− ' + dinero(c.importeDescuento);
    $('cTotal').textContent = dinero(c.total);
    $('cEfectiva').textContent = dinero(c.tarifaEfectiva);

    ultimaCotizacion = c;
  }

  var ultimaCotizacion = null;

  /** Texto plano del presupuesto, listo para pegar en un correo. */
  function textoPresupuesto() {
    var c = ultimaCotizacion;
    if (!c) return '';
    return [
      'PRESUPUESTO',
      '-----------------------------',
      'Horas estimadas: ' + c.horas + ' h',
      'Colchón de riesgo (' + valor('pRiesgo') + '%): ' + c.horasConRiesgo + ' h',
      'Tarifa por hora: ' + dinero(valor('pHoras') > 0 ? c.subtotal / c.horasConRiesgo : 0),
      'Subtotal: ' + dinero(c.subtotal),
      'Descuento (' + valor('pDescuento') + '%): -' + dinero(c.importeDescuento),
      'TOTAL: ' + dinero(c.total)
    ].join('\n');
  }

  /** Copia al portapapeles con respaldo para navegadores sin permiso. */
  function copiarPresupuesto() {
    var texto = textoPresupuesto();
    var mostrar = function (ok) {
      var m = $('mensaje');
      m.textContent = ok ? 'Presupuesto copiado al portapapeles.'
                         : 'No se pudo copiar automáticamente. Selecciona el texto a mano.';
      m.hidden = false;
      setTimeout(function () { m.hidden = true; }, 3000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { mostrar(true); },
                                                function () { mostrar(false); });
      return;
    }
    // Respaldo clásico: textarea temporal + execCommand.
    try {
      var ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      mostrar(ok);
    } catch (err) {
      mostrar(false);
    }
  }

  function restablecer() {
    CAMPOS.forEach(function (id) { $(id).value = DEFECTOS[id]; });
    $('moneda').value = '€';
    actualizar();
  }

  // --- Eventos: la calculadora es reactiva, el botón solo refuerza --------
  document.addEventListener('input', function (ev) {
    if (ev.target.closest('.tarjeta')) actualizar();
  });
  $('moneda').addEventListener('change', actualizar);
  $('btnCalcular').addEventListener('click', actualizar);
  $('btnReset').addEventListener('click', restablecer);
  $('btnCopiar').addEventListener('click', copiarPresupuesto);

  actualizar();
})();
