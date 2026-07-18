# Autotest — Calculadora de Propinas

Este proyecto incluye un autotest en `test.js` que valida la lógica de cálculo
**sin necesidad de abrir el navegador**. Prueba la función pura `calculateTip`
exportada desde `src/script.js`.

## Cómo ejecutarlo

```bash
node test.js
```

Sale con **código 0** si todas las pruebas pasan; con **código 1** si alguna falla.

## Qué se probó (14 pruebas)

| # | Caso | Qué verifica |
|---|------|--------------|
| 1-2 | 100 al 15% | Propina = 15 y total = 115 (caso típico) |
| 3-4 | 50 al 20% | Propina = 10 y total = 60 |
| 5-6 | 80 al 0% | Sin propina; total igual al monto |
| 7 | 0 al 15% | Monto cero → total cero |
| 8-9 | 90 al 10% entre 3 personas | Total = 99 y por persona = 33 (división de la cuenta) |
| 10 | 33.33 al 15% | Redondeo correcto a 2 decimales (4.9995 → 5.00) |
| 11 | 10.10 al 10% | Coma flotante controlada (propina = 1.01, no 1.0100000001) |
| 12 | Monto negativo | Lanza error de validación |
| 13 | Porcentaje no numérico | Lanza error de validación |
| 14 | 0 personas | Lanza error de validación (evita división por cero) |

## Resultado de la última ejecución

```
Resultado: 14/14 pruebas pasaron.
✅ Todas las pruebas pasaron.
(exit 0)
```

## Por qué estas pruebas

- **Casos típicos**: garantizan que la fórmula base `propina = monto * (% / 100)`
  y `total = monto + propina` son correctas.
- **Redondeo y coma flotante**: los cálculos monetarios son propensos a errores de
  binario (ej. `0.1 + 0.2`). Se verifica que el redondeo a 2 decimales sea estable.
- **Validaciones**: entradas inválidas deben fallar de forma controlada (con `Error`)
  en lugar de devolver `NaN` o resultados absurdos.
