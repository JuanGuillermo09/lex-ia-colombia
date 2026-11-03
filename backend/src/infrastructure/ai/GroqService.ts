import {
  IAIService,
  ChatCompletionMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  EmbeddingResponse,
} from '../../domain/services/IAIService';
import { config } from '../../config';

/** Modelos de Groq usados como respaldo cuando el configurado ya no está disponible. */
const GROQ_FALLBACK_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
];

/** Servicio de IA que utiliza la API de Groq para chat y HuggingFace para embeddings. */
export class GroqService implements IAIService {
  /** Cachea los IDs de modelo disponibles para no consultar la API en cada mensaje. */
  private static availableModels: string[] | null = null;

  /**
   * Obtiene la lista de modelos de texto disponibles para la cuenta de Groq.
   * @returns IDs de modelos, o null si no se pudo consultar
   */
  private async getAvailableModels(): Promise<string[] | null> {
    if (GroqService.availableModels) return GroqService.availableModels;
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${config.ai.groq.apiKey}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      const data: any = await response.json();
      const ids: string[] = (data?.data || [])
        .filter((m: any) => m.active !== false && m.output_modalities?.includes('text'))
        .map((m: any) => m.id);
      GroqService.availableModels = ids;
      return ids;
    } catch {
      return null;
    }
  }

  /**
   * Determina el orden de modelos a intentar: el configurado primero y luego
   * respaldos que existan realmente en la cuenta.
   * @param configured - Modelo solicitado o configurado
   * @returns Lista de modelos candidatos sin duplicados
   */
  private async resolveModelOrder(configured: string): Promise<string[]> {
    const available = await this.getAvailableModels();
    const candidates = [configured, ...GROQ_FALLBACK_MODELS];
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const model of candidates) {
      if (!model || seen.has(model)) continue;
      seen.add(model);
      // Si conocemos los disponibles, priorizamos solo los que existen.
      if (available && available.length > 0 && !available.includes(model)) {
        if (model === configured) ordered.push(model); // aún así intentamos el configurado
        continue;
      }
      ordered.push(model);
    }
    // Si el configurado no existe pero hay disponibles, usa el primero disponible.
    if (available && available.length > 0 && !available.includes(configured)) {
      const firstAvailable = available.find((m) => GROQ_FALLBACK_MODELS.includes(m));
      if (firstAvailable && !ordered.includes(firstAvailable)) ordered.push(firstAvailable);
    }
    return ordered;
  }

  /**
   * Envía mensajes al modelo de chat de Groq y retorna la respuesta.
   * Si el modelo configurado fue retirado, prueba automáticamente otros disponibles.
   * @param messages - Historial de mensajes
   * @param options - Configuración opcional
   * @returns Respuesta con contenido, modelo y uso de tokens
   */
  async generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse> {
    const configured = options?.model || config.ai.groq.model;
    const modelOrder = await this.resolveModelOrder(configured);
    const errors: string[] = [];

    for (const model of modelOrder) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.ai.groq.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options?.maxTokens || config.ai.openai.maxTokens,
          temperature: options?.temperature ?? config.ai.openai.temperature,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        errors.push(`${model}: ${error}`);
        const isModelMissing =
          error.includes('model_not_found') ||
          error.includes('does not exist') ||
          error.includes('decommissioned');
        if (isModelMissing) {
          console.warn(`[Groq] Modelo "${model}" no disponible, probando otro...`);
          continue;
        }
        throw new Error(`Groq API error: ${error}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content.trim()) {
        errors.push(`${model}: respuesta vacía`);
        console.warn(`[Groq] Modelo "${model}" devolvió contenido vacío, probando otro...`);
        continue;
      }

      return {
        content,
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
      };
    }

    throw new Error(`Groq: todos los modelos fallaron.\n${errors.join('\n')}`);
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
