import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { apiKeySetupSchema, insertStudySessionSchema } from "@shared/schema";
import { z } from "zod";

// Mock API clients for WaniKani and Bunpro
class WaniKaniClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getUser() {
    // In a real implementation, this would make an actual API call
    return {
      id: "user123",
      username: "learner",
      level: 18,
      subscription: {
        active: true,
        type: "recurring"
      }
    };
  }

  async getSummary() {
    return {
      lessons: [
        { available_at: new Date(), subject_ids: [1, 2, 3] }
      ],
      reviews: [
        { available_at: new Date(), subject_ids: [4, 5, 6, 7, 8] }
      ]
    };
  }

  async getSubjects() {
    return {
      data: [
        { id: 1, object: "kanji", data: { level: 1, character: "一" } },
        { id: 2, object: "kanji", data: { level: 1, character: "二" } },
        { id: 3, object: "vocabulary", data: { level: 1, character: "人" } }
      ],
      total_count: 342
    };
  }

  async getAssignments() {
    return {
      data: [
        { id: 1, subject_id: 1, srs_stage: 5 },
        { id: 2, subject_id: 2, srs_stage: 4 }
      ]
    };
  }
}

class BunproClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getUser() {
    return {
      id: "user456",
      username: "grammar_learner",
      streak: 12,
      profile: {
        study_level: 2
      }
    };
  }

  async getProgress() {
    return {
      grammar_points_learned: 127,
      reviews_completed: 1200,
      average_srs_level: 4.2,
      accuracy_percentage: 84
    };
  }

  async getReviews() {
    return {
      reviews_available: 12,
      reviews_completed_today: 8
    };
  }
}

async function checkAchievements(userId: number) {
  const user = await storage.getUser(userId);
  if (!user) return [];

  const progress = await storage.getUserProgress(userId);
  const achievements = await storage.getAllAchievements();
  const unlockedAchievements = [];

  for (const achievement of achievements) {
    const hasAchievement = await storage.hasUserAchievement(userId, achievement.id);
    if (hasAchievement) continue;

    let shouldUnlock = false;

    switch (achievement.category) {
      case "streak":
        shouldUnlock = user.currentStreak >= (achievement.threshold || 0);
        break;
      case "kanji":
        if (progress?.wanikaniData) {
          const kanjiCount = (progress.wanikaniData as any)?.subjects?.kanji || 0;
          shouldUnlock = kanjiCount >= (achievement.threshold || 0);
        }
        break;
      case "vocabulary":
        if (progress?.wanikaniData) {
          const vocabCount = (progress.wanikaniData as any)?.subjects?.vocabulary || 0;
          shouldUnlock = vocabCount >= (achievement.threshold || 0);
        }
        break;
      case "grammar":
        if (progress?.bunproData) {
          const grammarPoints = (progress.bunproData as any)?.grammar_points_learned || 0;
          shouldUnlock = grammarPoints >= (achievement.threshold || 0);
        }
        break;
    }

    if (shouldUnlock) {
      await storage.unlockAchievement({
        userId,
        achievementId: achievement.id
      });
      
      // Award XP
      await storage.updateUser(userId, {
        totalXP: user.totalXP + achievement.xpReward
      });

      unlockedAchievements.push(achievement);
    }
  }

  return unlockedAchievements;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      // For demo purposes, using user ID 1
      const userId = 1;
      let user = await storage.getUser(userId);
      
      if (!user) {
        // Create a demo user
        user = await storage.createUser({
          username: "demo_user",
          password: "password",
          displayName: "Alex Tanaka"
        });
      }

      const progress = await storage.getUserProgress(userId);
      const achievements = await storage.getUserAchievements(userId);
      const recentSessions = await storage.getUserStudySessions(userId, 7);

      res.json({
        user,
        progress,
        achievements,
        recentSessions
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Setup API keys
  app.post("/api/setup-keys", async (req, res) => {
    try {
      const { wanikaniApiKey, bunproApiKey } = apiKeySetupSchema.parse(req.body);
      const userId = 1; // Demo user

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUser(userId, {
        wanikaniApiKey,
        bunproApiKey
      });

      res.json({ message: "API keys updated successfully" });
    } catch (error) {
      console.error("Setup keys error:", error);
      res.status(400).json({ message: "Invalid API key data" });
    }
  });

  // Sync data from external APIs
  app.post("/api/sync-data", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let wanikaniData = null;
      let bunproData = null;

      // Sync WaniKani data
      if (user.wanikaniApiKey) {
        try {
          const waniClient = new WaniKaniClient(user.wanikaniApiKey);
          const [userInfo, summary, subjects, assignments] = await Promise.all([
            waniClient.getUser(),
            waniClient.getSummary(),
            waniClient.getSubjects(),
            waniClient.getAssignments()
          ]);

          wanikaniData = {
            user: userInfo,
            summary,
            subjects: {
              kanji: subjects.data.filter(s => s.object === "kanji").length,
              vocabulary: subjects.data.filter(s => s.object === "vocabulary").length,
              total: subjects.total_count
            },
            assignments,
            level: userInfo.level,
            reviewsAvailable: summary.reviews.length,
            lastSync: new Date()
          };
        } catch (error) {
          console.error("WaniKani sync error:", error);
        }
      }

      // Sync Bunpro data
      if (user.bunproApiKey) {
        try {
          const bunproClient = new BunproClient(user.bunproApiKey);
          const [userInfo, progressInfo, reviews] = await Promise.all([
            bunproClient.getUser(),
            bunproClient.getProgress(),
            bunproClient.getReviews()
          ]);

          bunproData = {
            user: userInfo,
            progress: progressInfo,
            reviews,
            grammar_points_learned: progressInfo.grammar_points_learned,
            accuracy: progressInfo.accuracy_percentage,
            srs_average: progressInfo.average_srs_level,
            reviewsAvailable: reviews.reviews_available,
            lastSync: new Date()
          };
        } catch (error) {
          console.error("Bunpro sync error:", error);
        }
      }

      // Update user progress
      await storage.updateUserProgress(userId, {
        userId,
        wanikaniData,
        bunproData
      });

      // Check for new achievements
      const newAchievements = await checkAchievements(userId);

      res.json({
        message: "Data synced successfully",
        wanikaniSynced: !!wanikaniData,
        bunproSynced: !!bunproData,
        newAchievements
      });
    } catch (error) {
      console.error("Sync data error:", error);
      res.status(500).json({ message: "Failed to sync data" });
    }
  });

  // Record study session
  app.post("/api/study-session", async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const userId = 1; // Demo user

      const session = await storage.createStudySession({
        ...sessionData,
        userId
      });

      // Update user streak
      const user = await storage.getUser(userId);
      if (user) {
        const today = new Date();
        const lastStudy = user.lastStudyDate;
        let newStreak = 1;

        if (lastStudy) {
          const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            newStreak = user.currentStreak + 1;
          } else if (daysDiff === 0) {
            newStreak = user.currentStreak; // Same day
          }
        }

        await storage.updateUser(userId, {
          currentStreak: newStreak,
          bestStreak: Math.max(user.bestStreak, newStreak),
          lastStudyDate: today,
          totalXP: user.totalXP + (sessionData.xpEarned || 0)
        });

        // Check for new achievements
        const newAchievements = await checkAchievements(userId);

        res.json({
          session,
          newAchievements
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Study session error:", error);
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // Get all achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      const userId = 1; // Demo user
      const userAchievements = await storage.getUserAchievements(userId);

      res.json({
        achievements,
        userAchievements
      });
    } catch (error) {
      console.error("Achievements error:", error);
      res.status(500).json({ message: "Failed to load achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
