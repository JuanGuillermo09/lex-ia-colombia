import { z } from 'zod';

/** Esquema de validación para crear/registrar un documento */
export const CreateDocumentSchema = z.object({
  name: z.string().min(1).max(500),
  type: z.string().min(1).max(100),
});

export type CreateDocumentDTO = z.infer<typeof CreateDocumentSchema>;

/** DTO con la respuesta de un documento procesado */
export interface DocumentResponseDTO {
  id: string;
  name: string;
  type: string;
  filePath: string;
  uploadedAt: string;
  articlesCount?: number;
}

/** DTO con estadísticas de documentos y artículos */
export interface DocumentStatsDTO {
  totalDocuments: number;
  totalArticles: number;
  documentsByType: Array<{
    type: string;
    count: number;
  }>;
}
