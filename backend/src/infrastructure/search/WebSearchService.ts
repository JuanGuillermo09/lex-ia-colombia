/** Resultado de una búsqueda web con título, URL y fragmento. */
export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

/** Servicio que realiza búsquedas web scraping DuckDuckGo Lite. */
export class WebSearchService {
  /**
   * Ejecuta una búsqueda en DuckDuckGo Lite con prefijo "Colombia".
   * @param query - Término de búsqueda
   * @param limit - Cantidad máxima de resultados (default 3)
   * @returns Lista de resultados web
   */
  async search(query: string, limit = 3): Promise<WebSearchResult[]> {
    try {
      const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent('Colombia ' + query)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) return [];

      const html = await response.text();
      const results: WebSearchResult[] = [];

      // DuckDuckGo Lite returns results in a table with class="result"
      // Each result has: <a class="result-link" href="...">title</a> and <p class="result-snippet">snippet</p>
      const rows = html.split('<tr class="result">').slice(1);

      for (const row of rows) {
        if (results.length >= limit) break;

        const titleMatch = row.match(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
        const snippetMatch = row.match(/<p[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/p>/);

        if (titleMatch) {
          const rawUrl = titleMatch[1];
          const rawTitle = titleMatch[2].replace(/<[^>]*>/g, '').trim();
          const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

          // DuckDuckGo uses redirect URLs
          const realUrl = this.extractUrl(rawUrl);
          if (realUrl && rawTitle) {
            results.push({
              title: rawTitle.substring(0, 120),
              url: realUrl,
              snippet: snippet.substring(0, 200),
            });
          }
        }
      }

      return results;
    } catch (e) {
      console.error('[WebSearch] Error:', e);
      return [];
    }
  }

  /**
   * Extrae la URL real de una URL de redirección de DuckDuckGo.
   * @param redirectUrl - URL de redirección de DuckDuckGo
   * @returns URL real decodificada o null si no es válida
   */
  private extractUrl(redirectUrl: string): string | null {
    // DuckDuckGo redirect URLs look like: //duckduckgo.com/l/?uddg=https%3A%2F%2F...
    const uddg = redirectUrl.match(/uddg=([^&]+)/);
    if (uddg) return decodeURIComponent(uddg[1]);
    // Direct URL
    if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) return redirectUrl;
    // Protocol-relative URL
    if (redirectUrl.startsWith('//')) return 'https:' + redirectUrl;
    return null;
  }
}
