/** Usuario del sistema */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
}

/** Respuesta del servidor tras autenticación */
export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/** Tokens renovados */
export interface TokenRefresh {
  accessToken: string;
  refreshToken: string;
}
