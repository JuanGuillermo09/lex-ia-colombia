import { PrismaClient } from '@prisma/client';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { Article, IArticle } from '../../domain/entities/Article';

/** Repositorio de artículos implementado con Prisma ORM, incluye búsqueda semántica por coseno. */
export class PrismaArticleRepository implements IArticleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Busca un artículo por su ID.
   * @param id - Identificador único
   * @returns Artículo o null si no existe
   */
  async findById(id: string): Promise<IArticle | null> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) return null;
    return this.toDomain(article);
  }

  /**
   * Retorna los artículos de un documento ordenados por número.
   * @param documentId - ID del documento padre
   * @returns Lista de artículos
   */
  async findByDocumentId(documentId: string): Promise<IArticle[]> {
    const articles = await this.prisma.article.findMany({
      where: { documentId },
      orderBy: { number: 'asc' },
    });
    return articles.map((a) => this.toDomain(a));
  }

  /**
   * Retorna artículos paginados con el nombre del documento incluido.
   * @param page - Número de página (1-indexed)
   * @param limit - Cantidad por página
   * @returns Lista de artículos y total de registros
   */
  async findAll(page: number, limit: number): Promise<{ articles: IArticle[]; total: number }> {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.article.findMany({
        skip,
        take: limit,
        orderBy: { number: 'asc' },
        include: { document: { select: { name: true } } },
      }),
      this.prisma.article.count(),
    ]);
    return { articles: rows.map((r) => this.toDomain(r)), total };
  }

  /**
   * Retorna los artículos más recientes (por ID descendente).
   * @param limit - Cantidad máxima de artículos
   * @returns Lista de artículos
   */
  async findRecent(limit: number): Promise<IArticle[]> {
    const articles = await this.prisma.article.findMany({
      take: limit,
      orderBy: { id: 'desc' },
    });
    return articles.map((a) => this.toDomain(a));
  }

  /**
   * Crea un nuevo artículo en la base de datos.
   * @param data - Datos del artículo sin id
   * @returns Artículo creado
   */
  async create(data: Omit<IArticle, 'id'>): Promise<IArticle> {
    const article = await this.prisma.article.create({ data });
    return this.toDomain(article);
  }

  /**
   * Elimina todos los artículos de un documento.
   * @param documentId - ID del documento
   */
  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prisma.article.deleteMany({ where: { documentId } });
  }

  /**
   * Busca artículos similares por similitud coseno del embedding.
   * Filtra por threshold, ordena por similitud descendente y limita resultados.
   * @param embedding - Vector de embedding de consulta
   * @param limit - Máximo de resultados
   * @param threshold - Umbral de similitud mínimo (0-1)
   * @returns Artículos que superan el umbral
   */
  async searchSimilar(
    embedding: number[],
    limit: number,
    threshold: number,
  ): Promise<IArticle[]> {
    const articles = await this.prisma.article.findMany({
      include: { document: true },
    });

    const scored = articles
      .map((article) => ({
        article,
        similarity: this.cosineSimilarity(embedding, article.embedding),
      }))
      .filter((s) => s.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scored.map((s) => this.toDomain(s.article));
  }

  /** Calcula la similitud coseno entre dos vectores numéricos. */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /** Convierte un registro de Prisma a la entidad de dominio Article. */
  private toDomain(article: any): IArticle {
    return new Article(
      article.id,
      article.documentId,
      article.number,
      article.title,
      article.text,
      article.embedding,
    );
  }
}
