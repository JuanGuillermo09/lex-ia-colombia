import { IArticle } from '../entities/Article';

/** Repositorio para operaciones de persistencia de artículos legales */
export interface IArticleRepository {
  /** Busca un artículo por su ID */
  findById(id: string): Promise<IArticle | null>;
  /** Busca artículos por ID del documento al que pertenecen */
  findByDocumentId(documentId: string): Promise<IArticle[]>;
  /** Obtiene todos los artículos con paginación */
  findAll(page: number, limit: number): Promise<{ articles: IArticle[]; total: number }>;
  /** Obtiene los artículos más recientes */
  findRecent(limit: number): Promise<IArticle[]>;
  /** Crea un nuevo artículo */
  create(data: Omit<IArticle, 'id'>): Promise<IArticle>;
  /** Elimina todos los artículos de un documento */
  deleteByDocumentId(documentId: string): Promise<void>;
  /** Busca artículos por similitud semántica usando el embedding */
  searchSimilar(embedding: number[], limit: number, threshold: number): Promise<IArticle[]>;
}
