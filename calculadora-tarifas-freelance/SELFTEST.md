# SELFTEST — Calculadora de tarifas freelance

Verificación automática del motor de cálculo (`src/tarifas.js`), sin navegador y sin
dependencias externas.

```bash
node check.js     # devuelve exit 0 si todo pasa, 1 si algo falla
```

## Qué se prueba (44 comprobaciones, 9 grupos)

| Grupo | Qué comprueba |
|-------|----------------|
| 1. Caso base | 5 días × 52 semanas = 260 días y 2.080 horas; tarifa = coste ÷ horas (11,54 €/h con 2.000 €/mes) |
| 2. Vacaciones y festivos | 22+12+5 días se descuentan; menos días disponibles ⇒ tarifa más alta, mismo coste anual |
| 3. Utilización | Al 50% de tiempo facturable las horas se parten a la mitad y la tarifa se duplica |
| 4. Impuestos | Se **despejan** del bruto (24.000 ÷ 0,8 = 30.000), no se suman encima; bruto − impuestos = coste |
| 5. Gastos y margen | Gastos anualizados, margen sobre el coste y facturación mensual coherente (33.000 → 2.750 €/mes) |
| 6. Robustez | Objeto vacío, texto no numérico, negativos y valores absurdos: nunca `NaN`, días limitados a 7/semana y mínimo 1 día trabajado |
| 7. Cotización | Colchón de riesgo (40 h + 20% = 48 h), descuento comercial, tarifa efectiva y división por cero controlada |
| 8. Comparador | Tarifa actual vs mínima: diferencia por hora y al año, veredicto (`baja`/`justa`/`buena`) con tolerancia del 2% y sin `NaN` |
| 9. Formato | Formato de dinero es-ES (`1.234,50`), símbolo de moneda y `NaN → 0,00` |

## Salida real (última ejecución)

```
== Calculadora de tarifas freelance: verificacion ==

[1] Caso base (sin impuestos, sin margen, 100% facturable)
  OK   260 dias trabajados (5 x 52)
  OK   2080 horas facturables
  OK   coste anual = 24000
  OK   tarifa/hora = 11.54
  OK   tarifa/dia = tarifa/hora x 8
  OK   sin impuestos el bruto = coste

[2] Vacaciones y festivos
  OK   35 dias libres descontados
  OK   225 dias trabajados
  OK   menos dias => tarifa mayor
  OK   mismo coste anual

[3] Utilizacion al 50%
  OK   horas facturables = la mitad
  OK   tarifa = el doble

[4] Impuestos al 20%
  OK   bruto necesario = 30000
  OK   impuestos anuales = 6000
  OK   bruto - impuestos = coste

[5] Gastos fijos y margen
  OK   gastos anuales = 6000
  OK   coste anual = 30000
  OK   margen anual = 3000
  OK   bruto = 33000
  OK   facturacion mensual = 2750

[6] Robustez con entradas invalidas
  OK   sin datos no da NaN
  OK   sin datos la tarifa es 0
  OK   valores absurdos siguen dando numero finito
  OK   dias por semana se limita a 7
  OK   al menos 1 dia trabajado
  OK   texto no numerico se ignora (gastos=0)

[7] Cotizacion de proyecto
  OK   40h + 20% riesgo = 48h
  OK   48h x 50 = 2400
  OK   tarifa efectiva sube con riesgo
  OK   descuento 10% sobre 2000 = 200
  OK   total con descuento = 1800
  OK   descuento baja la tarifa efectiva a 45
  OK   0 horas no divide por cero

[8] Comparacion con lo que cobras hoy
  OK   diferencia por hora = -10
  OK   pierde 10000 al ano
  OK   veredicto: baja
  OK   gana 15000 extra al ano
  OK   veredicto: buena
  OK   veredicto: justa (tolerancia 2%)
  OK   ingreso anual actual = 40000
  OK   comparador sin datos no da NaN

[9] Formato de dinero (es-ES)
  OK   1234.5 -> 1.234,50
  OK   con simbolo
  OK   NaN -> 0,00

-----------------------------------------
Pruebas pasadas: 44 | fallidas: 0
RESULTADO: TODO OK
```

Código de salida: `0`. Copia literal de la ejecución en `ui_shots/salida_check.txt`.

## Verificación visual

La interfaz se capturó con Edge en modo headless y perfil aislado:

- `ui_shots/iter_1.png` — primera versión.
- `ui_shots/iter_1b_corregida.png` — tras la crítica visual: corte de color limpio entre
  cabecera y tarjetas, y campos de una misma fila alineados aunque la etiqueta ocupe dos
  líneas.
- `ui_shots/iter_2.png` — versión actual: el botón «Calcular mi tarifa» ya cabe en una
  sola línea (`white-space: nowrap` + reparto flex 2:1) y la columna derecha ya no queda
  vacía: se rellenó con el comparador «¿Y lo que cobras hoy?».
- `ui_shots/iter_3_live.png` — captura del **sitio publicado**
  (https://agc-calculadora-tarifas-freelance.pages.dev): confirma que el despliegue sirve
  bien el CSS y ambos scripts (la tarifa aparece calculada, 41,63 €/h).

## Comprobación del despliegue

```
/                200
/styles.css      200
/app.js          200
/src/tarifas.js  200
```

Comprobado en la captura que los números de pantalla cuadran con el motor:
24.000 + 4.800 + 4.320 + 11.040 = **44.160 €** a facturar al año → **41,63 €/h** con 1.060,8
horas facturables; el proyecto de 40 h con 20% de colchón sale a 1.998,24 €.
