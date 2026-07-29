import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { ConversationDTO, MessageDTO } from '../dtos/ChatDTOs';

/** Caso de uso: obtener todas las conversaciones de un usuario con sus mensajes */
export class GetConversationsUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  /**
   * Ejecuta la obtención de conversaciones para un usuario
   * @param userId - ID del usuario
   */
  async execute(userId: string): Promise<ConversationDTO[]> {
    const conversations = await this.conversationRepository.findByUserId(userId);

    const result: ConversationDTO[] = [];
    for (const conv of conversations) {
      const messages = await this.messageRepository.findByConversationId(conv.id);
      result.push({
        id: conv.id,
        userId: conv.userId,
        title: conv.title,
        createdAt: conv.createdAt.toISOString(),
        messages: messages.map((m) => ({
          id: m.id,
          question: m.question,
          answer: m.answer,
          createdAt: m.createdAt.toISOString(),
          sources: m.sources?.map((s) => ({
            law: s.law,
            article: s.article,
            title: s.title,
          })) || [],
        })),
      });
    }

    return result;
  }
}
