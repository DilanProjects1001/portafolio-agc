# SELFTEST — Gestor de Presupuesto Mensual

Este documento describe las pruebas automáticas del proyecto y cómo ejecutarlas.

## Qué se prueba

El autotest está en `test/check.js` y valida la lógica de `src/app.js` **sin necesidad
de navegador** (Node importa `app.js` mediante `module.exports`). Comprueba:

1. **Agregar gastos y sumar total**
   - Presupuesto: 1000.
   - Se agregan dos gastos: "Supermercado" 200 y "Transporte" 300.
   - Se verifica que `getTotalExpenses()` = **500**.
   - Se verifica que `getRemaining(1000)` = **500**.

2. **Eliminar un gasto**
   - Se elimina el gasto en el índice 1 (el de 300).
   - Se verifica que `getTotalExpenses()` = **200**.
   - Se verifica que `getRemaining(1000)` = **800**.

Si todas las comprobaciones pasan, el script imprime el resultado y sale con
**código 0**. Si alguna falla, sale con **código 1**.

## Cómo ejecutarlo

Con Node.js instalado, desde la carpeta `gestor-presupuesto`:

```
node test/check.js
```

### Salida esperada

```
== Autotest Gestor de Presupuesto ==
  OK  - Total de gastos tras agregar 200 y 300 (= 500)
  OK  - Restante con presupuesto 1000 (= 500)
  OK  - Total de gastos tras eliminar uno (= 200)
  OK  - Restante tras eliminar (= 800)
====================================
RESULTADO: TODAS LAS PRUEBAS PASARON ✔
```

### Cómo verificar el código de salida

En PowerShell, tras ejecutar el comando:

```
node test/check.js ; echo $LASTEXITCODE
```

Debe mostrar `0` en la última línea (0 = todo correcto).

## Prueba visual (manual)

Además del autotest, se genera una captura de la interfaz en `ui_shots/iter_0.png`
usando Microsoft Edge en modo headless con un perfil aislado dentro del propio
proyecto, para revisar que la app se vea correctamente al abrir `src/index.html`.
