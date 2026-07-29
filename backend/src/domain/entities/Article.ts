/** Representa un artículo legal extraído de un documento */
export interface IArticle {
  id: string;
  documentId: string;
  number: string;
  title: string;
  text: string;
  /** Vector de embedding semántico para búsqueda por similitud */
  embedding: number[];
}

/** Entidad que contiene el texto, metadatos y embedding de un artículo */
export class Article implements IArticle {
  constructor(
    public id: string,
    public documentId: string,
    public number: string,
    public title: string,
    public text: string,
    public embedding: number[],
  ) {}
}
