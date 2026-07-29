import { z } from 'zod';

/** Esquema de validación para el registro de usuario */
export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

/** Esquema de validación para el inicio de sesión */
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Esquema para solicitar código de restablecimiento */
export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

/** Esquema para verificar el código de restablecimiento */
export const VerifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

/** Esquema para restablecer la contraseña */
export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(100),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type VerifyResetCodeDTO = z.infer<typeof VerifyResetCodeSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

/** DTO con la respuesta de autenticación (usuario + tokens) */
export interface AuthResponseDTO {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/** DTO con los tokens tras un refresco exitoso */
export interface TokenRefreshDTO {
  accessToken: string;
  refreshToken: string;
}
