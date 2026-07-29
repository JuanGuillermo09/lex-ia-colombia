import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { PrismaUserRepository } from '../../infrastructure/database/PrismaUserRepository';
import { PrismaConversationRepository } from '../../infrastructure/database/PrismaConversationRepository';
import prisma from '../../infrastructure/database/PrismaClient';

const userRepository = new PrismaUserRepository(prisma);
const conversationRepository = new PrismaConversationRepository(prisma);
const adminController = new AdminController(userRepository, conversationRepository);

const router = Router();

/** Todas las rutas requieren autenticación y rol ADMIN */
router.use(authenticate);
router.use(authorize('ADMIN'));

/** GET /api/admin/users - Lista de usuarios paginada */
router.get('/users', (req, res, next) =>
  adminController.getUsers(req as any, res, next),
);

/** PATCH /api/admin/users/:id/role - Actualizar rol de usuario */
router.patch('/users/:id/role', (req, res, next) =>
  adminController.updateUserRole(req as any, res, next),
);

/** DELETE /api/admin/users/:id - Eliminar usuario */
router.delete('/users/:id', (req, res, next) =>
  adminController.deleteUser(req as any, res, next),
);

/** GET /api/admin/users/:id/conversations - Conversaciones de un usuario */
router.get('/users/:id/conversations', (req, res, next) =>
  adminController.getUserConversations(req as any, res, next),
);

export default router;
