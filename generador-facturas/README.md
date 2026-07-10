# Generador de Facturas y Presupuestos 🧾

🌐 **Demo en vivo:** https://agc-generador-facturas.pages.dev

Una **app web sencilla** para crear facturas y presupuestos con aspecto profesional,
directamente en tu navegador. Escribes los datos de tu empresa y del cliente, agregas los
ítems (descripción, cantidad y precio), y la app calcula sola el **subtotal**, el
**impuesto (IVA)** y el **total**. Luego puedes **imprimirla o guardarla como PDF**.

Todo se guarda automáticamente en tu navegador, así que **no pierdes el trabajo** aunque
recargues la página. No necesitas instalar nada ni conexión a internet.

## Cómo usarla

1. Abre el archivo **`index.html`** con doble clic (se abre en tu navegador).
2. Rellena los datos de tu empresa, el cliente y el número/fecha del documento.
3. Pulsa **➕ Agregar fila** para cada producto o servicio y escribe cantidad y precio.
4. El total se calcula solo; también puedes pulsar **🧮 Calcular total**.
5. Ajusta el porcentaje de **IVA** si lo necesitas (por defecto 21%).
6. Pulsa **🖨️ Imprimir / PDF**: en el diálogo de impresión elige *"Guardar como PDF"*.

Botones disponibles:

- **➕ Agregar fila** — añade un ítem.
- **× (en cada fila)** — elimina esa fila.
- **🧮 Calcular total** — recalcula subtotal, IVA y total.
- **🗑️ Limpiar** — borra todo (pide confirmación).
- **🖨️ Imprimir / PDF** — abre el diálogo de impresión (para PDF, elige guardar como PDF).

## Qué hace bien

- **Cálculo automático** de importe por línea, subtotal, IVA y total.
- **Guardado automático** en `localStorage` (tus datos no salen de tu equipo).
- **Impresión limpia**: al imprimir se ocultan los botones y controles, dejando solo el
  documento.
- Acepta coma o punto como separador decimal.
- Diseño **responsivo** y profesional.

## Verificación

Se añadirá un archivo `check.js` con pruebas automáticas de las funciones de cálculo
(subtotal, IVA, total). Mientras tanto, las pruebas manuales se describen en `SELFTEST.md`.

## Ángulo de monetización

Herramienta gratuita gancho para autónomos, pymes y freelancers. Una versión "Pro" podría
añadir logo personalizado, múltiples plantillas, guardado en la nube, envío por correo y
numeración automática por suscripción.

---

# Invoice & Quote Generator 🧾 (English)

A **simple web app** to create professional-looking invoices and quotes right in your
browser. Enter your company and client details, add line items (description, quantity,
unit price), and the app automatically computes the **subtotal**, **tax (VAT)** and
**total**. Then you can **print it or save it as a PDF**.

Everything is saved automatically in your browser, so **you won't lose your work** on
reload. No install and no internet required.

## How to use it

1. Open **`index.html`** by double-clicking it (opens in your browser).
2. Fill in your company, the client, and the document number/date.
3. Click **➕ Agregar fila** (Add row) for each product or service and type quantity/price.
4. The total updates automatically; you can also click **🧮 Calcular total**.
5. Adjust the **VAT** percentage if needed (default 21%).
6. Click **🖨️ Imprimir / PDF** and choose *"Save as PDF"* in the print dialog.

## What it handles well

- **Automatic math** for line amount, subtotal, VAT and total.
- **Auto-save** to `localStorage` (your data never leaves your machine).
- **Clean printing**: buttons and controls are hidden when printing.
- Accepts comma or dot as the decimal separator.
- **Responsive**, professional design.

## Verification

A `check.js` file with automated tests for the calculation functions will be added. For
now, manual test steps are described in `SELFTEST.md`.

---

_Proyecto del portafolio AGC — generado de forma autónoma._
