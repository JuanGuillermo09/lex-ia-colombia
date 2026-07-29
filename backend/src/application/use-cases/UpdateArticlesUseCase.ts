import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { IAIService } from '../../domain/services/IAIService';
import { WebSearchService } from '../../infrastructure/search/WebSearchService';

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
  messages: string[];
}

const LEGAL_CODES = [
  { name: 'Código Sustantivo del Trabajo', type: 'Código', urls: [
    'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=33104',
    'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
  ]},
  { name: 'Código Civil Colombiano', type: 'Código', urls: [
    'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=39535',
    'https://www.secretariasenado.gov.co/senado/basedoc/codigo_civil.html',
  ]},
  { name: 'Código de Comercio', type: 'Código', urls: [
    'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41102',
    'https://www.secretariasenado.gov.co/senado/basedoc/codigo_comercio.html',
  ]},
  { name: 'Código Penal Colombiano', type: 'Código', urls: [
    'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=638270',
  ]},
  { name: 'Código General del Proceso', type: 'Código', urls: [
    'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=576167',
  ]},
  { name: 'Constitución Política de Colombia', type: 'Constitución', urls: [
    'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125',
    'https://www.secretariasenado.gov.co/senado/basedoc/constitucion_politica.html',
  ]},
];

export class UpdateArticlesUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly articleRepository: IArticleRepository,
    private readonly aiService: IAIService,
    private readonly webSearch: WebSearchService,
  ) {}

  async execute(onProgress?: (message: string) => void): Promise<UpdateResult> {
    const result: UpdateResult = { documentsUpdated: 0, articlesAdded: 0, articlesRemoved: 0, errors: [], messages: [] };
    const log = (msg: string) => { result.messages.push(msg); onProgress?.(msg); };

    for (const [index, code] of LEGAL_CODES.entries()) {
      if (index > 0) {
        log('Esperando 3 segundos para evitar límites de tasa...');
        await new Promise(r => setTimeout(r, 3000));
      }
      try {
        log(`Procesando ${code.name}...`);
        const articles = await this.fetchArticles(code, log);
        if (articles.length === 0) {
          log(`No se encontraron artículos para ${code.name}`);
          continue;
        }
        log(`Se encontraron ${articles.length} artículos en ${code.name}`);
        const doc = await this.findOrCreateDocument(code.name, code.type);
        const existing = await this.articleRepository.findByDocumentId(doc.id);
        for (const a of existing) {
          await this.articleRepository.deleteByDocumentId(doc.id);
          result.articlesRemoved++;
        }
        if (existing.length > 0) log(`Eliminados ${existing.length} artículos anteriores de ${code.name}`);
        for (const [i, article] of articles.entries()) {
          if (i > 0 && i % 5 === 0) {
            await new Promise(r => setTimeout(r, 1000));
          }
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
        log(`${code.name}: ${articles.length} artículos guardados`);
      } catch (e: any) {
        const errMsg = `${code.name}: ${e.message}`;
        result.errors.push(errMsg);
        log(`ERROR: ${errMsg}`);
      }
    }
    log(`Proceso completado: ${result.articlesAdded} artículos añadidos`);
    return result;
  }

  private async fetchArticles(code: { name: string; type: string; urls?: string[] }, log?: (msg: string) => void): Promise<ArticleData[]> {
    let content: string | null = null;
    if (code.urls) {
      for (const url of code.urls) {
        log?.(`Intentando fuente oficial: ${url}`);
        content = await this.fetchPageContent(url);
        if (content) break;
      }
    }
    if (!content) {
      try {
        const searchResults = await this.webSearch.search(code.name.replace('Colombiano', '').trim(), 3);
        for (const result of searchResults) {
          log?.(`Buscando contenido web: ${result.url}`);
          content = await this.fetchPageContent(result.url);
          if (content) break;
        }
        if (!content) log?.('Sin resultados web útiles');
      } catch {
        log?.('Error en búsqueda web');
      }
    }
    if (content && content.length > 100) {
      log?.(`Extrayendo artículos de contenido web (${content.length} caracteres)...`);
      return this.extractWithAI(content, code.name);
    }
    log?.('Generando artículos desde conocimiento de IA...');
    const firstBatch = await this.generateWithAI(code.name, 1);
    let allArticles = [...firstBatch];
    if (allArticles.length > 0) {
      log?.(`Generados ${allArticles.length} artículos, continuando...`);
      const secondBatch = await this.generateWithAI(code.name, allArticles.length + 1);
      allArticles = [...allArticles, ...secondBatch];
    }
    return allArticles;
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
        content: `Eres un asistente legal experto en legislación colombiana. Extrae los artículos del texto legal proporcionado. Responde SOLO con un JSON válido. Sin markdown ni explicaciones.`,
      },
      {
        role: 'user',
        content: `Texto legal: ${codeName}\n\n${content}\n\nFormato: {"articles":[{"number":"1","title":"","text":"..."}]}`,
      },
    ], { temperature: 0.1, maxTokens: 4000 });
    return this.parseArticleJson(response.content);
  }

  private async generateWithAI(codeName: string, startFrom?: number): Promise<ArticleData[]> {
    const response = await this.aiService.generateChatCompletion([
      {
        role: 'system',
        content: `Eres un asistente legal experto en legislación colombiana. Responde SOLO con un JSON válido. Sin markdown ni explicaciones.`,
      },
      {
        role: 'user',
        content: startFrom && startFrom > 1
          ? `Enumera los artículos del ${codeName} desde el artículo ${startFrom} hasta el ${startFrom + 19}. Incluye número, título y texto completo. Formato: {"articles":[{"number":"1","title":"Título","text":"..."}]}`
          : `Lista los primeros 20 artículos del ${codeName}. Incluye número, título y texto completo de cada artículo. Formato: {"articles":[{"number":"1","title":"Título","text":"..."}]}`,
      },
    ], { temperature: 0.1, maxTokens: 4000 });
    return this.parseArticleJson(response.content);
  }

  private parseArticleJson(text: string): ArticleData[] {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.articles) return parsed.articles;
    } catch {}
    const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlock) {
      try {
        const parsed = JSON.parse(jsonBlock[1].trim());
        if (parsed?.articles) return parsed.articles;
      } catch {}
    }
    const jsonMatch = text.match(/\{[\s\S]*"articles"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.articles)) return parsed.articles;
      } catch {}
    }
    return [];
  }

  private async findOrCreateDocument(name: string, type: string) {
    const docs = await this.documentRepository.findAll();
    const existing = docs.find(d => d.name === name);
    if (existing) return existing;
    return this.documentRepository.create({ name, type, filePath: `ai/${name.replace(/\s+/g, '_')}.txt` });
  }
}
