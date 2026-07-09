# Calculadora de Crédito 💳

🌐 **Demo en vivo:** https://agc-calculadora-credito.pages.dev

Una **app web sencilla** para calcular cuánto pagarías por un préstamo. Escribes el
monto que quieres pedir, la tasa de interés anual y en cuántos meses lo devolverías, y
la calculadora te dice:

- **Pago mensual** — cuánto pagarías cada mes (cuota fija).
- **Total pagado** — cuánto habrás pagado al terminar el crédito.
- **Total intereses** — cuánto de ese total son intereses (el costo del préstamo).

Usa el sistema de **amortización francesa**, que es el más común en bancos: la cuota es
la misma todos los meses.

## Cómo usarla

1. Abre el archivo **`index.html`** con doble clic (se abre en tu navegador).
2. No necesitas instalar nada ni conexión a internet: funciona todo en tu equipo.
3. Escribe el monto, la tasa anual y el plazo, y pulsa **Calcular**.

## Ejemplos de uso

| Monto | Tasa anual | Plazo | Pago mensual | Total pagado | Intereses |
|------:|-----------:|------:|-------------:|-------------:|----------:|
| $10,000 | 12% | 24 meses | $470.73 | $11,297.63 | $1,297.63 |
| $5,000  | 6%  | 12 meses | $430.33 | $5,163.99  | $163.99   |
| $1,200  | 0%  | 12 meses | $100.00 | $1,200.00  | $0.00     |

## Cómo se calcula (amortización francesa)

La cuota mensual se obtiene con esta fórmula:

```
        i · (1 + i)^n
C = P · ---------------
        (1 + i)^n − 1
```

Donde `P` es el monto, `i` la tasa mensual (tasa anual ÷ 12 ÷ 100) y `n` el número de
meses. Si la tasa es 0%, la cuota es simplemente el monto dividido entre los meses.

## Verificación

El archivo `test.js` comprueba automáticamente que los cálculos son correctos:

```
node test.js
```

Sale con código 0 si todo está bien. Ver detalles en `SELFTEST.md`.

## Ángulo de monetización

Esta calculadora puede ofrecerse como **herramienta gratuita gancho** en sitios de
comparadores de préstamos, cooperativas o fintechs, monetizando con enlaces de afiliado
a créditos y publicidad contextual. Una versión "Pro" podría añadir tabla de amortización
descargable, comparación de ofertas y cálculo de seguros por una suscripción mensual.

---

_Proyecto del portafolio AGC — generado de forma autónoma._
