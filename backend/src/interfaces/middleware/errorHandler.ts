import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';

export { AppError } from '../../domain/errors/AppError';

/**
 * Middleware global de manejo de errores
 * Captura errores AppError y errores genéricos,
 * ocultando detalles en producción
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  console.error('Error:', err);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
