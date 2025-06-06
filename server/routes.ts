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

// SRS Algorithm Implementation
class SRSAlgorithm {
  static calculateNextReview(
    currentInterval: number,
    easeFactor: number,
    repetitions: number,
    quality: number // 0-5 scale (0=total blackout, 5=perfect response)
  ): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
    let newEaseFactor = easeFactor;
    let newRepetitions = repetitions;
    let newInterval = currentInterval;

    if (quality >= 3) {
      // Correct response
      newRepetitions += 1;
      
      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentInterval * easeFactor);
      }
      
      newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      // Incorrect response
      newRepetitions = 0;
      newInterval = 1;
    }

    // Clamp ease factor between 1.3 and 2.5
    newEaseFactor = Math.max(1.3, Math.min(2.5, newEaseFactor));
    
    return { newInterval, newEaseFactor, newRepetitions };
  }

  static determineMastery(repetitions: number, interval: number): string {
    if (repetitions === 0) return "new";
    if (repetitions < 3) return "learning";
    if (interval < 21) return "review";
    return "mastered";
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
        kanji: sentenceCards.filter(card => card?.grammarPoints?.includes('kanji')).length,
        grammar: sentenceCards.filter(card => card?.grammarPoints && Array.isArray(card.grammarPoints) && card.grammarPoints.length > 0).length,
        vocabulary: sentenceCards.filter(card => card?.vocabulary && Array.isArray(card.vocabulary) && card.vocabulary.length > 0).length,
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
            easeFactor: 2.5,
            repetitions: 0,
            lastReviewed: null,
            nextReview: new Date(),
            correctCount: 0,
            incorrectCount: 0,
            mastery: 'learning'
          });
        }
        
        items = await storage.getReviewQueue(userId, 1000);
      }
      
      let filteredItems = items;
      
      if (mode && mode !== 'all-reviews') {
        const sentenceCards = await Promise.all(
          items.map(item => storage.getSentenceCard(item.sentenceCardId))
        );
        
        const filteredIndices: number[] = [];
        
        sentenceCards.forEach((card, index) => {
          if (!card) return;
          
          switch (mode) {
            case 'kanji-reviews':
              if (card.grammarPoints?.includes('kanji') || card.japanese.match(/[\u4e00-\u9faf]/)) {
                filteredIndices.push(index);
              }
              break;
            case 'grammar-reviews':
              if (card.grammarPoints && card.grammarPoints.length > 0) {
                filteredIndices.push(index);
              }
              break;
            case 'vocabulary-reviews':
              if (card.vocabulary && card.vocabulary.length > 0) {
                filteredIndices.push(index);
              }
              break;
            case 'learn-kanji':
            case 'learn-grammar':
            case 'learn-vocabulary':
              // For learning new content, return a subset for demonstration
              if (index < 5) filteredIndices.push(index);
              break;
          }
        });
        
        filteredItems = filteredIndices.map(i => items[i]).slice(0, limit);
      } else {
        filteredItems = items.slice(0, limit);
      }
      
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

      // Calculate new SRS values
      const { newInterval, newEaseFactor, newRepetitions } = SRSAlgorithm.calculateNextReview(
        srsItem.interval,
        srsItem.easeFactor,
        srsItem.repetitions,
        quality
      );

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + newInterval);

      const newMastery = SRSAlgorithm.determineMastery(newRepetitions, newInterval);

      // Update SRS item
      const updatedItem = await storage.updateSrsItem(srsItemId, {
        interval: newInterval,
        easeFactor: newEaseFactor,
        repetitions: newRepetitions,
        lastReviewed: new Date(),
        nextReview,
        correctCount: quality >= 3 ? srsItem.correctCount + 1 : srsItem.correctCount,
        incorrectCount: quality < 3 ? srsItem.incorrectCount + 1 : srsItem.incorrectCount,
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
        easeFactor: 2.5,
        repetitions: 0,
        nextReview: new Date()
      });

      res.json(srsItem);
    } catch (error) {
      console.error("Error adding card to SRS:", error);
      res.status(500).json({ error: "Failed to add card to SRS" });
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
          review: srsItems.filter(item => item.mastery === "review").length,
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

  // Get vocabulary items
  app.get("/api/vocabulary", async (req, res) => {
    try {
      const level = req.query.level as string;
      const jlptData = getJLPTData();
      
      let vocabularyItems: ProcessedVocabularyItem[] = [];
      
      if (level && level !== 'all') {
        const levelData = jlptData.get(level.toUpperCase());
        if (levelData) {
          vocabularyItems = levelData.slice(0, 100); // Limit to first 100 items for performance
        }
      } else {
        // Return items from all levels
        for (const [levelKey, levelData] of jlptData.entries()) {
          vocabularyItems.push(...levelData.slice(0, 20)); // 20 items per level
        }
      }

      // Transform to expected format
      const formattedItems = vocabularyItems.map(item => ({
        id: item.id,
        kanji: item.japanese,
        kana_reading: item.reading,
        english_meaning: item.english,
        example_sentence_jp: `${item.japanese}の例文です。`,
        example_sentence_en: `Example sentence with ${item.english}.`,
        jlptLevel: item.jlptLevel,
        difficulty: item.difficulty,
        register: item.register,
        theme: item.theme,
        tags: item.tags
      }));

      res.json(formattedItems);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });

  // Get kanji items
  app.get("/api/kanji", async (req, res) => {
    try {
      const level = req.query.level as string;
      
      // Sample kanji data for demonstration
      const kanjiItems = [
        {
          id: 1,
          kanji: "人",
          onyomi: "ジン、ニン",
          kunyomi: "ひと",
          english_meaning: "person",
          stroke_count: 2,
          example_vocab: ["人間", "大人"],
          jlptLevel: 'N5'
        },
        {
          id: 2,
          kanji: "日",
          onyomi: "ニチ、ジツ",
          kunyomi: "ひ、か",
          english_meaning: "day, sun",
          stroke_count: 4,
          example_vocab: ["今日", "毎日"],
          jlptLevel: 'N5'
        }
      ];

      let filteredItems = kanjiItems;
      if (level && level !== 'all') {
        filteredItems = kanjiItems.filter(item => item.jlptLevel === level);
      }

      res.json(filteredItems);
    } catch (error) {
      console.error("Error fetching kanji:", error);
      res.status(500).json({ error: "Failed to fetch kanji" });
    }
  });

  // Get grammar items
  app.get("/api/grammar", async (req, res) => {
    try {
      const level = req.query.level as string;
      
      // Sample grammar data for demonstration
      const grammarItems = [
        {
          id: 1,
          grammar_point: "です/である",
          meaning_en: "to be (polite/formal)",
          structure_notes: "Noun + です (polite) / Noun + である (formal written)",
          example_sentence_jp: "私は学生です。",
          example_sentence_en: "I am a student.",
          jlptLevel: 'N5'
        },
        {
          id: 2,
          grammar_point: "〜ます",
          meaning_en: "polite verb ending",
          structure_notes: "Verb stem + ます",
          example_sentence_jp: "本を読みます。",
          example_sentence_en: "I read a book.",
          jlptLevel: 'N5'
        }
      ];

      let filteredItems = grammarItems;
      if (level && level !== 'all') {
        filteredItems = grammarItems.filter(item => item.jlptLevel === level);
      }

      res.json(filteredItems);
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