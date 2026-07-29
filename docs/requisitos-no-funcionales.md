# Requisitos No Funcionales — LexIA Colombia

## Rendimiento

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-01 | Tiempo de respuesta del chat | El asistente debe responder en menos de 10 segundos en condiciones normales de red y API. | Alta |
| RNF-02 | Tiempo de carga inicial | La aplicación debe cargar el bundle inicial en menos de 3 segundos en conexiones de banda ancha. | Alta |
| RNF-03 | Paginación | Las listas con más de 20 elementos deben usar paginación para evitar sobrecarga de UI. | Media |
| RNF-04 | Compresión de assets | Los assets estáticos deben servirse comprimidos (gzip) desde Nginx. | Media |

## Seguridad

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-05 | Autenticación JWT | El acceso a recursos protegidos debe requerir un token JWT válido. | Alta |
| RNF-06 | Refresh tokens | Los tokens de acceso deben tener una expiración corta (15 min) y renovarse mediante refresh tokens (7 días). | Alta |
| RNF-07 | Contraseñas hasheadas | Las contraseñas deben almacenarse usando bcrypt con factor de costo 10. | Alta |
| RNF-08 | Validación de entrada | Todos los datos de entrada deben validarse con esquemas Zod. | Alta |
| RNF-09 | Control de roles | Las rutas de administración deben estar protegidas por el rol ADMIN. | Alta |
| RNF-10 | Código de recuperación | El código de restablecimiento de contraseña debe ser de 6 dígitos, aleatorio y expirar en 5 minutos. | Alta |

## Base de datos

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-11 | Persistencia | Los datos deben persistirse en PostgreSQL con Prisma ORM. | Alta |
| RNF-12 | Migraciones | Los cambios en el esquema de base de datos deben manejarse mediante migraciones de Prisma. | Alta |
| RNF-13 | Embeddings vectoriales | Los artículos deben almacenar embeddings como arreglos de punto flotante para búsqueda semántica. | Alta |

## Arquitectura

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-14 | Clean Architecture | El backend debe seguir Clean Architecture con capas de dominio, aplicación, infraestructura e interfaces. | Alta |
| RNF-15 | Repository Pattern | El acceso a datos debe hacerse mediante repositorios que abstraigan Prisma. | Alta |
| RNF-16 | Factory Pattern | Los proveedores de IA deben ser intercambiables mediante un factory (Groq, OpenAI, Gemini, Llama). | Alta |
| RNF-17 | Inyección de dependencias | Las dependencias deben inyectarse en los controladores y casos de uso. | Alta |

## Proveedores de IA

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-18 | Proveedor por defecto | El sistema debe usar Groq (llama-3.3-70b-versatile) como proveedor de IA por defecto. | Alta |
| RNF-19 | Fallback de embedding | Si falla la generación de embeddings, el sistema debe usar artículos recientes como fallback. | Media |
| RNF-20 | Umbral de similitud | La búsqueda semántica debe usar un umbral de similitud coseno de 0.7 con máximo 10 artículos. | Alta |

## Compatibilidad

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-21 | Navegadores | La aplicación debe funcionar en las versiones recientes de Chrome, Firefox, Safari y Edge. | Alta |
| RNF-22 | Dispositivos móviles | La UI debe ser completamente funcional en pantallas desde 320px de ancho. | Alta |

## Despliegue

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-23 | Contenedores Docker | La aplicación debe desplegarse usando Docker Compose con tres servicios: db, backend, frontend. | Alta |
| RNF-24 | Proxy inverso | El frontend debe servirse mediante Nginx como proxy inverso. | Alta |
| RNF-25 | Migración automática | El entrypoint del backend debe ejecutar migraciones y seed automáticamente al iniciar. | Alta |

## Código

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-26 | TypeScript estricto | Todo el código debe estar escrito en TypeScript con tipos estrictos. | Alta |
| RNF-27 | Documentación | Todos los archivos TypeScript deben tener comentarios JSDoc/TSDoc en español. | Media |
| RNF-28 | ESLint + Prettier | El código debe seguir las reglas de ESLint y Prettier configuradas en el proyecto. | Media |

## Mantenibilidad

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RNF-29 | Variables de entorno | La configuración sensible debe manejarse mediante variables de entorno con archivo .env. | Alta |
| RNF-30 | Separación de archivos | Cada componente Angular debe tener archivos separados para HTML, SCSS y TypeScript. | Alta |
