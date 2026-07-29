/** Artículo legal extraído de un documento */
export interface Article {
  id: string;
  documentId: string;
  number: string;
  title: string;
  text: string;
}

/** Respuesta paginada de artículos */
export interface ArticleResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
