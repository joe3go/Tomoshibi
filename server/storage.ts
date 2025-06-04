import { 
  users, 
  achievements, 
  userAchievements, 
  studySessions, 
  userProgress,
  type User, 
  type InsertUser, 
  type Achievement, 
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type StudySession,
  type InsertStudySession,
  type UserProgress,
  type InsertUserProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User achievement operations
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  hasUserAchievement(userId: number, achievementId: number): Promise<boolean>;

  // Study session operations
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getUserStudySessions(userId: number, limit?: number): Promise<StudySession[]>;

  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, progress: InsertUserProgress): Promise<UserProgress>;

  // Social features operations
  // Study Groups
  getAllStudyGroups(): Promise<StudyGroup[]>;
  getStudyGroup(id: number): Promise<StudyGroup | undefined>;
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  joinStudyGroup(groupId: number, userId: number): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  getUserGroups(userId: number): Promise<StudyGroup[]>;

  // Challenges
  getAllChallenges(): Promise<Challenge[]>;
  getActiveUserChallenges(userId: number): Promise<UserChallenge[]>;
  joinChallenge(userId: number, challengeId: number): Promise<UserChallenge>;
  updateChallengeProgress(userId: number, challengeId: number, progress: number): Promise<UserChallenge>;

  // Leaderboards
  getLeaderboard(period: string, metric: string): Promise<Leaderboard[]>;
  updateUserLeaderboard(userId: number, period: string, metric: string, value: number): Promise<void>;

  // Study Buddies
  getStudyBuddies(userId: number): Promise<StudyBuddyPair[]>;
  getBuddyRequests(userId: number): Promise<StudyBuddyRequest[]>;
  sendBuddyRequest(request: InsertStudyBuddyRequest): Promise<StudyBuddyRequest>;
  acceptBuddyRequest(requestId: number): Promise<StudyBuddyPair>;

  // Forums
  getForumCategories(): Promise<ForumCategory[]>;
  getForumTopics(categoryId: number): Promise<ForumTopic[]>;
  getForumPosts(topicId: number): Promise<ForumPost[]>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;

  // SRS Learning System
  // Grammar operations
  getAllGrammarPoints(): Promise<GrammarPoint[]>;
  getGrammarPoint(id: number): Promise<GrammarPoint | undefined>;
  
  // Kanji operations
  getAllKanji(): Promise<Kanji[]>;
  getKanji(id: number): Promise<Kanji | undefined>;
  
  // Vocabulary operations
  getAllVocabulary(): Promise<Vocabulary[]>;
  getVocabulary(id: number): Promise<Vocabulary | undefined>;
  
  // SRS operations
  getUserSrsItems(userId: number): Promise<SrsItem[]>;
  getSrsItem(id: number): Promise<SrsItem | undefined>;
  createSrsItem(item: InsertSrsItem): Promise<SrsItem>;
  updateSrsItem(id: number, updates: Partial<SrsItem>): Promise<SrsItem | undefined>;
  getReviewQueue(userId: number): Promise<SrsItem[]>;
  
  // Review operations
  createReviewSession(session: InsertReviewSession): Promise<ReviewSession>;
  getUserReviewSessions(userId: number, limit?: number): Promise<ReviewSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private studySessions: Map<number, StudySession>;
  private userProgress: Map<number, UserProgress>;
  private currentUserId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;
  private currentStudySessionId: number;
  private currentUserProgressId: number;

  constructor() {
    this.users = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.studySessions = new Map();
    this.userProgress = new Map();
    this.currentUserId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentStudySessionId = 1;
    this.currentUserProgressId = 1;
    
    this.seedAchievements();
  }

  private seedAchievements() {
    const defaultAchievements: InsertAchievement[] = [
      {
        name: "First Steps",
        description: "Complete your first study session",
        icon: "fas fa-baby",
        xpReward: 25,
        category: "milestone",
        threshold: 1
      },
      {
        name: "Kanji Apprentice",
        description: "Learn 50 kanji characters",
        icon: "fas fa-language",
        xpReward: 100,
        category: "kanji",
        threshold: 50
      },
      {
        name: "Kanji Master",
        description: "Learn 300 kanji characters",
        icon: "fas fa-medal",
        xpReward: 500,
        category: "kanji",
        threshold: 300
      },
      {
        name: "Vocabulary Builder",
        description: "Learn 500 vocabulary words",
        icon: "fas fa-book",
        xpReward: 200,
        category: "vocabulary",
        threshold: 500
      },
      {
        name: "Grammar Guru",
        description: "Master 100 grammar points",
        icon: "fas fa-graduation-cap",
        xpReward: 300,
        category: "grammar",
        threshold: 100
      },
      {
        name: "Streak Starter",
        description: "Study for 3 days in a row",
        icon: "fas fa-fire",
        xpReward: 50,
        category: "streak",
        threshold: 3
      },
      {
        name: "Streak Master",
        description: "Study for 10 days in a row",
        icon: "fas fa-fire",
        xpReward: 150,
        category: "streak",
        threshold: 10
      },
      {
        name: "Dedication",
        description: "Study for 30 days in a row",
        icon: "fas fa-crown",
        xpReward: 500,
        category: "streak",
        threshold: 30
      },
      {
        name: "N5 Champion",
        description: "Complete JLPT N5 level",
        icon: "fas fa-trophy",
        xpReward: 1000,
        category: "jlpt",
        threshold: 5
      },
      {
        name: "N4 Warrior",
        description: "Complete JLPT N4 level",
        icon: "fas fa-shield-alt",
        xpReward: 1500,
        category: "jlpt",
        threshold: 4
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.createAchievement(achievement);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      totalXP: 0,
      currentStreak: 0,
      bestStreak: 0,
      currentJLPTLevel: "N5",
      wanikaniApiKey: null,
      bunproApiKey: null,
      lastStudyDate: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const newAchievement: Achievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return userAchievements.map(ua => ({
      ...ua,
      achievement: this.achievements.get(ua.achievementId)!
    }));
  }

  async unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentUserAchievementId++;
    const newUserAchievement: UserAchievement = {
      ...userAchievement,
      id,
      unlockedAt: new Date(),
    };
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }

  async hasUserAchievement(userId: number, achievementId: number): Promise<boolean> {
    return Array.from(this.userAchievements.values())
      .some(ua => ua.userId === userId && ua.achievementId === achievementId);
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.currentStudySessionId++;
    const newSession: StudySession = {
      ...session,
      id,
      date: new Date(),
    };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async getUserStudySessions(userId: number, limit?: number): Promise<StudySession[]> {
    const sessions = Array.from(this.studySessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? sessions.slice(0, limit) : sessions;
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(progress => progress.userId === userId);
  }

  async updateUserProgress(userId: number, progressData: InsertUserProgress): Promise<UserProgress> {
    const existingProgress = await this.getUserProgress(userId);
    
    if (existingProgress) {
      const updatedProgress: UserProgress = {
        ...existingProgress,
        ...progressData,
        lastSyncedAt: new Date(),
      };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const id = this.currentUserProgressId++;
      const newProgress: UserProgress = {
        ...progressData,
        id,
        lastSyncedAt: new Date(),
      };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }
}

// DatabaseStorage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user || undefined;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const now = new Date();
    const [user] = await db.select().from(users).where(
      and(
        eq(users.passwordResetToken, token),
        // Check if token hasn't expired (valid for 1 hour)
      )
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievementsWithDetails = await db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    return userAchievementsWithDetails.map(row => ({
      ...row.user_achievements,
      achievement: row.achievements
    }));
  }

  async unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values(userAchievement)
      .returning();
    return newUserAchievement;
  }

  async hasUserAchievement(userId: number, achievementId: number): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      )
      .limit(1);
    return !!existing;
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db
      .insert(studySessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getUserStudySessions(userId: number, limit?: number): Promise<StudySession[]> {
    if (limit) {
      return await db
        .select()
        .from(studySessions)
        .where(eq(studySessions.userId, userId))
        .orderBy(desc(studySessions.date))
        .limit(limit);
    }

    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.date));
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    return progress || undefined;
  }

  async updateUserProgress(userId: number, progressData: InsertUserProgress): Promise<UserProgress> {
    // Try to update existing progress first
    const [updated] = await db
      .update(userProgress)
      .set(progressData)
      .where(eq(userProgress.userId, userId))
      .returning();

    if (updated) {
      return updated;
    }

    // If no existing progress, create new
    const [created] = await db
      .insert(userProgress)
      .values(progressData)
      .returning();
    return created;
  }

  // Seed default achievements in database
  async seedAchievements(): Promise<void> {
    const defaultAchievements: InsertAchievement[] = [
      {
        name: "First Steps",
        description: "Complete your first study session",
        icon: "fas fa-baby",
        xpReward: 25,
        category: "milestone",
        threshold: 1
      },
      {
        name: "Kanji Apprentice", 
        description: "Learn 50 kanji characters",
        icon: "fas fa-language",
        xpReward: 100,
        category: "kanji",
        threshold: 50
      },
      {
        name: "Kanji Master",
        description: "Learn 300 kanji characters", 
        icon: "fas fa-medal",
        xpReward: 500,
        category: "kanji",
        threshold: 300
      },
      {
        name: "Vocabulary Builder",
        description: "Learn 500 vocabulary words",
        icon: "fas fa-book", 
        xpReward: 200,
        category: "vocabulary",
        threshold: 500
      },
      {
        name: "Grammar Guru",
        description: "Master 100 grammar points",
        icon: "fas fa-graduation-cap",
        xpReward: 300,
        category: "grammar", 
        threshold: 100
      },
      {
        name: "Streak Starter",
        description: "Study for 3 days in a row",
        icon: "fas fa-fire",
        xpReward: 50,
        category: "streak",
        threshold: 3
      },
      {
        name: "Streak Master", 
        description: "Study for 10 days in a row",
        icon: "fas fa-fire",
        xpReward: 150,
        category: "streak",
        threshold: 10
      },
      {
        name: "Dedication",
        description: "Study for 30 days in a row",
        icon: "fas fa-crown", 
        xpReward: 500,
        category: "streak",
        threshold: 30
      },
      {
        name: "N5 Champion",
        description: "Complete JLPT N5 level",
        icon: "fas fa-trophy",
        xpReward: 1000,
        category: "jlpt",
        threshold: 5
      },
      {
        name: "N4 Warrior", 
        description: "Complete JLPT N4 level",
        icon: "fas fa-shield-alt",
        xpReward: 1500,
        category: "jlpt",
        threshold: 4
      }
    ];

    // Check if achievements already exist to avoid duplicates
    const existingAchievements = await this.getAllAchievements();
    if (existingAchievements.length === 0) {
      for (const achievement of defaultAchievements) {
        await this.createAchievement(achievement);
      }
    }
  }
}

export const storage = new DatabaseStorage();
