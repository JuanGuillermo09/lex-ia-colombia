import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { PrismaArticleRepository } from '../../infrastructure/database/PrismaArticleRepository';
import { PrismaDocumentRepository } from '../../infrastructure/database/PrismaDocumentRepository';
import { AIServiceFactory } from '../../infrastructure/ai/AIServiceFactory';
import { WebSearchService } from '../../infrastructure/search/WebSearchService';
import { UpdateArticlesUseCase } from '../../application/use-cases/UpdateArticlesUseCase';
import { ExportArticlesUseCase } from '../../application/use-cases/ExportArticlesUseCase';
import prisma from '../../infrastructure/database/PrismaClient';

const articleRepository = new PrismaArticleRepository(prisma);
const documentRepository = new PrismaDocumentRepository(prisma);
const aiService = AIServiceFactory.create();
const webSearch = new WebSearchService();

const updateArticlesUseCase = new UpdateArticlesUseCase(
  documentRepository,
  articleRepository,
  aiService,
  webSearch,
);
const exportArticlesUseCase = new ExportArticlesUseCase(
  articleRepository,
  documentRepository,
);

const articleController = new ArticleController(
  articleRepository,
  updateArticlesUseCase,
  exportArticlesUseCase,
);

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', (req, res, next) =>
  articleController.getAll(req as any, res, next),
);

router.post('/update', (req, res, next) =>
  articleController.update(req as any, res, next),
);

router.get('/export', (req, res, next) =>
  articleController.exportPdf(req as any, res, next),
);

export default router;