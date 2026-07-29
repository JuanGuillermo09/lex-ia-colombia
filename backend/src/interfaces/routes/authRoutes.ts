import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, VerifyResetCodeSchema, ResetPasswordSchema } from '../../application/dtos/AuthDTOs';
import { validate } from '../middleware/validate';
import { PrismaUserRepository } from '../../infrastructure/database/PrismaUserRepository';
import { JwtAuthService } from '../../infrastructure/auth/JwtAuthService';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import prisma from '../../infrastructure/database/PrismaClient';

const userRepository = new PrismaUserRepository(prisma);
const authService = new JwtAuthService();
const registerUseCase = new RegisterUseCase(userRepository, authService);
const loginUseCase = new LoginUseCase(userRepository, authService);
const authController = new AuthController(registerUseCase, loginUseCase);

const router = Router();

/** POST /api/auth/register - Registro de nuevo usuario */
router.post('/register', validate(RegisterSchema), (req, res, next) =>
  authController.register(req, res, next),
);

/** POST /api/auth/login - Inicio de sesión */
router.post('/login', validate(LoginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

/** POST /api/auth/refresh - Renovación de token */
router.post('/refresh', (req, res, next) =>
  authController.refreshToken(req, res, next),
);

/** POST /api/auth/forgot-password - Solicitar código de restablecimiento */
router.post('/forgot-password', validate(ForgotPasswordSchema), (req, res, next) =>
  authController.forgotPassword(req, res, next),
);

/** POST /api/auth/verify-reset-code - Verificar código de restablecimiento */
router.post('/verify-reset-code', validate(VerifyResetCodeSchema), (req, res, next) =>
  authController.verifyResetCode(req, res, next),
);

/** POST /api/auth/reset-password - Restablecer contraseña */
router.post('/reset-password', validate(ResetPasswordSchema), (req, res, next) =>
  authController.resetPassword(req, res, next),
);

export default router;
