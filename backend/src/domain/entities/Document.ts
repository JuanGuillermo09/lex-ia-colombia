/** Representa un documento legal subido por el usuario */
export interface IDocument {
  id: string;
  name: string;
  type: string;
  filePath: string;
  uploadedAt: Date;
  articlesCount?: number;
}

/** Entidad que almacena metadatos de un documento subido */
export class Document implements IDocument {
  constructor(
    public id: string,
    public name: string,
    public type: string,
    public filePath: string,
    public uploadedAt: Date = new Date(),
    public articlesCount?: number,
  ) {}
}
