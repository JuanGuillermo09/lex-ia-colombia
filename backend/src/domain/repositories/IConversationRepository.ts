import { IConversation } from '../entities/Conversation';

/** Repositorio para operaciones de persistencia de conversaciones */
export interface IConversationRepository {
  /** Busca una conversación por su ID */
  findById(id: string): Promise<IConversation | null>;
  /** Busca todas las conversaciones de un usuario */
  findByUserId(userId: string): Promise<IConversation[]>;
  /** Busca conversaciones de un usuario incluyendo sus mensajes */
  findByUserIdWithMessages(userId: string): Promise<IConversation[]>;
  /** Crea una nueva conversación */
  create(data: Omit<IConversation, 'id' | 'createdAt' | 'messages'>): Promise<IConversation>;
  /** Actualiza el título de una conversación */
  update(id: string, data: Partial<Pick<IConversation, 'title'>>): Promise<IConversation>;
  /** Elimina una conversación por su ID */
  delete(id: string): Promise<void>;
  /** Elimina múltiples conversaciones de un usuario */
  deleteMany(ids: string[], userId: string): Promise<void>;
}
