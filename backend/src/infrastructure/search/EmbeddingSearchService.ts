import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { IAIService } from '../../domain/services/IAIService';
import { ISearchService, SearchResult } from '../../domain/services/ISearchService';
import { IArticle } from '../../domain/entities/Article';
import { config } from '../../config';

/** Servicio de búsqueda semántica que usa embeddings para encontrar artículos similares. */
export class EmbeddingSearchService implements ISearchService {
  constructor(
    private readonly articleRepository: IArticleRepository,
    private readonly aiService: IAIService,
  ) {}

  /**
   * Busca artículos similares a la consulta generando un embedding.
   * Si falla la generación del embedding, fallback a artículos recientes.
   * @param query - Texto de consulta
   * @param limit - Máximo de resultados (opcional)
   * @returns Lista de resultados con artículo y similitud
   */
  async searchSimilar(query: string, limit?: number): Promise<SearchResult[]> {
    let articles: IArticle[];
    try {
      const embeddingResult = await this.aiService.generateEmbedding(query);
      articles = await this.articleRepository.searchSimilar(
        embeddingResult.embedding,
        limit || config.embedding.maxContextArticles,
        config.embedding.similarityThreshold,
      );
    } catch {
      articles = await this.articleRepository.findRecent(limit || config.embedding.maxContextArticles);
    }

    return articles.map((article) => ({
      article,
      similarity: 0,
    }));
  }

  /**
   * Busca artículos por similitud semántica sin filtro de threshold.
   * Fallback a artículos recientes si el embedding falla.
   * @param query - Texto de consulta
   * @param limit - Máximo de resultados
   * @returns Lista de artículos similares
   */
  async searchByText(query: string, limit?: number): Promise<IArticle[]> {
    try {
      const embeddingResult = await this.aiService.generateEmbedding(query);
      return this.articleRepository.searchSimilar(
        embeddingResult.embedding,
        limit || config.embedding.maxContextArticles,
        0,
      );
    } catch {
      return this.articleRepository.findRecent(limit || config.embedding.maxContextArticles);
    }
  }
}
