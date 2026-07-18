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
| [generador-firmas-email](generador-firmas-email/) | Herramienta web para generar firmas de correo profesionales en español ([Demo en vivo](https://agc-firmas-email.pages.dev)) | HTML/CSS/JS | 14/07/2026 |
| [verificador-enlaces](./verificador-enlaces) | Herramienta web para comprobar enlaces rotos en una página | HTML, CSS, JS, Node.js | 15/07/2026 |
| [contador-palabras](contador-palabras/) | Contador de palabras, caracteres, frases, párrafos y ranking de palabras más frecuentes, 100% offline en el navegador ([Demo en vivo](https://agc-contador-palabras.pages.dev)) | HTML/CSS/JS | 16/07/2026 |
| [tip-calculator](tip-calculator/) | Calculadora de propinas: calcula propina, total y pago por persona, 100% offline en el navegador | HTML/CSS/JS | 17/07/2026 |
| [gestor-presupuesto](gestor-presupuesto/) | Gestor de presupuesto mensual: agrega gastos y ve el total y el restante en tiempo real, 100% offline en el navegador | HTML/CSS/JS | 18/07/2026 |

### Lote guiado por empleos reales de IA (13/07/2026)

Proyectos generados por 3 agentes en paralelo, cada uno partiendo de lo que **piden los empleos reales de IA/automatización** (agentes con tool-use, RAG sobre documentos, apps con LLM, herramientas full-stack). Cada proyecto es un repo público propio; casi todos con demo en vivo.

| Proyecto | Descripción | Tecnología | Demo |
|----------|-------------|------------|------|
| [agc-agente-soporte](https://github.com/DilanProjects1001/agc-agente-soporte) | Agente de soporte al cliente con RAG + tool-use, responde desde una base privada | Cloudflare Pages + LLM | [vivo](https://agc-agente-soporte.pages.dev) |
| [agc-agente-flujo](https://github.com/DilanProjects1001/agc-agente-flujo) | Orquestador visual de flujos (n8n/Make en código): nodos Entrada/Clasificar/Agente/Salida con memoria entre pasos, nodo Agente ReAct + tool-use, editor de nodos y export/import del flujo como JSON | HTML/CSS/JS + Cloudflare Pages | [vivo](https://agc-agente-flujo.pages.dev) |
| [agc-simulador-agente](https://github.com/DilanProjects1001/agc-simulador-agente) | Simulador de agente de IA con tool-use: muestra el razonamiento paso a paso | Cloudflare Pages + LLM | [vivo](https://agc-simulador-agente.pages.dev) |
| [agc-support-hub](https://github.com/DilanProjects1001/agc-support-hub) | Hub de automatización de soporte: recibe webhooks de canales y responde con IA | Cloudflare Pages + LLM | [vivo](https://agc-support-hub.pages.dev) |
| [agc-triage-correos](https://github.com/DilanProjects1001/agc-triage-correos) | Clasificador y triage de correos con IA (prioridad, intención, ruteo) | Cloudflare Pages + LLM | [vivo](https://agc-triage-correos.pages.dev) |
| [agc-bandeja-ia](https://github.com/DilanProjects1001/agc-bandeja-ia) | Agente de bandeja de entrada: clasifica un lote de mensajes por tipo/urgencia | Cloudflare Pages + LLM | — |
| [agc-docqa](https://github.com/DilanProjects1001/agc-docqa) | AgcDocQA: Q&A sobre documentos — pega un texto y pregunta; responde usando solo ese contexto (gpt-4o-mini con respaldo a Workers AI) | Cloudflare Pages + Workers AI | [vivo](https://agc-docqa.pages.dev) |
| [agc-chatbot-faq](https://github.com/DilanProjects1001/agc-chatbot-faq) | Chatbot de soporte con base de conocimiento (FAQ) | Cloudflare Pages + LLM | [vivo](https://agc-chatbot-faq.pages.dev) |
| [agc-radar-opiniones](https://github.com/DilanProjects1001/agc-radar-opiniones) | Radar de opiniones IA: panel de sentimiento y temas de reseñas de clientes | Cloudflare Pages + LLM | [vivo](https://agc-radar-opiniones.pages.dev) |
| [agc-analista-datos](https://github.com/DilanProjects1001/agc-analista-datos) | Analista de datos IA: preguntas en lenguaje natural → SQL (texto a SQL) | Cloudflare Pages + LLM | [vivo](https://agc-analista-datos.pages.dev) |
| [agc-limpiador-datos](https://github.com/DilanProjects1001/agc-limpiador-datos) | Limpiador de datos IA (ETL): normaliza y depura datasets | Cloudflare Pages + LLM | [vivo](https://agc-limpiador-datos.pages.dev) |
| [agc-datosclaros](https://github.com/DilanProjects1001/agc-datosclaros) | DatosClaros IA: extractor de texto libre a tabla con esquema configurable — motor local (regex) + motor IA (Workers AI), export CSV/JSON y guardado en D1 | Cloudflare Pages + Workers AI + D1 | [vivo](https://agc-datosclaros.pages.dev) |
| [agc-resumen-reuniones](https://github.com/DilanProjects1001/agc-resumen-reuniones) | Resumen de reuniones IA (transcripción → puntos clave y acciones) | Cloudflare Pages + LLM | [vivo](https://agc-resumen-reuniones.pages.dev) |
| [agc-invoice-extractor](https://github.com/DilanProjects1001/agc-invoice-extractor) | Extractor de facturas con IA (invoice → JSON estructurado) | Cloudflare Pages + LLM | [vivo](https://agc-invoice-extractor.pages.dev) |
| [agc-informe-ia](https://github.com/DilanProjects1001/agc-informe-ia) | InformeIA: notas → informe estructurado (acta, propuesta...) con historial en D1 | Cloudflare Worker + Workers AI + D1 | [vivo](https://agc-informe-ia.pages.dev) |

---

## English

This repository builds **itself**: every day an AI agent invents, builds, and publishes
a small, useful, well-documented project here — no human intervention. Each folder is a
standalone project with its own README, code, and verification.

_Generated autonomously by [OpenGravity](https://github.com/) + Claude._
