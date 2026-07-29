# Visión del Proyecto — LexIA Colombia

## Nombre del proyecto
**LexIA Colombia** — Asistente jurídico impulsado por inteligencia artificial especializado en legislación colombiana.

## Problema
Consultar la legislación colombiana implica navegar múltiples sitios web oficiales, buscar manualmente entre cientos de artículos y cruzar información de distintas fuentes (Constitución, códigos, leyes, decretos). No existe una herramienta unificada que permita hacer preguntas en lenguaje natural y obtener respuestas precisas con referencias verificables.

## Solución
LexIA Colombia es una aplicación web full-stack que utiliza inteligencia artificial con un pipeline RAG (Retrieval-Augmented Generation) para:
- Recibir preguntas en lenguaje natural sobre legislación colombiana
- Buscar artículos relevantes mediante embeddings vectoriales
- Consultar fuentes web oficiales en tiempo real
- Generar respuestas precisas con citas a artículos y referencias web

## Objetivo del proyecto
Desarrollar y desplegar un asistente legal inteligente, gratuito y de código abierto, que facilite el acceso a la legislación colombiana a ciudadanos, abogados, estudiantes y cualquier persona interesada.

## Audiencia objetivo
- **Abogados y profesionales del derecho** que necesitan consultar legislación rápidamente
- **Estudiantes de derecho** que investigan normas y artículos
- **Ciudadanos** que buscan entender sus derechos y obligaciones legales
- **Administradores** que gestionan documentos legales y usuarios

## Propuesta de valor
| Sin LexIA | Con LexIA |
|-----------|-----------|
| Buscar manualmente en múltiples sitios web | Una sola pregunta en lenguaje natural |
| Leer cientos de artículos para encontrar uno | Búsqueda semántica por similitud |
| Sin referencias claras a fuentes | Respuestas con citas y enlaces oficiales |
| Proceso lento y tedioso | Respuesta en segundos |

## Stack tecnológico
| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 20 (standalone, Material Design, SCSS) |
| Backend | Node.js + Express + TypeScript (Clean Architecture) |
| Base de datos | PostgreSQL 16 con Prisma ORM |
| Autenticación | JWT + Refresh Tokens |
| IA | Groq (llama-3.3-70b-versatile) para chat, HuggingFace para embeddings |
| Búsqueda web | DuckDuckGo Lite |
| Contenedores | Docker + Docker Compose + Nginx |

## Entregables
- Aplicación web funcional con autenticación de usuarios
- Chat interactivo con respuestas basadas en legislación colombiana
- Panel de administración para gestión de documentos, usuarios y estadísticas
- Documentación completa del proyecto (requisitos, arquitectura, API)
- Despliegue en producción mediante Docker

## Criterios de éxito
- El asistente responde preguntas sobre legislación colombiana con precisión
- Las respuestas incluyen referencias a artículos de ley y fuentes web verificables
- El sistema soporta múltiples usuarios con roles (USER, ADMIN)
- Los administradores pueden subir documentos PDF y gestionar contenido
- La aplicación es responsive y funciona en dispositivos móviles
- El código sigue principios de Clean Architecture y buenas prácticas

## Licencia
MIT — Código abierto y gratuito.
