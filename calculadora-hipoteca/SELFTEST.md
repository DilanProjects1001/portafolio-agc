# SELFTEST — Calculadora de hipoteca

Verificación automática del motor de cálculo, sin navegador y sin dependencias externas.

```bash
node check.js     # devuelve exit 0 si todo pasa, 1 si algo falla
```

`check.js` hace `require('./script.js')`, es decir, prueba **exactamente el mismo código
que ejecuta la interfaz**, no una copia. Esto es posible porque `script.js` exporta el
motor con `module.exports` en Node y con `window.Hipoteca` en el navegador, y se salta
todo el cableado del DOM cuando no existe `document`.

## Qué se prueba (45 comprobaciones, 7 grupos)

| Grupo | Qué comprueba |
|-------|----------------|
| 1. Caso conocido A | 200.000 € al 6% a 30 años → cuota **1.199,10 €** (referencia clásica de manual). Además: 360 pagos, primer mes = 1.000 € de interés + 199,10 € de capital, saldo final 0, intereses totales 231.676,38 € y total pagado 431.676,38 € |
| 2. Caso conocido B | 150.000 € al 4,5% a 15 años → cuota **1.147,49 €**, 180 pagos, primer mes 562,50 € de interés, saldo final 0 |
| 3. Coherencia de la tabla | La suma de la columna de capital = el préstamo exacto; suma de intereses = `interesTotal`; en **cada** fila capital + interés = cuota; el saldo baja todos los meses; el interés del mes = saldo previo × tasa mensual; el mes 1 paga más interés que capital y el mes 360 al revés; los acumulados cuadran al final |
| 4. Préstamo al 0% | Caso límite que indetermina la fórmula (0/0): se reparte el capital a partes iguales. 120.000 € a 10 años → 1.000 €/mes, 0 € de intereses, total pagado = capital |
| 5. Relaciones lógicas | Menos plazo ⇒ cuota más alta pero menos intereses; más tasa ⇒ cuota más alta; el doble de monto ⇒ el doble de cuota (la fórmula es lineal en P); total pagado > monto prestado; coste por euro ≈ 1,158 |
| 6. Robustez | Monto 0, plazo 0, monto negativo y texto no numérico ⇒ cuota 0 (nunca `NaN` ni división por cero); objeto vacío ⇒ tabla vacía; acepta números como texto y con **coma decimal** (`'5,5'` se lee como 5,5%) |
| 7. Formato | Formato de dinero es-ES (`1.199,10`), separador de millares (`1.234.567,89`), símbolo de moneda, `NaN → 0,00` y conservación del signo negativo |

### Por qué el grupo 3 importa

Es la prueba que detecta el error típico de estas calculadoras: arrastrar la cuota teórica
360 veces deja unos céntimos de resto y la tabla no cierra en cero. `script.js` salda el
último mes contra el saldo real pendiente, y el test lo confirma comprobando que la suma
de la columna de capital es exactamente el monto prestado.

## Salida real (última ejecución)

```
== Calculadora de hipoteca: verificacion del motor ==

[1] Caso conocido: 200000, 6% anual, 30 anios
      cuota calculada = 1199.101050
  OK    pago mensual = 1199.10
  OK    360 pagos en la tabla
  OK    primer mes: interes = 1000.00
  OK    primer mes: capital = 199.10
  OK    saldo final = 0
  OK    intereses totales ~ 231676
  OK    total pagado ~ 431676
      intereses totales = 231676.38 | total pagado = 431676.38

[2] Caso conocido: 150000, 4.5% anual, 15 anios
      cuota calculada = 1147.489933
  OK    pago mensual = 1147.49
  OK    180 pagos en la tabla
  OK    primer mes: interes = 562.50
  OK    saldo final = 0
      intereses totales = 56548.19

[3] Coherencia de la tabla de amortizacion
  OK    suma de capital = monto prestado
  OK    suma de intereses = interesTotal
  OK    capital + intereses = total pagado
  OK    en cada fila capital + interes = cuota
  OK    el saldo baja todos los meses
  OK    interes del mes = saldo previo x tasa mensual
  OK    mes 1: se paga mas interes que capital
  OK    mes 360: se paga mas capital que interes
  OK    acumulados coherentes al final

[4] Prestamo sin intereses (0%)
  OK    cuota = monto / meses = 1000
  OK    sin intereses el interes total es 0
  OK    total pagado = monto prestado
  OK    saldo final = 0

[5] Relaciones logicas
  OK    menos plazo => cuota mas alta
  OK    menos plazo => menos intereses
  OK    mas tasa => cuota mas alta
  OK    doble monto => doble cuota (es lineal)
  OK    total pagado > monto prestado
  OK    coste por euro prestado ~ 1.158

[6] Robustez con entradas invalidas
  OK    monto 0 => cuota 0
  OK    plazo 0 => cuota 0
  OK    monto negativo => cuota 0
  OK    texto no numerico => cuota 0
  OK    tabla vacia si el monto es 0
  OK    sin datos no da NaN
  OK    sin datos la tabla esta vacia
  OK    sin datos no divide por cero en costePorEuro
  OK    acepta numeros como texto y coma decimal
  OK    coma decimal se lee como 5.5%

[7] Formato de dinero (es-ES)
  OK    1199.1 -> 1.199,10
  OK    con simbolo
  OK    millones con separadores
  OK    NaN -> 0,00
  OK    negativo conserva el signo

-----------------------------------------
Pruebas pasadas: 45 | fallidas: 0
RESULTADO: TODO OK
```

Código de salida: `0`. Copia literal de la ejecución en `ui_shots/salida_check.txt`.

## Verificación visual

La interfaz se capturó con Edge en modo headless y perfil aislado dentro del proyecto
(`_edge_profile/`, ignorado por git), sin abrir ninguna ventana:

- `ui_shots/iter_1.png` — la app abierta con el ejemplo precargado (200.000 € / 6% / 30
  años). Se ven el formulario, el resumen con **1.199,10 €** en grande, la barra 46%
  capital / 54% intereses, el gráfico de saldo con los ejes etiquetados y las dos curvas
  cruzándose alrededor del año 14, y la tabla de amortización con cabecera fija.

**Los números de la pantalla cuadran con el motor:** la captura muestra en el mes 1
capital 199,10 € / interés 1.000,00 € / saldo 199.800,90 €, que es exactamente lo que
afirman las comprobaciones del grupo 1.

Correcciones aplicadas tras mirar la captura: se cambió la frase del coste por euro, que
mezclaba el símbolo de moneda de forma incoherente (`Por cada €1 prestado pagas € 1,16`),
por `Por cada 1 € prestado devuelves 1,16 € solo en intereses`.

## Lo que NO cubre este autotest

- El renderizado del `<canvas>` (el gráfico se valida a ojo con la captura, no por código).
- Interacción real del usuario en el navegador: eventos, recálculo al escribir y cambio
  de moneda se comprobaron manualmente en la captura, no de forma automatizada.
- El motor no modela seguros, comisiones, carencia ni revisiones de tipo variable: la app
  es de cuota fija (sistema francés) y así se advierte en la interfaz y en el README.
