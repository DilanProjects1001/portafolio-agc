# Convertidor de Divisas

🔗 **Demo en vivo:** [agc-convertidor-de-divisas.pages.dev](https://agc-convertidor-de-divisas.pages.dev)

Calculadora de cambio de moneda que funciona **sin internet y sin instalar nada**:
abres un archivo y ya está. Convierte entre **dólares (USD), euros (EUR), libras
(GBP), yenes (JPY) y pesos mexicanos (MXN)** con tasas fijas incluidas en el propio
programa.

Escribes un monto, eliges de qué moneda a qué moneda, pulsas **Convertir** y el
resultado aparece con el símbolo, los separadores y los decimales propios de esa
moneda (el yen sin decimales, el euro con separadores europeos, etc.).

Sin CDNs, sin `npm install`, sin llamadas de red. Todo el cálculo ocurre en tu equipo.

## Cómo usar

1. Abre `index.html` haciendo doble clic (sirve cualquier navegador moderno).
2. Escribe el monto que quieres convertir.
3. Elige la **moneda de origen** y la **moneda de destino** en los dos desplegables.
   El botón del medio (⇆) intercambia las dos de golpe.
4. Pulsa **Convertir**. También funciona pulsando `Enter` dentro del campo del monto.

**Cosas a tener en cuenta:**

- No necesita servidor ni conexión: se abre directamente desde el disco.
- Las tasas son **fijas, de demostración** (no son las del mercado en tiempo real).
  Están a la vista en la tabla "Tasas usadas" al final de la página; sirven para
  hacerte una idea, no para cerrar una operación de verdad.
- El botón **Limpiar** deja el formulario en blanco para empezar otra vez.
- Puedes escribir el decimal con coma o con punto: `12,5` y `12.5` valen igual.
- Si escribes algo que no es un número, o un número negativo, te avisa con un
  mensaje claro en vez de mostrar un resultado sin sentido.

## Qué hay en cada archivo

```
convertidor-de-divisas/
├── index.html                  Sólo el marcado. Sin estilos ni scripts incrustados
├── style.css                   Diseño monocromático, alto contraste, responsive
├── script.js                   La interfaz: lee el formulario y pinta el resultado
├── converter.js                Las cuentas. No toca el DOM: corre en Node y en el navegador
├── test/
│   └── convertidor.test.js     72 pruebas de la lógica
├── check.js                    57 pruebas de estructura, cableado y cero dependencias
├── SELFTEST.md                 Qué comprueba cada prueba, bloque por bloque
├── README.md
├── _deploy/                    Copia limpia de los 4 archivos web que se publican
└── ui_shots/
    ├── iter_1.png              Captura de la app abierta desde el disco
    └── iter_deploy.png         Captura de la app ya publicada en internet
```

**Sobre `_deploy/`:** a Cloudflare Pages sólo se suben `index.html`, `style.css`,
`converter.js` y `script.js` (28 KB). Las pruebas, la documentación y el perfil de
navegador que usan las capturas se quedan fuera: no pintan nada en un sitio público.

**Por qué está partido así:** `converter.js` no toca el DOM a propósito. Gracias a
eso, el archivo que ejecuta el navegador es *exactamente el mismo* que Node carga
con `require()` en las pruebas. No existe una copia paralela de la matemática que
pudiera desincronizarse sin que nadie se entere.

## Tasas usadas

Valores fijos de demostración, escritos en `converter.js` como "cuánto vale 1 USD":

| Moneda | Código | Valor por 1 USD |
| --- | --- | --- |
| Dólar estadounidense | USD | 1.00 |
| Euro | EUR | 0.85 |
| Libra esterlina | GBP | 0.73 |
| Yen japonés | JPY | 149.50 |
| Peso mexicano | MXN | 17.50 |

La conversión es `monto / tasa(origen) * tasa(destino)`, pasando siempre por el
dólar como base. Por eso las 25 combinaciones posibles salen de una sola columna de
números, sin necesidad de una tabla cruzada.

## Cómo verificar que funciona

Desde la carpeta del proyecto:

```
node test/convertidor.test.js     # 72 pruebas de la lógica          -> exit 0
node check.js                     # 57 pruebas de estructura e interfaz -> exit 0
```

Las dos se ejecutan sin navegador y sin dependencias. `SELFTEST.md` detalla qué
cubre cada bloque.

## Ángulo de monetización

- **Enlaces afiliados a casas de cambio.** En el momento en que alguien convierte,
  ya ha declarado una intención ("quiero moneda X"). Poner una tarjeta contextual
  debajo del resultado — *"Envía 500 USD a MXN con Wise / Remitly / Revolut"* — con
  enlace de afiliado. Las remesadoras y brókers de divisas pagan bien por cuenta
  abierta y financiada, y el propio par de monedas es la señal de segmentación.
- **Versión premium con tasas reales.** La versión gratis lleva tasas fijas de
  demostración; una versión de pago (pago único o unos pocos dólares al mes)
  desbloquea tasas reales del mercado desde una API, gráficas históricas, alertas
  por correo cuando una tasa llega a cierto valor, y más de 150 monedas.
- **Licencia del widget para incrustar.** Vender el conversor como `<iframe>` o
  fragmento de marca blanca a agencias de viajes, tiendas online y webs de
  facturación para autónomos, con precio por sitio y por año.
- **Versión sin publicidad / con marca propia.** Una cuota pequeña para quitar la
  tarjeta de afiliados y poner el logo y los colores del cliente.
- **Gancho para una suite mayor de finanzas.** Usarlo como puerta de entrada
  gratuita a un paquete de pago (generador de facturas multimoneda, control de
  gastos para autónomos que facturan al extranjero).

---

# English

## Currency Converter

🔗 **Live demo:** [agc-convertidor-de-divisas.pages.dev](https://agc-convertidor-de-divisas.pages.dev)

An offline currency converter for **USD, EUR, GBP, JPY and MXN**. Enter an amount,
pick a source and a target currency, hit **Convertir**, and get the result formatted
with the right symbol, separators and decimal precision for that currency.

No build step, no `npm install`, no CDNs, no network calls. Open `index.html` and it
works — straight from the filesystem. The interface is in Spanish.

### Features

- Five currencies with fixed offline rates: **USD, EUR, GBP, JPY, MXN**.
- Locale-aware formatting via `Intl.NumberFormat` — JPY shows zero decimals, EUR
  uses European separators (`1.234,50 €`), MXN uses Mexican ones.
- One-click swap button to flip source and target.
- Live rate line: *"Tasa aplicada: 1 USD = 0,85 €"*, updated as you change selects.
- Rate table rendered from the same data object the maths uses — displayed rates can
  never drift from applied rates.
- Accepts both decimal separators: `12,5` and `12.5` are the same amount.
- Input validation: empty, non-numeric and negative amounts produce a clear message
  instead of `NaN`.
- Monochrome, high-contrast UI; 52-54px buttons; responsive down to small phones;
  visible keyboard focus rings.

### Architecture

`converter.js` never touches the DOM, so the exact same file the browser runs is the
one Node loads with `require()` in the tests. There is no parallel copy of the maths
that could silently drift.

```
node test/convertidor.test.js     # 72 tests on the conversion logic     -> exit 0
node check.js                     # 57 tests on structure and UI wiring  -> exit 0
```

### Monetization angle

- **Affiliate links to exchange services.** The moment a user converts, they have
  stated an intent ("I want X currency"). Place a contextual card under the result —
  *"Send 500 USD to MXN with Wise / Remitly / Revolut"* — with an affiliate link.
  Remittance and FX brokers pay well per funded account, and the currency pair itself
  is the targeting signal.
- **Premium tier with real rates.** The free version ships fixed demo rates; a paid
  tier (one-off or a few dollars a month) unlocks live mid-market rates from an FX
  API, historical charts, rate alerts by email, and 150+ currencies.
- **Embeddable widget licence.** Sell a white-label `<iframe>`/snippet to travel
  agencies, e-commerce stores and freelance-invoicing sites that want a converter on
  their own page, priced per site per year.
- **Ad-free / branded build.** A small fee to remove the affiliate card and drop in
  the customer's own logo and colours.
- **Lead magnet for a broader FX toolkit.** Use it as the free entry point into a paid
  suite (multi-currency invoice generator, expense tracker for freelancers billing
  abroad).
