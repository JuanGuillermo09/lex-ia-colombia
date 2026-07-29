import {
  IDocumentParserService,
  ParsedDocument,
  ParsedArticle,
} from '../../domain/services/IDocumentParserService';
import fs from 'fs/promises';
import path from 'path';

/** Servicio que parsea documentos PDF y extrae artículos estructurados usando expresiones regulares. */
export class PDFParserService implements IDocumentParserService {
  /**
   * Lee un archivo PDF, extrae su texto y lo convierte en un documento estructurado con artículos.
   * @param filePath - Ruta absoluta al archivo PDF
   * @returns Documento parseado con nombre, tipo y lista de artículos
   */
  async parse(filePath: string): Promise<ParsedDocument> {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    const fileName = path.basename(filePath, path.extname(filePath));
    const articles = this.extractArticles(data.text);

    return {
      name: fileName,
      type: this.detectDocumentType(fileName),
      articles,
    };
  }

  /**
   * Extrae artículos del texto usando el patrón "Artículo Nº".
   * Si no encuentra coincidencias, divide por párrafos como fallback.
   * @param text - Texto completo extraído del PDF
   * @returns Lista de artículos con número, título y contenido
   */
  private extractArticles(text: string): ParsedArticle[] {
    const articles: ParsedArticle[] = [];
    const articleRegex = /Art[ií]culo\s+(\d+[\w-]*)[.:]\s*(.*?)(?=\nArt[ií]culo\s+\d+|$)/gs;

    let match: RegExpExecArray | null;
    while ((match = articleRegex.exec(text)) !== null) {
      const number = match[1].trim();
      const content = match[2].trim();
      const lines = content.split('\n');
      const title = lines[0].trim();
      const articleText = lines.slice(1).join('\n').trim();

      articles.push({
        number,
        title: title || `Artículo ${number}`,
        text: content,
      });
    }

    if (articles.length === 0) {
      const sections = text.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
      sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        articles.push({
          number: `${index + 1}`,
          title: lines[0].substring(0, 100) || `Sección ${index + 1}`,
          text: section.trim(),
        });
      });
    }

    return articles;
  }

  /**
   * Detecta el tipo de documento legal según palabras clave en el nombre del archivo.
   * @param fileName - Nombre del archivo sin extensión
   * @returns Tipo de documento (Constitución, Código, Ley, etc.)
   */
  private detectDocumentType(fileName: string): string {
    const lower = fileName.toLowerCase();
    if (lower.includes('constitucion') || lower.includes('constitución')) return 'Constitución';
    if (lower.includes('codigo') || lower.includes('código')) return 'Código';
    if (lower.includes('ley')) return 'Ley';
    if (lower.includes('decreto')) return 'Decreto';
    if (lower.includes('sentencia')) return 'Sentencia';
    if (lower.includes('resolucion') || lower.includes('resolución')) return 'Resolución';
    return 'Documento';
  }
}
