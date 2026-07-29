/** Documento legal subido al sistema */
export interface Document {
  id: string;
  name: string;
  type: string;
  filePath: string;
  uploadedAt: string;
  articlesCount?: number;
}

/** Estadísticas globales de documentos */
export interface DocumentStats {
  totalDocuments: number;
  totalArticles: number;
  documentsByType: Array<{
    type: string;
    count: number;
  }>;
}
