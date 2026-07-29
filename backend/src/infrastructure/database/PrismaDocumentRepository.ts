import { PrismaClient } from '@prisma/client';
import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { Document, IDocument } from '../../domain/entities/Document';

/** Repositorio de documentos implementado con Prisma ORM. */
export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Busca un documento por su ID.
   * @param id - Identificador único
   * @returns Documento o null si no existe
   */
  async findById(id: string): Promise<IDocument | null> {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  /**
   * Retorna todos los documentos ordenados por fecha de subida descendente.
   * @returns Lista de documentos
   */
  async findAll(): Promise<IDocument[]> {
    const docs = await this.prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
    return docs.map((d) => this.toDomain(d));
  }

  /**
   * Crea un nuevo documento en la base de datos.
   * @param data - Datos del documento sin id ni uploadedAt
   * @returns Documento creado
   */
  async create(data: Omit<IDocument, 'id' | 'uploadedAt'>): Promise<IDocument> {
    const doc = await this.prisma.document.create({ data });
    return this.toDomain(doc);
  }

  /**
   * Elimina un documento por su ID.
   * @param id - ID del documento a eliminar
   */
  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }

  /** Convierte un registro de Prisma a la entidad de dominio Document. */
  private toDomain(doc: any): IDocument {
    return new Document(doc.id, doc.name, doc.type, doc.filePath, doc.uploadedAt);
  }
}
