# Self test — Formateador JSON

Ejecuta la prueba automática con:

```bash
node check.js
```

El script termina con **código de salida 0** si todo pasa, o **1** si algo falla.
No necesita navegador: importa las funciones puras de `script.js`
(`formatear`, `minificar`, `resaltar`) y las verifica directamente en Node.

## Qué se prueba

1. **Formatear añade estructura**
   - El resultado contiene saltos de línea.
   - Usa 2 espacios de sangría por defecto.
   - Los datos se conservan (round-trip: `parse` → `stringify` idéntico).

2. **Opciones de sangría**
   - Sangría de 4 espacios.
   - Sangría con tabulación (`\t`).

3. **Minificar**
   - Elimina espacios y saltos de línea, dejando el JSON más compacto válido.

4. **Validación de errores**
   - Un JSON inválido lanza una excepción (que la UI convierte en mensaje de error).

5. **Tipos de datos variados**
   - Strings, números negativos y decimales, booleanos, `null`, arrays y objetos
     anidados sobreviven al round-trip sin perder información.

6. **Resaltado de sintaxis**
   - Marca claves (`syn-clave`), strings (`syn-string`), números (`syn-numero`),
     booleanos (`syn-bool`) y `null` (`syn-null`) con sus clases CSS.

7. **Seguridad del resaltado**
   - El HTML se escapa antes de resaltar: `<script>` se convierte en
     `&lt;script&gt;`, evitando inyección de HTML/JS.

## Resultado esperado

```
Pasados: 14  |  Fallidos: 0
RESULTADO: TODO OK
```
