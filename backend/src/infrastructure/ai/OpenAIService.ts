import {
  IAIService,
  ChatCompletionMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  EmbeddingResponse,
} from '../../domain/services/IAIService';
import { config } from '../../config';

/** Servicio de IA que utiliza la API de OpenAI (ChatGPT y Embeddings). */
export class OpenAIService implements IAIService {
  /**
   * Envía un historial de mensajes al modelo de chat de OpenAI y retorna la respuesta.
   * @param messages - Lista de mensajes del historial
   * @param options - Configuración opcional (modelo, tokens, temperatura)
   * @returns Respuesta con contenido, modelo y uso de tokens
   */
  async generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || config.ai.openai.model,
        messages,
        max_tokens: options?.maxTokens || config.ai.openai.maxTokens,
        temperature: options?.temperature ?? config.ai.openai.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data: any = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }

  /**
   * Genera un vector de embedding para el texto dado usando la API de OpenAI.
   * @param text - Texto a vectorizar (se trunca a 7000 caracteres)
   * @returns Vector de embedding y modelo utilizado
   */
  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    const truncated = text.length > 7000 ? text.substring(0, 7000) : text;
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.openai.embeddingModel,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Embedding API error: ${error}`);
    }

    const data: any = await response.json();
    return {
      embedding: data.data[0].embedding,
      model: data.model,
    };
  }
}
