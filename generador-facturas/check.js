/**
 * check.js — Pruebas automáticas del Generador de Facturas y Presupuestos
 * -------------------------------------------------------------------------
 * Verifica las funciones puras de cálculo. Para no depender de nada, las
 * funciones están COPIADAS EXACTAMENTE de script.js (misma lógica), en lugar
 * de importarlas con require. Así este archivo se ejecuta solo con Node.js:
 *
 *   node check.js
 *
 * Sale con código 0 si TODAS las pruebas pasan, y con código 1 si alguna falla.
 */

/* =========================================================================
   FUNCIONES DE CÁLCULO  (copia exacta de script.js)
   ========================================================================= */

/** Convierte un texto a número tolerante (coma o punto decimal); 0 si no vale. */
function parsearNumero(valor) {
  if (typeof valor === "number") {
    return isFinite(valor) ? valor : 0;
  }
  if (typeof valor !== "string") {
    return 0;
  }
  var limpio = valor.trim().replace(/\s/g, "").replace(",", ".");
  var n = parseFloat(limpio);
  return isFinite(n) ? n : 0;
}

/** Redondea a 2 decimales evitando errores de coma flotante. */
function redondear2(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** Importe de una línea (cantidad × precio), redondeado a 2 decimales. */
function importeLinea(cantidad, precio) {
  return redondear2(parsearNumero(cantidad) * parsearNumero(precio));
}

/** Subtotal (suma de importes), IVA sobre el subtotal, y total = subtotal+IVA. */
function calcularTotales(items, ivaPorcentaje) {
  var subtotal = 0;
  for (var i = 0; i < items.length; i++) {
    subtotal += parsearNumero(items[i].importe);
  }

  var iva = subtotal * parsearNumero(ivaPorcentaje) / 100;
  var total = subtotal + iva;

  return { subtotal: subtotal, iva: iva, total: total };
}

/** Formatea a moneda española: 1234.5 -> "1.234,50" (manual, sin ICU). */
function formatearMoneda(valor) {
  var n = Number(valor);
  if (!isFinite(n)) {
    n = 0;
  }
  var negativo = n < 0;
  n = Math.abs(n);

  var partes = n.toFixed(2).split(".");
  var entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (negativo ? "-" : "") + entero + "," + partes[1];
}

/* =========================================================================
   MOTOR DE PRUEBAS
   ========================================================================= */

var fallos = 0;

/** Comprueba una condición; si falla, lo registra y muestra el detalle. */
function verificar(descripcion, obtenido, esperado) {
  var a = JSON.stringify(obtenido);
  var b = JSON.stringify(esperado);
  if (a === b) {
    console.log("  OK   " + descripcion);
  } else {
    console.log("  FALLO " + descripcion);
    console.log("        obtenido: " + a);
    console.log("        esperado: " + b);
    fallos++;
  }
}

console.log("Ejecutando pruebas del generador de facturas...\n");

// -------------------------------------------------------------------------
// importeLinea
// -------------------------------------------------------------------------
console.log("importeLinea (cantidad × precio)");
verificar("importeLinea(3, 10) === 30", importeLinea(3, 10), 30);
verificar("importeLinea(0, 5) === 0", importeLinea(0, 5), 0);

// -------------------------------------------------------------------------
// calcularTotales
// -------------------------------------------------------------------------
console.log("\ncalcularTotales (subtotal, IVA, total)");
verificar(
  "dos ítems con IVA 21%",
  calcularTotales([{ importe: 100.50 }, { importe: 200.25 }], 21),
  { subtotal: 300.75, iva: 63.1575, total: 363.9075 }
);
verificar(
  "lista vacía",
  calcularTotales([], 21),
  { subtotal: 0, iva: 0, total: 0 }
);
verificar(
  "IVA 0% -> total = subtotal",
  calcularTotales([{ importe: 100 }], 0),
  { subtotal: 100, iva: 0, total: 100 }
);

// -------------------------------------------------------------------------
// parsearNumero
// -------------------------------------------------------------------------
console.log("\nparsearNumero (texto -> número)");
verificar('parsearNumero("10,50") === 10.5', parsearNumero("10,50"), 10.5);

// -------------------------------------------------------------------------
// formatearMoneda
// -------------------------------------------------------------------------
console.log("\nformatearMoneda (número -> texto es-ES)");
verificar('formatearMoneda(1234.5) === "1.234,50"', formatearMoneda(1234.5), "1.234,50");

// -------------------------------------------------------------------------
// Resultado final
// -------------------------------------------------------------------------
console.log("");
if (fallos === 0) {
  console.log("Todos los tests pasaron correctamente.");
  process.exit(0);
} else {
  console.log("FALLARON " + fallos + " prueba(s).");
  process.exit(1);
}
