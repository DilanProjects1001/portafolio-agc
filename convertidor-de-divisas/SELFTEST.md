# Autotest — qué se probó

El proyecto trae **dos verificaciones**, las dos sin navegador, sin conexión y sin
dependencias (sólo Node). Ambas salen con **código 0** si pasan y **1** si algo falla.

```
node test/convertidor.test.js     # 72 pruebas — la LÓGICA
node check.js                     # 57 pruebas — la ESTRUCTURA y la INTERFAZ
```

**Por qué dos y no una:** `test/convertidor.test.js` carga `converter.js` con
`require()` y ejecuta de verdad las cuentas. `check.js` no ejecuta nada: lee los
archivos como texto y comprueba que estén completos y bien conectados entre sí.
Son dos preguntas distintas ("¿el cálculo es correcto?" y "¿la página está entera?")
y conviene que fallen por separado para saber dónde mirar.

---

# 1) `test/convertidor.test.js` — la lógica (72 pruebas)

Carga **el mismo `converter.js` que ejecuta el navegador**. `converter.js` no toca
el DOM a propósito: por eso se puede probar en Node sin simular una página, y no
existe una copia paralela de la matemática que pudiera desincronizarse.

## Bloque A — La tabla de monedas (13)

- Están las **5 monedas pedidas**: USD, EUR, GBP, JPY, MXN, todas con tasa positiva.
- El orden de los desplegables es exactamente `USD, EUR, GBP, JPY, MXN`.
- La base **USD vale exactamente 1** (si no, toda la tabla estaría corrida).
- `listarMonedas()` devuelve 5 fichas, cada una con código, nombre y decimales.
- El **yen se define con 0 decimales**.
- `moneda('ABC')` lanza error en vez de devolver basura.
- `moneda()` devuelve una **copia**: modificar lo que devuelve no corrompe la tabla
  interna del módulo.

## Bloque B — Conversiones concretas (10)

Valores calculados a mano y comparados uno a uno:

| Caso | Esperado |
| --- | --- |
| 100 USD → EUR | 85 |
| 100 USD → GBP | 73 |
| 1 USD → JPY | 149.50 |
| 100 USD → MXN | 1750 |
| 85 EUR → USD | 100 (la vuelta exacta) |
| 1750 MXN → USD | 100 |
| 12.5 USD → EUR | 10.625 (decimales) |
| 1.000.000 USD → JPY | 149.500.000 (montos grandes) |
| 0 GBP → MXN | 0 |

## Bloque C — Propiedades que siempre deben cumplirse (9)

Estas no dependen de qué tasas se pongan; si alguna falla, la fórmula está mal:

- **Identidad**: convertir una moneda a sí misma no cambia el monto (las 5).
- **Ida y vuelta**: en las **25 combinaciones**, convertir 500 de A a B y de vuelta
  a A recupera 500. Detecta una tasa invertida o una división al revés.
- **Transitividad**: en las **125 rutas** A→B→C, encadenar da lo mismo que ir
  directo A→C. Confirma que todo pasa por una base común (USD) y no por atajos.
- **Proporcionalidad**: el doble de monto da el doble de resultado.
- `tasaEntre(A,B)` coincide con `convertir(1, A, B)`.

## Bloque D — Entradas inválidas (6)

`convertir()` **lanza error** (no devuelve `NaN` en silencio) ante: moneda de origen
desconocida, moneda de destino desconocida, monto negativo, texto en vez de número,
`NaN` e `Infinity`.

## Bloque E — Validación de lo que escribe el usuario (11)

`validarMonto()` concentra las reglas para que la interfaz sólo tenga que mostrar el
mensaje:

- Acepta `"100"`, `"  42  "` (con espacios), `"0"`, y **ambos separadores decimales**:
  `"12,5"` y `"12.5"` dan 12.5.
- Rechaza con mensaje claro: vacío (*"Escribe un monto para poder convertir."*),
  texto (*"El monto debe ser un número válido."*) y negativo (*"El monto no puede
  ser negativo."*).
- No revienta con `null` ni `undefined`.
- Todos los mensajes están **en español**.

## Bloque F — Formato de moneda (11)

- Cada moneda lleva **su símbolo**: `$`, `€`, `£`, `￥`, `$`.
  *(Nota: el locale `ja-JP` usa el yen de ancho completo `￥` U+FFE5, no `¥` U+00A5;
  la prueba acepta los dos.)*
- El **yen sin decimales** (`￥1,235`), el **dólar con dos** (`$1,234.50`) y el
  **euro con separadores europeos** (`1.234,50 €`).
- Formatear `0` no falla; formatear una moneda inexistente o un valor no numérico
  lanza error.

## Bloque G — La operación completa (9)

`operar()` es lo que llama la interfaz. Se comprueba que devuelva el valor numérico,
el resultado ya formateado, el detalle (*"$100.00 equivale a 85,00 €"*) y la línea de
tasa aplicada; que avise cuando origen y destino son la misma moneda; y que ante un
monto inválido devuelva `{ok:false, error}` en vez de lanzar una excepción que
rompería la página.

## Bloque H — El módulo es autónomo (3)

- `converter.js` **no tiene ni un `require()`** de paquetes externos.
- **No toca el DOM** (`document.` / `window.`), por eso sirve en Node y en el navegador.
  *(El escaneo quita antes los comentarios: el archivo los menciona como documentación
  de uso y darían falso positivo.)*
- Se exporta correctamente para los dos entornos (`module.exports` y `raiz.Conversor`).

---

# 2) `check.js` — la estructura y la interfaz (57 pruebas)

## Bloque A — Todos los archivos están (9)

Existen y no están vacíos: `index.html`, `style.css`, `script.js`, `converter.js`,
`test/convertidor.test.js`, `README.md`, `SELFTEST.md`, la carpeta `ui_shots/` y al
menos una captura `.png` dentro.

## Bloque B — Los archivos están conectados entre sí (7)

- `index.html` enlaza `style.css` y carga `converter.js` y `script.js`.
- **`converter.js` se carga ANTES que `script.js`** (si no, `script.js` no lo
  encontraría y la página quedaría muerta).
- `script.js` usa `window.Conversor`.
- `index.html` **no lleva `<style>` ni `<script>` sueltos**: la separación en
  archivos que pide la estructura es real, no cosmética.

## Bloque C — La interfaz tiene todos sus elementos (19)

`lang="es"`, `charset=UTF-8`, viewport responsive, título, `input#monto` numérico,
`select#origen`, `select#destino`, botones `btnConvertir` / `btnLimpiar` /
`btnInvertir`, caja `#resultado`, `#montoConvertido`, `#tablaTasas`,
`aria-live="polite"` y las etiquetas en español. Además:

- **Los 12 `getElementById` de `script.js` apuntan a un `id` que existe** en el HTML.
  Caza erratas que dejarían la página rota con un error en consola.
- **Los 3 botones tienen su `addEventListener('click', …)`**. Un botón sin manejador
  se ve perfecto y no hace nada; esto lo detecta.
- **Los desplegables se generan desde `converter.js`** (`listarMonedas()`) y no están
  escritos a mano en el HTML: una sola fuente de verdad para las monedas.

## Bloque D — El diseño cumple las reglas de usabilidad (6)

Botones y campos de **52-54px de alto**, reglas `@media` para pantallas chicas,
paleta definida con variables CSS, marca de **foco visible** para quien navega con
teclado, y texto base de **16px o más**.

## Bloque E — Cero dependencias externas (5)

Ni un `src="http…"` o `href="http…"` en el HTML; ni `@import` ni `url(https:…)` ni
fuentes web en el CSS; ni `fetch()` ni `XMLHttpRequest` en el JS; y **no existe
`package.json`**, así que no hay nada que instalar. La página funciona sin conexión.

## Bloque F — Documentación (10)

- El `README.md` tiene las secciones **`Ángulo de monetización`**, **`Monetization
  angle`** y **`Cómo usar`**, y explica cómo lanzar las pruebas.
- **El idioma principal del README es el español** (regla AGC): se comprueba que el
  título y las secciones clave estén en español *antes* de la sección `English`, para
  que el castellano no acabe relegado a una traducción al final.
- **Los números de pruebas que cita el README son los reales** (72 y 57). Si alguien
  añade una prueba y no actualiza el texto, esto falla: la documentación no puede
  mentir sobre su propia cobertura.
- **El README no tiene TODOs sueltos** (`TODO`, `FIXME`, `TBD`, `WIP`).
- Este `SELFTEST.md` documenta el archivo de pruebas.

---

# Qué NO cubren

- **No ejecutan el JavaScript en un navegador**: no simulan clics reales ni miden
  píxeles. Eso se cubre con la **captura visual** de `ui_shots/iter_1.png`, revisada
  a ojo en cada iteración.
- **No validan que las tasas sean las del mercado real**: por diseño son fijas y de
  demostración, y así está avisado en la propia página y en el README.
