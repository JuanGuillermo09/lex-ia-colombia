import { PrismaClient } from '@prisma/client';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { Message, IMessage } from '../../domain/entities/Message';

/** Repositorio de mensajes implementado con Prisma ORM. */
export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Busca un mensaje por su ID incluyendo fuentes y artículo relacionado.
   * @param id - Identificador único del mensaje
   * @returns Mensaje o null si no existe
   */
  async findById(id: string): Promise<IMessage | null> {
    const msg = await this.prisma.message.findUnique({
      where: { id },
      include: { sources: { include: { article: true } } },
    });
    if (!msg) return null;
    return this.toDomain(msg);
  }

  /**
   * Retorna todos los mensajes de una conversación ordenados por fecha ascendente.
   * @param conversationId - ID de la conversación
   * @returns Lista de mensajes
   */
  async findByConversationId(conversationId: string): Promise<IMessage[]> {
    const msgs = await this.prisma.message.findMany({
      where: { conversationId },
      include: { sources: { include: { article: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return msgs.map((m) => this.toDomain(m));
  }

  /**
   * Crea un nuevo mensaje en la base de datos.
   * @param data - Datos del mensaje sin id, createdAt ni sources
   * @returns Mensaje creado
   */
  async create(data: Omit<IMessage, 'id' | 'createdAt' | 'sources'>): Promise<IMessage> {
    const msg = await this.prisma.message.create({ data });
    return this.toDomain(msg);
  }

  /**
   * Asocia una fuente (artículo) a un mensaje.
   * @param messageId - ID del mensaje
   * @param articleId - ID del artículo fuente
   */
  async addSource(
    messageId: string,
    articleId: string,
    law: string,
    article: string,
    title: string,
  ): Promise<void> {
    await this.prisma.messageSource.create({
      data: { messageId, articleId },
    });
  }

  /** Convierte un registro de Prisma a la entidad de dominio Message con fuentes. */
  private toDomain(msg: any): IMessage {
    return new Message(
      msg.id,
      msg.conversationId,
      msg.question,
      msg.answer,
      msg.createdAt,
      msg.sources?.map((s: any) => ({
        id: s.id,
        messageId: s.messageId,
        articleId: s.articleId,
        law: s.article?.document?.name || '',
        article: s.article?.number || '',
        title: s.article?.title || '',
      })),
    );
  }
}
