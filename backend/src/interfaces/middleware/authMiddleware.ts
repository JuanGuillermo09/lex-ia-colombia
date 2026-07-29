import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '../../infrastructure/auth/JwtAuthService';

const authService = new JwtAuthService();

/** Extiende Request de Express con datos del usuario autenticado */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * Middleware que verifica el token JWT en el header Authorization
 * y agrega los datos del usuario a la solicitud
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = authService.verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Middleware que restringe el acceso según los roles especificados
 * @param roles Roles permitidos para acceder al recurso
 */
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
      return;
    }

    next();
  };
}
