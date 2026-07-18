# 💵 Calculadora de Propinas (tip-calculator)

Una calculadora de propinas web, simple y rápida: escribes el monto de la cuenta,
eliges el porcentaje de propina y, si quieres, divides la cuenta entre varias personas.
Te muestra al instante **la propina, el total a pagar y cuánto paga cada persona**.

Funciona **100% en tu navegador**, sin conexión a internet, sin servidores y sin
instalar nada.

## Cómo usarla

1. Abre el archivo `src/index.html` con doble clic (o arrástralo a tu navegador).
2. Escribe el **monto de la cuenta**.
3. Toca un botón de porcentaje (10%, 15%, 18%, 20%, 25%) o escribe otro a mano.
4. Si van a dividir la cuenta, indica **entre cuántas personas**.
5. Listo: la propina, el total y el pago por persona se calculan solos.

## Ejemplo

- Cuenta: **$100**, propina **15%** → Propina **$15.00**, Total **$115.00**.
- Cuenta: **$90**, propina **10%**, entre **3 personas** → Total **$99.00**,
  cada persona paga **$33.00**.

## Estructura

```
tip-calculator/
├── src/
│   ├── index.html   ← la interfaz (abre este archivo)
│   ├── style.css    ← estilos (botones grandes, alto contraste)
│   └── script.js    ← lógica + conexión con la interfaz
├── test.js          ← autotest de la lógica (node test.js)
├── SELFTEST.md      ← qué prueba el autotest
├── README.md        ← este archivo
└── ui_shots/        ← capturas de la interfaz
```

## Probar la lógica (opcional, para desarrolladores)

La lógica de cálculo está en la función pura `calculateTip(monto, porcentaje, personas)`
exportada desde `src/script.js`. Para verificarla sin abrir el navegador:

```bash
node test.js
```

Debe mostrar `14/14 pruebas pasaron.` y salir con código 0. Detalles en `SELFTEST.md`.

Uso de la función desde Node.js:

```js
const { calculateTip } = require('./src/script.js');
console.log(calculateTip(100, 15));      // { propina: 15, total: 115, porPersona: 115 }
console.log(calculateTip(90, 10, 3));    // { propina: 9, total: 99, porPersona: 33 }
```

## Ángulo de monetización

Puede ofrecerse como **widget embebible** para blogs de finanzas personales o apps de
restaurantes (marca blanca, pago único por licencia). También sirve como gancho para una
**app de reparto de gastos** más completa (dividir por consumo, historial, monedas), con
plan gratuito y funciones premium por suscripción.

---

_Proyecto autónomo del Portafolio AGC — sin dependencias externas, sin CDNs._
