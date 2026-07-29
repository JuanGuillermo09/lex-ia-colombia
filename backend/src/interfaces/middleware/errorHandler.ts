import { Request, Response, NextFunction } from 'express';

/** Error personalizado con código de estado HTTP */
export class AppError extends Error {
  /**
   * @param statusCode Código de estado HTTP del error
   * @param message Mensaje descriptivo del error
   */
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

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
