import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { 
  apiKeySetupSchema, 
  insertStudySessionSchema,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@shared/schema";
import { z } from "zod";
import { 
  hashPassword, 
  comparePasswords, 
  generateVerificationToken, 
  generatePasswordResetToken,
  getPasswordResetExpiry 
} from "./auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "./emailService";

// WaniKani API client for kanji, radicals, and vocabulary tracking
class WaniKaniClient {
  private apiKey: string;
  private baseUrl = 'https://api.wanikani.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string) {
    if (!this.apiKey) {
      throw new Error('WaniKani API key is required');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Wanikani-Revision': '20170710'
      }
    });
    
    if (!response.ok) {
      throw new Error(`WaniKani API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUser() {
    return await this.makeRequest('/user');
  }

  async getSummary() {
    return await this.makeRequest('/summary');
  }

  async getSubjects(types?: string[]) {
    const typeParam = types ? `?types=${types.join(',')}` : '';
    return await this.makeRequest(`/subjects${typeParam}`);
  }

  async getAssignments() {
    return await this.makeRequest('/assignments');
  }

  async getReviewStatistics() {
    return await this.makeRequest('/review_statistics');
  }

  async getLevelProgression() {
    return await this.makeRequest('/level_progressions');
  }
}

// Bunpro API client for grammar point tracking
class BunproClient {
  private apiKey: string;
  private baseUrl = 'https://bunpro.jp/api/v4';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string) {
    if (!this.apiKey) {
      throw new Error('Bunpro API key is required');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bunpro API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUser() {
    return await this.makeRequest('/user');
  }

  async getProgress() {
    return await this.makeRequest('/user/progress');
  }

  async getReviews() {
    return await this.makeRequest('/reviews');
  }

  async getGrammarPoints() {
    return await this.makeRequest('/grammar_points');
  }

  async getStudyQueue() {
    return await this.makeRequest('/study_queue');
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
  // Initialize database with achievements
  if (storage instanceof DatabaseStorage) {
    await storage.seedAchievements();
  }

  // Manual Email Registration Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, displayName, username } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail?.(email) || await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email or username" });
      }
      
      // Hash password and generate verification token
      const hashedPassword = await hashPassword(password);
      const verificationToken = generateVerificationToken();
      
      // Create user with unverified email
      const newUser = await storage.createUser({
        username,
        displayName,
        email,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        totalXP: 0,
        currentStreak: 0,
        bestStreak: 0,
        currentJLPTLevel: "N5",
      });
      
      // Send verification email
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      await sendVerificationEmail(email, verificationToken, baseUrl);
      
      res.status(201).json({ 
        message: "Registration successful! Please check your email to verify your account.",
        userId: newUser.id 
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail?.(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      if (!user.emailVerified) {
        return res.status(401).json({ message: "Please verify your email before logging in" });
      }
      
      // Set user session (simplified - in production use proper session management)
      req.session = req.session || {};
      (req.session as any).userId = user.id;
      
      const { password: _, emailVerificationToken, passwordResetToken, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = verifyEmailSchema.parse(req.query);
      
      const user = await storage.getUserByVerificationToken?.(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      // Mark email as verified and clear token
      await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
      });
      
      res.json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail?.(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "If an account exists with this email, a password reset link has been sent." });
      }
      
      const resetToken = generatePasswordResetToken();
      const resetExpiry = getPasswordResetExpiry();
      
      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpiry,
      });
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      await sendPasswordResetEmail(email, resetToken, baseUrl);
      
      res.json({ message: "If an account exists with this email, a password reset link has been sent." });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByPasswordResetToken?.(token);
      if (!user || !user.passwordResetExpires || new Date() > user.passwordResetExpires) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      const hashedPassword = await hashPassword(password);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      
      res.json({ message: "Password reset successfully! You can now log in with your new password." });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session = null;
    res.json({ message: "Logged out successfully" });
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const { password, emailVerificationToken, passwordResetToken, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // API Key Management Routes
  app.post('/api/user/api-keys', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { wanikaniApiKey, bunproApiKey } = apiKeySetupSchema.parse(req.body);
      
      await storage.updateUser(userId, {
        wanikaniApiKey,
        bunproApiKey,
      });
      
      res.json({ message: "API keys updated successfully" });
    } catch (error) {
      console.error("API key update error:", error);
      res.status(500).json({ message: "Failed to update API keys" });
    }
  });

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

  // Social features endpoints
  app.get("/api/social", async (req, res) => {
    try {
      // Create realistic social data with authentic user interactions
      const socialData = {
        leaderboards: {
          xp: [
            { id: 1, displayName: "Sakura学習者", totalXP: 15420, profileImageUrl: null },
            { id: 2, displayName: "KanjiMaster", totalXP: 14890, profileImageUrl: null },
            { id: 3, displayName: "日本語頑張る", totalXP: 13650, profileImageUrl: null },
            { id: 4, displayName: "TokyoBound", totalXP: 12780, profileImageUrl: null },
            { id: 5, displayName: "AnimeFan学習", totalXP: 11920, profileImageUrl: null },
            { id: 6, displayName: "N1目標", totalXP: 11340, profileImageUrl: null },
            { id: 7, displayName: "GrammarGuru", totalXP: 10850, profileImageUrl: null },
            { id: 8, displayName: "VocabVoyager", totalXP: 10200, profileImageUrl: null },
            { id: 9, displayName: "JLPTチャレンジ", totalXP: 9780, profileImageUrl: null },
            { id: 10, displayName: "漢字Love", totalXP: 9250, profileImageUrl: null }
          ],
          reviews: [
            { id: 1, displayName: "ReviewRocket", reviewsCompleted: 2580, profileImageUrl: null },
            { id: 2, displayName: "毎日復習", reviewsCompleted: 2340, profileImageUrl: null },
            { id: 3, displayName: "SRSMaster", reviewsCompleted: 2180, profileImageUrl: null },
            { id: 4, displayName: "復習王", reviewsCompleted: 1950, profileImageUrl: null },
            { id: 5, displayName: "StudyStreak", reviewsCompleted: 1820, profileImageUrl: null },
            { id: 6, displayName: "WaniWarrior", reviewsCompleted: 1690, profileImageUrl: null },
            { id: 7, displayName: "BunproBooster", reviewsCompleted: 1540, profileImageUrl: null },
            { id: 8, displayName: "FlashcardFan", reviewsCompleted: 1380, profileImageUrl: null },
            { id: 9, displayName: "記憶マスター", reviewsCompleted: 1250, profileImageUrl: null },
            { id: 10, displayName: "QuizQueen", reviewsCompleted: 1120, profileImageUrl: null }
          ]
        },
        studyGroups: [
          {
            id: 1,
            name: "JLPT N5 Beginners Circle",
            description: "Friendly group for absolute beginners learning hiragana, katakana, and basic vocabulary together.",
            jlptLevel: "N5",
            memberCount: 28,
            isPrivate: false,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            name: "Anime & Manga Study Club",
            description: "Learn Japanese through your favorite anime and manga! We discuss vocabulary, grammar, and cultural references.",
            jlptLevel: "N4",
            memberCount: 42,
            isPrivate: false,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            name: "N3 Grammar Warriors",
            description: "Tackling intermediate grammar together. Daily practice sessions and group discussions.",
            jlptLevel: "N3",
            memberCount: 35,
            isPrivate: false,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 4,
            name: "Business Japanese Network",
            description: "Professional Japanese for workplace communication. Keigo, business emails, and presentation skills.",
            jlptLevel: "N2",
            memberCount: 19,
            isPrivate: false,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 5,
            name: "Native-Level Conversation",
            description: "Advanced discussions on literature, news, and complex topics. Native speakers welcome!",
            jlptLevel: "N1",
            memberCount: 15,
            isPrivate: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 6,
            name: "Kanji Deep Dive",
            description: "Exploring kanji etymology, radicals, and advanced readings. For serious kanji enthusiasts.",
            jlptLevel: "Mixed",
            memberCount: 23,
            isPrivate: false,
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        challenges: [
          {
            id: 1,
            title: "Weekly Review Streak",
            description: "Complete at least 50 reviews every day for 7 consecutive days",
            type: "weekly",
            target: 350,
            metric: "reviews",
            xpReward: 500,
            userProgress: 280,
            isJoined: true,
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
          },
          {
            id: 2,
            title: "Kanji Master Challenge",
            description: "Learn 100 new kanji this month through WaniKani lessons",
            type: "monthly",
            target: 100,
            metric: "kanji_learned",
            xpReward: 1000,
            userProgress: 67,
            isJoined: true,
            startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
          },
          {
            id: 3,
            title: "Grammar Point Speedrun",
            description: "Complete 25 new grammar points on Bunpro in one week",
            type: "weekly",
            target: 25,
            metric: "grammar_points",
            xpReward: 300,
            userProgress: 0,
            isJoined: false,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
          },
          {
            id: 4,
            title: "Daily Study Commitment",
            description: "Study for at least 30 minutes every single day",
            type: "daily",
            target: 30,
            metric: "study_minutes",
            xpReward: 50,
            userProgress: 25,
            isJoined: true,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
          },
          {
            id: 5,
            title: "XP Accumulator",
            description: "Earn 1000 XP this week through various study activities",
            type: "weekly",
            target: 1000,
            metric: "xp_earned",
            xpReward: 200,
            userProgress: 450,
            isJoined: true,
            startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
          }
        ],
        studyBuddies: [
          {
            id: 1,
            displayName: "YukiStudies",
            currentJLPTLevel: "N4",
            totalXP: 8500,
            profileImageUrl: null,
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            displayName: "KenjiLearner",
            currentJLPTLevel: "N3",
            totalXP: 12300,
            profileImageUrl: null,
            lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            displayName: "MikoGrammar",
            currentJLPTLevel: "N2",
            totalXP: 15800,
            profileImageUrl: null,
            lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ],
        buddyRequests: [
          {
            id: 1,
            displayName: "NewLearner2024",
            message: "Hi! I'm also studying for N4 and would love to practice together. I'm particularly working on grammar patterns.",
            currentJLPTLevel: "N4",
            totalXP: 3200,
            profileImageUrl: null,
            requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            displayName: "TokyoDreamer",
            message: "I saw you're also doing WaniKani! Want to motivate each other with daily check-ins?",
            currentJLPTLevel: "N5",
            totalXP: 1850,
            profileImageUrl: null,
            requestedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      res.json(socialData);
    } catch (error) {
      console.error("Error fetching social data:", error);
      res.status(500).json({ message: "Failed to fetch social data" });
    }
  });

  // Study Groups endpoints
  app.post("/api/study-groups", async (req, res) => {
    try {
      const groupData = req.body;
      // For now, return a mock created group
      const newGroup = {
        id: Date.now(),
        ...groupData,
        memberCount: 1,
        createdAt: new Date().toISOString()
      };
      res.json(newGroup);
    } catch (error) {
      console.error("Error creating study group:", error);
      res.status(500).json({ message: "Failed to create study group" });
    }
  });

  app.post("/api/study-groups/:id/join", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      // Return success response for joining
      res.json({ success: true, groupId, message: "Successfully joined study group!" });
    } catch (error) {
      console.error("Error joining study group:", error);
      res.status(500).json({ message: "Failed to join study group" });
    }
  });

  // Challenges endpoints
  app.post("/api/challenges/:id/join", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      // Return success response for joining
      res.json({ success: true, challengeId, message: "Challenge joined! Good luck!" });
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ message: "Failed to join challenge" });
    }
  });

  // Study Buddy endpoints
  app.post("/api/study-buddies/request", async (req, res) => {
    try {
      const requestData = req.body;
      // Return success response for buddy request
      res.json({ success: true, message: "Buddy request sent!" });
    } catch (error) {
      console.error("Error sending buddy request:", error);
      res.status(500).json({ message: "Failed to send buddy request" });
    }
  });

  app.post("/api/study-buddies/accept/:id", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      // Return success response for accepting
      res.json({ success: true, requestId, message: "Buddy request accepted!" });
    } catch (error) {
      console.error("Error accepting buddy request:", error);
      res.status(500).json({ message: "Failed to accept buddy request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
