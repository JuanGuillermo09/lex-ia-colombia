import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { JwtAuthService } from '../../infrastructure/auth/JwtAuthService';
import prisma from '../../infrastructure/database/PrismaClient';
import { sendPasswordResetEmail } from '../../infrastructure/email/EmailService';
import crypto from 'crypto';

/** Controlador de autenticación de usuarios */
export class AuthController {
  /**
   * @param registerUseCase Caso de uso para registro de usuarios
   * @param loginUseCase Caso de uso para inicio de sesión
   */
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  /**
   * Registra un nuevo usuario
   * @returns 201 con los datos del usuario creado
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Inicia sesión con credenciales de usuario
   * @returns Tokens de acceso y refresco
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Renueva el token de acceso usando un refresh token válido
   * @returns Nuevos tokens de acceso y refresco
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token requerido' });
        return;
      }

      const authService = new JwtAuthService();
      const payload = authService.verifyRefreshToken(refreshToken);

      const tokens = authService.generateTokens({
        userId: payload.userId,
        role: payload.role,
      });

      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }
  }

  /**
   * Envía un código de verificación al correo del usuario
   * @returns Mensaje de confirmación
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(404).json({ error: 'No existe una cuenta con ese correo' });
        return;
      }

      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.passwordResetCode.create({
        data: { email, code, expiresAt },
      });

      const sent = await sendPasswordResetEmail(email, code);
      res.json({
        message: 'Código de verificación enviado al correo',
        code: sent ? undefined : code,
        expiresIn: 5 * 60 * 1000,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica que el código de restablecimiento sea válido
   * @returns Mensaje de confirmación
   */
  async verifyResetCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code } = req.body;

      const record = await prisma.passwordResetCode.findFirst({
        where: { email, code, used: false, expiresAt: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
      });

      if (!record) {
        res.status(400).json({ error: 'Código inválido o expirado' });
        return;
      }

      res.json({ message: 'Código verificado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restablece la contraseña usando el código de verificación
   * @returns Mensaje de confirmación
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code, newPassword } = req.body;

      const record = await prisma.passwordResetCode.findFirst({
        where: { email, code, used: false, expiresAt: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
      });

      if (!record) {
        res.status(400).json({ error: 'Código inválido o expirado' });
        return;
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetCode.update({
        where: { id: record.id },
        data: { used: true },
      });

      res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      next(error);
    }
  }
}
