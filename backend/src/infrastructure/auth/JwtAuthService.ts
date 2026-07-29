import { IAuthService, AuthTokens, TokenPayload } from '../../domain/services/IAuthService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config';

/** Servicio de autenticación JWT: hash de contraseñas y generación/verificación de tokens. */
export class JwtAuthService implements IAuthService {
  /**
   * Genera un hash bcrypt de la contraseña con 12 rondas de sal.
   * @param password - Contraseña en texto plano
   * @returns Hash de la contraseña
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compara una contraseña en texto plano contra un hash bcrypt.
   * @param password - Contraseña en texto plano
   * @param hash - Hash almacenado
   * @returns true si coinciden
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Genera un par de tokens (access y refresh) firmados con JWT.
   * @param payload - Datos del usuario a incluir en el token
   * @returns Objeto con accessToken y refreshToken
   */
  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verifica y decodifica un token de acceso.
   * @param token - Token JWT a verificar
   * @returns Payload del token
   */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  /**
   * Verifica y decodifica un token de refresco.
   * @param token - Token de refresco a verificar
   * @returns Payload del token
   */
  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  }
}
