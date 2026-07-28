# StoxAI / Glab

Sistema inteligente de gestión de laboratorio para el departamento de I+D de GEZE.

## 1. Descripción del proyecto

StoxAI (también referido como **Glab**) es la plataforma interna que centraliza la gestión operativa del laboratorio de I+D de GEZE. Cubre:

- **Gestión de stock**: productos, ubicaciones y niveles de inventario.
- **Equipos y calibraciones**: ficha de equipos de laboratorio y su historial de calibración.
- **Gestor de software**: inventario de software instalado/licenciado y su ubicación en servidor.
- **Bancos de ensayo**: fichas de banco con fotos y documentos asociados.
- **Setup guide**: guías de configuración paso a paso, con software y documentos vinculados.
- **Benchmarking activities (Kanban)**: tablero Kanban para planificar actividades de benchmarking.
- **Digital tools**: herramientas específicas embebidas (p. ej. calibración de galgas).
- **Bot de Telegram**: notificaciones y consultas rápidas contra el sistema.

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS estático (sin framework ni build step), servido desde `public/` |
| Hosting frontend | Netlify (`stox-ai-system.netlify.app`) |
| Backend "serverless" | Netlify Functions (proxy hacia n8n y glab-api) |
| Automatización / API principal | n8n (self-hosted, Docker) |
| API adicional | API Express propia (`glab-api`), gestionada con PM2 |
| Base de datos | PostgreSQL 15 (Docker) |
| Almacenamiento de archivos | MinIO (S3-compatible, Docker) |
| Bot | Telegram Bot API vía webhook de n8n |
| Red/acceso remoto | Tailscale (incluye Funnel para exponer servicios) |
| Servidor | Ubuntu con Docker |

## 2. Arquitectura del sistema

### Servidor

- SO: Ubuntu con Docker.
- IP local: `172.20.0.107`
- IP Tailscale: `100.86.121.107`

### Servicios Docker

| Servicio | Imagen | Puerto(s) | Notas |
|---|---|---|---|
| PostgreSQL | `postgres:15` | 5432 | DB `stock_db`, usuario `stock_user` (ver credenciales en documento del equipo) |
| n8n | `n8nio/n8n` | 5678 | Motor de workflows/API principal |
| MinIO | `minio/minio` | 9000 (API) / 9001 (consola) | Almacenamiento de fotos y documentos |

### API Express (glab-api)

- Ruta en servidor: `/home/server/glab-api/`
- Gestionado con **PM2**, puerto `3001`.
- Habla directo con PostgreSQL (sin pasar por n8n) para Kanban y Calibraciones de Galgas.
- Autenticación por API key (header `x-api-key`, ver credenciales en documento del equipo).

### Frontend

- Hosting: **Netlify** (`stox-ai-system.netlify.app`).
- Código fuente: GitHub, repo [`Roco-NextG/stoxai`](https://github.com/Roco-NextG/stoxai).

### Exposición vía Tailscale Funnel

| Servicio | Puerto Funnel | Path |
|---|---|---|
| n8n | 443 | `/` |
| MinIO | 8443 | `/` |
| glab-api | 443 | `/glab-api/` |

### URLs de acceso

| Recurso | URL | Notas |
|---|---|---|
| n8n | https://stockserver.tail78d0c3.ts.net | Editor de workflows |
| MinIO consola | http://172.20.0.107:9001 | Usuario/pass en documento del equipo |
| Dashboard producción | https://stox-ai-system.netlify.app | Frontend público |
| API Express | https://stockserver.tail78d0c3.ts.net/glab-api/ | Kanban y Calibraciones Galgas |

## 3. Configuración del entorno local

### Requisitos previos (Mac y Windows)

1. **Git** — https://git-scm.com/downloads
2. **Node.js** (LTS) — https://nodejs.org
3. **Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```
4. **Claude Code**:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

### Clonar el repositorio

```bash
git clone https://github.com/Roco-NextG/stoxai.git
cd stoxai
```

> Si el repo es privado y no tienes acceso SSH configurado, pide a Rommel que te dé acceso como colaborador en GitHub, o usa un Personal Access Token propio al clonar (`https://<tu-token>@github.com/Roco-NextG/stoxai.git`). No compartas tokens en el código ni en el README.

### Vincular con Netlify

```bash
netlify login
netlify link --name stox-ai-system
```

### Desarrollo local

```bash
netlify dev
```

Abre `http://localhost:8888`. Esto sirve `public/` y ejecuta las Netlify Functions localmente, que a su vez llaman a n8n/glab-api en el servidor remoto (no hay backend local).

### Deploy a producción

```bash
netlify deploy --prod
```

⚠️ Los créditos de build de Netlify son limitados — no hacer deploy hasta validar los cambios en local con `netlify dev`.

### Flujo de Git

```bash
git add .
git commit -m "descripcion del cambio"
git push origin main
```

## 4. Estructura del proyecto

```
stoxai/
├── public/
│   ├── index.html                     # Dashboard principal (todo el frontend)
│   └── tools/
│       └── calibracion-galgas.html    # Digital tool: calibración de galgas
├── netlify/
│   └── functions/                     # Proxy functions hacia n8n y glab-api
│       ├── api-stock.js, api-add-stock.js, api-edit-stock.js, ...
│       ├── api-equipos*.js, api-calibrar-equipo.js
│       ├── api-software*.js
│       ├── api-bancos*.js, api-*-foto-banco.js, api-*-documento-banco.js
│       ├── api-setups*.js, api-pasos*.js, api-setup-software*.js
│       ├── api-kanban-*.js
│       ├── api-calibraciones-galgas*.js
│       └── telegram.js                # Webhook del bot de Telegram
├── netlify.toml                       # Redirects (/api/... -> función) y config de build
└── README.md
```

Cada Netlify Function es un proxy delgado: recibe la petición del frontend y hace `fetch` a un webhook de n8n (`https://stockserver.tail78d0c3.ts.net/webhook/...`) o a glab-api, devolviendo la respuesta con headers CORS.

## 5. Cómo trabajar con Claude Code

### Instalación e inicio

```bash
npm install -g @anthropic-ai/claude-code
cd stoxai
claude
```

### Cómo dar prompts efectivos

- Sé específico: menciona el **archivo** exacto.
- Describe el **comportamiento actual** y el **comportamiento deseado**.
- Si tocas una función concreta, nómbrala.

**Ejemplos de buenos prompts:**

- "En `public/index.html`, en la función `renderBancosGrid()`, añade un badge de estado (Operativo/Mantenimiento) en cada card de banco."
- "Crea una Netlify Function en `netlify/functions/api-status-banco.js` que haga POST a `https://stockserver.tail78d0c3.ts.net/glab-api/api/bancos/:id/status`."

### Qué puede hacer Claude Code

- Editar archivos del repo, ejecutar comandos, conectarse al servidor vía SSH, hacer deploys a Netlify.

### Qué NO puede hacer

- Crear workflows de n8n: hay que crearlos manualmente en la UI de n8n (https://stockserver.tail78d0c3.ts.net).

## 6. Flujo de desarrollo

1. Crear rama o trabajar directamente en `main` (según el alcance del cambio).
2. Probar con `netlify dev` en local antes de nada.
3. Hacer `netlify deploy --prod` solo cuando el cambio esté validado (créditos de build limitados).
4. Siempre hacer `git push` después del deploy, para que el repo quede sincronizado con lo desplegado.
5. Los workflows de n8n se crean/editan manualmente en https://stockserver.tail78d0c3.ts.net — no se versionan en este repo.

## 7. Base de datos — tablas existentes

| Tabla | Área | Descripción breve |
|---|---|---|
| `productos`, `ubicaciones`, `stock` | Inventario | Catálogo de productos, ubicaciones físicas y niveles de stock |
| `equipos`, `calibraciones` | Equipos | Ficha de equipos y su historial de calibración |
| `software` | Software | Gestor de software (licencias, ubicación en servidor, etc.) |
| `bancos_ensayo`, `banco_fotos`, `banco_documentos` | Bancos de ensayo | Fichas de banco con fotos y documentos adjuntos |
| `setups`, `setup_pasos`, `setup_software`, `setup_documentos` | Setup guide | Guías paso a paso con software y documentos vinculados |
| `kanban_columnas`, `kanban_tarjetas`, `kanban_etiquetas`, `kanban_tarjeta_etiquetas` | Benchmarking activities | Tablero Kanban de actividades |
| `calibraciones_galgas` | Digital tools | Calibración de galgas (herramienta específica) |

## 8. Workflows n8n existentes

⚠️ **No tocar sin coordinación** con el resto del equipo — muchos módulos del frontend dependen directamente de estos webhooks.

- StoxAI - Telegram Bot (principal, recibe mensajes del bot)
- StoxAI - Health Check (cada hora, alertas a Telegram)
- StoxAI - API Stock, Add Stock, Edit Stock, Delete Stock, Delete Stock Permanente
- StoxAI - API Equipos, Add Equipo, Edit Equipo, Delete Equipo, Calibrar Equipo
- StoxAI - API Software, Add Software, Edit Software, Delete Software
- StoxAI - API Bancos, Add Banco, Edit Banco, Delete Banco
- StoxAI - API Setups, Add Setup, Edit Setup, Delete Setup
- StoxAI - API Pasos, Add Paso, Edit Paso, Delete Paso
- StoxAI - API Upload Foto Banco, Delete Foto Banco, Get Fotos Banco
- StoxAI - API Upload Documento Banco, Delete Documento Banco, Get Documentos Banco
- StoxAI - API Upload Documento Setup, Delete Documento Setup, Get Documentos Setup
- StoxAI - API Upload Foto Paso, Delete Foto Paso
- StoxAI - API Setup Software, Add Setup Software, Delete Setup Software
- StoxAI - API Calibraciones Galgas, Add/Edit/Delete Calibracion Galgas

*(Nota: Kanban y Calibraciones Galgas hablan directo con glab-api/PostgreSQL, no vía n8n.)*

## 9. Pendientes activos

### 🔴 Urgente

- [ ] Conectar los 4 workflows de Calibraciones Galgas en n8n (tabla ya creada, Netlify Functions ya creadas, falta crear los workflows manualmente en n8n).
- [ ] Verificar que el Kanban persiste correctamente en producción (las columnas y tarjetas deben cargarse desde glab-api).

### 🟡 En progreso

- [ ] Fix tarjetas Kanban más compactas (CSS no se aplicó correctamente).
- [ ] Fix links clicables en Gestor de Software (columna `ubicacion_servidor`).
- [ ] Drag & drop para reordenar columnas del Kanban.

### 🟡 Próximas features (acordadas con Rommel y José)

- [ ] Status de bancos de ensayo (Operativo/Mantenimiento/Reservado) — bloquea creación de actividades en mantenimiento.
- [ ] Vista Gantt en Benchmarking Activities (tipo MS Project, slots de tiempo por banco).
- [ ] Modo feria en Raspberry Pi B+ para TV del departamento (rotación de vistas).
- [ ] Sección Noticias/Blog con editor rico, soporte HTML, fotos.
- [ ] Agente IA de noticias por tópicos del departamento.
- [ ] Mapa 3D del laboratorio en hover de ubicaciones (Stock y Calibración).
- [ ] Scripts Python como Digital Tools (Rommel debe pasar los scripts).
- [ ] Pantalla táctil en el laboratorio (Raspberry Pi + teclado virtual onboard).
- [ ] Control de ventiladores Sonoff S60TPF (hardware pendiente de conectar al WiFi).
- [ ] Agente de voz físico (Raspberry Pi 3A+ + Whisplay HAT — configuración pendiente).
- [ ] Autenticación Netlify Identity con bloqueo optimista para 15 usuarios.

### 🟢 Hardware pendiente de comprar/configurar

- [ ] Sensor de temperatura enchufable (Sonoff THR316 o similar).
- [ ] Botón industrial IP65 para agente de voz.
- [ ] MicroSD 32GB para Raspberry Pi 3A+.

## 10. Comandos útiles del servidor

```bash
# Conectar al servidor (password en documento del equipo)
ssh server@100.86.121.107

# Ver contenedores Docker
docker ps

# Acceder a PostgreSQL
docker exec -it postgres psql -U stock_user -d stock_db

# Ver logs de glab-api
pm2 logs glab-api

# Reiniciar glab-api
pm2 restart glab-api

# Ver estado de Tailscale Funnel
tailscale funnel status

# Ejecutar backup manual
/home/server/backup_postgres.sh
```

## 11. Variables de entorno y credenciales

Por seguridad, **las credenciales reales no se guardan en este repositorio** (ni en README, ni en `.env`, ni en el historial de commits). Están disponibles en el documento compartido del equipo. Aquí solo se listan qué credenciales existen y para qué sirven:

| Credencial | Uso | Dónde encontrarla |
|---|---|---|
| Usuario/password PostgreSQL | Acceso a `stock_db` (`stock_user`) | Documento del equipo |
| Usuario/password MinIO | Consola de administración MinIO | Documento del equipo |
| API key de glab-api | Header `x-api-key` en llamadas a glab-api | Documento del equipo |
| Password SSH del servidor | Acceso `ssh server@100.86.121.107` | Documento del equipo |
| Token del Bot de Telegram | Webhook de n8n | Documento del equipo |
| Claude API Key | Uso de la API de Claude fuera de Claude Code | Documento del equipo |
| Cuenta Netlify | Gestión del sitio en Netlify | `r.contreras@geze.com` |

**Regla del equipo:** ninguna credencial real (password, API key, token) debe commitearse en este repo. Si necesitas una para desarrollo local, pídela por el canal del equipo y guárdala en un `.env` local (ya está en `.gitignore`), nunca en código versionado.
