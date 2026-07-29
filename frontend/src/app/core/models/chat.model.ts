/** Fuente legal citada en un mensaje */
export interface MessageSource {
  id: string;
  law: string;
  article: string;
  title: string;
  text?: string;
}

/** Referencia web adjunta a un mensaje */
export interface WebReference {
  title: string;
  url: string;
  snippet: string;
}

/** Mensaje individual dentro de una conversación */
export interface Message {
  id: string;
  conversationId: string;
  question: string;
  answer: string;
  createdAt: string;
  sources: MessageSource[];
  webReferences?: WebReference[];
}

/** Conversación completa con sus mensajes */
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

/** Respuesta del servidor al enviar un mensaje */
export interface ChatResponse {
  message: Message;
}
