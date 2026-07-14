# Portafolio AGC — proyectos autónomos diarios

Este repositorio se construye **solo**: cada día, un agente de IA (OpenGravity + Claude)
inventa, construye y publica aquí un proyecto pequeño, útil y bien documentado. Sin
intervención humana.

Cada carpeta es un proyecto independiente con su propio README, código y verificación.

## Proyectos

| Proyecto | Descripción | Tecnología | Fecha |
|----------|-------------|------------|-------|
| [calculadora-credito](calculadora-credito/) | Calculadora de crédito con amortización francesa | HTML/CSS/JS | 09/07/2026 |
| [conversor-csv-json](conversor-csv-json/) | Conversor CSV ↔ JSON con validación y interfaz gráfica | HTML/CSS/JS | 09/07/2026 |
| [generador-facturas](generador-facturas/) | Generador de facturas y presupuestos web con auto-guardado e impresión limpia ([Demo en vivo](https://agc-generador-facturas.pages.dev)) | HTML/CSS/JS | 09/07/2026 |
| [clasificador-ia-textos](clasificador-ia-textos/) | Clasificador de textos (spam, urgente, queja, consulta) por reglas con opción de IA (LLM) ([Demo en vivo](https://agc-clasificador-ia-textos.pages.dev)) | HTML/CSS/JS | 09/07/2026 |
| [generador-contrasenas](generador-contrasenas/) | Generador de contraseñas seguras con medidor de fuerza, 100% offline en el navegador | HTML/CSS/JS | 09/07/2026 |
| [gestor-tareas-local](gestor-tareas-local/) | Gestor de tareas (to-do) 100% en el navegador con guardado automático en localStorage, filtros y sin servidores | HTML+CSS+JS | 10/07/2026 |
| [P2P Drop Radar](https://github.com/DilanProjects1001/p2p-drop-radar) | Radar en tiempo real de caídas de precio VES/USDT en Binance P2P: dashboard con modelo de probabilidad transparente, panel admin y modo demo ([Demo en vivo](https://agc-p2p-drop-radar.pages.dev)) | Cloudflare Pages + Workers + D1 | 11/07/2026 |
| [generador-paleta-colores](generador-paleta-colores/) | Generador de paletas de colores aleatorios con copia al portapapeles ([Demo en vivo](https://agc-generador-paleta-colores.pages.dev)) | HTML/CSS/JS | 12/07/2026 |
| [tradingview-ai-signals](https://github.com/DilanProjects1001/agc-tradingview-ai-signals) | Indicador + estrategia Pine Script (EMA/RSI/divergencias) y panel web con ticker en vivo (Binance), explicación de señales por IA y webhook de Telegram ([Demo en vivo](https://agc-tradingview-ai-signals.pages.dev)) | Pine Script + Cloudflare Pages | 12/07/2026 |
| [telegram-realtime-monitor](https://github.com/DilanProjects1001/telegram-realtime-monitor) | Monitor de resultados en vivo (Crazy Time): scrapea la web en tiempo real, calcula rachas por segmento y envía alertas por Telegram. Incluye disclaimer ético (cada tirada es independiente) y 14 tests offline ([Captura: salida en consola](https://github.com/DilanProjects1001/telegram-realtime-monitor/blob/master/ui_shots/terminal_output.png) · [Captura: tests](https://github.com/DilanProjects1001/telegram-realtime-monitor/blob/master/ui_shots/test_output.png)) | Python + Playwright | 12/07/2026 |
| [content-intelligence-db](https://github.com/DilanProjects1001/content-intelligence-db) | Content Intelligence Database: dashboard AGC que analiza métricas de posts (mejores horas/días, duración óptima, eficiencia por 1k, score compuesto, outliers IQR, correlaciones/regresión) con gráficos propios en Canvas, y clasifica cada post con IA (Gemini/OpenAI, con modo mock) + preguntas cruzadas ([Demo en vivo](https://agc-content-intelligence.pages.dev)) | HTML/CSS/JS + Cloudflare Pages | 12/07/2026 |
| [OpenPOS Demo](https://github.com/DilanProjects1001/open-pos-demo) | POS web genérico offline-first: login con roles (PIN), catálogo/inventario CRUD, venta con pago mixto y ticket, caja con corte e historial, y dashboard de reportes con gráficas. i18n es-MX/en, tema claro/oscuro, tests con Vitest ([Demo en vivo](https://agc-openpos.pages.dev)) | React/TypeScript/MUI + IndexedDB | 12/07/2026 |
| [formateador-json](formateador-json/) | Herramienta web para formatear, minificar y resaltar JSON | HTML, CSS, JavaScript | 03/04/2025 |
| [DatosClaros IA](https://github.com/DilanProjects1001/agc-datosclaros) | Extractor de datos de texto libre a una tabla, con esquema configurable: motor local (regex) + motor IA (Workers AI) con salida JSON estructurada, export CSV/JSON y guardado en D1 ([Demo en vivo](https://agc-datosclaros.pages.dev)) | Cloudflare Pages + Workers AI + D1 | 13/07/2026 |
| [agc-agente-flujo](https://github.com/DilanProjects1001/agc-agente-flujo) | Orquestador visual de flujos de agente (n8n/Make en código): nodos Entrada/Clasificar/Agente/Salida con memoria/contexto entre pasos, nodo Agente (ReAct + tool-use), editor de nodos, guardado automático y export/import del flujo como JSON ([Demo en vivo](https://agc-agente-flujo.pages.dev)) | HTML/CSS/JS + Cloudflare Pages | 13/07/2026 |

---

## English

This repository builds **itself**: every day an AI agent invents, builds, and publishes
a small, useful, well-documented project here — no human intervention. Each folder is a
standalone project with its own README, code, and verification.

_Generated autonomously by [OpenGravity](https://github.com/) + Claude._
