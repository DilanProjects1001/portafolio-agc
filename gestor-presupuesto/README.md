# 💰 Monthly Budget Manager

A self-contained web app to track your monthly budget. Add expenses and see how much you have left in real time.

## Problem it solves

Keeping a monthly budget usually means juggling a spreadsheet or doing mental math every
time you spend. This app removes that friction: you type your monthly budget once, add each
expense as it happens, and instantly see your **total spent** and **remaining balance**. If
you overspend, the "Remaining" box turns red so overspending is impossible to miss. It runs
entirely in the browser — no internet, no accounts, no installation.

## Usage (with examples)

1. Open `src/index.html` by double-clicking it (it opens in your browser).
2. Type your **Monthly budget**, e.g. `1000`.
3. For each expense, fill in the name and amount, then click **➕ Add expense**:

   ```
   Name:   Groceries     Amount: 200
   Name:   Transport     Amount: 300
   ```

4. The app updates automatically:

   ```
   Total spent:  $500.00
   Remaining:    $500.00
   ```

5. Click **🗑 Delete** next to any expense to remove it. Removing "Transport" (300) leaves:

   ```
   Total spent:  $200.00
   Remaining:    $800.00
   ```

No installation and no internet connection required.

## Project structure

```
gestor-presupuesto/
├── src/
│   ├── index.html   UI (HTML + CSS + UI bridge)
│   └── app.js       Logic: add/remove expenses and calculations
├── test/
│   └── check.js     Logic autotest (runs with Node)
├── ui_shots/        UI screenshots
├── README.md
└── SELFTEST.md      What was tested and how to verify it
```

## How to run the tests

With Node.js installed, from the project folder:

```
node test/check.js
```

Expected output ends with all checks passing and exit code `0`:

```
== Autotest Gestor de Presupuesto ==
  OK  - Total de gastos tras agregar 200 y 300 (= 500)
  OK  - Restante con presupuesto 1000 (= 500)
  OK  - Total de gastos tras eliminar uno (= 200)
  OK  - Restante tras eliminar (= 800)
====================================
RESULTADO: TODAS LAS PRUEBAS PASARON ✔
```

To also check the exit code (PowerShell):

```
node test/check.js ; echo $LASTEXITCODE   # prints 0 when everything passes
```

See `SELFTEST.md` for full details of what is tested.

## 💡 Monetization angle

This free version covers everyday budgeting. A **Premium** tier could add expense
**categories** with charts, **export** to CSV/Excel/PDF, **dark mode**, per-category budget
alerts, and **cloud sync** across phone and computer. Freemium model: free for basic use, a
low monthly subscription unlocks categories, export and sync.

---

## Resumen en español

**Gestor de Presupuesto Mensual** es una app web autocontenida (sin internet ni
dependencias) para controlar tu presupuesto del mes. Escribes tu presupuesto, agregas cada
gasto con nombre y monto, y ves al instante el **total gastado** y el **restante**; si te
pasas, el restante se pone en rojo. Se abre con doble clic en `src/index.html`. Para correr
las pruebas: `node test/check.js` (debe terminar con código 0). Idea de monetización: versión
Premium con categorías, exportación (CSV/PDF), modo oscuro y sincronización en la nube.
