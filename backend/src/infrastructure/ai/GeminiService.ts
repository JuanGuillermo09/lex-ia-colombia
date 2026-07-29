import {
  IAIService,
  ChatCompletionMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  EmbeddingResponse,
} from '../../domain/services/IAIService';
import { config } from '../../config';

/** Servicio de IA que utiliza la API de Google Gemini para chat y HuggingFace para embeddings. */
export class GeminiService implements IAIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1';

  /** Inicializa el servicio con la clave de API desde la configuración. */
  constructor() {
    this.apiKey = config.ai.gemini.apiKey;
  }

  /**
   * Envía mensajes a Gemini adaptando el formato (system → systemInstruction, assistant → model).
   * @param messages - Historial de mensajes
   * @param options - Configuración opcional (modelo, tokens, temperatura)
   * @returns Respuesta con contenido, modelo y uso de tokens
   */
  async generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse> {
    const systemMsg = messages.find((m) => m.role === 'system');
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const model = options?.model || config.ai.gemini.model;
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    const body: any = {
      contents,
      generationConfig: {
        maxOutputTokens: options?.maxTokens || config.ai.openai.maxTokens,
        temperature: options?.temperature ?? config.ai.openai.temperature,
      },
    };

    if (systemMsg) {
      body.systemInstruction = {
        parts: [{ text: systemMsg.content }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data: any = await response.json();
    const candidate = data.candidates?.[0];
    return {
      content: candidate?.content?.parts?.[0]?.text || '',
      model: data.modelVersion || model,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
    };
  }

  /**
   * Genera un embedding usando HuggingFace Inference API (texto truncado a 500 caracteres).
   * @param text - Texto a vectorizar
   * @returns Vector de embedding y modelo utilizado
   */
  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    const truncated = text.length > 500 ? text.substring(0, 500) : text;
    const model = 'sentence-transformers/all-MiniLM-L6-v2';
    const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.ai.groq.hfToken) {
      headers['Authorization'] = `Bearer ${config.ai.groq.hfToken}`;
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inputs: truncated }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const error = await response.text();
        console.warn(`[Embedding] HF API error (${response.status}): ${error.substring(0, 100)}`);
        return { embedding: new Array(384).fill(0), model: 'fallback' };
      }
      const data: any = await response.json();
      if (!data || !Array.isArray(data[0])) {
        console.warn('[Embedding] Unexpected HF response format');
        return { embedding: new Array(384).fill(0), model: 'fallback' };
      }
      return { embedding: data[0], model };
    } catch (e: any) {
      console.warn(`[Embedding] Error: ${e.message}`);
      return { embedding: new Array(384).fill(0), model: 'fallback' };
    }
  }
}
