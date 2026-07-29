import { IDocument } from '../entities/Document';

/** Repositorio para operaciones de persistencia de documentos */
export interface IDocumentRepository {
  /** Busca un documento por su ID */
  findById(id: string): Promise<IDocument | null>;
  /** Obtiene todos los documentos */
  findAll(): Promise<IDocument[]>;
  /** Crea un nuevo documento */
  create(data: Omit<IDocument, 'id' | 'uploadedAt'>): Promise<IDocument>;
  /** Elimina un documento por su ID */
  delete(id: string): Promise<void>;
}
