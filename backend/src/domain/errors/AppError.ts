/**
 * Error de aplicación con un código de estado HTTP asociado.
 * Permite que los casos de uso comuniquen errores esperados
 * (por ejemplo, credenciales inválidas o correo duplicado)
 * sin acoplarse a la capa HTTP.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
