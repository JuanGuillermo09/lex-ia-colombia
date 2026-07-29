import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { SendMessageUseCase } from '../../application/use-cases/SendMessageUseCase';
import { GetConversationsUseCase } from '../../application/use-cases/GetConversationsUseCase';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';

/** Controlador de operaciones del chat */
export class ChatController {
  /**
   * @param sendMessageUseCase Caso de uso para enviar mensajes
   * @param getConversationsUseCase Caso de uso para obtener conversaciones
   * @param conversationRepository Repositorio de conversaciones
   */
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly conversationRepository: IConversationRepository,
  ) {}

  /**
   * Envía un mensaje dentro de una conversación y obtiene respuesta de la IA
   * @returns Respuesta generada por la IA
   */
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.sendMessageUseCase.execute(req.user!.userId, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las conversaciones del usuario autenticado
   * @returns Lista de conversaciones
   */
  async getConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await this.getConversationsUseCase.execute(req.user!.userId);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Renombra una conversación existente
   * @returns Conversación actualizada con el nuevo título
   */
  async renameConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title } = req.body;
      const conversation = await this.conversationRepository.update(req.params.id as string, { title });
      res.json({ id: conversation.id, title: conversation.title });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una conversación por su ID
   * @returns 204 sin contenido
   */
  async deleteConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.conversationRepository.deleteMany([req.params.id as string], req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina múltiples conversaciones en lote
   * @returns 204 sin contenido
   */
  async deleteBatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: 'Se requiere un arreglo de IDs' });
        return;
      }
      await this.conversationRepository.deleteMany(ids, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
