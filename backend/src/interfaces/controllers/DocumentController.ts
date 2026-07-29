import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { UploadDocumentUseCase } from '../../application/use-cases/UploadDocumentUseCase';
import { DeleteDocumentUseCase } from '../../application/use-cases/DeleteDocumentUseCase';
import { GetStatsUseCase } from '../../application/use-cases/GetStatsUseCase';
import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { IDocument } from '../../domain/entities/Document';

/** Controlador de documentos legales */
export class DocumentController {
  /**
   * @param uploadDocumentUseCase Caso de uso para subir documentos
   * @param deleteDocumentUseCase Caso de uso para eliminar documentos
   * @param getStatsUseCase Caso de uso para obtener estadísticas
   * @param documentRepository Repositorio de documentos
   */
  constructor(
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
    private readonly documentRepository: IDocumentRepository,
  ) {}

  /**
   * Sube un documento PDF, lo procesa y genera artículos
   * @returns Documento creado con sus artículos
   */
  async upload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Archivo PDF requerido' });
        return;
      }

      const { name, type } = req.body;
      const result = await this.uploadDocumentUseCase.execute(
        name || req.file.originalname,
        type || 'Documento',
        req.file.path,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todos los documentos disponibles
   * @returns Lista de documentos
   */
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documents = await this.documentRepository.findAll();
      res.json(documents);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un documento y sus artículos asociados
   * @returns 204 sin contenido
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.deleteDocumentUseCase.execute(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas de documentos y artículos
   * @returns Estadísticas del sistema
   */
  async getStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.getStatsUseCase.execute();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
