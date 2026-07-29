import swaggerJsdoc from 'swagger-jsdoc';

/** Configuración de documentación Swagger/OpenAPI para LexIA Colombia API */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LexIA Colombia API',
      version: '1.0.0',
      description: 'API del asistente jurídico LexIA Colombia - Legislación colombiana',
      contact: {
        name: 'LexIA Colombia',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  /** Escanea rutas para generar documentación automática */
  apis: ['./src/interfaces/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
