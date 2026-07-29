import { IMessage } from '../entities/Message';

/** Repositorio para operaciones de persistencia de mensajes */
export interface IMessageRepository {
  /** Busca un mensaje por su ID */
  findById(id: string): Promise<IMessage | null>;
  /** Busca todos los mensajes de una conversación */
  findByConversationId(conversationId: string): Promise<IMessage[]>;
  /** Crea un nuevo mensaje */
  create(data: Omit<IMessage, 'id' | 'createdAt' | 'sources'>): Promise<IMessage>;
  /** Añade una fuente legal a un mensaje */
  addSource(messageId: string, articleId: string, law: string, article: string, title: string): Promise<void>;
}
