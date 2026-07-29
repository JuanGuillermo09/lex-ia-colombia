import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { IDocumentParserService } from '../../domain/services/IDocumentParserService';
import { IAIService } from '../../domain/services/IAIService';
import { DocumentResponseDTO } from '../dtos/DocumentDTOs';

/** Caso de uso: subir y procesar un documento legal extrayendo sus artículos */
export class UploadDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly articleRepository: IArticleRepository,
    private readonly documentParser: IDocumentParserService,
    private readonly aiService: IAIService,
  ) {}

  /**
   * Ejecuta la subida: parsea el documento, crea artículos con embeddings
   * @param name - Nombre del documento
   * @param type - Tipo de documento
   * @param filePath - Ruta del archivo en disco
   */
  async execute(name: string, type: string, filePath: string): Promise<DocumentResponseDTO> {
    const parsed = await this.documentParser.parse(filePath);

    const document = await this.documentRepository.create({
      name,
      type,
      filePath,
    });

    let articlesCount = 0;
    for (const article of parsed.articles) {
      const embeddingResult = await this.aiService.generateEmbedding(article.text);
      await this.articleRepository.create({
        documentId: document.id,
        number: article.number,
        title: article.title,
        text: article.text,
        embedding: embeddingResult.embedding,
      });
      articlesCount++;
    }

    return {
      id: document.id,
      name: document.name,
      type: document.type,
      filePath: document.filePath,
      uploadedAt: document.uploadedAt.toISOString(),
      articlesCount,
    };
  }
}
