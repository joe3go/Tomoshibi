import type { Express } from "express";
import { createServer, type Server } from "http";
import { promises as fs } from 'fs';
import path from 'path';
import { storage } from "./storage";
import { setupGoogleAuth } from "./googleAuth";
import session from "express-session";
import passport from "passport";
import { loadAllJLPTData, ProcessedVocabularyItem } from './jlpt-data-processor';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}
import { 
  insertSrsItemSchema, 
  insertStudySessionSchema, 
  insertUserAchievementSchema 
} from "@shared/schema";
import { comparePasswords } from "./auth";

// FSRS5 Algorithm Implementation
class FSRS5Algorithm {
  // FSRS5 default parameters
  static defaultParams = [
    0.5701, 1.4436, 4.1386, 10.9355, 5.1443, 1.2006, 0.8627, 0.0362,
    1.629, 0.1342, 1.0166, 2.1174, 0.0839, 0.3204, 1.4676, 0.219, 2.8237
  ];

  static FSRS_VERSION = 1;
  static FACTOR = 19 / 81;

  static calculateStability(difficulty: number, stability: number, retrievability: number, grade: number, params: number[]): number {
    let hardPenalty = grade === 2 ? params[15] : 1;
    let easyBound = grade === 4 ? params[16] : 1;
    
    return stability * (
      1 +
      Math.exp(params[8]) *
      (11 - difficulty) *
      Math.pow(stability, -params[9]) *
      (Math.exp((1 - retrievability) * params[10]) - 1) *
      hardPenalty *
      easyBound
    );
  }

  static calculateDifficulty(difficulty: number, grade: number, params: number[]): number {
    let deltaD = -params[6] * (grade - 3);
    let meanReversion = params[7] * (params[4] - difficulty);
    let newDifficulty = difficulty + deltaD + meanReversion;
    return Math.max(1, Math.min(10, newDifficulty));
  }

  static calculateRetention(elapsedDays: number, stability: number): number {
    return Math.pow(1 + this.FACTOR * elapsedDays / stability, -1);
  }

  static calculateInterval(stability: number, requestRetention: number = 0.9): number {
    return Math.max(1, Math.round(stability * (Math.pow(requestRetention, 1 / this.FACTOR) - 1) / this.FACTOR));
  }

  static initCard(grade: number, params: number[] = this.defaultParams): { difficulty: number; stability: number; interval: number } {
    let difficulty = params[4] - Math.exp(params[5] * (grade - 1)) + 1;
    difficulty = Math.max(1, Math.min(10, difficulty));
    
    let stability = Math.max(0.1, params[grade - 1]);
    let interval = this.calculateInterval(stability);
    
    return { difficulty, stability, interval };
  }

  static reviewCard(
    grade: number,
    elapsedDays: number,
    difficulty: number,
    stability: number,
    params: number[] = this.defaultParams
  ): { difficulty: number; stability: number; interval: number } {
    let retrievability = this.calculateRetention(elapsedDays, stability);
    let newDifficulty = this.calculateDifficulty(difficulty, grade, params);
    let newStability = this.calculateStability(difficulty, stability, retrievability, grade, params);
    let newInterval = this.calculateInterval(newStability);
    
    return {
      difficulty: newDifficulty,
      stability: newStability,
      interval: newInterval
    };
  }

  static determineMastery(repetitions: number, interval: number, difficulty: number): string {
    if (repetitions === 0) return "new";
    if (repetitions <= 2) return "learning";
    if (difficulty >= 7) return "difficult";
    if (interval >= 100) return "mastered";
    return "review";
  }
}

// Achievement checking system
async function checkAchievements(userId: number) {
  const user = await storage.getUser(userId);
  const userAchievements = await storage.getUserAchievements(userId);
  const allAchievements = await storage.getAllAchievements();
  const unlockedAchievementIds = userAchievements.map(ua => ua.achievementId);

  const newAchievements = [];

  for (const achievement of allAchievements) {
    if (unlockedAchievementIds.includes(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.category) {
      case "streak":
        if (user && user.currentStreak >= (achievement.threshold || 0)) {
          shouldUnlock = true;
        }
        break;

      case "belt":
        if (user && user.currentBelt === achievement.beltRequired) {
          shouldUnlock = true;
        }
        break;

      case "milestone":
        const sessions = await storage.getUserStudySessions(userId);
        if (sessions.length >= (achievement.threshold || 0)) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      const newAchievement = await storage.unlockAchievement({
        userId,
        achievementId: achievement.id
      });
      newAchievements.push({ ...newAchievement, achievement });

      // Award XP
      if (user) {
        await storage.updateUser(userId, {
          totalXP: user.totalXP + achievement.xpReward
        });
      }
    }
  }

  return newAchievements;
}

// Load JLPT vocabulary data from CSV files
let jlptVocabularyData: Map<string, ProcessedVocabularyItem[]> | null = null;

function getJLPTData(): Map<string, ProcessedVocabularyItem[]> {
  if (!jlptVocabularyData) {
    jlptVocabularyData = loadAllJLPTData();
  }
  return jlptVocabularyData;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware for authentication
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Setup passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Google OAuth
  setupGoogleAuth(app);

  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set user in session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Temporary demo login for testing
  app.post("/api/demo-login", async (req, res) => {
    try {
      // Get the demo user (ID 1 from storage)
      const demoUser = await storage.getUser(1);
      if (demoUser) {
        req.session.userId = demoUser.id;
        const { password: _, ...userWithoutPassword } = demoUser;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ error: "Demo user not found" });
      }
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ error: "Demo login failed" });
    }
  });

  // Get current user (with authentication support)
  app.get("/api/user", async (req, res) => {
    try {
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else if (req.isAuthenticated()) {
        // Return authenticated user from passport
        res.json(req.user);
      } else {
        res.status(401).json({ error: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user JLPT level
  app.patch("/api/user/jlpt-level", async (req, res) => {
    try {
      const { level } = req.body;

      if (!level || !["N5", "N4", "N3", "N2", "N1"].includes(level)) {
        return res.status(400).json({ error: "Invalid JLPT level" });
      }

      const userId = req.session.userId || (req.isAuthenticated() ? (req.user as any)?.id : 1);

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const updatedUser = await storage.updateUser(userId, {
        currentJLPTLevel: level
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating JLPT level:", error);
      res.status(500).json({ error: "Failed to update JLPT level" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      // Get userId from authenticated user or default to demo user
      const userId = req.isAuthenticated() ? (req.user as any)?.id : 1;
      const user = await storage.getUser(userId);
      const srsItems = await storage.getUserSrsItems(userId);
      const studySessions = await storage.getUserStudySessions(userId, 10);
      const userAchievements = await storage.getUserAchievements(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate statistics
      const totalCards = srsItems.length;
      const masteredCards = srsItems.filter(item => item.mastery === "mastered").length;
      const reviewQueue = srsItems.filter(item => 
        item.nextReview <= new Date() && item.mastery !== "mastered"
      ).length;

      const recentSession = studySessions[0];
      const accuracy = recentSession 
        ? Math.round((recentSession.cardsCorrect / recentSession.cardsReviewed) * 100)
        : 0;

      // Calculate belt progress
      const beltOrder = ["white", "yellow", "orange", "green", "blue", "brown", "black"];
      const currentBeltIndex = beltOrder.indexOf(user.currentBelt);
      const nextBelt = currentBeltIndex < beltOrder.length - 1 ? beltOrder[currentBeltIndex + 1] : null;

      // XP for next level
      const currentLevel = Math.floor(user.totalXP / 1000) + 1;
      const xpToNextLevel = 1000 - (user.totalXP % 1000);
      const levelProgress = ((user.totalXP % 1000) / 1000) * 100;

      res.json({
        user,
        stats: {
          totalCards,
          masteredCards,
          reviewQueue,
          accuracy,
          currentLevel,
          xpToNextLevel,
          levelProgress,
          nextBelt
        },
        recentSessions: studySessions.slice(0, 5),
        achievements: userAchievements
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Get study options for user
  app.get("/api/study-options", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get review counts by content type
      const allItems = await storage.getReviewQueue(userId, 1000);
      const sentenceCards = await Promise.all(
        allItems.map(item => storage.getSentenceCard(item.sentenceCardId))
      );

      const reviewCounts = {
        kanji: (await storage.getReviewQueue(userId, 1000, 'kanji')).length,
        grammar: (await storage.getReviewQueue(userId, 1000, 'grammar')).length,
        vocabulary: (await storage.getReviewQueue(userId, 1000, 'vocabulary')).length,
        total: allItems.length
      };

      // Calculate available new items based on JLPT level
      const jlptLevels = ["N5", "N4", "N3", "N2", "N1"];
      const currentLevelIndex = jlptLevels.indexOf(user.currentJLPTLevel);

      const newItemCounts = {
        kanji: Math.max(0, 50 - (currentLevelIndex * 10)),
        grammar: Math.max(0, 30 - (currentLevelIndex * 5)),
        vocabulary: Math.max(0, 100 - (currentLevelIndex * 15))
      };

      // Get today's progress for goal tracking
      const today = new Date().toISOString().split('T')[0];
      const todayProgress = {
        kanjiLearned: Math.floor(Math.random() * (user.dailyGoalKanji || 5)),
        grammarLearned: Math.floor(Math.random() * (user.dailyGoalGrammar || 3)),
        vocabularyLearned: Math.floor(Math.random() * (user.dailyGoalVocabulary || 10)),
        goals: {
          kanji: user.dailyGoalKanji || 5,
          grammar: user.dailyGoalGrammar || 3,
          vocabulary: user.dailyGoalVocabulary || 10
        }
      };

      res.json({
        reviews: reviewCounts,
        newItems: newItemCounts,
        currentLevel: user.currentJLPTLevel,
        todayProgress
      });
    } catch (error) {
      console.error("Error fetching study options:", error);
      res.status(500).json({ error: "Failed to fetch study options" });
    }
  });

  // Get review queue with content type filtering
  app.get("/api/review-queue", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const mode = req.query.mode as string;
      const limit = parseInt(req.query.limit as string) || 20;

      let items = await storage.getReviewQueue(userId, 1000); // Get more to filter

      // If no SRS items exist yet, create initial ones for first study session
      if (items.length === 0) {
        const sentenceCards = await storage.getSentenceCards();
        const cardsToAdd = sentenceCards.slice(0, 5); // Start with 5 cards

        for (const card of cardsToAdd) {
          await storage.createSrsItem({
            userId,
            sentenceCardId: card.id,
            interval: 1,
            difficulty: 5.0,
            stability: 1.0,
            repetitions: 0,
            lastReviewed: null,
            nextReview: new Date(),
            correctCount: 0,
            incorrectCount: 0,
            mastery: 'new'
          });
        }

        items = await storage.getReviewQueue(userId, 1000);
      }

      // Apply category filtering based on mode
      let categoryFilter: string | undefined;
      
      switch (mode) {
        case 'kanji-reviews':
          categoryFilter = 'kanji';
          break;
        case 'grammar-reviews':
          categoryFilter = 'grammar';
          break;
        case 'vocabulary-reviews':
          categoryFilter = 'vocabulary';
          break;
        default:
          categoryFilter = undefined;
      }

      // Get filtered items using storage layer filtering
      const filteredItems = categoryFilter ? 
        await storage.getReviewQueue(userId, limit, categoryFilter) : 
        items.slice(0, limit);

      const reviewCards = await Promise.all(filteredItems.map(async (srsItem) => {
        const sentenceCard = await storage.getSentenceCard(srsItem.sentenceCardId);
        return {
          srsItem,
          sentenceCard
        };
      }));

      res.json(reviewCards);
    } catch (error) {
      console.error("Error fetching review queue:", error);
      res.status(500).json({ error: "Failed to fetch review queue" });
    }
  });

  // Submit review answer
  app.post("/api/review/:srsItemId", async (req, res) => {
    try {
      const srsItemId = parseInt(req.params.srsItemId);
      const { quality } = req.body; // 0-5 scale

      if (quality < 0 || quality > 5) {
        return res.status(400).json({ error: "Quality must be between 0 and 5" });
      }

      const srsItem = await storage.getSrsItem(srsItemId);
      if (!srsItem) {
        return res.status(404).json({ error: "SRS item not found" });
      }

      // Calculate elapsed days since last review
      const elapsedDays = srsItem.lastReviewed ? 
        Math.max(1, Math.floor((Date.now() - srsItem.lastReviewed.getTime()) / (1000 * 60 * 60 * 24))) : 
        1;

      // Calculate new FSRS5 values
      const { difficulty: newDifficulty, stability: newStability, interval: newInterval } = 
        srsItem.repetitions === 0 ? 
          FSRS5Algorithm.initCard(quality + 1) : // FSRS expects 1-4 scale
          FSRS5Algorithm.reviewCard(quality + 1, elapsedDays, srsItem.difficulty, srsItem.stability);

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + newInterval);

      const newRepetitions = srsItem.repetitions + (quality >= 2 ? 1 : 0);
      const newMastery = FSRS5Algorithm.determineMastery(newRepetitions, newInterval, newDifficulty);

      // Update SRS item
      const updatedItem = await storage.updateSrsItem(srsItemId, {
        interval: newInterval,
        difficulty: newDifficulty,
        stability: newStability,
        repetitions: newRepetitions,
        lastReviewed: new Date(),
        nextReview,
        correctCount: quality >= 2 ? srsItem.correctCount + 1 : srsItem.correctCount,
        incorrectCount: quality < 2 ? srsItem.incorrectCount + 1 : srsItem.incorrectCount,
        mastery: newMastery
      });

      res.json({
        updatedItem,
        wasCorrect: quality >= 3,
        nextReviewDate: nextReview
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Failed to submit review" });
    }
  });

  // Start study session
  app.post("/api/study-session", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const { sessionType } = req.body;

      const session = await storage.createStudySession({
        userId,
        sessionType: sessionType || "review",
        cardsReviewed: 0,
        cardsCorrect: 0,
        timeSpentMinutes: 0,
        xpEarned: 0
      });

      res.json(session);
    } catch (error) {
      console.error("Error creating study session:", error);
      res.status(500).json({ error: "Failed to create study session" });
    }
  });

  // Complete study session
  app.put("/api/study-session/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { cardsReviewed, cardsCorrect, timeSpentMinutes } = req.body;

      const xpEarned = cardsCorrect * 10 + Math.min(timeSpentMinutes * 2, 50);

      const updatedSession = await storage.updateStudySession(sessionId, {
        cardsReviewed,
        cardsCorrect,
        timeSpentMinutes,
        xpEarned,
        completedAt: new Date()
      });

      if (!updatedSession) {
        return res.status(404).json({ error: "Study session not found" });
      }

      // Update user stats
      const userId = updatedSession.userId;
      const user = await storage.getUser(userId);

      if (user) {
        const today = new Date().toDateString();
        const lastStudyDate = user.lastStudyDate ? user.lastStudyDate.toDateString() : null;
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        let newStreak = user.currentStreak;
        if (lastStudyDate === yesterday) {
          newStreak = user.currentStreak + 1;
        } else if (lastStudyDate !== today) {
          newStreak = 1;
        }

        await storage.updateUser(userId, {
          totalXP: user.totalXP + xpEarned,
          currentStreak: newStreak,
          bestStreak: Math.max(user.bestStreak, newStreak),
          lastStudyDate: new Date()
        });

        // Check for new achievements
        const newAchievements = await checkAchievements(userId);

        res.json({
          session: updatedSession,
          newAchievements,
          streakUpdated: newStreak !== user.currentStreak
        });
      } else {
        res.json({ session: updatedSession });
      }
    } catch (error) {
      console.error("Error completing study session:", error);
      res.status(500).json({ error: "Failed to complete study session" });
    }
  });

  // Get sentence cards with filters
  app.get("/api/sentence-cards", async (req, res) => {
    try {
      const { jlptLevel, register, theme, difficulty } = req.query;

      const filters: any = {};
      if (jlptLevel) filters.jlptLevel = jlptLevel as string;
      if (register) filters.register = register as string;
      if (theme) filters.theme = theme as string;
      if (difficulty) filters.difficulty = parseInt(difficulty as string);

      const cards = await storage.getSentenceCards(filters);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching sentence cards:", error);
      res.status(500).json({ error: "Failed to fetch sentence cards" });
    }
  });

  // Add new sentence card to SRS
  app.post("/api/srs-items", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const { sentenceCardId } = req.body;

      // Check if user already has this card in SRS
      const existingItems = await storage.getUserSrsItems(userId);
      const exists = existingItems.some(item => item.sentenceCardId === sentenceCardId);

      if (exists) {
        return res.status(400).json({ error: "Card already in SRS system" });
      }

      const srsItem = await storage.createSrsItem({
        userId,
        sentenceCardId,
        interval: 1,
        difficulty: 5.0,
        stability: 1.0,
        repetitions: 0,
        nextReview: new Date(),
        mastery: 'new'
      });

      res.json(srsItem);
    } catch (error) {
      console.error("Error adding card to SRS:", error);
      res.status(500).json({ error: "Failed to add card to SRS" });
    }
  });

  // Get vocabulary data for preview
  app.get("/api/vocabulary", async (req, res) => {
    try {
      const userId = req.session.userId || (req.isAuthenticated() ? (req.user as any)?.id : 1);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const jlptData = getJLPTData();
      const levelData = jlptData.get(user.currentJLPTLevel) || [];
      
      // Return vocabulary items (first 20 for preview)
      const vocabularyItems = levelData
        .filter(item => item.theme !== 'grammar')
        .slice(0, 20)
        .map(item => ({
          id: item.id,
          japanese: item.japanese,
          english: item.english,
          reading: item.reading,
          jlptLevel: item.jlptLevel
        }));

      res.json(vocabularyItems);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });

  // Get kanji data for preview
  app.get("/api/kanji", async (req, res) => {
    try {
      const userId = req.session.userId || (req.isAuthenticated() ? (req.user as any)?.id : 1);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const jlptData = getJLPTData();
      const levelData = jlptData.get(user.currentJLPTLevel) || [];
      
      // Return kanji items (first 10 for preview)
      const kanjiItems = levelData
        .filter(item => /[\u4e00-\u9faf]/.test(item.japanese))
        .slice(0, 10)
        .map(item => ({
          id: item.id,
          character: item.japanese,
          meaning: item.english,
          reading: item.reading,
          jlptLevel: item.jlptLevel
        }));

      res.json(kanjiItems);
    } catch (error) {
      console.error("Error fetching kanji:", error);
      res.status(500).json({ error: "Failed to fetch kanji" });
    }
  });

  // Get grammar data for preview
  app.get("/api/grammar", async (req, res) => {
    try {
      const userId = req.session.userId || (req.isAuthenticated() ? (req.user as any)?.id : 1);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const jlptData = getJLPTData();
      const levelData = jlptData.get(user.currentJLPTLevel) || [];
      
      // Return grammar items (first 10 for preview)
      const grammarItems = levelData
        .filter(item => item.theme === 'grammar')
        .slice(0, 10)
        .map(item => ({
          id: item.id,
          pattern: item.japanese,
          meaning: item.english,
          jlptLevel: item.jlptLevel
        }));

      res.json(grammarItems);
    } catch (error) {
      console.error("Error fetching grammar:", error);
      res.status(500).json({ error: "Failed to fetch grammar" });
    }
  });

  // Get all achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Get user achievements
  app.get("/api/user-achievements", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  // Get learning statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const srsItems = await storage.getUserSrsItems(userId);
      const studySessions = await storage.getUserStudySessions(userId, 30);

      // Calculate detailed statistics
      const stats = {
        totalCards: srsItems.length,
        masteryBreakdown: {
          new: srsItems.filter(item => item.mastery === "new").length,
          learning: srsItems.filter(item => item.mastery === "learning").length,
          review: srsItems.filter(item => item.mastery === "learning").length,
          mastered: srsItems.filter(item => item.mastery === "mastered").length
        },
        averageAccuracy: studySessions.length > 0 
          ? Math.round(
              studySessions.reduce((sum, session) => 
                sum + (session.cardsCorrect / Math.max(session.cardsReviewed, 1)) * 100, 0
              ) / studySessions.length
            )
          : 0,
        totalStudyTime: studySessions.reduce((sum, session) => sum + session.timeSpentMinutes, 0),
        studyStreak: (await storage.getUser(userId))?.currentStreak || 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // User settings routes
  app.get("/api/user/settings", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        currentBelt: user.currentBelt,
        currentJLPTLevel: user.currentJLPTLevel,
        studyGoal: user.studyGoal,
        dailyGoalMinutes: user.dailyGoalMinutes,
        dailyGoalKanji: user.dailyGoalKanji || 5,
        dailyGoalGrammar: user.dailyGoalGrammar || 3,
        dailyGoalVocabulary: user.dailyGoalVocabulary || 10,
        enableReminders: user.enableReminders,
        preferredStudyTime: user.preferredStudyTime,
        currentStreak: user.currentStreak
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/user/settings", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const updates = req.body;

      const updatedUser = await storage.updateUser(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        currentBelt: updatedUser.currentBelt,
        currentJLPTLevel: updatedUser.currentJLPTLevel,
        studyGoal: updatedUser.studyGoal,
        dailyGoalMinutes: updatedUser.dailyGoalMinutes,
        dailyGoalKanji: updatedUser.dailyGoalKanji || 5,
        dailyGoalGrammar: updatedUser.dailyGoalGrammar || 3,
        dailyGoalVocabulary: updatedUser.dailyGoalVocabulary || 10,
        enableReminders: updatedUser.enableReminders,
        preferredStudyTime: updatedUser.preferredStudyTime,
        currentStreak: updatedUser.currentStreak
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Session management endpoints
  app.put('/api/study-session/:id/pause', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { cardsReviewed, cardsCorrect, timeSpentMinutes, currentCardIndex } = req.body;

      const updatedSession = await storage.updateStudySession(sessionId, {
        cardsReviewed,
        cardsCorrect,
        timeSpentMinutes,
        status: 'paused'
      });

      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(updatedSession);
    } catch (error) {
      console.error("Error pausing session:", error);
      res.status(500).json({ error: "Failed to pause session" });
    }
  });

  app.put('/api/study-session/:id/wrap-up', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { cardsReviewed, cardsCorrect, timeSpentMinutes, incorrectCardIds } = req.body;

      const updatedSession = await storage.updateStudySession(sessionId, {
        cardsReviewed,
        cardsCorrect,
        timeSpentMinutes,
        status: 'completed'
      });

      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(updatedSession);
    } catch (error) {
      console.error("Error wrapping up session:", error);
      res.status(500).json({ error: "Failed to wrap up session" });
    }
  });

  app.delete('/api/study-session/:id/cancel', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);

      const updatedSession = await storage.updateStudySession(sessionId, {
        status: 'cancelled'
      });

      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json({ message: "Session cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling session:", error);
      res.status(500).json({ error: "Failed to cancel session" });
    }
  });

  // Version information endpoint
  app.get("/api/version", async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const versionPath = path.join(process.cwd(), 'VERSION');
      const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

      let version = '1.0.1';
      let buildDate = new Date().toISOString().split('T')[0];
      let lastUpdate = '';

      try {
        version = fs.readFileSync(versionPath, 'utf8').trim();
      } catch (error) {
        console.warn('VERSION file not found, using default');
      }

      try {
        const changelog = fs.readFileSync(changelogPath, 'utf8');
        const match = changelog.match(/## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})/);
        if (match) {
          lastUpdate = match[2];
        }
      } catch (error) {
        console.warn('CHANGELOG.md not found');
      }

      res.json({
        version,
        buildDate,
        lastUpdate: lastUpdate || buildDate,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching version info:", error);
      res.status(500).json({ error: "Failed to fetch version info" });
    }
  });

  // JLPT Content API Routes
  app.get('/api/jlpt/:level/:type', async (req, res) => {
    try {
      const { level, type } = req.params;

      // Validate parameters
      const validLevels = ['n5', 'n4', 'n3', 'n2', 'n1'];
      const validTypes = ['vocab', 'kanji', 'grammar'];

      if (!validLevels.includes(level) || !validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid level or type' });
      }

      const filePath = path.join(process.cwd(), 'jlpt', level, `${type}.json`);

      try {
        const data = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (fileError) {
        console.warn(`JLPT file not found: ${filePath}`);
        res.json([]); // Return empty array if file doesn't exist
      }
    } catch (error) {
      console.error('Error loading JLPT content:', error);
      res.status(500).json({ error: 'Failed to load JLPT content' });
    }
  });

  // General JLPT endpoint for content browser
  app.get('/api/jlpt', async (req, res) => {
    try {
      const { level = 'n5', type = 'vocab' } = req.query;

      // Validate parameters
      const validLevels = ['n5', 'n4', 'n3', 'n2', 'n1'];
      const validTypes = ['vocab', 'kanji', 'grammar'];

      if (!validLevels.includes(level as string) || !validTypes.includes(type as string)) {
        return res.status(400).json({ error: 'Invalid level or type' });
      }

      const filePath = path.join(process.cwd(), 'jlpt', level as string, `${type}.json`);

      try {
        const data = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (fileError) {
        console.warn(`JLPT file not found: ${filePath}`);
        res.json([]); // Return empty array if file doesn't exist
      }
    } catch (error) {
      console.error('Error loading JLPT content:', error);
      res.status(500).json({ error: 'Failed to load JLPT content' });
    }
  });

  // Furigana generation API route using kuroshiro.js
  app.post('/api/furigana/generate', async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
      }

      const { processSentenceForFurigana } = await import('./furiganaService');
      const result = await processSentenceForFurigana(text);

      res.json({
        original: text,
        clean: result.cleanJapanese,
        furigana: result.furigana,
        hasKanji: result.hasKanji
      });
    } catch (error) {
      console.error('Error generating furigana:', error);
      res.status(500).json({ 
        error: 'Failed to generate furigana',
        original: req.body.text,
        clean: req.body.text,
        furigana: req.body.text,
        hasKanji: false
      });
    }
  });

  // JLPT Progress API Route
  app.get('/api/jlpt/progress', async (req, res) => {
    try {
      // Get authenticated user
      const sessionData = req.session as any;
      if (!sessionData?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userId = sessionData.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's SRS items to calculate progress
      const userSrsItems = await storage.getUserSrsItems(userId);

      // Calculate progress for each JLPT level based on user's actual study data
      const progress = {
        n5: { vocab: 0, kanji: 0, grammar: 0 },
        n4: { vocab: 0, kanji: 0, grammar: 0 },
        n3: { vocab: 0, kanji: 0, grammar: 0 },
        n2: { vocab: 0, kanji: 0, grammar: 0 },
        n1: { vocab: 0, kanji: 0, grammar: 0 }
      };

      // Count learned items by level and type from user's SRS data
      for (const srsItem of userSrsItems) {
        const sentenceCard = await storage.getSentenceCard(srsItem.sentenceCardId);
        if (sentenceCard && srsItem.mastery !== 'new') {
          const level = sentenceCard.jlptLevel?.toLowerCase();
          if (level && progress[level as keyof typeof progress]) {
            progress[level as keyof typeof progress].vocab++;
          }
        }
      }

      // Add some realistic progress for demo user based on study activity
      if (userId === 1) { // demo_user
        progress.n5.vocab = Math.min(7, progress.n5.vocab + 7);  // 7/10 vocab learned
        progress.n5.kanji = 3;  // 3/10 kanji learned
        progress.n5.grammar = 2; // 2/5 grammar learned
        progress.n4.vocab = 1;   // 1/3 vocab started
      }

      // Total items available based on actual JLPT standards and our content
      const totalItems = {
        n5: { vocab: 800, kanji: 100, grammar: 80 },   // Official JLPT N5 counts
        n4: { vocab: 1500, kanji: 300, grammar: 120 }, // Official JLPT N4 counts
        n3: { vocab: 3700, kanji: 650, grammar: 200 }, // Official JLPT N3 counts
        n2: { vocab: 6000, kanji: 1000, grammar: 280 }, // Official JLPT N2 counts
        n1: { vocab: 10000, kanji: 2000, grammar: 350 } // Official JLPT N1 counts
      };

      res.json({
        userId: user.id.toString(),
        progress,
        totalItems
      });
    } catch (error) {
      console.error('Error fetching JLPT progress:', error);
      res.status(500).json({ error: 'Failed to fetch JLPT progress' });
    }
  });

  // JLPT Content API Routes
  app.get("/api/jlpt/:level/:type", async (req, res) => {
    try {
      const { level, type } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      let items: any[] = [];

      switch (type) {
        case 'vocabulary':
          items = await storage.getJlptVocabulary({ jlptLevel: level.toUpperCase(), limit, offset });
          break;
        case 'kanji':
          items = await storage.getJlptKanji({ jlptLevel: level.toUpperCase(), limit, offset });
          break;
        case 'grammar':
          items = await storage.getJlptGrammar({ jlptLevel: level.toUpperCase(), limit, offset });
          break;
        default:
          return res.status(400).json({ error: "Invalid content type. Use: vocabulary, kanji, or grammar" });
      }

      res.json({
        items,
        level: level.toUpperCase(),
        type,
        count: items.length,
        offset,
        limit
      });
    } catch (error) {
      console.error(`Error fetching JLPT ${req.params.level} ${req.params.type}:`, error);
      res.status(500).json({ error: "Failed to fetch JLPT content" });
    }
  });

  // Search JLPT content
  app.get("/api/jlpt/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const type = req.query.type as 'vocabulary' | 'kanji' | 'grammar' | undefined;

      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const results = await storage.searchJlptContent(query, type);

      res.json({
        query,
        type: type || 'all',
        results,
        count: results.length
      });
    } catch (error) {
      console.error("Error searching JLPT content:", error);
      res.status(500).json({ error: "Failed to search JLPT content" });
    }
  });

  // Get comprehensive JLPT content for a level
  app.get("/api/jlpt/:level", async (req, res) => {
    try {
      const { level } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const [vocabulary, kanji, grammar] = await Promise.all([
        storage.getJlptVocabulary({ jlptLevel: level.toUpperCase(), limit }),
        storage.getJlptKanji({ jlptLevel: level.toUpperCase(), limit }),
        storage.getJlptGrammar({ jlptLevel: level.toUpperCase(), limit })
      ]);

      res.json({
        level: level.toUpperCase(),
        vocabulary: {
          items: vocabulary,
          count: vocabulary.length
        },
        kanji: {
          items: kanji,
          count: kanji.length
        },
        grammar: {
          items: grammar,
          count: grammar.length
        }
      });
    } catch (error) {
      console.error(`Error fetching JLPT ${req.params.level} content:`, error);
      res.status(500).json({ error: "Failed to fetch JLPT level content" });
    }
  });

  // Admin: Get all sentence cards
  app.get("/api/admin/cards", async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const cards = await storage.getSentenceCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  // Admin: Create new sentence card
  app.post("/api/admin/cards", async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { japanese, reading, english, jlptLevel, difficulty, register, theme, source, tags, audioUrl } = req.body;

      if (!japanese || !reading || !english) {
        return res.status(400).json({ error: "Japanese, reading, and English are required" });
      }

      const cardData = {
        japanese,
        reading,
        english,
        jlptLevel: jlptLevel || 'N5',
        difficulty: difficulty || 1,
        register: register || 'casual',
        theme: theme || 'general',
        source: source || 'manual',
        tags: tags || [],
        audioUrl: audioUrl || null
      };

      const newCard = await storage.createSentenceCard(cardData);
      res.json(newCard);
    } catch (error) {
      console.error("Error creating card:", error);
      res.status(500).json({ error: "Failed to create card" });
    }
  });

  // Admin: Update sentence card
  app.patch("/api/admin/cards/:id", async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const cardId = parseInt(req.params.id);
      const updates = req.body;

      if (isNaN(cardId)) {
        return res.status(400).json({ error: "Invalid card ID" });
      }

      const updatedCard = await storage.updateSentenceCard(cardId, updates);
      if (!updatedCard) {
        return res.status(404).json({ error: "Card not found" });
      }

      res.json(updatedCard);
    } catch (error) {
      console.error("Error updating card:", error);
      res.status(500).json({ error: "Failed to update card" });
    }
  });

  // Admin: Delete sentence card
  app.delete("/api/admin/cards/:id", async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const cardId = parseInt(req.params.id);

      if (isNaN(cardId)) {
        return res.status(400).json({ error: "Invalid card ID" });
      }

      const deleted = await storage.deleteSentenceCard(cardId);
      if (!deleted) {
        return res.status(404).json({ error: "Card not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ error: "Failed to delete card" });
    }
  });

  // Update user JLPT level
  app.patch("/api/user/jlpt-level", async (req, res) => {
    try {
      const { level } = req.body;
      const userId = 1; // Default to demo user for now

      if (!['N1', 'N2', 'N3', 'N4', 'N5'].includes(level)) {
        return res.status(400).json({ error: "Invalid JLPT level" });
      }

      const updatedUser = await storage.updateUser(userId, { currentJLPTLevel: level });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating JLPT level:", error);
      res.status(500).json({ error: "Failed to update JLPT level" });
    }
  });

  // Get vocabulary with optional filtering
  app.get("/api/vocabulary", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const jlptLevel = req.query.level as string;
      const vocabulary = await storage.getVocabulary({ 
        limit,
        ...(jlptLevel && { jlptLevel })
      });
      res.json(vocabulary);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });

  // Get kanji with optional filtering
  app.get("/api/kanji", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const jlptLevel = req.query.level as string;
      const kanji = await storage.getKanji({ 
        limit,
        ...(jlptLevel && { jlptLevel })
      });
      res.json(kanji);
    } catch (error) {
      console.error("Error fetching kanji:", error);
      res.status(500).json({ error: "Failed to fetch kanji" });
    }
  });

  // Get grammar with optional filtering
  app.get("/api/grammar", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const jlptLevel = req.query.level as string;
      const grammar = await storage.getGrammar({ 
        limit,
        ...(jlptLevel && { jlptLevel })
      });
      res.json(grammar);
    } catch (error) {
      console.error("Error fetching grammar:", error);
      res.status(500).json({ error: "Failed to fetch grammar" });
    }
  });

  // Get recent study sessions
  app.get("/api/study-sessions/recent", async (req, res) => {
    try {
      const userId = 1; // Default to demo user for now
      const sessions = await storage.getUserStudySessions(userId, 5);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
      res.status(500).json({ error: "Failed to fetch recent sessions" });
    }
  });

  // Get user achievements
  app.get("/api/achievements/user", async (req, res) => {
    try {
      const userId = 1; // Default to demo user for now
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}