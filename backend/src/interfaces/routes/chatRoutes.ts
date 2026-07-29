import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { SendMessageSchema, RenameConversationSchema } from '../../application/dtos/ChatDTOs';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authMiddleware';
import { PrismaConversationRepository } from '../../infrastructure/database/PrismaConversationRepository';
import { PrismaMessageRepository } from '../../infrastructure/database/PrismaMessageRepository';
import { PrismaArticleRepository } from '../../infrastructure/database/PrismaArticleRepository';
import { PrismaDocumentRepository } from '../../infrastructure/database/PrismaDocumentRepository';
import { AIServiceFactory } from '../../infrastructure/ai/AIServiceFactory';
import { EmbeddingSearchService } from '../../infrastructure/search/EmbeddingSearchService';
import { WebSearchService } from '../../infrastructure/search/WebSearchService';
import { SendMessageUseCase } from '../../application/use-cases/SendMessageUseCase';
import { GetConversationsUseCase } from '../../application/use-cases/GetConversationsUseCase';
import prisma from '../../infrastructure/database/PrismaClient';

const aiService = AIServiceFactory.create();
const conversationRepository = new PrismaConversationRepository(prisma);
const messageRepository = new PrismaMessageRepository(prisma);
const articleRepository = new PrismaArticleRepository(prisma);
const documentRepository = new PrismaDocumentRepository(prisma);
const searchService = new EmbeddingSearchService(articleRepository, aiService);
const webSearchService = new WebSearchService();

const sendMessageUseCase = new SendMessageUseCase(
  conversationRepository,
  messageRepository,
  aiService,
  searchService,
  documentRepository,
  webSearchService,
);
const getConversationsUseCase = new GetConversationsUseCase(
  conversationRepository,
  messageRepository,
);

const chatController = new ChatController(sendMessageUseCase, getConversationsUseCase, conversationRepository);

const router = Router();

/** Todas las rutas requieren autenticación */
router.use(authenticate);

/** POST /api/chat/messages - Enviar mensaje y obtener respuesta de la IA */
router.post('/messages', validate(SendMessageSchema), (req, res, next) =>
  chatController.sendMessage(req as any, res, next),
);

/** GET /api/chat/conversations - Listar conversaciones del usuario */
router.get('/conversations', (req, res, next) =>
  chatController.getConversations(req as any, res, next),
);

/** DELETE /api/chat/conversations/:id - Eliminar una conversación */
router.delete('/conversations/:id', (req, res, next) =>
  chatController.deleteConversation(req as any, res, next),
);

/** POST /api/chat/conversations/delete-batch - Eliminar conversaciones en lote */
router.post('/conversations/delete-batch', (req, res, next) =>
  chatController.deleteBatch(req as any, res, next),
);

/** PATCH /api/chat/conversations/:id - Renombrar una conversación */
router.patch('/conversations/:id', validate(RenameConversationSchema), (req, res, next) =>
  chatController.renameConversation(req as any, res, next),
);

export default router;
