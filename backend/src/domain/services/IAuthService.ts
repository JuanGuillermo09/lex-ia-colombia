/** Tokens de acceso y refresco para autenticación */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Datos contenidos en el token JWT */
export interface TokenPayload {
  userId: string;
  role: string;
}

/** Servicio de autenticación: hasheo, comparación y generación/verificación de tokens */
export interface IAuthService {
  /** Hashea una contraseña */
  hashPassword(password: string): Promise<string>;
  /** Compara una contraseña con su hash */
  comparePassword(password: string, hash: string): Promise<boolean>;
  /** Genera un par de tokens (access + refresh) */
  generateTokens(payload: TokenPayload): AuthTokens;
  /** Verifica y decodifica un token de acceso */
  verifyAccessToken(token: string): TokenPayload;
  /** Verifica y decodifica un token de refresco */
  verifyRefreshToken(token: string): TokenPayload;
}
