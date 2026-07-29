import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DocumentController } from '../controllers/DocumentController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { PrismaDocumentRepository } from '../../infrastructure/database/PrismaDocumentRepository';
import { PrismaArticleRepository } from '../../infrastructure/database/PrismaArticleRepository';
import { PDFParserService } from '../../infrastructure/document/PDFParserService';
import { AIServiceFactory } from '../../infrastructure/ai/AIServiceFactory';
import { UploadDocumentUseCase } from '../../application/use-cases/UploadDocumentUseCase';
import { DeleteDocumentUseCase } from '../../application/use-cases/DeleteDocumentUseCase';
import { GetStatsUseCase } from '../../application/use-cases/GetStatsUseCase';
import { config } from '../../config';
import prisma from '../../infrastructure/database/PrismaClient';

const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Solo se permiten archivos PDF'));
      return;
    }
    cb(null, true);
  },
});

const aiService = AIServiceFactory.create();
const documentRepository = new PrismaDocumentRepository(prisma);
const articleRepository = new PrismaArticleRepository(prisma);
const pdfParser = new PDFParserService();

const uploadDocumentUseCase = new UploadDocumentUseCase(
  documentRepository,
  articleRepository,
  pdfParser,
  aiService,
);
const deleteDocumentUseCase = new DeleteDocumentUseCase(
  documentRepository,
  articleRepository,
);
const getStatsUseCase = new GetStatsUseCase(documentRepository, articleRepository);

const documentController = new DocumentController(
  uploadDocumentUseCase,
  deleteDocumentUseCase,
  getStatsUseCase,
  documentRepository,
);

const router = Router();

/** Todas las rutas requieren autenticación */
router.use(authenticate);

/** GET /api/documents/stats - Estadísticas de documentos (solo ADMIN) */
router.get('/stats', authorize('ADMIN'), (req, res, next) =>
  documentController.getStats(req as any, res, next),
);

/** POST /api/documents/upload - Subir documento PDF (solo ADMIN) */
router.post('/upload', authorize('ADMIN'), upload.single('file'), (req, res, next) =>
  documentController.upload(req as any, res, next),
);

/** GET /api/documents - Listar todos los documentos */
router.get('/', (req, res, next) =>
  documentController.list(req as any, res, next),
);

/** DELETE /api/documents/:id - Eliminar un documento (solo ADMIN) */
router.delete('/:id', authorize('ADMIN'), (req, res, next) =>
  documentController.delete(req as any, res, next),
);

export default router;
