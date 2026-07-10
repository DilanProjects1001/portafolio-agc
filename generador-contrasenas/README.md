# 🔐 Generador de Contraseñas Seguras

Aplicación web sencilla y autocontenida para crear contraseñas aleatorias y
seguras directamente en tu navegador. **Nada se envía a internet**: toda la
generación ocurre en tu propio equipo.

## ✨ ¿Qué hace?

- Genera contraseñas aleatorias con la longitud que elijas (de 4 a 64 caracteres).
- Te deja elegir qué incluir: mayúsculas, minúsculas, números y símbolos.
- Muestra una **barra de seguridad** que indica qué tan fuerte es la contraseña.
- Botón para **copiar** la contraseña al portapapeles con un clic.

## 🚀 Cómo abrirla

No necesitas instalar nada:

1. Descarga o clona esta carpeta.
2. Haz doble clic en el archivo **`index.html`**.
3. ¡Listo! Se abrirá en tu navegador y ya puedes generar contraseñas.

## 🧑‍💻 Cómo usarla

1. Ajusta la **longitud** con el deslizador.
2. Marca las casillas de los tipos de caracteres que quieras incluir.
3. Pulsa **«Generar contraseña»**.
4. Copia el resultado con el botón **«Copiar»**.

## ✅ Cómo verificar que funciona (pruebas)

El proyecto incluye pruebas automáticas que no necesitan navegador. Con
[Node.js](https://nodejs.org) instalado, ejecuta desde esta carpeta:

```bash
node check.js
```

Si todo está bien, verás el mensaje **«✅ TODAS LAS PRUEBAS PASARON»** y el
script terminará con código de salida `0`.

## 📁 Estructura del proyecto

```
generador-contrasenas/
├── index.html      → Estructura de la interfaz
├── style.css       → Estilos (colores, botones, diseño)
├── script.js       → Lógica de generación (usable en navegador y Node.js)
├── check.js        → Pruebas automáticas (node check.js)
├── ui_shots/       → Carpeta para capturas de pantalla
└── README.md       → Este archivo
```

## 💰 Ángulo de monetización

Este generador puede ofrecerse como herramienta gratuita que atrae tráfico y
funcionar como puerta de entrada a un **gestor de contraseñas premium** (guardado
cifrado, sincronización entre dispositivos, autocompletado). También encaja como
widget integrable de marca blanca para bancos, VPNs o servicios de ciberseguridad
que quieran ofrecer esta utilidad a sus clientes.

---

Proyecto de portafolio hecho con **HTML, CSS y JavaScript puros**, sin librerías
ni dependencias externas.
