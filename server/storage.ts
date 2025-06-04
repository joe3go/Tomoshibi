import { 
  User, InsertUser, 
  SentenceCard, InsertSentenceCard,
  SrsItem, InsertSrsItem,
  StudySession, InsertStudySession,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  LearningPath, UserPathProgress
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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

  private seedData() {
    // Create demo user
    const demoUser: User = {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      password: null,
      displayName: "Akira Tanaka",
      profileImageUrl: null,
      currentBelt: "yellow",
      currentJLPTLevel: "N5",
      totalXP: 1250,
      currentStreak: 7,
      bestStreak: 12,
      lastStudyDate: new Date(),
      studyGoal: "Understand anime without subtitles",
      dailyGoalMinutes: 30,
      preferredStudyTime: "evening",
      enableReminders: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(1, demoUser);

    // Seed authentic Japanese sentence cards
    const sentenceCards: SentenceCard[] = [
      {
        id: 1,
        japanese: "私は学生です。",
        reading: "わたし は がくせい です。",
        english: "I am a student.",
        audioUrl: null,
        jlptLevel: "N5",
        difficulty: 1,
        register: "polite",
        theme: "self_introduction",
        source: "textbook",
        grammarPoints: ["は particle", "です copula"],
        vocabulary: ["私", "学生"],
        culturalNotes: "This is the standard polite way to introduce yourself as a student.",
        createdAt: new Date()
      },
      {
        id: 2,
        japanese: "今日はいい天気ですね。",
        reading: "きょう は いい てんき です ね。",
        english: "It's nice weather today, isn't it?",
        audioUrl: null,
        jlptLevel: "N5",
        difficulty: 2,
        register: "polite",
        theme: "daily_conversation",
        source: "common_phrases",
        grammarPoints: ["は particle", "です copula", "ね particle"],
        vocabulary: ["今日", "いい", "天気"],
        culturalNotes: "Weather is a common conversation starter in Japan.",
        createdAt: new Date()
      },
      {
        id: 3,
        japanese: "ちょっと待って！",
        reading: "ちょっと まって！",
        english: "Wait a moment!",
        audioUrl: null,
        jlptLevel: "N5",
        difficulty: 3,
        register: "casual",
        theme: "anime",
        source: "My Hero Academia",
        grammarPoints: ["te-form", "imperative"],
        vocabulary: ["ちょっと", "待つ"],
        culturalNotes: "Very common expression in anime and casual conversation.",
        createdAt: new Date()
      },
      {
        id: 4,
        japanese: "お疲れ様でした。",
        reading: "おつかれさま でした。",
        english: "Thank you for your hard work.",
        audioUrl: null,
        jlptLevel: "N5",
        difficulty: 4,
        register: "polite",
        theme: "workplace",
        source: "business_japanese",
        grammarPoints: ["past tense", "honorific language"],
        vocabulary: ["お疲れ様"],
        culturalNotes: "Essential phrase for workplace courtesy in Japan.",
        createdAt: new Date()
      },
      {
        id: 5,
        japanese: "やばい！遅刻しちゃう！",
        reading: "やばい！ちこく しちゃう！",
        english: "Oh no! I'm going to be late!",
        audioUrl: null,
        jlptLevel: "N4",
        difficulty: 5,
        register: "casual",
        theme: "anime",
        source: "slice_of_life_anime",
        grammarPoints: ["casual speech", "ちゃう contraction", "future tense"],
        vocabulary: ["やばい", "遅刻"],
        culturalNotes: "やばい is very common slang, especially among young people.",
        createdAt: new Date()
      }
    ];

    sentenceCards.forEach(card => {
      this.sentenceCards.set(card.id, card);
      this.currentCardId = Math.max(this.currentCardId, card.id + 1);
    });

    // Create SRS items for demo user
    sentenceCards.slice(0, 3).forEach((card, index) => {
      const srsItem: SrsItem = {
        id: index + 1,
        userId: 1,
        sentenceCardId: card.id,
        interval: index === 0 ? 1 : index === 1 ? 3 : 7,
        easeFactor: 2.5,
        repetitions: index,
        lastReviewed: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)),
        nextReview: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)),
        correctCount: index * 2,
        incorrectCount: index,
        mastery: index === 0 ? "new" : index === 1 ? "learning" : "review",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.srsItems.set(srsItem.id, srsItem);
    });

    // Seed achievements
    const achievements: Achievement[] = [
      {
        id: 1,
        name: "First Steps",
        description: "Complete your first study session",
        icon: "🚪",
        category: "milestone",
        threshold: 1,
        beltRequired: null,
        xpReward: 50,
        createdAt: new Date()
      },
      {
        id: 2,
        name: "Consistency Master",
        description: "Study for 7 days in a row",
        icon: "🔥",
        category: "streak",
        threshold: 7,
        beltRequired: null,
        xpReward: 200,
        createdAt: new Date()
      },
      {
        id: 3,
        name: "Yellow Belt",
        description: "Achieve yellow belt mastery",
        icon: "🥋",
        category: "belt",
        threshold: null,
        beltRequired: "yellow",
        xpReward: 500,
        createdAt: new Date()
      },
      {
        id: 4,
        name: "Anime Enthusiast",
        description: "Master 50 anime-style sentences",
        icon: "📺",
        category: "content",
        threshold: 50,
        beltRequired: null,
        xpReward: 300,
        createdAt: new Date()
      },
      {
        id: 5,
        name: "Casual Speaker",
        description: "Master casual Japanese conversation",
        icon: "💬",
        category: "register",
        threshold: 25,
        beltRequired: null,
        xpReward: 250,
        createdAt: new Date()
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });

    // Unlock some achievements for demo user
    const userAchievement1: UserAchievement = {
      id: 1,
      userId: 1,
      achievementId: 1,
      unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    };
    const userAchievement2: UserAchievement = {
      id: 2,
      userId: 1,
      achievementId: 2,
      unlockedAt: new Date()
    };

    this.userAchievements.set(1, userAchievement1);
    this.userAchievements.set(2, userAchievement2);

    // Create a recent study session
    const studySession: StudySession = {
      id: 1,
      userId: 1,
      sessionType: "review",
      cardsReviewed: 15,
      cardsCorrect: 13,
      timeSpentMinutes: 18,
      xpEarned: 85,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 18 * 60 * 1000)
    };
    this.studySessions.set(1, studySession);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...userData,
      currentBelt: "white",
      currentJLPTLevel: "N5",
      totalXP: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastStudyDate: null,
      dailyGoalMinutes: 20,
      enableReminders: true,
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

  async getSentenceCards(filters?: {
    jlptLevel?: string;
    register?: string;
    theme?: string;
    difficulty?: number;
  }): Promise<SentenceCard[]> {
    let cards = Array.from(this.sentenceCards.values());
    
    if (filters?.jlptLevel) {
      cards = cards.filter(card => card.jlptLevel === filters.jlptLevel);
    }
    if (filters?.register) {
      cards = cards.filter(card => card.register === filters.register);
    }
    if (filters?.theme) {
      cards = cards.filter(card => card.theme === filters.theme);
    }
    if (filters?.difficulty) {
      cards = cards.filter(card => card.difficulty <= filters.difficulty);
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
      createdAt: new Date()
    };
    
    this.sentenceCards.set(card.id, card);
    return card;
  }

  async getUserSrsItems(userId: number): Promise<SrsItem[]> {
    return Array.from(this.srsItems.values()).filter(item => item.userId === userId);
  }

  async getSrsItem(id: number): Promise<SrsItem | undefined> {
    return this.srsItems.get(id);
  }

  async createSrsItem(itemData: InsertSrsItem): Promise<SrsItem> {
    const item: SrsItem = {
      id: this.currentSrsItemId++,
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
    const userItems = Array.from(this.srsItems.values())
      .filter(item => item.userId === userId && item.nextReview <= new Date())
      .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
    
    return limit ? userItems.slice(0, limit) : userItems;
  }

  async createStudySession(sessionData: InsertStudySession): Promise<StudySession> {
    const session: StudySession = {
      id: this.currentSessionId++,
      startedAt: new Date(),
      ...sessionData
    };
    
    this.studySessions.set(session.id, session);
    return session;
  }

  async getUserStudySessions(userId: number, limit?: number): Promise<StudySession[]> {
    const sessions = Array.from(this.studySessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    
    return limit ? sessions.slice(0, limit) : sessions;
  }

  async updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const achievement: Achievement = {
      id: this.currentAchievementId++,
      ...achievementData,
      createdAt: new Date()
    };
    
    this.achievements.set(achievement.id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return userAchievements.map(ua => {
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
    return Array.from(this.userAchievements.values())
      .some(ua => ua.userId === userId && ua.achievementId === achievementId);
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