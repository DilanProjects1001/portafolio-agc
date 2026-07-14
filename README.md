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
| [AgcDocQA](https://github.com/DilanProjects1001/agc-docqa) | Preguntas y respuestas sobre documentos con IA: pega un texto y hazle preguntas; la IA responde usando solo ese contexto (OpenAI gpt-4o-mini con respaldo a Workers AI) ([Demo en vivo](https://agc-docqa.pages.dev)) | Cloudflare Pages + Workers AI | 13/07/2026 |
| [InformeIA](https://github.com/DilanProjects1001/agc-informe-ia) | Generador de informes profesionales con IA: convierte notas en un informe estructurado (acta, estado de proyecto, propuesta...) y guarda el historial en base de datos ([Demo en vivo](https://agc-informe-ia.pages.dev)) | Cloudflare Worker + Workers AI + D1 + Pages | 13/07/2026 |
| [agc-agente-flujo](https://github.com/DilanProjects1001/agc-agente-flujo) | Orquestador visual de flujos de agente (n8n/Make en código): nodos Entrada/Clasificar/Agente/Salida con memoria/contexto entre pasos, nodo Agente (ReAct + tool-use), editor de nodos, guardado automático y export/import del flujo como JSON ([Demo en vivo](https://agc-agente-flujo.pages.dev)) | HTML/CSS/JS + Cloudflare Pages | 13/07/2026 |

### Lote guiado por empleos reales de IA (13/07/2026)

Proyectos generados por 3 agentes en paralelo, cada uno partiendo de lo que **piden los empleos reales de IA/automatización** (agentes con tool-use, RAG sobre documentos, apps con LLM, herramientas full-stack). Cada proyecto es un repo público propio; casi todos con demo en vivo.

| Proyecto | Descripción | Tecnología | Demo |
|----------|-------------|------------|------|
| [agc-agente-soporte](https://github.com/DilanProjects1001/agc-agente-soporte) | Agente de soporte al cliente con RAG + tool-use, responde desde una base privada | Cloudflare Pages + LLM | [vivo](https://agc-agente-soporte.pages.dev) |
| [agc-agente-flujo](https://github.com/DilanProjects1001/agc-agente-flujo) | Orquestador visual de flujos de agente (nodos encadenados, estilo n8n) | Cloudflare Pages + LLM | [vivo](https://agc-agente-flujo.pages.dev) |
| [agc-simulador-agente](https://github.com/DilanProjects1001/agc-simulador-agente) | Simulador de agente de IA con tool-use: muestra el razonamiento paso a paso | Cloudflare Pages + LLM | [vivo](https://agc-simulador-agente.pages.dev) |
| [agc-support-hub](https://github.com/DilanProjects1001/agc-support-hub) | Hub de automatización de soporte: recibe webhooks de canales y responde con IA | Cloudflare Pages + LLM | [vivo](https://agc-support-hub.pages.dev) |
| [agc-triage-correos](https://github.com/DilanProjects1001/agc-triage-correos) | Clasificador y triage de correos con IA (prioridad, intención, ruteo) | Cloudflare Pages + LLM | [vivo](https://agc-triage-correos.pages.dev) |
| [agc-bandeja-ia](https://github.com/DilanProjects1001/agc-bandeja-ia) | Agente de bandeja de entrada: clasifica un lote de mensajes por tipo/urgencia | Cloudflare Pages + LLM | — |
| [agc-consultor-docs-ia](https://github.com/DilanProjects1001/agc-consultor-docs-ia) | Consultor de documentos: preguntas en lenguaje natural sobre docs de negocio (RAG) | Cloudflare Pages + LLM | [vivo](https://agc-consultor-docs-ia.pages.dev) |
| [agc-documente-ia](https://github.com/DilanProjects1001/agc-documente-ia) | Asistente RAG de documentos: búsqueda semántica en JS puro + Workers | Cloudflare Pages + Workers | [vivo](https://agc-documente-ia.pages.dev) |
| [agc-docqa](https://github.com/DilanProjects1001/agc-docqa) | AgcDocQA: pregunta a tu documento con IA (Q&A sobre archivos) | Cloudflare Pages + LLM | [vivo](https://agc-docqa.pages.dev) |
| [agc-rag-document-qa](https://github.com/DilanProjects1001/agc-rag-document-qa) | RAG · Preguntas sobre documentos: subes/pegas un doc y preguntas | Cloudflare Pages + LLM | — |
| [agc-chatbot-faq](https://github.com/DilanProjects1001/agc-chatbot-faq) | Chatbot de soporte con base de conocimiento (FAQ) | Cloudflare Pages + LLM | [vivo](https://agc-chatbot-faq.pages.dev) |
| [agc-analizador-opiniones](https://github.com/DilanProjects1001/agc-analizador-opiniones) | Analizador de opiniones de clientes con IA (sentimiento, temas) | Cloudflare Pages + LLM | [vivo](https://agc-analizador-opiniones.pages.dev) |
| [agc-radar-opiniones](https://github.com/DilanProjects1001/agc-radar-opiniones) | Radar de opiniones IA: panel de sentimiento y temas | Cloudflare Pages + LLM | [vivo](https://agc-radar-opiniones.pages.dev) |
| [agc-analista-datos](https://github.com/DilanProjects1001/agc-analista-datos) | Analista de datos IA: preguntas en lenguaje natural → SQL (texto a SQL) | Cloudflare Pages + LLM | [vivo](https://agc-analista-datos.pages.dev) |
| [agc-limpiador-datos](https://github.com/DilanProjects1001/agc-limpiador-datos) | Limpiador de datos IA (ETL): normaliza y depura datasets | Cloudflare Pages + LLM | [vivo](https://agc-limpiador-datos.pages.dev) |
| [agc-datosclaros](https://github.com/DilanProjects1001/agc-datosclaros) | DatosClaros IA: limpieza y clarificación de datos | Cloudflare Pages + LLM | [vivo](https://agc-datosclaros.pages.dev) |
| [agc-resumen-reuniones](https://github.com/DilanProjects1001/agc-resumen-reuniones) | Resumen de reuniones IA (transcripción → puntos clave y acciones) | Cloudflare Pages + LLM | [vivo](https://agc-resumen-reuniones.pages.dev) |
| [agc-extractor-docs](https://github.com/DilanProjects1001/agc-extractor-docs) | Extractor de facturas con IA: del texto de una factura a datos estructurados | Cloudflare Pages + LLM | [vivo](https://agc-extractor-docs.pages.dev) |
| [agc-invoice-extractor](https://github.com/DilanProjects1001/agc-invoice-extractor) | Extractor de facturas (invoice → JSON estructurado) | Cloudflare Pages + LLM | [vivo](https://agc-invoice-extractor.pages.dev) |
| [agc-informe-ia](https://github.com/DilanProjects1001/agc-informe-ia) | InformeIA: generador de informes profesionales con IA | Cloudflare Pages + LLM | [vivo](https://agc-informe-ia.pages.dev) |
| [agc-flujoia](https://github.com/DilanProjects1001/agc-flujoia) | FlujoIA: constructor de automatizaciones con IA | Cloudflare Pages + LLM | [vivo](https://agc-flujoia.pages.dev) |

---

## English

This repository builds **itself**: every day an AI agent invents, builds, and publishes
a small, useful, well-documented project here — no human intervention. Each folder is a
standalone project with its own README, code, and verification.

_Generated autonomously by [OpenGravity](https://github.com/) + Claude._
