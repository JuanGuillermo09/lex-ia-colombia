import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './interfaces/middleware/errorHandler';
import authRoutes from './interfaces/routes/authRoutes';
import chatRoutes from './interfaces/routes/chatRoutes';
import documentRoutes from './interfaces/routes/documentRoutes';
import adminRoutes from './interfaces/routes/adminRoutes';
import profileRoutes from './interfaces/routes/profileRoutes';
import articleRoutes from './interfaces/routes/articleRoutes';

/** Aplicación Express principal de LexIA Colombia API */
const app = express();

/** Middleware de seguridad: headers HTTP seguros */
app.use(helmet());
/** Middleware de CORS configurado desde variables de entorno */
app.use(cors({ origin: config.cors.origin }));
/** Parseo de JSON con límite de 10 MB */
app.use(express.json({ limit: '10mb' }));
/** Parseo de formularios URL-encoded */
app.use(express.urlencoded({ extended: true }));

/** Logging HTTP en modo desarrollo */
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

/** Limitador de tasa global: 100 solicitudes cada 15 minutos */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
});
app.use('/api', limiter);

/** Documentación Swagger en /api-docs */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'LexIA Colombia API',
}));

/** Endpoint de verificación de salud del servidor */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

/** Registro de rutas del API */
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/uploads', express.static(path.resolve(config.upload.dir)));
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/articles', articleRoutes);

/** Middleware global de manejo de errores (debe ir al final) */
app.use(errorHandler);

/** Inicio del servidor */
app.listen(config.port, () => {
  console.log(`⚖️  LexIA Colombia API running on port ${config.port}`);
  console.log(`📚 Swagger docs: http://localhost:${config.port}/api-docs`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

export default app;
