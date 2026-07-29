import {
  IAIService,
  ChatCompletionMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  EmbeddingResponse,
} from '../../domain/services/IAIService';
import { config } from '../../config';

/** Servicio de IA que utiliza la API de Groq para chat y HuggingFace para embeddings. */
export class GroqService implements IAIService {
  /**
   * Envía mensajes al modelo de chat de Groq y retorna la respuesta.
   * @param messages - Historial de mensajes
   * @param options - Configuración opcional
   * @returns Respuesta con contenido, modelo y uso de tokens
   */
  async generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.groq.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || config.ai.groq.model,
        messages,
        max_tokens: options?.maxTokens || config.ai.openai.maxTokens,
        temperature: options?.temperature ?? config.ai.openai.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
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
   * Genera un embedding usando HuggingFace Inference API (texto truncado a 500 caracteres).
   * @param text - Texto a vectorizar
   * @returns Vector de embedding y modelo utilizado
   */
  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    const truncated = text.length > 500 ? text.substring(0, 500) : text;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.ai.groq.hfToken) {
      headers['Authorization'] = `Bearer ${config.ai.groq.hfToken}`;
    }
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/${config.ai.groq.embeddingModel}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ inputs: truncated }),
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!response.ok) {
        const error = await response.text();
        console.warn(`[Embedding] HF API error (${response.status}): ${error.substring(0, 100)}`);
        return this.fallbackEmbedding();
      }
      const data: any = await response.json();
      if (!data || !Array.isArray(data[0])) {
        console.warn('[Embedding] Unexpected HF response format');
        return this.fallbackEmbedding();
      }
      return { embedding: data[0], model: config.ai.groq.embeddingModel };
    } catch (e: any) {
      console.warn(`[Embedding] Error: ${e.message}`);
      return this.fallbackEmbedding();
    }
  }

  private fallbackEmbedding(): EmbeddingResponse {
    console.warn('[Embedding] Using fallback zero vector (semantic search degraded)');
    return { embedding: new Array(384).fill(0), model: 'fallback' };
  }
}
