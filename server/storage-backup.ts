
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

  private seedData() {
    // Create demo user with Google ID support
    const demoUser: User = {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      password: null,
      displayName: "Akira Tanaka",
      profileImageUrl: null,
      googleId: null,
      currentBelt: "yellow",
      currentJLPTLevel: "N5",
      totalXP: 1250,
      currentStreak: 7,
      bestStreak: 12,
      lastStudyDate: new Date(),
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

    // Generate authentic JLPT N5 sentence cards from vocabulary data
    n5Vocabulary.slice(0, 20).forEach((vocab, index) => {
      const card: SentenceCard = {
        id: index + 1,
        japanese: vocab.example_sentence_jp,
        reading: vocab.example_sentence_jp,
        english: vocab.example_sentence_en,
        audioUrl: vocab.audio_url || null,
        jlptLevel: "N5",
        difficulty: Math.min(Math.max(1, Math.floor(vocab.kana_reading.length / 2)), 5),
        register: vocab.kanji === vocab.kana_reading ? "casual" : "polite",
        theme: this.determineTheme(vocab.english_meaning),
        source: "jlptsensei_n5",
        grammarPoints: this.extractGrammarPoints(vocab.example_sentence_jp),
        vocabulary: [vocab.kanji, vocab.kana_reading],
        culturalNotes: `Core N5 vocabulary: ${vocab.kanji} (${vocab.kana_reading}) - ${vocab.english_meaning}`,
        createdAt: new Date()
      };
      this.sentenceCards.set(card.id, card);
    });

    // Create SRS items for the first few cards
    [1, 2, 3, 4, 5].forEach(cardId => {
      const srsItem: SrsItem = {
        id: cardId,
        userId: 1,
        sentenceCardId: cardId,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewed: null,
        nextReview: new Date(),
        correctCount: 0,
        incorrectCount: 0,
        mastery: 'learning',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.srsItems.set(cardId, srsItem);
    });

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

    // Sample study session
    const studySession: StudySession = {
      id: 1,
      userId: 1,
      sessionType: "review",
      cardsReviewed: 5,
      cardsCorrect: 4,
      timeSpentMinutes: 15,
      xpEarned: 100,
      startedAt: new Date(Date.now() - 900000), // 15 minutes ago
      completedAt: new Date()
    };
    this.studySessions.set(1, studySession);
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
}

export const storage = new MemStorage();