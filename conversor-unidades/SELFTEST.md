# SELFTEST — Conversor de Unidades

Documento de verificación del proyecto: **qué se probó, cómo se probó y qué salió**.

- **Fecha de ejecución:** 2026-07-28
- **Entorno:** Node.js v24.13.1 en Windows 11
- **Dependencias externas:** ninguna (no hace falta `npm install`)
- **Resultado:** ✅ **38 de 38 pruebas pasadas — código de salida 0**

## Comando usado

```bash
cd conversor-unidades
node test.js
```

## Qué se prueba

Las pruebas atacan directamente `conversiones.js`, que es **el mismo archivo que carga
la página web**. No hay una copia distinta para los tests: si las pruebas pasan, la
lógica que usa el usuario en el navegador es exactamente la que se validó.

| Bloque | Pruebas | Qué comprueba |
|--------|---------|---------------|
| Longitud | 8 | Conversiones entre m, cm, mm, km, in, ft, yd, mi (incluye el caso "misma unidad") |
| Peso | 5 | Conversiones entre kg, g, lb, oz |
| Temperatura | 8 | Celsius ↔ Fahrenheit ↔ Kelvin, incluido el punto de cruce −40 °C = −40 °F |
| Volumen | 6 | Conversiones entre L, mL, gal, qt, pt, cup |
| Ida y vuelta | 3 | Convertir y volver a convertir devuelve el valor original (no se acumula error) |
| Formato de salida | 4 | Los números se muestran sin ceros sobrantes y con notación exponencial solo en valores extremos |
| Errores controlados | 4 | Categoría inexistente, unidad de origen/destino inválida y valor no numérico lanzan un error claro en lugar de devolver un resultado equivocado |
| **Total** | **38** | |

Los valores esperados son las equivalencias exactas del sistema internacional
(1 in = 0,0254 m; 1 lb = 0,45359237 kg; 1 gal EE.UU. = 3,785411784 L), con una
tolerancia de 1e-9 para absorber el redondeo propio de los números decimales del
ordenador.

## Salida real del comando

```text
=== LONGITUD ===
  OK   1 km -> m  ->  1000
  OK   100 cm -> m  ->  1
  OK   1 m -> mm  ->  1000
  OK   1 in -> cm  ->  2.54
  OK   1 ft -> in  ->  12.000000000000002
  OK   1 yd -> ft  ->  3
  OK   1 mi -> km  ->  1.609344
  OK   5 m -> m (misma unidad)  ->  5

=== PESO ===
  OK   1 kg -> g  ->  1000
  OK   1 lb -> kg  ->  0.45359237
  OK   1 kg -> lb  ->  2.2046226218487757
  OK   16 oz -> lb  ->  1
  OK   1 oz -> g  ->  28.349523125

=== TEMPERATURA ===
  OK   0 C -> F  ->  32
  OK   100 C -> F  ->  212
  OK   -40 C -> F  ->  -40
  OK   0 C -> K  ->  273.15
  OK   212 F -> C  ->  100
  OK   98.6 F -> C  ->  37
  OK   300 K -> C  ->  26.850000000000023
  OK   373.15 K -> F  ->  212

=== VOLUMEN ===
  OK   1 L -> mL  ->  1000
  OK   1 gal -> L  ->  3.785411784
  OK   1 gal -> qt  ->  4
  OK   1 qt -> pt  ->  2
  OK   1 pt -> cup  ->  2
  OK   1 cup -> mL  ->  236.5882365

=== IDA Y VUELTA (round-trip) ===
  OK   123.456 m -> mi -> m  ->  123.456
  OK   37 C -> F -> C  ->  37
  OK   2.5 gal -> mL -> gal  ->  2.5

=== FORMATO DE SALIDA ===
  OK   formatear(1000)  ->  "1000"
  OK   formatear(2.54)  ->  "2.54"
  OK   formatear(0.5)  ->  "0.5"
  OK   formatear(-0.0000001)  ->  "-1.0000e-7"

=== ERRORES CONTROLADOS ===
  OK   categoría inexistente  ->  error esperado: Categoría desconocida: distancia
  OK   unidad de origen inválida  ->  error esperado: Unidad de origen inválida: parsec
  OK   unidad de destino inválida  ->  error esperado: Unidad de destino inválida: parsec
  OK   valor no numérico  ->  error esperado: El valor debe ser un número válido.

--------------------------------------------
Resultado: 38 pruebas pasadas, 0 fallidas.
--------------------------------------------
```

Código de salida verificado: **0**.

> Nota sobre `1 ft -> in  ->  12.000000000000002`: no es un fallo. Es el redondeo normal
> de los decimales en cualquier computadora; la prueba lo acepta dentro de la tolerancia
> de 1e-9 y en pantalla el usuario ve **12**, porque la función `formatear()` recorta
> esos dígitos sobrantes.

## Verificación visual (no automatizada)

La interfaz se revisó a ojo en capturas tomadas con Edge en modo headless y perfil
aislado, guardadas en `ui_shots/`:

| Captura | Qué muestra |
|---------|-------------|
| `iter_1.png` | Primera versión. Se detectaron dos defectos: el texto "1 Metros (m) equivale a" (mal redactado) y las equivalencias rápidas fuera de pantalla. |
| `iter_2.png` | Versión corregida: "1 m equivale a → 3.28084 ft" con línea de detalle, y equivalencias visibles. |
| `iter_3.png` | La misma página ya publicada en Cloudflare Pages, confirmando que el sitio en vivo carga y calcula. |
| `iter_4.png` | Revisión final del sitio publicado. |

## Verificación del sitio publicado

```text
https://agc-conversor-unidades.pages.dev/                  status=200  bytes=12349
https://agc-conversor-unidades.pages.dev/conversiones.js   status=200  bytes=4911
<title>Conversor de Unidades — longitud, peso, temperatura y volumen</title>
```

En la captura del sitio en vivo se lee el resultado calculado (`1 m equivale a
3.28084 ft`) y la tabla de equivalencias. Ambos los genera JavaScript al cargar la
página, así que su presencia demuestra que el motor de conversión funciona en
producción y no solo en local.

## Qué NO se probó automáticamente

Con honestidad, para que quede claro el alcance:

- Los **clics reales** en la interfaz (cambiar de categoría, botón ⇄, botón Convertir)
  no están automatizados; se verificaron mirando las capturas y abriendo la página.
  La lógica que disparan esos botones sí está cubierta por las 38 pruebas.
- No hay pruebas en varios navegadores; el código usa JavaScript estándar sin
  funciones modernas exclusivas, por lo que funciona en cualquier navegador actual.
