# Requisitos Funcionales — LexIA Colombia

## Módulo de autenticación

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-01 | Registro de usuario | El sistema debe permitir que un usuario se registre con nombre, correo electrónico y contraseña. | Alta |
| RF-02 | Inicio de sesión | El sistema debe permitir que un usuario inicie sesión con correo y contraseña. | Alta |
| RF-03 | Cierre de sesión | El sistema debe permitir que un usuario cierre sesión. | Alta |
| RF-04 | Recuperación de contraseña | El sistema debe enviar un código de verificación al correo del usuario para restablecer su contraseña. El código expira en 5 minutos. | Media |
| RF-05 | Renovación de token | El sistema debe permitir renovar el token de acceso mediante un refresh token. | Alta |

## Módulo de chat

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-06 | Enviar mensaje | El usuario autenticado debe poder enviar una pregunta en lenguaje natural al asistente. | Alta |
| RF-07 | Respuesta con referencias | El asistente debe responder con citas a artículos de ley y referencias web oficiales. | Alta |
| RF-08 | Indicador de escritura | Mientras el asistente genera la respuesta, debe mostrarse un indicador de escritura (typing indicator). | Media |
| RF-09 | Enlaces clickables | Las URLs en la respuesta del asistente deben convertirse en enlaces clickables. | Media |
| RF-10 | Sidebar de preguntas | En el chat debe mostrarse un panel lateral derecho con la lista de preguntas de la conversación actual, colapsable y con navegación a cada mensaje. | Media |
| RF-11 | Scroll-to-bottom | Debe mostrarse un botón flotante para ir al final del chat cuando el usuario esté a más de 100px del último mensaje. | Baja |

## Módulo de conversaciones

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-12 | Listar conversaciones | El usuario debe poder listar todas sus conversaciones guardadas. | Alta |
| RF-13 | Ver conversación | El usuario debe poder cargar una conversación anterior mediante un parámetro en la ruta. | Alta |
| RF-14 | Renombrar conversación | El usuario debe poder renombrar una conversación desde el historial (doble clic o botón editar) y desde la cabecera del chat (botón editar, Enter para guardar). | Media |
| RF-15 | Eliminar conversación individual | El usuario debe poder eliminar una conversación individual con confirmación. | Media |
| RF-16 | Eliminar conversaciones múltiples | El usuario debe poder seleccionar varias conversaciones y eliminarlas en lote con confirmación. | Baja |

## Módulo de perfil

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-17 | Ver perfil | El usuario debe poder ver su información de perfil (nombre, email, rol). | Media |
| RF-18 | Actualizar perfil | El usuario debe poder actualizar su nombre y correo electrónico, reflejándose en localStorage y la interfaz. | Media |
| RF-19 | Cambiar contraseña | El usuario debe poder cambiar su contraseña proporcionando la contraseña actual y la nueva. | Media |

## Módulo de dashboard

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-20 | Dashboard | El usuario autenticado debe ver una página de inicio con acceso rápido a chat, historial y perfil mediante tarjetas. | Media |

## Módulo de administración — Usuarios

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-21 | Listar usuarios | El administrador debe poder listar todos los usuarios registrados. | Alta |
| RF-22 | Cambiar rol de usuario | El administrador debe poder cambiar el rol de un usuario (USER/ADMIN). | Alta |
| RF-23 | Eliminar usuario | El administrador debe poder eliminar un usuario. | Alta |
| RF-24 | Ver conversaciones de usuario | El administrador debe poder ver las conversaciones de cualquier usuario en modo solo lectura con acordeón de preguntas y respuestas. | Media |

## Módulo de administración — Documentos

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-25 | Actualizar artículos desde web | El administrador debe poder iniciar una búsqueda web automática de códigos legales colombianos; el sistema usa IA para extraer artículos y los guarda en la base de datos. | Alta |
| RF-26 | Listar documentos | El administrador debe poder listar los documentos disponibles. | Alta |
| RF-27 | Eliminar documento | El administrador debe poder eliminar un documento y sus artículos asociados. | Alta |

## Módulo de administración — Artículos

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-28 | Ver artículos indexados | El administrador debe poder ver todos los artículos indexados con paginación (cabecera fija, área scrolleable). | Alta |
| RF-29 | Scroll-to-top en artículos | En la lista de artículos debe haber un botón flotante para volver al inicio. | Baja |
| RF-30 | Exportar artículos a PDF | El administrador debe poder descargar un PDF con todos los artículos indexados, generado dinámicamente por el backend. | Media |

## Módulo de administración — Estadísticas

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-31 | Ver estadísticas | El administrador debe poder ver estadísticas: total de documentos, artículos y distribución por tipo. | Media |

## Módulo de landing page

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-32 | Página de presentación | El sistema debe mostrar una landing page con hero, características, pasos de uso y footer. | Alta |
| RF-33 | Badge de IA | La landing page debe mostrar un badge indicando "Impulsado por Groq · IA en funcionamiento" en el hero. | Baja |

## Módulo de interfaz de usuario

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-34 | Diseño responsive | La aplicación debe adaptarse a dispositivos móviles, tablets y desktop con media queries. | Alta |
| RF-35 | Skeleton loading | Las vistas deben mostrar shimmer/skeleton mientras cargan datos. | Media |
| RF-36 | Toast/Snackbar | Las notificaciones deben mostrarse mediante un sistema de toasts estilizados (ToastService con MatSnackBar). | Media |
| RF-37 | Sidenav responsive | El menú lateral debe cambiar a modo "over" en dispositivos móviles con botón de cierre. | Alta |
