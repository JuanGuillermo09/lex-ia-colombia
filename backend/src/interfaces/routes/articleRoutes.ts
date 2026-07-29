import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { PrismaArticleRepository } from '../../infrastructure/database/PrismaArticleRepository';
import prisma from '../../infrastructure/database/PrismaClient';

const articleRepository = new PrismaArticleRepository(prisma);
const articleController = new ArticleController(articleRepository);

const router = Router();

/** Todas las rutas requieren autenticación y rol ADMIN */
router.use(authenticate);
router.use(authorize('ADMIN'));

/** GET /api/articles - Listar artículos paginados */
router.get('/', (req, res, next) =>
  articleController.getAll(req as any, res, next),
);

export default router;