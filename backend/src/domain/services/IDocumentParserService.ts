/** Artículo extraído de un documento legal parseado */
export interface ParsedArticle {
  number: string;
  title: string;
  text: string;
}

/** Documento legal parseado con sus artículos */
export interface ParsedDocument {
  name: string;
  type: string;
  articles: ParsedArticle[];
}

/** Servicio para parsear documentos legales y extraer sus artículos */
export interface IDocumentParserService {
  /**
   * Parsea un archivo y extrae sus artículos legales
   * @param filePath - Ruta del archivo a parsear
   */
  parse(filePath: string): Promise<ParsedDocument>;
}
