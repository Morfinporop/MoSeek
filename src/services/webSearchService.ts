const SEARCH_API_URL = 'https://api.duckduckgo.com/';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

class WebSearchService {
  private cache: Map<string, { results: SearchResult[]; timestamp: number }> = new Map();
  private CACHE_TTL = 10 * 60 * 1000; // 10 минут

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    // Проверяем кеш
    const cached = this.cache.get(query.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.results;
    }

    try {
      // Метод 1: DuckDuckGo Instant Answer API
      const ddgResults = await this.searchDDG(query, maxResults);
      if (ddgResults.length > 0) {
        this.cache.set(query.toLowerCase(), { results: ddgResults, timestamp: Date.now() });
        return ddgResults;
      }

      // Метод 2: Wikipedia API как fallback
      const wikiResults = await this.searchWikipedia(query, maxResults);
      if (wikiResults.length > 0) {
        this.cache.set(query.toLowerCase(), { results: wikiResults, timestamp: Date.now() });
        return wikiResults;
      }

      return [];
    } catch (e) {
      console.error('Search error:', e);
      return [];
    }
  }

  private async searchDDG(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        no_html: '1',
        skip_disambig: '1',
      });

      const res = await fetch(`${SEARCH_API_URL}?${params}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return [];

      const data = await res.json();
      const results: SearchResult[] = [];

      // Abstract (главный результат)
      if (data.Abstract && data.AbstractText) {
        results.push({
          title: data.Heading || query,
          snippet: data.AbstractText.substring(0, 500),
          url: data.AbstractURL || '',
        });
      }

      // Related Topics
      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0]?.substring(0, 100) || '',
              snippet: topic.Text.substring(0, 300),
              url: topic.FirstURL,
            });
          }
          // Подкатегории
          if (topic.Topics) {
            for (const sub of topic.Topics.slice(0, 2)) {
              if (sub.Text && sub.FirstURL) {
                results.push({
                  title: sub.Text.split(' - ')[0]?.substring(0, 100) || '',
                  snippet: sub.Text.substring(0, 300),
                  url: sub.FirstURL,
                });
              }
            }
          }
        }
      }

      return results.slice(0, maxResults);
    } catch {
      return [];
    }
  }

  private async searchWikipedia(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      // Определяем язык запроса для выбора Wikipedia
      const lang = this.detectQueryLang(query);
      const wikiLang = lang === 'ru' ? 'ru' : 'en';

      const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: String(maxResults),
        format: 'json',
        origin: '*',
        utf8: '1',
      });

      const res = await fetch(
        `https://${wikiLang}.wikipedia.org/w/api.php?${params}`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (!res.ok) return [];

      const data = await res.json();
      const results: SearchResult[] = [];

      if (data.query?.search) {
        for (const item of data.query.search) {
          const snippet = item.snippet
            ?.replace(/<[^>]*>/g, '')
            ?.replace(/&[^;]+;/g, ' ')
            ?.trim();

          if (snippet) {
            results.push({
              title: item.title,
              snippet: snippet.substring(0, 400),
              url: `https://${wikiLang}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            });
          }
        }
      }

      // Дополнительно — получаем развёрнутые описания
      if (results.length > 0) {
        const titles = results.slice(0, 3).map(r => r.title).join('|');
        const extractParams = new URLSearchParams({
          action: 'query',
          titles: titles,
          prop: 'extracts',
          exintro: '1',
          explaintext: '1',
          exlimit: '3',
          format: 'json',
          origin: '*',
        });

        try {
          const extractRes = await fetch(
            `https://${wikiLang}.wikipedia.org/w/api.php?${extractParams}`,
            { signal: AbortSignal.timeout(5000) }
          );

          if (extractRes.ok) {
            const extractData = await extractRes.json();
            const pages = extractData.query?.pages || {};

            for (const pageId of Object.keys(pages)) {
              const page = pages[pageId];
              if (page.extract) {
                const idx = results.findIndex(r => r.title === page.title);
                if (idx !== -1) {
                  results[idx].snippet = page.extract.substring(0, 600);
                }
              }
            }
          }
        } catch { /* ignore */ }
      }

      return results;
    } catch {
      return [];
    }
  }

  private detectQueryLang(query: string): string {
    const cyrillic = (query.match(/[а-яёА-ЯЁ]/g) || []).length;
    const latin = (query.match(/[a-zA-Z]/g) || []).length;
    return cyrillic > latin ? 'ru' : 'en';
  }

  shouldSearch(userInput: string): boolean {
    const lower = userInput.toLowerCase();

    // Явные запросы на поиск
    if (/(?:найди|загугли|поищи|что\s*(?:такое|значит|за)|кто\s*(?:такой|такая)|search|find|google|look\s*up|what\s*is|who\s*is)/i.test(lower)) {
      return true;
    }

    // Вопросы о текущих событиях / трендах
    if (/(?:сейчас|сегодня|последн|актуальн|новост|тренд|хайп|популярн|trending|latest|current|news|recent|2025|2026)/i.test(lower)) {
      return true;
    }

    // Вопросы о конкретных людях/местах/событиях
    if (/(?:кто\s+|что\s+случилось|где\s+находи|когда\s+(?:был|будет|вышл|выйдет)|сколько\s+(?:стоит|лет|людей))/i.test(lower)) {
      return true;
    }

    // Вопросы о мемах/интернет-культуре
    if (/(?:мем|brainrot|скибиди|skibidi|ризз|rizz|сигма|sigma|mewing|меллстрой|mellstroy|ohio|gyatt|aura|mogging|looksmax|delulu|glazing|yapping|fanum)/i.test(lower)) {
      return true;
    }

    // Вопросы о играх/фильмах/музыке
    if (/(?:gta\s*6|gta\s*vi|elden\s*ring|silksong|switch\s*2|nintendo|playstation|xbox|фильм|сериал|альбом|песня|трек|movie|game|album)/i.test(lower)) {
      return true;
    }

    // Вопросы о технологиях
    if (/(?:neuralink|openai|sora|gemini|claude|gpt-5|apple|iphone|vision\s*pro|tesla|spacex|starship)/i.test(lower)) {
      return true;
    }

    // Вопросы о ценах/статистике
    if (/(?:сколько\s*стоит|цена|курс|биткоин|bitcoin|крипт|crypto|акци|stock|price)/i.test(lower)) {
      return true;
    }

    return false;
  }

  buildSearchContext(results: SearchResult[]): string {
    if (results.length === 0) return '';

    let context = 'WEB SEARCH RESULTS (use this fresh data in your answer):\n\n';

    for (let i = 0; i < results.length; i++) {
      context += `[${i + 1}] ${results[i].title}\n`;
      context += `${results[i].snippet}\n`;
      if (results[i].url) {
        context += `Source: ${results[i].url}\n`;
      }
      context += '\n';
    }

    context += 'INSTRUCTIONS: Use the above search results to give an accurate, up-to-date answer. Cite information naturally. If results are insufficient, say what you know and note limitations. Do NOT make up facts not in the results.\n';

    return context;
  }
}

export const webSearchService = new WebSearchService();
