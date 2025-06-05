import { VocabWord, ReviewSession, UserStats, SRS_INTERVALS, SRSLevel } from '@/types/vocab';

const VOCAB_STORAGE_KEY = 'tomoshibi_vocab';
const SESSIONS_STORAGE_KEY = 'tomoshibi_sessions';
const STATS_STORAGE_KEY = 'tomoshibi_stats';

export class VocabStorage {
  static getVocabWords(): VocabWord[] {
    try {
      const stored = localStorage.getItem(VOCAB_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveVocabWords(words: VocabWord[]): void {
    localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(words));
  }

  static addWord(word: Omit<VocabWord, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount'>): VocabWord {
    const words = this.getVocabWords();
    const newWord: VocabWord = {
      ...word,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      correctCount: 0,
      incorrectCount: 0,
    };
    words.push(newWord);
    this.saveVocabWords(words);
    return newWord;
  }

  static updateWord(id: string, updates: Partial<VocabWord>): VocabWord | null {
    const words = this.getVocabWords();
    const index = words.findIndex(w => w.id === id);
    if (index === -1) return null;
    
    words[index] = { ...words[index], ...updates };
    this.saveVocabWords(words);
    return words[index];
  }

  static deleteWord(id: string): boolean {
    const words = this.getVocabWords();
    const filtered = words.filter(w => w.id !== id);
    if (filtered.length === words.length) return false;
    
    this.saveVocabWords(filtered);
    return true;
  }

  static getWordsDueForReview(): VocabWord[] {
    const words = this.getVocabWords();
    const now = Date.now();
    return words.filter(word => word.nextReviewAt <= now);
  }

  static reviewWord(id: string, correct: boolean): VocabWord | null {
    const word = this.getVocabWords().find(w => w.id === id);
    if (!word) return null;

    let newSrsLevel: SRSLevel;
    if (correct) {
      newSrsLevel = Math.min(5, word.srsLevel + 1) as SRSLevel;
      word.correctCount++;
    } else {
      newSrsLevel = 1 as SRSLevel; // Reset to learning level
      word.incorrectCount++;
    }

    const nextReviewAt = Date.now() + SRS_INTERVALS[newSrsLevel];
    
    return this.updateWord(id, {
      srsLevel: newSrsLevel,
      nextReviewAt,
      lastReviewedAt: Date.now(),
      correctCount: word.correctCount,
      incorrectCount: word.incorrectCount,
    });
  }

  static getStats(): UserStats {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY);
      const defaultStats: UserStats = {
        totalWords: 0,
        wordsDueToday: 0,
        successRate: 0,
        streakDays: 0,
        lastStudiedAt: 0,
        totalReviews: 0,
      };
      return stored ? { ...defaultStats, ...JSON.parse(stored) } : defaultStats;
    } catch {
      return {
        totalWords: 0,
        wordsDueToday: 0,
        successRate: 0,
        streakDays: 0,
        lastStudiedAt: 0,
        totalReviews: 0,
      };
    }
  }

  static updateStats(updates: Partial<UserStats>): void {
    const current = this.getStats();
    const updated = { ...current, ...updates };
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
  }

  static calculateCurrentStats(): UserStats {
    const words = this.getVocabWords();
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const tomorrow = today + 24 * 60 * 60 * 1000;

    const totalWords = words.length;
    const wordsDueToday = words.filter(w => w.nextReviewAt >= today && w.nextReviewAt < tomorrow).length;
    
    const totalReviews = words.reduce((sum, w) => sum + w.correctCount + w.incorrectCount, 0);
    const correctReviews = words.reduce((sum, w) => sum + w.correctCount, 0);
    const successRate = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

    const stats = this.getStats();
    const streakDays = this.calculateStreakDays();

    return {
      totalWords,
      wordsDueToday,
      successRate: Math.round(successRate),
      streakDays,
      lastStudiedAt: stats.lastStudiedAt,
      totalReviews,
    };
  }

  static calculateStreakDays(): number {
    const stats = this.getStats();
    const now = Date.now();
    const lastStudied = stats.lastStudiedAt;
    
    if (!lastStudied) return 0;
    
    const daysDiff = Math.floor((now - lastStudied) / (24 * 60 * 60 * 1000));
    
    if (daysDiff > 1) return 0; // Streak broken
    if (daysDiff === 1) return stats.streakDays; // Maintain streak
    return stats.streakDays; // Same day
  }

  static markStudiedToday(): void {
    const stats = this.getStats();
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastStudiedDay = stats.lastStudiedAt ? new Date(stats.lastStudiedAt).setHours(0, 0, 0, 0) : 0;
    
    if (lastStudiedDay < today) {
      const daysDiff = Math.floor((today - lastStudiedDay) / (24 * 60 * 60 * 1000));
      const newStreak = daysDiff === 1 ? stats.streakDays + 1 : 1;
      
      this.updateStats({
        lastStudiedAt: now,
        streakDays: newStreak,
      });
    }
  }

  static loadDemoWords(): VocabWord[] {
    const demoWords: Omit<VocabWord, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount'>[] = [
      {
        kanji: '猫',
        furigana: 'ねこ',
        meaning: 'cat',
        tags: ['animals', 'N5'],
        srsLevel: 2,
        nextReviewAt: Date.now() - 1000 * 60 * 60, // Due for review
        isDemo: true,
      },
      {
        kanji: '学校',
        furigana: 'がっこう',
        meaning: 'school',
        tags: ['places', 'N5'],
        srsLevel: 3,
        nextReviewAt: Date.now() + 1000 * 60 * 60 * 8, // Future review
        isDemo: true,
      },
      {
        kanji: '食べる',
        furigana: 'たべる',
        meaning: 'to eat',
        tags: ['verbs', 'N5'],
        srsLevel: 1,
        nextReviewAt: Date.now() - 1000 * 60 * 30, // Due for review
        isDemo: true,
      },
      {
        kanji: '美しい',
        furigana: 'うつくしい',
        meaning: 'beautiful',
        tags: ['adjectives', 'N4'],
        srsLevel: 4,
        nextReviewAt: Date.now() + 1000 * 60 * 60 * 24 * 2, // Future review
        isDemo: true,
      },
      {
        kanji: '友達',
        furigana: 'ともだち',
        meaning: 'friend',
        tags: ['people', 'N5'],
        srsLevel: 0,
        nextReviewAt: Date.now(), // Ready for first review
        isDemo: true,
      },
    ];

    const words = this.getVocabWords();
    const addedWords: VocabWord[] = [];

    demoWords.forEach(demoWord => {
      const newWord = this.addWord(demoWord);
      addedWords.push(newWord);
    });

    return addedWords;
  }

  static clearDemoWords(): void {
    const words = this.getVocabWords();
    const nonDemoWords = words.filter(w => !w.isDemo);
    this.saveVocabWords(nonDemoWords);
  }
}