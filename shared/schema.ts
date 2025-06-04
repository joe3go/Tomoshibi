import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  displayName: text("display_name").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  googleId: text("google_id").unique(),
  totalXP: integer("total_xp").default(0),
  currentStreak: integer("current_streak").default(0),
  bestStreak: integer("best_streak").default(0),
  currentJLPTLevel: text("current_jlpt_level").default("N5"),
  wanikaniApiKey: text("wanikani_api_key"),
  bunproApiKey: text("bunpro_api_key"),
  lastStudyDate: timestamp("last_study_date"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull(),
  category: text("category").notNull(), // 'streak', 'kanji', 'vocabulary', 'grammar', 'jlpt'
  threshold: integer("threshold"), // Required value to unlock
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  wanikaniReviews: integer("wanikani_reviews").default(0),
  bunproReviews: integer("bunpro_reviews").default(0),
  xpEarned: integer("xp_earned").default(0),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wanikaniData: json("wanikani_data"), // Stores WaniKani API response
  bunproData: json("bunpro_data"), // Stores Bunpro API response
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  date: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastSyncedAt: true,
});

export const apiKeySetupSchema = z.object({
  wanikaniApiKey: z.string().optional(),
  bunproApiKey: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
// Study Groups
export const studyGroups = pgTable("study_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  jlptLevel: text("jlpt_level"),
  isPrivate: boolean("is_private").default(false),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => studyGroups.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").default("member"), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Study Buddy System
export const studyBuddyRequests = pgTable("study_buddy_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  targetId: integer("target_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
});

export const studyBuddyPairs = pgTable("study_buddy_pairs", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenges
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // daily, weekly, monthly, custom
  target: integer("target").notNull(), // target number (XP, reviews, etc.)
  metric: text("metric").notNull(), // xp, reviews, study_time, etc.
  xpReward: integer("xp_reward").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Forum System
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => forumCategories.id),
  title: text("title").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyBy: integer("last_reply_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopics.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaderboards
export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  period: text("period").notNull(), // weekly, monthly, all_time
  metric: text("metric").notNull(), // total_xp, weekly_xp, reviews_completed
  value: integer("value").notNull(),
  rank: integer("rank"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertStudyGroupSchema = createInsertSchema(studyGroups).pick({
  name: true,
  description: true,
  jlptLevel: true,
  isPrivate: true,
  createdBy: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  role: true,
});

export const insertStudyBuddyRequestSchema = createInsertSchema(studyBuddyRequests).pick({
  requesterId: true,
  targetId: true,
  message: true,
  status: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  type: true,
  target: true,
  metric: true,
  xpReward: true,
  startDate: true,
  endDate: true,
  isActive: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).pick({
  userId: true,
  challengeId: true,
  progress: true,
  isCompleted: true,
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).pick({
  categoryId: true,
  title: true,
  authorId: true,
  isPinned: true,
  isLocked: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  topicId: true,
  authorId: true,
  content: true,
});

// Types
export type StudyGroup = typeof studyGroups.$inferSelect;
export type InsertStudyGroup = z.infer<typeof insertStudyGroupSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type StudyBuddyRequest = typeof studyBuddyRequests.$inferSelect;
export type InsertStudyBuddyRequest = z.infer<typeof insertStudyBuddyRequestSchema>;
export type StudyBuddyPair = typeof studyBuddyPairs.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type ApiKeySetup = z.infer<typeof apiKeySetupSchema>;

// SRS Learning System Tables

// Grammar Points - JLPT N5 grammar structures
export const grammarPoints = pgTable("grammar_points", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(), // e.g., "です/である"
  titleJapanese: varchar("title_japanese", { length: 100 }).notNull(), // e.g., "です/である"
  jlptLevel: varchar("jlpt_level", { length: 5 }).notNull(), // N5, N4, N3, N2, N1
  structure: text("structure").notNull(), // Grammar pattern explanation
  meaning: text("meaning").notNull(), // English explanation
  examples: json("examples").notNull(), // Array of example sentences with translations
  notes: text("notes"), // Additional usage notes
  tags: json("tags"), // Array of tags for categorization
  difficulty: integer("difficulty").notNull().default(1), // 1-5 difficulty rating
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Kanji - Individual kanji characters
export const kanji = pgTable("kanji", {
  id: serial("id").primaryKey(),
  character: varchar("character", { length: 1 }).notNull().unique(), // The kanji character
  jlptLevel: varchar("jlpt_level", { length: 5 }).notNull(),
  meaning: text("meaning").notNull(), // English meanings
  onyomi: jsonb("onyomi"), // On'yomi readings array
  kunyomi: jsonb("kunyomi"), // Kun'yomi readings array
  radicals: jsonb("radicals"), // Component radicals
  strokeCount: integer("stroke_count").notNull(),
  frequency: integer("frequency"), // Usage frequency ranking
  examples: jsonb("examples").notNull(), // Example words using this kanji
  mnemonics: text("mnemonics"), // Memory aids
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Vocabulary - Words and phrases
export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  word: varchar("word", { length: 50 }).notNull(), // Japanese word
  reading: varchar("reading", { length: 100 }).notNull(), // Hiragana/katakana reading
  meaning: text("meaning").notNull(), // English meaning
  partOfSpeech: varchar("part_of_speech", { length: 50 }).notNull(), // noun, verb, etc.
  jlptLevel: varchar("jlpt_level", { length: 5 }).notNull(),
  kanjiIds: jsonb("kanji_ids"), // Related kanji IDs
  examples: jsonb("examples").notNull(), // Example sentences
  audio: varchar("audio", { length: 255 }), // Audio file path/URL
  difficulty: integer("difficulty").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// SRS Items - Individual items in the spaced repetition system
export const srsItems = pgTable("srs_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemType: varchar("item_type", { length: 20 }).notNull(), // 'grammar', 'kanji', 'vocabulary'
  itemId: integer("item_id").notNull(), // References grammar_points.id, kanji.id, or vocabulary.id
  srsLevel: integer("srs_level").notNull().default(0), // 0-8 SRS stages
  nextReviewAt: timestamp("next_review_at").notNull(),
  lastReviewedAt: timestamp("last_reviewed_at"),
  correctStreak: integer("correct_streak").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  correctReviews: integer("correct_reviews").notNull().default(0),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Review Sessions - Track individual review attempts
export const reviewSessions = pgTable("review_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  srsItemId: integer("srs_item_id").notNull().references(() => srsItems.id),
  isCorrect: boolean("is_correct").notNull(),
  responseTime: integer("response_time"), // Time in milliseconds
  reviewType: varchar("review_type", { length: 20 }).notNull(), // 'meaning', 'reading', 'audio'
  userAnswer: text("user_answer"),
  correctAnswer: text("correct_answer"),
  reviewedAt: timestamp("reviewed_at").defaultNow()
});

// Study Streaks - Track daily study habits
export const studyStreaks = pgTable("study_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  reviewsCompleted: integer("reviews_completed").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  timeSpent: integer("time_spent").notNull().default(0), // Minutes
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }), // Percentage
  createdAt: timestamp("created_at").defaultNow()
});

// Learning Paths - Structured curriculum progression
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  jlptLevel: varchar("jlpt_level", { length: 5 }).notNull(),
  order: integer("order").notNull(),
  prerequisites: jsonb("prerequisites"), // Array of required learning path IDs
  content: jsonb("content").notNull(), // Structured lessons and milestones
  estimatedHours: integer("estimated_hours"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User Learning Path Progress
export const userLearningProgress = pgTable("user_learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  learningPathId: integer("learning_path_id").notNull().references(() => learningPaths.id),
  currentLesson: integer("current_lesson").notNull().default(0),
  completedLessons: jsonb("completed_lessons").notNull().default([]),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations for better querying
export const grammarPointsRelations = relations(grammarPoints, ({ many }) => ({
  srsItems: many(srsItems),
}));

export const kanjiRelations = relations(kanji, ({ many }) => ({
  srsItems: many(srsItems),
  vocabularyItems: many(vocabulary),
}));

export const vocabularyRelations = relations(vocabulary, ({ many, one }) => ({
  srsItems: many(srsItems),
}));

export const srsItemsRelations = relations(srsItems, ({ one, many }) => ({
  user: one(users, {
    fields: [srsItems.userId],
    references: [users.id],
  }),
  reviewSessions: many(reviewSessions),
  grammarPoint: one(grammarPoints, {
    fields: [srsItems.itemId],
    references: [grammarPoints.id],
  }),
  kanji: one(kanji, {
    fields: [srsItems.itemId],
    references: [kanji.id],
  }),
  vocabulary: one(vocabulary, {
    fields: [srsItems.itemId],
    references: [vocabulary.id],
  }),
}));

export const reviewSessionsRelations = relations(reviewSessions, ({ one }) => ({
  user: one(users, {
    fields: [reviewSessions.userId],
    references: [users.id],
  }),
  srsItem: one(srsItems, {
    fields: [reviewSessions.srsItemId],
    references: [srsItems.id],
  }),
}));

export const studyStreaksRelations = relations(studyStreaks, ({ one }) => ({
  user: one(users, {
    fields: [studyStreaks.userId],
    references: [users.id],
  }),
}));

export const userLearningProgressRelations = relations(userLearningProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLearningProgress.userId],
    references: [users.id],
  }),
  learningPath: one(learningPaths, {
    fields: [userLearningProgress.learningPathId],
    references: [learningPaths.id],
  }),
}));

// Type exports for the new tables
export type GrammarPoint = typeof grammarPoints.$inferSelect;
export type InsertGrammarPoint = typeof grammarPoints.$inferInsert;
export type Kanji = typeof kanji.$inferSelect;
export type InsertKanji = typeof kanji.$inferInsert;
export type Vocabulary = typeof vocabulary.$inferSelect;
export type InsertVocabulary = typeof vocabulary.$inferInsert;
export type SrsItem = typeof srsItems.$inferSelect;
export type InsertSrsItem = typeof srsItems.$inferInsert;
export type ReviewSession = typeof reviewSessions.$inferSelect;
export type InsertReviewSession = typeof reviewSessions.$inferInsert;
export type StudyStreak = typeof studyStreaks.$inferSelect;
export type InsertStudyStreak = typeof studyStreaks.$inferInsert;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = typeof userLearningProgress.$inferInsert;

// SRS Algorithm Constants
export const SRS_INTERVALS = [
  4 * 60 * 60 * 1000,      // 4 hours (apprentice 1)
  8 * 60 * 60 * 1000,      // 8 hours (apprentice 2)
  24 * 60 * 60 * 1000,     // 1 day (apprentice 3)
  3 * 24 * 60 * 60 * 1000, // 3 days (apprentice 4)
  7 * 24 * 60 * 60 * 1000, // 1 week (guru 1)
  14 * 24 * 60 * 60 * 1000, // 2 weeks (guru 2)
  30 * 24 * 60 * 60 * 1000, // 1 month (master)
  120 * 24 * 60 * 60 * 1000, // 4 months (enlightened)
]; // burned items don't come back for review

export const SRS_LEVEL_NAMES = [
  'lesson',
  'apprentice_1',
  'apprentice_2', 
  'apprentice_3',
  'apprentice_4',
  'guru_1',
  'guru_2',
  'master',
  'enlightened',
  'burned'
];

// Validation schemas for SRS operations
export const submitReviewSchema = z.object({
  srsItemId: z.number(),
  isCorrect: z.boolean(),
  responseTime: z.number().optional(),
  reviewType: z.enum(['meaning', 'reading', 'audio']),
  userAnswer: z.string(),
});

export const unlockItemsSchema = z.object({
  grammarPointIds: z.array(z.number()).optional(),
  kanjiIds: z.array(z.number()).optional(),
  vocabularyIds: z.array(z.number()).optional(),
});

export type SubmitReview = z.infer<typeof submitReviewSchema>;
export type UnlockItems = z.infer<typeof unlockItemsSchema>;
