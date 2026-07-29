import {
  IAIService,
  ChatCompletionMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  EmbeddingResponse,
} from '../../domain/services/IAIService';
import { GroqService } from './GroqService';
import { GeminiService } from './GeminiService';

export class FallbackAIService implements IAIService {
  private providers: IAIService[];

  constructor() {
    this.providers = [new GeminiService(), new GroqService()];
  }

  async generateChatCompletion(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResponse> {
    const errors: string[] = [];
    for (const provider of this.providers) {
      try {
        return await provider.generateChatCompletion(messages, options);
      } catch (e: any) {
        errors.push(e.message);
        const isRateLimit =
          e.message.includes('rate_limit') ||
          e.message.includes('429') ||
          e.message.includes('quota') ||
          e.message.includes('RESOURCE_EXHAUSTED');
        if (!isRateLimit) throw e;
        console.warn(`[Fallback] Provider falló (rate limit), probando siguiente...`);
      }
    }
    throw new Error(`Todos los proveedores fallaron:\n${errors.join('\n')}`);
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    return this.providers[0].generateEmbedding(text);
  }
}
