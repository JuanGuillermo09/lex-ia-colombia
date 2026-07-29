import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { IAIService } from '../../domain/services/IAIService';
import { WebSearchService, WebSearchResult } from '../../infrastructure/search/WebSearchService';

interface ArticleData {
  number: string;
  title: string;
  text: string;
}

interface UpdateResult {
  documentsUpdated: number;
  articlesAdded: number;
  articlesRemoved: number;
  errors: string[];
}

const LEGAL_CODES = [
  { name: 'Código Sustantivo del Trabajo', type: 'Código' },
  { name: 'Código Civil Colombiano', type: 'Código' },
  { name: 'Código de Comercio', type: 'Código' },
  { name: 'Código Penal Colombiano', type: 'Código' },
  { name: 'Código General del Proceso', type: 'Código' },
  { name: 'Constitución Política de Colombia', type: 'Constitución' },
];

export class UpdateArticlesUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly articleRepository: IArticleRepository,
    private readonly aiService: IAIService,
    private readonly webSearch: WebSearchService,
  ) {}

  async execute(): Promise<UpdateResult> {
    const result: UpdateResult = { documentsUpdated: 0, articlesAdded: 0, articlesRemoved: 0, errors: [] };

    for (const code of LEGAL_CODES) {
      try {
        const articles = await this.fetchArticles(code);
        if (articles.length === 0) {
          result.errors.push(`No se encontraron artículos para ${code.name}`);
          continue;
        }
        const doc = await this.findOrCreateDocument(code.name, code.type);
        const existing = await this.articleRepository.findByDocumentId(doc.id);
        for (const a of existing) {
          await this.articleRepository.deleteByDocumentId(doc.id);
          result.articlesRemoved++;
        }
        for (const article of articles) {
          const embedding = await this.aiService.generateEmbedding(article.text);
          await this.articleRepository.create({
            documentId: doc.id,
            number: article.number,
            title: article.title,
            text: article.text,
            embedding: embedding.embedding,
          });
          result.articlesAdded++;
        }
        result.documentsUpdated++;
      } catch (e: any) {
        result.errors.push(`${code.name}: ${e.message}`);
      }
    }
    return result;
  }

  private async fetchArticles(code: { name: string; type: string }): Promise<ArticleData[]> {
    let content: string | null = null;
    try {
      const searchResults = await this.webSearch.search(code.name.replace('Colombiano', '').trim(), 1);
      if (searchResults.length > 0) {
        content = await this.fetchPageContent(searchResults[0].url);
      }
    } catch {}
    if (content && content.length > 100) {
      return this.extractWithAI(content, code.name);
    }
    return this.generateWithAI(code.name);
  }

  private async fetchPageContent(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LexIA/1.0)' },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      const html = await response.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return text.length > 200 ? text.substring(0, 30000) : null;
    } catch {
      return null;
    }
  }

  private async extractWithAI(content: string, codeName: string): Promise<ArticleData[]> {
    const response = await this.aiService.generateChatCompletion([
      {
        role: 'system',
        content: `Eres un asistente legal experto en legislación colombiana. Extrae los artículos del texto legal proporcionado. Responde SOLO con un JSON válido: {"articles":[{"number":"1","title":"","text":"..."}]}. Sin markdown ni explicaciones.`,
      },
      {
        role: 'user',
        content: `Texto legal: ${codeName}\n\n${content}`,
      },
    ], { temperature: 0.1, maxTokens: 8000 });
    return this.parseArticleJson(response.content);
  }

  private async generateWithAI(codeName: string): Promise<ArticleData[]> {
    const response = await this.aiService.generateChatCompletion([
      {
        role: 'system',
        content: `Eres un asistente legal experto en legislación colombiana. Lista los artículos más importantes del ${codeName}. Incluye número, título y texto completo de cada artículo. Responde SOLO con un JSON válido: {"articles":[{"number":"1","title":"Título","text":"Texto completo del artículo..."}]}. Sin markdown ni explicaciones.`,
      },
    ], { temperature: 0.1, maxTokens: 8000 });
    return this.parseArticleJson(response.content);
  }

  private parseArticleJson(text: string): ArticleData[] {
    const jsonMatch = text.match(/\{[\s\S]*"articles"[\s\S]*\}/);
    if (!jsonMatch) return [];
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed.articles) ? parsed.articles : [];
    } catch {
      return [];
    }
  }

  private async findOrCreateDocument(name: string, type: string) {
    const docs = await this.documentRepository.findAll();
    const existing = docs.find(d => d.name === name);
    if (existing) return existing;
    return this.documentRepository.create({ name, type, filePath: `ai/${name.replace(/\s+/g, '_')}.txt` });
  }
}
