import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import fs from 'fs/promises';

/** Caso de uso: eliminar un documento y sus artículos asociados */
export class DeleteDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly articleRepository: IArticleRepository,
  ) {}

  /**
   * Ejecuta la eliminación del documento y su archivo físico
   * @param documentId - ID del documento a eliminar
   */
  async execute(documentId: string): Promise<void> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Documento no encontrado');
    }

    await this.articleRepository.deleteByDocumentId(documentId);
    await this.documentRepository.delete(documentId);

    try {
      await fs.unlink(document.filePath);
    } catch {
      // File may not exist
    }
  }
}
