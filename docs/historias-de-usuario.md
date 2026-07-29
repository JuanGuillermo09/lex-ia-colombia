# Historias de Usuario — LexIA Colombia

---

## HU-01: Registro de cuenta

**Como** usuario nuevo  
**Quiero** registrarme con mi nombre, correo y contraseña  
**Para** poder acceder al asistente legal

**Criterios de aceptación:**
- El formulario valida que el nombre tenga al menos 2 caracteres
- El formulario valida que el correo tenga formato válido
- El formulario valida que la contraseña tenga al menos 8 caracteres
- Al registrarse exitosamente, se redirige al dashboard
- Si el correo ya existe, muestra un error claro

---

## HU-02: Inicio de sesión

**Como** usuario registrado  
**Quiero** iniciar sesión con mi correo y contraseña  
**Para** acceder a mis conversaciones y al asistente

**Criterios de aceptación:**
- Si las credenciales son correctas, redirige al dashboard
- Si las credenciales son incorrectas, muestra un mensaje de error
- Hay un enlace a "¿Olvidaste tu contraseña?" y a "Registrarse"
- El formulario incluye un badge "IA en funcionamiento" en la cabecera

---

## HU-03: Recuperación de contraseña

**Como** usuario que olvidó su contraseña  
**Quiero** solicitar un código de verificación a mi correo  
**Para** restablecer mi contraseña y acceder a mi cuenta

**Criterios de aceptación:**
- Ingreso mi correo y recibo un código de 6 dígitos
- El código expira en 5 minutos (se muestra un contador regresivo en pantalla)
- Sin SMTP configurado, el código se muestra en pantalla con advertencia
- Ingreso el código y luego una nueva contraseña con confirmación
- La contraseña se actualiza y puedo iniciar sesión con la nueva
- El código expirado deshabilita el botón de verificación

---

## HU-04: Dashboard

**Como** usuario autenticado  
**Quiero** ver una página de inicio con acceso rápido  
**Para** navegar fácilmente a las secciones principales

**Criterios de aceptación:**
- Veo tarjetas con acceso a chat, historial y perfil
- Las tarjetas tienen iconos y descripciones
- Al hacer clic, navego a la sección correspondiente

---

## HU-05: Chat con asistente legal

**Como** usuario autenticado  
**Quiero** hacer preguntas en lenguaje natural sobre legislación colombiana  
**Para** obtener respuestas precisas con referencias

**Criterios de aceptación:**
- Escribo una pregunta y el asistente responde en segundos
- La respuesta incluye citas a artículos de ley numerados
- Las URLs en la respuesta son clickables
- Se muestran tarjetas con referencias web oficiales
- Mientras responde, se muestra un indicador de escritura con animación de puntos
- Hay un botón flotante para ir al final del chat

---

## HU-06: Sidebar de preguntas en chat

**Como** usuario en una conversación larga  
**Quiero** ver un panel lateral con la lista de preguntas  
**Para** navegar rápidamente entre mensajes

**Criterios de aceptación:**
- El panel se muestra a la derecha del chat
- Cada pregunta es clickable y desplaza al mensaje correspondiente
- El panel es colapsable (botón de toggle)
- En móviles se muestra como overlay a pantalla completa

---

## HU-07: Historial de conversaciones

**Como** usuario autenticado  
**Quiero** ver todas mis conversaciones anteriores  
**Para** retomar consultas previas

**Criterios de aceptación:**
- Las conversaciones se muestran en orden cronológico descendente
- Cada conversación muestra el título y la fecha
- Puedo hacer clic en una conversación para abrirla en el chat
- Mientras carga la lista, se muestran skeleton shimmers

---

## HU-08: Renombrar conversación

**Como** usuario autenticado  
**Quiero** renombrar una conversación  
**Para** identificarla fácilmente después

**Criterios de aceptación:**
- Puedo renombrar desde el historial (doble clic o botón de editar)
- Puedo renombrar desde la cabecera del chat (botón editar, input inline)
- El cambio se guarda automáticamente al presionar Enter

---

## HU-09: Eliminar conversaciones

**Como** usuario autenticado  
**Quiero** eliminar una o varias conversaciones  
**Para** mantener limpio mi historial

**Criterios de aceptación:**
- Puedo eliminar una conversación individual con un botón y confirmación
- Puedo seleccionar múltiples conversaciones y eliminarlas en lote
- Se pide confirmación antes de eliminar

---

## HU-10: Ver y editar perfil

**Como** usuario autenticado  
**Quiero** ver y editar mi información de perfil  
**Para** mantener mis datos actualizados

**Criterios de aceptación:**
- Veo mi nombre, correo y rol
- Puedo editar mi nombre y correo
- Los cambios se reflejan inmediatamente en la interfaz y localStorage
- Puedo cambiar mi contraseña (requiere contraseña actual + nueva + confirmación)

---

## HU-11: Subir documentos (Admin)

**Como** administrador  
**Quiero** subir documentos PDF con articulados legales  
**Para** que el sistema indexe los artículos y los use en las respuestas

**Criterios de aceptación:**
- Selecciono un archivo PDF y lo subo
- El sistema procesa el PDF y extrae los artículos
- Los artículos se almacenan con embeddings para búsqueda semántica
- Veo el documento en la lista de documentos subidos

---

## HU-12: Gestionar usuarios (Admin)

**Como** administrador  
**Quiero** listar, cambiar roles y eliminar usuarios  
**Para** administrar quién tiene acceso al sistema

**Criterios de aceptación:**
- Veo una tabla responsive con todos los usuarios (nombre, email, rol, fecha)
- Puedo cambiar el rol de un usuario entre USER y ADMIN
- Puedo eliminar un usuario
- Puedo ver las conversaciones de cualquier usuario en modo solo lectura con acordeón

---

## HU-13: Ver conversaciones de usuarios (Admin)

**Como** administrador  
**Quiero** ver las conversaciones de cualquier usuario en modo solo lectura  
**Para** revisar el historial de preguntas y respuestas sin poder modificarlo

**Criterios de aceptación:**
- Desde la lista de usuarios, hay un botón "Ver conversaciones" por cada usuario
- Al hacer clic, navego a una vista con las conversaciones del usuario seleccionado
- Las conversaciones se muestran en acordeón expansible
- Cada conversación expandida muestra sus mensajes (pregunta y respuesta) con fuentes
- No hay botones de editar, renombrar ni eliminar (solo lectura)
- La interfaz es responsive con scroll horizontal en móviles

---

## HU-14: Ver artículos indexados (Admin)

**Como** administrador  
**Quiero** ver todos los artículos indexados  
**Para** revisar el contenido legal disponible en el sistema

**Criterios de aceptación:**
- Veo una lista paginada con número, título y texto del artículo
- La cabecera de la tabla permanece fija al hacer scroll
- Hay un botón flotante para volver al inicio de la página

---

## HU-14: Ver estadísticas (Admin)

**Como** administrador  
**Quiero** ver estadísticas del sistema  
**Para** conocer el uso y contenido de la plataforma

**Criterios de aceptación:**
- Veo el total de documentos subidos
- Veo el total de artículos indexados
- Veo la distribución por tipo de documento

---

## HU-15: Landing page

**Como** visitante no autenticado  
**Quiero** ver una página de presentación del producto  
**Para** entender qué ofrece LexIA Colombia y decidir si registrarme

**Criterios de aceptación:**
- Veo un navbar con logo y botones de acción
- Veo el hero con el nombre, badge de IA, descripción y botones CTA
- Veo una cuadrícula de características del producto
- Veo los pasos de uso numerados
- Veo el footer con información del proyecto

---

## HU-16: Diseño responsive

**Como** usuario en dispositivo móvil  
**Quiero** que la aplicación se adapte a mi pantalla  
**Para** usarla cómodamente desde cualquier dispositivo

**Criterios de aceptación:**
- El menú lateral se convierte en overlay en móviles (BreakpointObserver)
- El sidebar del chat se muestra como overlay a pantalla completa
- Las tablas administrativas tienen scroll horizontal con min-width
- Los formularios ocupan el ancho completo
- Los botones y enlaces tienen tamaño táctil adecuado

---

## HU-17: Notificaciones Toast

**Como** usuario  
**Quiero** ver notificaciones visuales cuando ocurren acciones importantes  
**Para** saber si una operación fue exitosa o falló

**Criterios de aceptación:**
- Las notificaciones aparecen como toasts estilizados con iconos
- Los toasts de éxito son verdes, los de error son rojos
- Los toasts desaparecen automáticamente después de unos segundos
- El servicio ToastService encapsula la lógica de MatSnackBar
