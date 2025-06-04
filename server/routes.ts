import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSrsItemSchema, 
  insertStudySessionSchema, 
  insertUserAchievementSchema 
} from "@shared/schema";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (demo mode)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1); // Demo user
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = 1; // Demo user
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

  // Get review queue
  app.get("/api/review-queue", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const limit = parseInt(req.query.limit as string) || 20;
      
      const reviewItems = await storage.getReviewQueue(userId, limit);
      
      // Get sentence cards for each SRS item
      const reviewCardsWithContent = await Promise.all(
        reviewItems.map(async (item) => {
          const sentenceCard = await storage.getSentenceCard(item.sentenceCardId);
          return {
            srsItem: item,
            sentenceCard
          };
        })
      );

      res.json(reviewCardsWithContent);
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

  const httpServer = createServer(app);
  return httpServer;
}