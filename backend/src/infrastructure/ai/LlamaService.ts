import {
  IAIService,
  ChatCompletionMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  EmbeddingResponse,
} from '../../domain/services/IAIService';
import { config } from '../../config';

/** Servicio de IA que se conecta a una instancia local de Llama (Ollama). */
export class LlamaService implements IAIService {
  /**
   * Construye un prompt con formato Llama y envía la solicitud a la API de Ollama.
   * @param messages - Historial de mensajes con roles system/user/assistant
   * @param options - Configuración opcional
   * @returns Respuesta con contenido generado y modelo
   */
  async generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse> {
    const prompt = messages
      .map((m) => {
        switch (m.role) {
          case 'system':
            return `<s>[INST] <<SYS>>\n${m.content}\n<</SYS>>\n\n`;
          case 'user':
            return `${m.content} [/INST]`;
          case 'assistant':
            return `${m.content} </s><s>[INST]`;
          default:
            return m.content;
        }
      })
      .join('\n');

    const response = await fetch(config.ai.llama.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || config.ai.llama.model,
        prompt,
        stream: false,
        options: {
          num_predict: options?.maxTokens || config.ai.openai.maxTokens,
          temperature: options?.temperature ?? config.ai.openai.temperature,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Llama API error: ${error}`);
    }

    const data: any = await response.json();
    return {
      content: data.response,
      model: data.model,
    };
  }

  /**
   * Genera un embedding usando el modelo local de Ollama (texto truncado a 500 caracteres).
   * @param text - Texto a vectorizar
   * @returns Vector de embedding y modelo utilizado
   */
  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    const truncated = text.length > 500 ? text.substring(0, 500) : text;
    const response = await fetch(`${config.ai.llama.apiUrl.replace('/generate', '/embeddings')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ai.llama.embeddingModel,
        prompt: truncated,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Llama Embedding API error: ${error}`);
    }

    const data: any = await response.json();
    return {
      embedding: data.embedding,
      model: data.model,
    };
  }
}
