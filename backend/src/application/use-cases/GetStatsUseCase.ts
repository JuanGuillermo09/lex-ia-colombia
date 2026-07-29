import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { DocumentStatsDTO } from '../dtos/DocumentDTOs';

/** Caso de uso: obtener estadísticas de documentos y artículos */
export class GetStatsUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly articleRepository: IArticleRepository,
  ) {}

  /**
   * Ejecuta el cálculo de estadísticas (total docs, artículos, agrupación por tipo)
   */
  async execute(): Promise<DocumentStatsDTO> {
    const documents = await this.documentRepository.findAll();
    const totalDocuments = documents.length;

    let totalArticles = 0;
    const typeMap = new Map<string, number>();

    for (const doc of documents) {
      const articles = await this.articleRepository.findByDocumentId(doc.id);
      totalArticles += articles.length;

      const current = typeMap.get(doc.type) || 0;
      typeMap.set(doc.type, current + 1);
    }

    const documentsByType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    return {
      totalDocuments,
      totalArticles,
      documentsByType,
    };
  }
}
