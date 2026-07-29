# LexIA Colombia

**Asistente legal con IA especializado en legislación colombiana**

LexIA Colombia es una aplicación web full-stack que permite consultar artículos de la legislación colombiana usando inteligencia artificial. El sistema emplea un pipeline RAG (Retrieval-Augmented Generation) para buscar artículos relevantes, consultar fuentes web y generar respuestas con citas y referencias verificables.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 20 (standalone, Material Design, SCSS) |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL 16 con Prisma ORM |
| Autenticación | JWT + Refresh Tokens |
| IA | Abstraction layer (Groq, OpenAI, Gemini, Llama/Ollama) |
| Búsqueda semántica | Embeddings vectoriales + cosine similarity |
| Búsqueda web | DuckDuckGo Lite |
| Despliegue | Render.com |

---

## Arquitectura

```
LexIA/
├── backend/                  # API REST (Clean Architecture)
│   ├── src/
│   │   ├── domain/           # Entidades, interfaces de repositorios y servicios
│   │   ├── application/      # Casos de uso (use-cases) + DTOs con validación Zod
│   │   ├── infrastructure/   # Prisma repos, AI services, auth, PDF parser, search
│   │   └── interfaces/       # Controladores, middlewares, rutas, Swagger
│   ├── prisma/               # Schema + migraciones
│   └── scripts/              # Seed (admin@lexia.com / admin123)
├── frontend/                 # SPA Angular
│   ├── src/
│   │   ├── favicon.ico       # Martillo (gavel) de la justicia
│   │   ├── assets/gavel.svg  # SVG del icono
│   │   └── app/
│   │       ├── core/         # Modelos, servicios, interceptors, guards
│   │       ├── layouts/      # Main layout (sidenav) / Auth layout
│   │       └── features/     # Landing, login, register, dashboard, chat,
│   │                         # history, profile, admin (users/docs/articles/stats)
├── render.yaml               # Blueprint Render (backend + DB)
```

### Principios
- **Clean Architecture** con separación en capas (dominio, aplicación, infraestructura, interfaces)
- **Repository Pattern** para abstracción de base de datos
- **DTOs + Zod** para validación de datos de entrada
- **Inyección de dependencias** en toda la aplicación
- **Factory Pattern** para proveedores de IA intercambiables

---

## Pipeline RAG (Retrieval-Augmented Generation)

1. El usuario envía una pregunta
2. La pregunta se convierte en embedding vectorial
3. Búsqueda por similitud coseno contra los artículos almacenados (threshold: 0.7, máx. 10)
4. Fallback: si falla el embedding, usa artículos recientes
5. Búsqueda web simultánea en DuckDuckGo Lite
6. Se construye contexto con los artículos + resultados web
7. Se envía todo al modelo de IA con un prompt de sistema (asistente legal colombiano)
8. Se guarda el mensaje y las fuentes en base de datos
9. Se devuelve la respuesta con citas a artículos y referencias web

### Proveedores de IA soportados

| Proveedor | Chat | Embeddings |
|-----------|------|-------------|
| Groq (default) | llama-3.3-70b-versatile | HuggingFace inference |
| OpenAI | GPT-4 / GPT-3.5 | text-embedding-3-small |
| Gemini | gemini-pro | HuggingFace inference |
| Llama/Ollama | llama3.2 local | nomic-embed-text local |

---

## Funcionalidades

### Usuario
- **Autenticación** — registro, login, refresh tokens, recuperación de contraseña
- **Dashboard** — acceso rápido a chat, historial y perfil
- **Chat** — preguntas con respuestas del asistente, citas a artículos y referencias web
- **Historial** — conversaciones guardadas, renombrar, eliminar (individual/múltiple)
- **Perfil** — editar nombre/email, cambiar contraseña

### Administrador
- **Usuarios** — listar, cambiar rol, eliminar, ver conversaciones de cada usuario (solo lectura)
- **Artículos** — actualización automática vía IA (busca códigos colombianos en web y extrae artículos con Groq)
- **Descarga PDF** — exportar todos los artículos a un documento PDF
- **Estadísticas** — total de documentos, artículos y distribución por tipo

---

## Instalación y ejecución

### Requisitos
- Node.js 22+
- PostgreSQL 16

### Desarrollo local

```bash
# 1. Clonar y entrar
cd LexIA

# 2. Backend
cd backend
cp .env.example .env        # Editar GROQ_API_KEY, JWT_SECRET y demás
npm install
npx prisma migrate dev
npx prisma generate
npm run prisma:seed         # Crea admin@lexia.com / admin123
npm run dev                 # http://localhost:3000

# 3. Frontend (otra terminal)
cd frontend
npm install
ng serve --proxy-config proxy.conf.json  # http://localhost:4200
```

### Variables de entorno clave (`.env`)

```
# Base de datos
DATABASE_URL=postgresql://lexia:lexia123@localhost:5432/lexia_db?schema=public

# JWT (cambiar en producción)
JWT_SECRET=change-this-secret
JWT_REFRESH_SECRET=change-this-refresh-secret

# IA
AI_PROVIDER=groq
GROQ_API_KEY=gsk-tu-api-key-aqui

# SMTP (para recuperación de contraseña — si está vacío, el código se muestra en consola)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-app
SMTP_FROM=tu-correo@gmail.com
```

---

## API

Documentación Swagger disponible en `/api-docs` con el servidor corriendo.

### Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | - | Registrar usuario |
| POST | `/api/auth/login` | - | Iniciar sesión |
| POST | `/api/auth/refresh` | - | Refrescar token |
| POST | `/api/auth/forgot-password` | - | Solicitar código de recuperación |
| POST | `/api/auth/verify-reset-code` | - | Verificar código de recuperación |
| POST | `/api/auth/reset-password` | - | Restablecer contraseña |
| POST | `/api/chat/messages` | Bearer | Enviar mensaje |
| GET | `/api/chat/conversations` | Bearer | Listar conversaciones |
| PATCH | `/api/chat/conversations/:id` | Bearer | Renombrar conversación |
| DELETE | `/api/chat/conversations/:id` | Bearer | Eliminar conversación |
| POST | `/api/chat/conversations/delete-batch` | Bearer | Eliminar múltiples conversaciones |
| GET | `/api/articles` | Admin | Listar artículos paginados |
| POST | `/api/articles/update` | Admin | Actualizar artículos automáticamente (IA) |
| GET | `/api/articles/export` | Admin | Descargar PDF con todos los artículos |
| GET | `/api/documents` | Admin | Listar documentos |
| POST | `/api/documents/upload` | Admin | Subir PDF (legacy — usar update automático) |
| GET | `/api/documents/stats` | Admin | Estadísticas |
| GET | `/api/admin/users` | Admin | Listar usuarios |
| PATCH | `/api/admin/users/:id/role` | Admin | Cambiar rol |
| DELETE | `/api/admin/users/:id` | Admin | Eliminar usuario |
| GET | `/api/profile` | Bearer | Obtener perfil |
| PATCH | `/api/profile` | Bearer | Actualizar perfil |
| POST | `/api/profile/change-password` | Bearer | Cambiar contraseña |

---

## Despliegue en Render.com

LexIA está desplegado en Render.com (plan gratuito). Usa un Blueprint (`render.yaml`) para el backend y la base de datos, y un Static Site para el frontend.

### Servicios

| Servicio | Tipo | URL |
|----------|------|-----|
| Backend | Web Service | `https://lexia-backend-rqw4.onrender.com` |
| Frontend | Static Site | `https://lex-ia-colombia.onrender.com` |
| Base de datos | PostgreSQL | Render PostgreSQL plugin |

### Variables de entorno en Render

**Backend** (set via `render.yaml` o dashboard):
| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | (asignada por Render PostgreSQL) |
| `JWT_SECRET` | (auto-generada) |
| `JWT_REFRESH_SECRET` | (auto-generada) |
| `AI_PROVIDER` | `groq` |
| `GROQ_API_KEY` | (tu API key) |
| `CORS_ORIGIN` | `https://lex-ia-colombia.onrender.com` |

**Frontend** (configurar manualmente en dashboard):
| Variable | Valor |
|----------|-------|
| `API_URL` | `https://lexia-backend-rqw4.onrender.com/api` |
| `NPM_CONFIG_LEGACY_PEER_DEPS` | `true` |

### Notas de despliegue
- El frontend requiere `404.html` en el build para SPA routing (se copia automáticamente desde `index.html`)
- El health check del backend (`/api/health`) está fuera del rate limiter para evitar falsos positivos
- Si los servicios gratuitos se duermen por inactividad, el primer request puede demorar ~30s

---

## Licencia

MIT
