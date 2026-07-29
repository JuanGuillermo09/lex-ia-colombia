import { z } from 'zod';

/** Esquema de validación para enviar un mensaje */
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  question: z.string().min(1).max(10000),
});

/** Esquema de validación para renombrar una conversación */
export const RenameConversationSchema = z.object({
  title: z.string().min(1).max(200),
});

export type SendMessageDTO = z.infer<typeof SendMessageSchema>;
export type RenameConversationDTO = z.infer<typeof RenameConversationSchema>;

/** DTO con la respuesta del chat (mensaje generado + fuentes) */
export interface ChatResponseDTO {
  message: {
    id: string;
    conversationId: string;
    question: string;
    answer: string;
    createdAt: string;
    sources: Array<{
      id: string;
      law: string;
      article: string;
      title: string;
      text: string;
    }>;
    webReferences?: Array<{
      title: string;
      url: string;
      snippet: string;
    }>;
  };
}

/** DTO que representa una conversación completa con sus mensajes */
export interface ConversationDTO {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  messages: MessageDTO[];
}

/** DTO que representa un mensaje dentro de una conversación */
export interface MessageDTO {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  sources: Array<{
    law: string;
    article: string;
    title: string;
  }>;
}
