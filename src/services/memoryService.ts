import { supabase } from './supabaseClient';
import type { Message } from '../types';

export interface MemoryEntry {
  id: string;
  category: 'correction' | 'preference' | 'fact' | 'mistake';
  content: string;
  context: string | null;
  importance: number;
  timesReferenced: number;
  createdAt: Date;
}

const CORRECTION_PATTERNS = [
  /(?:нет|не|неправильно|ошибка|неверно|не\s*так)[,!.\s]+(?:правильно|надо|нужно|должно)[:\s]+(.+)/i,
  /(?:я\s*(?:имел|имела)\s*в\s*виду|я\s*хотел(?:а)?\s*сказать)[:\s]+(.+)/i,
  /(?:не\s*(?:надо|нужно|стоит))\s+(.+)/i,
  /(?:запомни|учти|имей\s*в\s*виду|на\s*будущее)[:\s]+(.+)/i,
  /(?:всегда|никогда\s*не)\s+(.+)/i,
  /(?:я\s*(?:предпочитаю|люблю|хочу|не\s*люблю|ненавижу))\s+(.+)/i,
  /(?:меня\s*зовут|я\s*[-—])\s+(.+)/i,
  /(?:мне\s*(?:\d+)\s*(?:лет|год))/i,
  /(?:я\s*(?:работаю|учусь|занимаюсь|живу|из))\s+(.+)/i,
  /(?:no|wrong|incorrect|that's\s*not\s*right)[,!.\s]+(?:the\s*correct|it\s*should\s*be|it's)[:\s]+(.+)/i,
  /(?:I\s*meant|I\s*was\s*trying\s*to\s*say)[:\s]+(.+)/i,
  /(?:remember|keep\s*in\s*mind|note\s*that|for\s*future)[:\s]+(.+)/i,
  /(?:I\s*(?:prefer|like|want|don't\s*like|hate))\s+(.+)/i,
  /(?:my\s*name\s*is|I'm|I\s*am)\s+(.+)/i,
  /(?:I\s*(?:work|study|live|am\s*from))\s+(.+)/i,
];

const PERSONAL_FACT_PATTERNS = [
  /(?:меня\s*зовут|my\s*name\s*is)\s+(\S+)/i,
  /(?:мне\s*)(\d+)\s*(?:лет|год|years?\s*old)/i,
  /(?:я\s*из|I'm\s*from|I\s*live\s*in)\s+(.+)/i,
  /(?:я\s*(?:программист|разработчик|дизайнер|студент|учитель|врач|инженер)|I'm\s*a\s*(?:developer|designer|student|teacher|doctor|engineer))/i,
  /(?:мой\s*любимый|my\s*favorite)\s+(.+)/i,
];

class MemoryService {
  private localCache: Map<string, MemoryEntry[]> = new Map();
  private analysisQueue: Array<{ userId: string; userMsg: string; aiMsg: string; allMessages: Message[] }> = [];
  private isProcessing = false;

  async getMemories(userId: string): Promise<MemoryEntry[]> {
    if (this.localCache.has(userId)) {
      return this.localCache.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', userId)
        .order('importance', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Memory fetch error:', error);
        return this.getLocalMemories(userId);
      }

      const memories: MemoryEntry[] = (data || []).map((m: any) => ({
        id: m.id,
        category: m.category,
        content: m.content,
        context: m.context,
        importance: m.importance,
        timesReferenced: m.times_referenced,
        createdAt: new Date(m.created_at),
      }));

      this.localCache.set(userId, memories);
      this.saveLocalMemories(userId, memories);
      return memories;
    } catch {
      return this.getLocalMemories(userId);
    }
  }

  async buildMemoryPrompt(userId: string): Promise<string> {
    const memories = await this.getMemories(userId);
    if (memories.length === 0) return '';

    const corrections = memories.filter(m => m.category === 'correction').slice(0, 15);
    const preferences = memories.filter(m => m.category === 'preference').slice(0, 10);
    const facts = memories.filter(m => m.category === 'fact').slice(0, 10);
    const mistakes = memories.filter(m => m.category === 'mistake').slice(0, 10);

    const sections: string[] = [];
    sections.push('USER MEMORY (from past conversations):');

    if (facts.length > 0) {
      sections.push('\nFacts about user:');
      facts.forEach(f => sections.push(`- ${f.content}`));
    }

    if (preferences.length > 0) {
      sections.push('\nUser preferences:');
      preferences.forEach(p => sections.push(`- ${p.content}`));
    }

    if (corrections.length > 0) {
      sections.push('\nPast corrections (DO NOT repeat these mistakes):');
      corrections.forEach(c => {
        sections.push(`- ${c.content}${c.context ? ` [ctx: ${c.context}]` : ''}`);
      });
    }

    if (mistakes.length > 0) {
      sections.push('\nKnown mistakes to avoid:');
      mistakes.forEach(m => sections.push(`- ${m.content}`));
    }

    sections.push('\nUse this memory naturally. Do NOT list it. Do NOT say "I remember...". Just apply it.');
    return sections.join('\n');
  }

  async analyzeAndStore(userId: string, userMessage: string, aiResponse: string, allMessages: Message[]): Promise<void> {
    this.analysisQueue.push({ userId, userMsg: userMessage, aiMsg: aiResponse, allMessages });
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    while (this.analysisQueue.length > 0) {
      const item = this.analysisQueue.shift()!;
      try {
        await this.extractAndSaveMemories(item.userId, item.userMsg, item.aiMsg, item.allMessages);
      } catch (e) {
        console.error('Memory processing error:', e);
      }
    }
    this.isProcessing = false;
  }

  private async extractAndSaveMemories(
    userId: string,
    userMessage: string,
    _aiResponse: string,
    allMessages: Message[]
  ): Promise<void> {
    const newMemories: Array<{
      category: 'correction' | 'preference' | 'fact' | 'mistake';
      content: string;
      context: string | null;
      importance: number;
    }> = [];

    for (const pattern of CORRECTION_PATTERNS) {
      const match = userMessage.match(pattern);
      if (match) {
        const content = match[1]?.trim() || match[0].trim();
        if (content.length > 3 && content.length < 500) {
          newMemories.push({
            category: 'correction',
            content: `User: "${userMessage.substring(0, 200)}" → ${content}`,
            context: this.getRecentContext(allMessages),
            importance: 7,
          });
        }
      }
    }

    for (const pattern of PERSONAL_FACT_PATTERNS) {
      const match = userMessage.match(pattern);
      if (match) {
        newMemories.push({
          category: 'fact',
          content: match[0].trim(),
          context: null,
          importance: 8,
        });
      }
    }

    const dissatisfaction = this.detectDissatisfaction(userMessage, allMessages);
    if (dissatisfaction) {
      newMemories.push({
        category: 'mistake',
        content: dissatisfaction,
        context: this.getRecentContext(allMessages),
        importance: 9,
      });
    }

    const preference = this.detectPreference(userMessage);
    if (preference) {
      newMemories.push({
        category: 'preference',
        content: preference,
        context: null,
        importance: 6,
      });
    }

    for (const mem of newMemories) {
      await this.saveMemory(userId, mem);
    }
  }

  private detectDissatisfaction(userMessage: string, allMessages: Message[]): string | null {
    const lower = userMessage.toLowerCase();
    const patterns = [
      /(?:ты\s*(?:опять|снова))\s+(.+)/i,
      /(?:я\s*(?:же|уже)\s*(?:говорил|сказал|просил))/i,
      /(?:не\s*то|не\s*так|неправильно|ошибся|неверно|бред|чушь|фигня|херня)/i,
      /(?:wrong\s*again|you\s*keep|I\s*already\s*(?:told|said|asked))/i,
      /(?:that's\s*(?:wrong|incorrect|not\s*right|bullshit|nonsense))/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        const lastAI = allMessages
          .filter(m => m.role === 'assistant' && !m.isLoading)
          .slice(-1)[0];
        const aiContent = lastAI?.content?.substring(0, 200) || 'unknown';
        return `Dissatisfied. AI: "${aiContent}..." User: "${userMessage.substring(0, 200)}"`;
      }
    }
    return null;
  }

  private detectPreference(userMessage: string): string | null {
    const lower = userMessage.toLowerCase();
    const prefPatterns = [
      { regex: /(?:отвечай|пиши|говори)\s+(?:на|по-?)\s*(\S+)/i, tpl: 'Prefers language: $1' },
      { regex: /(?:используй|пиши\s*на)\s+(typescript|javascript|python|rust|go|java)/i, tpl: 'Prefers: $1' },
      { regex: /(?:не\s*(?:надо|нужно|стоит|хочу))\s+(?:мне\s+)?(.+)/i, tpl: 'Does NOT want: $1' },
      { regex: /(?:I\s*prefer|I\s*want\s*you\s*to)\s+(.+)/i, tpl: 'Prefers: $1' },
      { regex: /(?:всегда|always)\s+(.+)/i, tpl: 'Always: $1' },
    ];

    for (const { regex, tpl } of prefPatterns) {
      const match = lower.match(regex);
      if (match) {
        return tpl.replace('$1', match[1]?.trim() || match[0].trim());
      }
    }
    return null;
  }

  private getRecentContext(messages: Message[]): string {
    return messages
      .filter(m => !m.isLoading)
      .slice(-4)
      .map(m => `[${m.role}]: ${(m.content || '').substring(0, 80)}`)
      .join(' | ');
  }

  private async saveMemory(
    userId: string,
    memory: { category: string; content: string; context: string | null; importance: number }
  ): Promise<void> {
    const existing = this.localCache.get(userId) || [];
    const isDuplicate = existing.some(m =>
      m.category === memory.category && this.similarity(m.content, memory.content) > 0.7
    );
    if (isDuplicate) return;

    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .insert({
          user_id: userId,
          category: memory.category,
          content: memory.content,
          context: memory.context,
          importance: memory.importance,
        })
        .select()
        .single();

      if (!error && data) {
        const entry: MemoryEntry = {
          id: data.id,
          category: data.category,
          content: data.content,
          context: data.context,
          importance: data.importance,
          timesReferenced: 0,
          createdAt: new Date(data.created_at),
        };
        const cached = this.localCache.get(userId) || [];
        cached.unshift(entry);
        if (cached.length > 100) cached.pop();
        this.localCache.set(userId, cached);
        this.saveLocalMemories(userId, cached);
      }
    } catch {
      const entry: MemoryEntry = {
        id: crypto.randomUUID(),
        category: memory.category as any,
        content: memory.content,
        context: memory.context,
        importance: memory.importance,
        timesReferenced: 0,
        createdAt: new Date(),
      };
      const cached = this.localCache.get(userId) || [];
      cached.unshift(entry);
      if (cached.length > 100) cached.pop();
      this.localCache.set(userId, cached);
      this.saveLocalMemories(userId, cached);
    }
  }

  async clearAllMemories(userId: string): Promise<void> {
    try {
      await supabase.from('ai_memory').delete().eq('user_id', userId);
    } catch { /* ignore */ }
    this.localCache.set(userId, []);
    localStorage.removeItem(`mogpt_memory_${userId}`);
  }

  private similarity(a: string, b: string): number {
    const aWords = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const bWords = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    if (aWords.size === 0 || bWords.size === 0) return 0;
    const intersection = [...aWords].filter(w => bWords.has(w)).length;
    const union = new Set([...aWords, ...bWords]).size;
    return intersection / union;
  }

  private getLocalMemories(userId: string): MemoryEntry[] {
    try {
      const data = localStorage.getItem(`mogpt_memory_${userId}`);
      if (!data) return [];
      const parsed = JSON.parse(data);
      this.localCache.set(userId, parsed);
      return parsed;
    } catch {
      return [];
    }
  }

  private saveLocalMemories(userId: string, memories: MemoryEntry[]): void {
    try {
      localStorage.setItem(`mogpt_memory_${userId}`, JSON.stringify(memories.slice(0, 100)));
    } catch { /* storage full */ }
  }
}

export const memoryService = new MemoryService();
