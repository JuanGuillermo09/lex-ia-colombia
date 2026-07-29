import { PrismaClient } from '@prisma/client';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { Conversation, IConversation } from '../../domain/entities/Conversation';

/** Repositorio de conversaciones implementado con Prisma ORM. */
export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Busca una conversación por su ID.
   * @param id - Identificador único
   * @returns Conversación o null si no existe
   */
  async findById(id: string): Promise<IConversation | null> {
    const conv = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conv) return null;
    return this.toDomain(conv);
  }

  /**
   * Retorna todas las conversaciones de un usuario ordenadas por fecha descendente.
   * @param userId - ID del usuario
   * @returns Lista de conversaciones
   */
  async findByUserId(userId: string): Promise<IConversation[]> {
    const convs = await this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return convs.map((c) => this.toDomain(c));
  }

  /**
   * Retorna conversaciones con mensajes, fuentes y artículos anidados.
   * @param userId - ID del usuario
   * @returns Lista de conversaciones con mensajes expandidos
   */
  async findByUserIdWithMessages(userId: string): Promise<IConversation[]> {
    const convs = await this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sources: {
              include: { article: { include: { document: true } } },
            },
          },
        },
      },
    });
    return convs.map((c) => {
      const conv = this.toDomain(c);
      conv.messages = c.messages.map((m: any) => ({
        id: m.id,
        conversationId: m.conversationId,
        question: m.question,
        answer: m.answer,
        createdAt: m.createdAt,
        sources: m.sources?.map((s: any) => ({
          id: s.id,
          messageId: s.messageId,
          articleId: s.articleId,
          law: s.article?.document?.name || '',
          article: s.article?.number || '',
          title: s.article?.title || '',
        })),
      }));
      return conv;
    });
  }

  /**
   * Crea una nueva conversación con título por defecto si no se provee.
   * @param data - Datos de la conversación (sin id, createdAt, messages)
   * @returns Conversación creada
   */
  async create(data: Omit<IConversation, 'id' | 'createdAt' | 'messages'>): Promise<IConversation> {
    const conv = await this.prisma.conversation.create({
      data: { userId: data.userId, title: data.title || 'Nueva conversación' },
    });
    return this.toDomain(conv);
  }

  /**
   * Actualiza el título de una conversación.
   * @param id - ID de la conversación
   * @param data - Objeto con el nuevo título
   * @returns Conversación actualizada
   */
  async update(id: string, data: Partial<Pick<IConversation, 'title'>>): Promise<IConversation> {
    const conv = await this.prisma.conversation.update({
      where: { id },
      data: { title: data.title },
    });
    return this.toDomain(conv);
  }

  /**
   * Elimina una conversación por su ID.
   * @param id - ID de la conversación
   */
  async delete(id: string): Promise<void> {
    await this.prisma.conversation.delete({ where: { id } });
  }

  /**
   * Elimina múltiples conversaciones de un usuario verificando pertenencia.
   * @param ids - Lista de IDs a eliminar
   * @param userId - ID del usuario propietario
   */
  async deleteMany(ids: string[], userId: string): Promise<void> {
    await this.prisma.conversation.deleteMany({
      where: { id: { in: ids }, userId },
    });
  }

  /** Convierte un registro de Prisma a la entidad de dominio Conversation. */
  private toDomain(conv: any): IConversation {
    return new Conversation(conv.id, conv.userId, conv.title, conv.createdAt);
  }
}
