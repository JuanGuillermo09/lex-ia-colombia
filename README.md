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
| Web Scraping | DuckDuckGo Lite |
| Contenedores | Docker + Docker Compose + Nginx |

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
├── infrastructure/           # Dockerfiles, Nginx config, DB init
└── docker-compose.yml        # PostgreSQL + Backend + Frontend
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
- **Autenticación** — registro, login, refresh tokens
- **Dashboard** — acceso rápido a chat, historial y perfil
- **Chat** — preguntas con respuestas del asistente, citas a artículos y referencias web
- **Historial** — conversaciones guardadas, renombrar, eliminar (individual/múltiple)
- **Perfil** — editar nombre/email, cambiar contraseña

### Administrador
- **Usuarios** — listar, cambiar rol, eliminar, ver conversaciones de cada usuario (solo lectura)
- **Documentos** — subir PDFs con articulados, listar, eliminar
- **Artículos** — ver todos los artículos indexados (paginado)
- **Estadísticas** — total de documentos, artículos y distribución por tipo

---

## Instalación y ejecución

### Requisitos
- Node.js 20+
- PostgreSQL 16
- Docker (opcional)

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

### Docker (local con código fuente)

```bash
# Primera vez o tras cambios:
docker compose up -d --build

# Si ya todo está construido:
docker compose up -d

# Frontend: http://localhost:8080
# Backend API: http://localhost:3000/api
# Swagger: http://localhost:3000/api-docs
```

### Docker Hub (sin código fuente — solo Docker Desktop)

Las imágenes están publicadas en Docker Hub. En cualquier PC con Docker:

```bash
# Crear docker-compose.yml con este contenido:
cat > docker-compose.yml << 'EOF'
services:
  db:
    image: postgres:16-alpine
    container_name: lexia-db
    environment:
      POSTGRES_USER: lexia
      POSTGRES_PASSWORD: lexia123
      POSTGRES_DB: lexia_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lexia -d lexia_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: juan287/lexia-backend:latest
    container_name: lexia-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://lexia:lexia123@db:5432/lexia_db?schema=public
      JWT_SECRET: cambia_esto_por_un_secreto_seguro
      AI_PROVIDER: groq
      GROQ_API_KEY: TU_API_KEY_DE_GROQ
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads

  frontend:
    image: juan287/lexia-frontend:latest
    container_name: lexia-frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads:
EOF

# Ejecutar:
docker compose up -d

# Acceder: http://localhost:8080
```

> **Nota:** Reemplazar `GROQ_API_KEY` con una API key válida de [Groq](https://console.groq.com/keys).

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
| POST | `/api/documents/upload` | Admin | Subir PDF |
| GET | `/api/documents` | Admin | Listar documentos |
| GET | `/api/admin/users` | Admin | Listar usuarios |
| GET | `/api/admin/users/:id/conversations` | Admin | Ver conversaciones de usuario |
| GET | `/api/profile` | Bearer | Obtener perfil |
| PATCH | `/api/profile` | Bearer | Actualizar perfil |
| POST | `/api/profile/change-password` | Bearer | Cambiar contraseña |

---

---

## Despliegue temporal con túnel público

Para compartir el proyecto desde tu PC sin un VPS:

```bash
# Iniciar el túnel (una vez):
cd frontend
npx localtunnel --port 8080

# La URL se muestra en consola
# Queda guardada en: %TEMP%\localtunnel.log
# Para verla después:
type "%TEMP%\localtunnel.log"
```

Cualquier persona con la URL puede acceder mientras el PC esté encendido.

---

## Licencia

MIT
