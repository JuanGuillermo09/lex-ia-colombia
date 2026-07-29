import { IArticle } from '../entities/Article';

/** Resultado de una búsqueda con su puntuación de similitud */
export interface SearchResult {
  article: IArticle;
  similarity: number;
}

/** Servicio de búsqueda semántica y textual sobre artículos legales */
export interface ISearchService {
  /** Busca artículos por similitud semántica usando la consulta */
  searchSimilar(query: string, limit?: number): Promise<SearchResult[]>;
  /** Busca artículos por coincidencia textual */
  searchByText(query: string, limit?: number): Promise<IArticle[]>;
}
