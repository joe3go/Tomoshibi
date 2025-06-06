
import { 
  User, InsertUser, 
  SentenceCard, InsertSentenceCard,
  SrsItem, InsertSrsItem,
  StudySession, InsertStudySession,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  LearningPath, UserPathProgress
} from "@shared/schema";
import { n5Vocabulary, n5Kanji, n5Grammar } from "./jlpt-n5-data";
import { processSentenceForFurigana } from "./furiganaService";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId?(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Sentence card operations
  getSentenceCards(filters?: {
    jlptLevel?: string;
    register?: string;
    theme?: string;
    difficulty?: number;
  }): Promise<SentenceCard[]>;
  getSentenceCard(id: number): Promise<SentenceCard | undefined>;
  createSentenceCard(card: InsertSentenceCard): Promise<SentenceCard>;

  // SRS operations
  getUserSrsItems(userId: number): Promise<SrsItem[]>;
  getSrsItem(id: number): Promise<SrsItem | undefined>;
  createSrsItem(item: InsertSrsItem): Promise<SrsItem>;
  updateSrsItem(id: number, updates: Partial<SrsItem>): Promise<SrsItem | undefined>;
  getReviewQueue(userId: number, limit?: number): Promise<SrsItem[]>;
  
  // Study session operations
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getUserStudySessions(userId: number, limit?: number): Promise<StudySession[]>;
  updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined>;

  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  hasUserAchievement(userId: number, achievementId: number): Promise<boolean>;

  // Learning path operations
  getAllLearningPaths(): Promise<LearningPath[]>;
  getUserPathProgress(userId: number): Promise<UserPathProgress[]>;

  // JLPT Content operations
  getVocabulary(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]>;
  getKanji(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]>;
  getGrammar(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]>;

  // JLPT content operations
  getJlptVocabulary(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getJlptKanji(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getJlptGrammar(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  searchJlptContent(query: string, type?: 'vocabulary' | 'kanji' | 'grammar'): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sentenceCards: Map<number, SentenceCard>;
  private srsItems: Map<number, SrsItem>;
  private studySessions: Map<number, StudySession>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private learningPaths: Map<number, LearningPath>;
  private userPathProgress: Map<number, UserPathProgress>;

  private currentUserId: number;
  private currentCardId: number;
  private currentSrsItemId: number;
  private currentSessionId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;

  constructor() {
    this.users = new Map();
    this.sentenceCards = new Map();
    this.srsItems = new Map();
    this.studySessions = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.learningPaths = new Map();
    this.userPathProgress = new Map();

    this.currentUserId = 1;
    this.currentCardId = 1;
    this.currentSrsItemId = 1;
    this.currentSessionId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;

    this.seedData();
  }

  private determineTheme(meaning: string): string {
    const themes = {
      'I, me': 'personal',
      'you': 'personal', 
      'he, him': 'personal',
      'she, her': 'personal',
      'person': 'people',
      'house, home': 'living',
      'school': 'education',
      'book': 'education',
      'car': 'transport',
      'time': 'time',
      'now': 'time'
    };
    return themes[meaning as keyof typeof themes] || 'general';
  }

  private extractGrammarPoints(sentence: string): string[] {
    const points = [];
    if (sentence.includes('です')) points.push('です copula');
    if (sentence.includes('は')) points.push('は particle');
    if (sentence.includes('を')) points.push('を particle');
    if (sentence.includes('に')) points.push('に particle');
    if (sentence.includes('で')) points.push('で particle');
    if (sentence.includes('が')) points.push('が particle');
    if (sentence.includes('ます')) points.push('polite present');
    return points.length > 0 ? points : ['basic grammar'];
  }

  private generateCleanSentenceCards() {
    // Authentic N5 sentences with clean Japanese text (no bracketed furigana)
    const authenticSentences = [
      { japanese: "私は学生です。", english: "I am a student.", vocab: ["私", "学生"] },
      { japanese: "今日は晴れです。", english: "Today is sunny.", vocab: ["今日", "晴れ"] },
      { japanese: "本を読みます。", english: "I read books.", vocab: ["本", "読む"] },
      { japanese: "水を飲みます。", english: "I drink water.", vocab: ["水", "飲む"] },
      { japanese: "家に帰ります。", english: "I go home.", vocab: ["家", "帰る"] },
      { japanese: "学校に行きます。", english: "I go to school.", vocab: ["学校", "行く"] },
      { japanese: "友達と話します。", english: "I talk with friends.", vocab: ["友達", "話す"] },
      { japanese: "映画を見ます。", english: "I watch movies.", vocab: ["映画", "見る"] },
      { japanese: "音楽を聞きます。", english: "I listen to music.", vocab: ["音楽", "聞く"] },
      { japanese: "朝ご飯を食べます。", english: "I eat breakfast.", vocab: ["朝", "ご飯", "食べる"] },
      { japanese: "電車で会社に行きます。", english: "I go to the company by train.", vocab: ["電車", "会社", "行く"] },
      { japanese: "毎日新聞を読みます。", english: "I read the newspaper every day.", vocab: ["毎日", "新聞", "読む"] },
      { japanese: "母と買い物に行きます。", english: "I go shopping with my mother.", vocab: ["母", "買い物", "行く"] },
      { japanese: "図書館で勉強します。", english: "I study at the library.", vocab: ["図書館", "勉強"] },
      { japanese: "公園で犬と散歩します。", english: "I walk the dog in the park.", vocab: ["公園", "犬", "散歩"] }
    ];

    authenticSentences.forEach((sentence, index) => {
      const card: SentenceCard = {
        id: index + 1,
        japanese: sentence.japanese,
        reading: null, // Will be generated with kuroshiro.js
        english: sentence.english,
        audioUrl: null,
        jlptLevel: "N5",
        difficulty: Math.min(Math.max(1, Math.floor(sentence.japanese.length / 4)), 5),
        register: sentence.japanese.includes("です") || sentence.japanese.includes("ます") ? "polite" : "casual",
        theme: this.determineTheme(sentence.english.toLowerCase()),
        source: "authentic_n5",
        grammarPoints: this.extractGrammarPoints(sentence.japanese),
        vocabulary: sentence.vocab,
        culturalNotes: `Authentic N5 sentence: ${sentence.japanese}`,
        createdAt: new Date()
      };
      this.sentenceCards.set(card.id, card);
    });

    console.log(`Generated ${authenticSentences.length} clean sentence cards without bracketed furigana`);
  }

  private seedData() {
    // Create demo user with Google ID support
    const demoUser: User = {
      id: 1,
      username: "demo",
      email: "demo@example.com",
      password: "902c1437ddf62dc4c7126c18f85899d3f16eef7d2dd5db5a381b73bd310853ba3090cde2a3c34d3a7938ad4de39c276bde6793529e5264f031fe5c7cedfbde7d.65e2f5f9bc23a13903c03210f9999f7b", // hashed "demo"
      displayName: "Akira Tanaka",
      profileImageUrl: null,
      googleId: null,
      currentBelt: "white",
      currentJLPTLevel: "N5",
      totalXP: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastStudyDate: null,
      studyGoal: "Understand anime without subtitles",
      dailyGoalMinutes: 30,
      dailyGoalKanji: 5,
      dailyGoalGrammar: 3,
      dailyGoalVocabulary: 10,
      preferredStudyTime: "evening",
      enableReminders: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(1, demoUser);

    // Create test user for latibulize
    const testUser: User = {
      id: 2,
      username: "latibulize",
      email: "latibulize@japsense.com",
      password: "3a4b9f1608ec7bef21a76be449f4eee98b356db3122500662427ddef39384062e53eea6ef0cb95252ee9cac4bf2ffd923acfc7099a8f9a600c555ac774101d51.667049cfad3dc5981ce498e66f25fca8", // hashed "123"
      displayName: "Latibulize",
      profileImageUrl: null,
      googleId: null,
      currentBelt: "white",
      currentJLPTLevel: "N5",
      totalXP: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastStudyDate: null,
      studyGoal: "Master JLPT N5",
      dailyGoalMinutes: 20,
      dailyGoalKanji: 5,
      dailyGoalGrammar: 3,
      dailyGoalVocabulary: 10,
      preferredStudyTime: "morning",
      enableReminders: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(2, testUser);

    // Generate authentic JLPT N5 sentence cards with clean Japanese text
    this.generateCleanSentenceCards();

    // SRS items will be created when user starts studying

    // Seed achievements
    const achievements = [
      {
        id: 1,
        name: "First Steps",
        description: "Complete your first review session",
        icon: "👶",
        category: "milestone",
        threshold: 1,
        beltRequired: null,
        xpReward: 50,
        createdAt: new Date()
      },
      {
        id: 2,
        name: "Streak Master",
        description: "Maintain a 7-day study streak",
        icon: "🔥",
        category: "consistency",
        threshold: 7,
        beltRequired: null,
        xpReward: 200,
        createdAt: new Date()
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });

    // No pre-existing study sessions - start fresh
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) return user;
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Sentence card operations
  async getSentenceCards(filters?: {
    jlptLevel?: string;
    register?: string;
    theme?: string;
    difficulty?: number;
  }): Promise<SentenceCard[]> {
    let cards = Array.from(this.sentenceCards.values());
    
    if (filters) {
      if (filters.jlptLevel) {
        cards = cards.filter(card => card.jlptLevel === filters.jlptLevel);
      }
      if (filters.register) {
        cards = cards.filter(card => card.register === filters.register);
      }
      if (filters.theme) {
        cards = cards.filter(card => card.theme === filters.theme);
      }
      if (filters.difficulty !== undefined) {
        cards = cards.filter(card => card.difficulty === filters.difficulty);
      }
    }
    
    return cards;
  }

  async getSentenceCard(id: number): Promise<SentenceCard | undefined> {
    return this.sentenceCards.get(id);
  }

  async createSentenceCard(cardData: InsertSentenceCard): Promise<SentenceCard> {
    const card: SentenceCard = {
      id: this.currentCardId++,
      ...cardData,
      reading: cardData.reading || null,
      audioUrl: cardData.audioUrl || null,
      theme: cardData.theme || null,
      source: cardData.source || null,
      culturalNotes: cardData.culturalNotes || null,
      createdAt: new Date()
    };
    this.sentenceCards.set(card.id, card);
    return card;
  }

  // SRS operations
  async getUserSrsItems(userId: number): Promise<SrsItem[]> {
    return Array.from(this.srsItems.values()).filter(item => item.userId === userId);
  }

  async getSrsItem(id: number): Promise<SrsItem | undefined> {
    return this.srsItems.get(id);
  }

  async createSrsItem(itemData: InsertSrsItem): Promise<SrsItem> {
    const item: SrsItem = {
      id: this.currentSrsItemId++,
      interval: itemData.interval || 1,
      easeFactor: itemData.easeFactor || 2.5,
      repetitions: itemData.repetitions || 0,
      lastReviewed: itemData.lastReviewed || null,
      correctCount: itemData.correctCount || 0,
      incorrectCount: itemData.incorrectCount || 0,
      mastery: itemData.mastery || 'learning',
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.srsItems.set(item.id, item);
    return item;
  }

  async updateSrsItem(id: number, updates: Partial<SrsItem>): Promise<SrsItem | undefined> {
    const item = this.srsItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates, updatedAt: new Date() };
    this.srsItems.set(id, updatedItem);
    return updatedItem;
  }

  async getReviewQueue(userId: number, limit?: number): Promise<SrsItem[]> {
    const now = new Date();
    let queue = Array.from(this.srsItems.values())
      .filter(item => item.userId === userId && item.nextReview <= now)
      .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
    
    if (limit) {
      queue = queue.slice(0, limit);
    }
    
    return queue;
  }

  // Study session operations
  async createStudySession(sessionData: InsertStudySession): Promise<StudySession> {
    const session: StudySession = {
      id: this.currentSessionId++,
      cardsReviewed: sessionData.cardsReviewed || 0,
      cardsCorrect: sessionData.cardsCorrect || 0,
      timeSpentMinutes: sessionData.timeSpentMinutes || 0,
      xpEarned: sessionData.xpEarned || 0,
      completedAt: sessionData.completedAt || null,
      ...sessionData,
      startedAt: new Date()
    };
    this.studySessions.set(session.id, session);
    return session;
  }

  async getUserStudySessions(userId: number, limit?: number): Promise<StudySession[]> {
    let sessions = Array.from(this.studySessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    
    if (limit) {
      sessions = sessions.slice(0, limit);
    }
    
    return sessions;
  }

  async updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const achievement: Achievement = {
      id: this.currentAchievementId++,
      threshold: achievementData.threshold || null,
      beltRequired: achievementData.beltRequired || null,
      xpReward: achievementData.xpReward || 0,
      ...achievementData,
      createdAt: new Date()
    };
    this.achievements.set(achievement.id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId)
      .map(ua => {
        const achievement = this.achievements.get(ua.achievementId)!;
        return { ...ua, achievement };
      });
  }

  async unlockAchievement(userAchievementData: InsertUserAchievement): Promise<UserAchievement> {
    const userAchievement: UserAchievement = {
      id: this.currentUserAchievementId++,
      ...userAchievementData,
      unlockedAt: new Date()
    };
    this.userAchievements.set(userAchievement.id, userAchievement);
    return userAchievement;
  }

  async hasUserAchievement(userId: number, achievementId: number): Promise<boolean> {
    for (const ua of this.userAchievements.values()) {
      if (ua.userId === userId && ua.achievementId === achievementId) {
        return true;
      }
    }
    return false;
  }

  async getAllLearningPaths(): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values());
  }

  async getUserPathProgress(userId: number): Promise<UserPathProgress[]> {
    return Array.from(this.userPathProgress.values())
      .filter(progress => progress.userId === userId);
  }

  // JLPT content operations
  async getJlptVocabulary(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let vocabulary = [...n5Vocabulary];
    
    if (filters?.jlptLevel) {
      vocabulary = vocabulary.filter(v => v.jlpt_level === filters.jlptLevel);
    }
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || vocabulary.length;
    
    return vocabulary.slice(offset, offset + limit).map(v => ({
      id: v.id || v.kanji,
      kanji: v.kanji,
      kanaReading: v.kana_reading,
      englishMeaning: [v.english_meaning],
      jlptLevel: 'N5',
      exampleSentenceJp: v.example_sentence_jp,
      exampleSentenceEn: v.example_sentence_en,
      audioUrl: v.audio_url,
      type: 'vocabulary'
    }));
  }

  async getJlptKanji(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let kanji = [...n5Kanji];
    
    if (filters?.jlptLevel) {
      kanji = kanji.filter(k => k.jlpt_level === filters.jlptLevel);
    }
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || kanji.length;
    
    return kanji.slice(offset, offset + limit).map(k => ({
      id: k.kanji,
      kanji: k.kanji,
      onyomi: k.onyomi,
      kunyomi: k.kunyomi,
      englishMeaning: [k.english_meaning],
      jlptLevel: 'N5',
      strokeCount: k.stroke_count,
      exampleVocab: k.example_vocab,
      strokeOrderDiagram: k.stroke_order_diagram,
      type: 'kanji'
    }));
  }

  async getJlptGrammar(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let grammar = [...n5Grammar];
    
    if (filters?.jlptLevel) {
      grammar = grammar.filter(g => g.jlpt_level === filters.jlptLevel);
    }
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || grammar.length;
    
    return grammar.slice(offset, offset + limit).map(g => ({
      id: g.grammar_point,
      grammarPoint: g.grammar_point,
      meaningEn: g.meaning_en,
      structureNotes: g.structure_notes,
      jlptLevel: 'N5',
      exampleSentenceJp: g.example_sentence_jp,
      exampleSentenceEn: g.example_sentence_en,
      type: 'grammar'
    }));
  }

  async searchJlptContent(query: string, type?: 'vocabulary' | 'kanji' | 'grammar'): Promise<any[]> {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();
    
    if (!type || type === 'vocabulary') {
      const vocabResults = await this.getJlptVocabulary();
      results.push(...vocabResults.filter(v => 
        v.kanji.includes(query) ||
        v.kanaReading.includes(query) ||
        v.englishMeaning.some((m: string) => m.toLowerCase().includes(lowerQuery))
      ));
    }
    
    if (!type || type === 'kanji') {
      const kanjiResults = await this.getJlptKanji();
      results.push(...kanjiResults.filter(k => 
        k.kanji.includes(query) ||
        k.onyomi?.includes(query) ||
        k.kunyomi?.includes(query) ||
        k.englishMeaning.some((m: string) => m.toLowerCase().includes(lowerQuery))
      ));
    }
    
    if (!type || type === 'grammar') {
      const grammarResults = await this.getJlptGrammar();
      results.push(...grammarResults.filter(g => 
        g.grammarPoint.includes(query) ||
        g.meaningEn.toLowerCase().includes(lowerQuery) ||
        g.structureNotes?.toLowerCase().includes(lowerQuery)
      ));
    }
    
    return results;
  }

  async getVocabulary(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]> {
    const vocab = await this.getJlptVocabulary(filters);
    if (filters?.limit) {
      return vocab.slice(0, filters.limit);
    }
    return vocab;
  }

  async getKanji(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]> {
    const kanji = await this.getJlptKanji(filters);
    if (filters?.limit) {
      return kanji.slice(0, filters.limit);
    }
    return kanji;
  }

  async getGrammar(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]> {
    const grammar = await this.getJlptGrammar(filters);
    if (filters?.limit) {
      return grammar.slice(0, filters.limit);
    }
    return grammar;
  }
}

export const storage = new MemStorage();