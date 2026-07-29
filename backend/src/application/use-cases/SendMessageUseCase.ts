import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { IAIService } from '../../domain/services/IAIService';
import { ISearchService } from '../../domain/services/ISearchService';
import { SendMessageDTO, ChatResponseDTO } from '../dtos/ChatDTOs';
import { WebSearchService, WebSearchResult } from '../../infrastructure/search/WebSearchService';
import { config } from '../../config';

/** Prompt base del asistente jurídico */
const SYSTEM_PROMPT = `Eres un asistente jurídico especializado en legislación colombiana.

Responde utilizando el contexto recibido.

Si hay referencias web proporcionadas, úsalas y cita sus URLs.

Si no hay referencias web pero conoces la fuente oficial (como la Constitución, leyes colombianas en funcionpublica.gov.co, la Corte Constitucional en corteconstitucional.gov.co, etc.), puedes incluir la URL al final como referencia.

Siempre que cites una fuente, incluye su URL.
Nunca inventes URLs. Solo usa URLs que estén en las referencias proporcionadas o que sean de fuentes oficiales colombianas ampliamente conocidas.`;

/** Caso de uso: enviar un mensaje al asistente y obtener respuesta con fuentes */
export class SendMessageUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly aiService: IAIService,
    private readonly searchService: ISearchService,
    private readonly documentRepository: IDocumentRepository,
    private readonly webSearchService: WebSearchService = new WebSearchService(),
  ) {}

  /**
   * Ejecuta el envío de un mensaje y genera la respuesta con búsqueda de fuentes
   * @param userId - ID del usuario que envía el mensaje
   * @param dto - Datos del mensaje a enviar
   */
  async execute(userId: string, dto: SendMessageDTO): Promise<ChatResponseDTO> {
    let conversationId = dto.conversationId;

    if (!conversationId) {
      const conversation = await this.conversationRepository.create({ userId, title: 'Nueva conversación' });
      conversationId = conversation.id;
    }

    const [searchResults, webResults] = await Promise.all([
      this.searchService.searchSimilar(dto.question, config.embedding.maxContextArticles),
      this.webSearchService.search(dto.question),
    ]);

    const contextArticles = searchResults
      .filter((r) => r.similarity >= config.embedding.similarityThreshold)
      .map((r) => ({
        articleId: r.article.id,
        law: r.article.documentId,
        article: r.article.number,
        title: r.article.title,
        text: r.article.text,
        similarity: r.similarity,
        documentId: r.article.documentId,
      }));

    const docIds = [...new Set(contextArticles.map((a) => a.documentId))];
    const docs = await Promise.all(
      docIds.map((id) => this.documentRepository.findById(id)),
    );
    const docUrlMap = new Map(
      docs.filter((d) => d).map((d) => [d!.id, d!.filePath.replace(/\\/g, '/')]),
    );

    let fullContext = '';
    if (contextArticles.length > 0) {
      fullContext += 'Contexto de la base de datos:\n\n' + contextArticles
        .map((a) => {
          const fileUrl = docUrlMap.get(a.documentId);
          return `[Artículo ${a.article} - ${a.title}]${fileUrl ? ` (${fileUrl})` : ''}\n${a.text}`;
        })
        .join('\n\n');
    }

    if (webResults.length > 0) {
      fullContext += '\n\nReferencias web:\n\n' + webResults
        .map((r) => `- ${r.title}\n  ${r.url}\n  ${r.snippet}`)
        .join('\n\n');
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(fullContext ? [{ role: 'user' as const, content: fullContext }] : []),
      { role: 'user' as const, content: dto.question },
    ];

    const response = await this.aiService.generateChatCompletion(messages, {
      temperature: config.ai.openai.temperature,
      maxTokens: config.ai.openai.maxTokens,
    });

    const savedMessage = await this.messageRepository.create({
      conversationId,
      question: dto.question,
      answer: response.content,
    });

    for (const article of contextArticles) {
      await this.messageRepository.addSource(
        savedMessage.id,
        article.articleId,
        article.law,
        article.article,
        article.title,
      );
    }

    return {
      message: {
        id: savedMessage.id,
        conversationId,
        question: dto.question,
        answer: response.content,
        createdAt: savedMessage.createdAt.toISOString(),
        sources: contextArticles.map((a) => ({
          id: a.law,
          law: a.law,
          article: a.article,
          title: a.title,
          text: a.text,
        })),
        webReferences: this.extractUrls(response.content, webResults),
      },
    };
  }

  /**
   * Extrae URLs únicas del texto de respuesta combinadas con resultados web
   * @param text - Texto de la respuesta
   * @param webResults - Resultados de búsqueda web
   */
  private extractUrls(text: string, webResults: WebSearchResult[]): WebSearchResult[] {
    const seen = new Set<string>();
    const refs: WebSearchResult[] = [];

    for (const r of webResults) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        refs.push(r);
      }
    }

    const urlRegex = /https?:\/\/[^\s\)\]<>"]+/g;
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0].replace(/[\.\?\!\,;]+$/, '');
      if (!seen.has(url)) {
        seen.add(url);
        refs.push({
          title: url.substring(0, 100),
          url,
          snippet: '',
        });
      }
    }

    return refs.slice(0, 5);
  }
}
