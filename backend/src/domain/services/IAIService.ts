/** Mensaje dentro de una conversación con la IA */
export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Opciones para configurar la generación de la respuesta */
export interface ChatCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/** Respuesta generada por el modelo de IA */
export interface ChatCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/** Vector de embedding generado por el modelo */
export interface EmbeddingResponse {
  embedding: number[];
  model: string;
}

/** Servicio de IA para generación de texto y embeddings */
export interface IAIService {
  /**
   * Genera una respuesta del modelo dada una lista de mensajes
   * @param messages - Historial de mensajes de la conversación
   * @param options - Opciones de configuración del modelo
   */
  generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse>;
  /**
   * Genera un vector de embedding para un texto
   * @param text - Texto a convertir en embedding
   */
  generateEmbedding(text: string): Promise<EmbeddingResponse>;
}
