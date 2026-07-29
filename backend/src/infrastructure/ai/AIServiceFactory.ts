import { IAIService } from '../../domain/services/IAIService';
import { OpenAIService } from './OpenAIService';
import { LlamaService } from './LlamaService';
import { GroqService } from './GroqService';
import { GeminiService } from './GeminiService';
import { FallbackAIService } from './FallbackAIService';
import { config } from '../../config';

/** Fábrica que crea la implementación concreta de IA según la configuración. */
export class AIServiceFactory {
  /**
   * Crea y retorna una instancia del servicio de IA configurado.
   * @returns Implementación de IA basada en config.ai.provider
   */
  static create(): IAIService {
    const provider = config.ai.provider;
    if (provider === 'fallback') {
      return new FallbackAIService();
    }
    switch (provider) {
      case 'gemini':
        return new GeminiService();
      case 'groq':
        return new GroqService();
      case 'llama':
        return new LlamaService();
      case 'openai':
      default:
        return new OpenAIService();
    }
  }
}
