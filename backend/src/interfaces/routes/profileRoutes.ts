import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate } from '../middleware/authMiddleware';
import { PrismaUserRepository } from '../../infrastructure/database/PrismaUserRepository';
import { JwtAuthService } from '../../infrastructure/auth/JwtAuthService';
import prisma from '../../infrastructure/database/PrismaClient';

const userRepository = new PrismaUserRepository(prisma);
const authService = new JwtAuthService();
const profileController = new ProfileController(userRepository, authService);

const router = Router();

/** Todas las rutas requieren autenticación */
router.use(authenticate);

/** GET /api/profile - Obtener perfil del usuario autenticado */
router.get('/', (req, res, next) =>
  profileController.getProfile(req as any, res, next),
);

/** PATCH /api/profile - Actualizar perfil */
router.patch('/', (req, res, next) =>
  profileController.updateProfile(req as any, res, next),
);

/** POST /api/profile/change-password - Cambiar contraseña */
router.post('/change-password', (req, res, next) =>
  profileController.changePassword(req as any, res, next),
);

export default router;
