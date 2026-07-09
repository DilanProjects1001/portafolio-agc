# SELFTEST — Calculadora de Crédito

Documento de las pruebas automáticas del proyecto. Las pruebas viven en `test.js` y se
ejecutan con Node.js, sin navegador ni dependencias externas.

## Cómo ejecutar

```
node test.js
```

- **Exit 0** → todas las pruebas pasaron.
- **Exit 1** → alguna prueba falló (se muestra el detalle en consola).

## Qué se prueba

Se verifica la función `calcularPrestamo(monto, tasaAnual, meses)`, que devuelve
`{ pagoMensual, totalPagado, totalInteres }` usando amortización francesa.

| # | Caso | Entradas | Resultado esperado |
|---|------|----------|--------------------|
| 1 | Préstamo típico con interés | monto=10000, tasa=12%, meses=24 | pago ≈ 470.73 · total ≈ 11297.63 · interés ≈ 1297.63 |
| 2 | Préstamo sin interés (0%) | monto=1200, tasa=0%, meses=12 | pago = 100 · total = 1200 · interés = 0 |
| 3 | Préstamo corto con interés | monto=5000, tasa=6%, meses=12 | pago ≈ 430.33 · total ≈ 5163.99 · interés ≈ 163.99 |
| 4 | Validación de datos inválidos | monto=-100 | debe lanzar un error (no calcular) |

Los casos con interés se comparan con una tolerancia de ±0.05 para absorber los
redondeos a dos decimales. El caso sin interés y la validación se comprueban de forma
exacta.

## Resultado de la última ejecución

```
Ejecutando pruebas de la calculadora de crédito...

Caso 1: $10,000 al 12% anual, 24 meses
  OK   pago mensual = 470.73
  OK   total pagado = 11297.63
  OK   total intereses = 1297.63

Caso 2: $1,200 al 0% anual, 12 meses (sin intereses)
  OK   pago mensual = 100
  OK   total pagado = 1200
  OK   total intereses = 0

Caso 3: $5,000 al 6% anual, 12 meses
  OK   pago mensual = 430.33
  OK   total pagado = 5163.99
  OK   total intereses = 163.99

Caso 4: datos inválidos (monto negativo) deben lanzar error
  OK   se rechazó el monto negativo correctamente

✅ TODAS LAS PRUEBAS PASARON
```

Código de salida: **0** ✅
