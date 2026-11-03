import {
  IAIService,
  ChatCompletionMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  EmbeddingResponse,
} from '../../domain/services/IAIService';
import { GroqService } from './GroqService';
import { GeminiService } from './GeminiService';
import { config } from '../../config';

/**
 * Servicio de IA con respaldo en cascada.
 * Intenta los proveedores configurados (Gemini, Groq); si ninguno está
 * disponible o todos fallan, responde con un mensaje informativo basado
 * en el contexto local en lugar de romper el chat con un error 500.
 */
export class FallbackAIService implements IAIService {
  private providers: IAIService[];

  constructor() {
    this.providers = [new GeminiService(), new GroqService()];
  }

  /** Indica si un proveedor tiene credenciales configuradas. */
  private hasCredentials(provider: IAIService): boolean {
    if (provider instanceof GeminiService) return !!config.ai.gemini.apiKey;
    if (provider instanceof GroqService) return !!config.ai.groq.apiKey;
    return true;
  }

  async generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse> {
    const errors: string[] = [];
    for (const provider of this.providers) {
      if (!this.hasCredentials(provider)) {
        errors.push(`${provider.constructor.name}: sin credenciales configuradas`);
        continue;
      }
      try {
        return await provider.generateChatCompletion(messages, options);
      } catch (e: any) {
        const message = e?.message || String(e);
        errors.push(message);
        const isRateLimit =
          message.includes('rate_limit') ||
          message.includes('429') ||
          message.includes('quota') ||
          message.includes('RESOURCE_EXHAUSTED');
        console.warn(
          `[Fallback] ${provider.constructor.name} falló${isRateLimit ? ' (rate limit)' : ''}: ${message.substring(0, 160)}`,
        );
      }
    }

    if (errors.length > 0) {
      console.warn(`[Fallback] Usando respuesta de respaldo. Detalles:\n${errors.join('\n')}`);
    }

    return this.buildFallbackResponse(messages);
  }

  /**
   * Construye una respuesta útil con el contexto disponible cuando no hay IA.
   * @param messages - Historial de mensajes del que se extrae el contexto local
   */
  private buildFallbackResponse(messages: ChatCompletionMessage[]): ChatCompletionResponse {
    const context = messages.find((m) => m.role === 'user' && m.content.startsWith('Contexto de la base de datos'));
    const parts: string[] = [];

    parts.push(
      '⚠️ El asistente de IA no está disponible en este momento (no hay proveedor de IA configurado o respondió con error). ' +
        'Estas son las referencias de la base de datos local que coinciden con tu consulta:',
    );

    if (context) {
      const lines = context.content.split('\n');
      const items: string[] = [];
      let current = '';
      for (const line of lines) {
        if (line.startsWith('[Artículo')) {
          if (current) items.push(current.trim());
          current = line + '\n';
        } else if (current) {
          current += line + '\n';
        }
        if (items.length >= 5) break;
      }
      if (current && items.length < 5) items.push(current.trim());

      if (items.length > 0) {
        parts.push('\n' + items.map((i) => '• ' + i.replace(/\n+/g, ' ').substring(0, 400)).join('\n\n'));
      } else {
        parts.push('\nTodavía no hay artículos cargados que coincidan con tu consulta.');
      }
    } else {
      parts.push(
        '\nNo se encontraron artículos en la base de datos local para esta consulta. ' +
          'Puedes intentar de nuevo más tarde o cargar documentos legales desde el panel de administración.',
      );
    }

    return {
      content: parts.join('\n'),
      model: 'fallback-local',
      usage: undefined,
    };
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    return this.providers[0].generateEmbedding(text);
  }
}
