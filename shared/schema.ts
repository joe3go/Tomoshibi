import { pgTable, serial, text, varchar, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  googleId: varchar("google_id", { length: 100 }).unique(),
  
  // Learning progress
  currentBelt: varchar("current_belt", { length: 20 }).notNull().default("white"),
  currentJLPTLevel: varchar("current_jlpt_level", { length: 5 }).notNull().default("N5"),
  totalXP: integer("total_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastStudyDate: timestamp("last_study_date"),
  
  // Preferences
  studyGoal: varchar("study_goal", { length: 100 }),
  dailyGoalMinutes: integer("daily_goal_minutes").default(20),
  dailyGoalKanji: integer("daily_goal_kanji").default(5),
  dailyGoalGrammar: integer("daily_goal_grammar").default(3),
  dailyGoalVocabulary: integer("daily_goal_vocabulary").default(10),
  preferredStudyTime: varchar("preferred_study_time", { length: 10 }),
  enableReminders: boolean("enable_reminders").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// JLPT Vocabulary table
export const jlptVocabulary = pgTable("jlpt_vocabulary", {
  id: serial("id").primaryKey(),
  kanji: text("kanji").notNull(),
  kanaReading: text("kana_reading").notNull(),
  englishMeaning: jsonb("english_meaning").notNull(), // Array of meanings
  jlptLevel: varchar("jlpt_level", { length: 2 }).notNull(), // N1, N2, N3, N4, N5
  partOfSpeech: varchar("part_of_speech", { length: 50 }),
  exampleSentenceJp: text("example_sentence_jp"),
  exampleSentenceEn: text("example_sentence_en"),
  audioUrl: varchar("audio_url", { length: 500 }),
  frequency: integer("frequency"), // Usage frequency ranking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// JLPT Kanji table
export const jlptKanji = pgTable("jlpt_kanji", {
  id: serial("id").primaryKey(),
  kanji: varchar("kanji", { length: 1 }).notNull().unique(),
  onyomi: text("onyomi"), // On'yomi readings
  kunyomi: text("kunyomi"), // Kun'yomi readings
  englishMeaning: jsonb("english_meaning").notNull(), // Array of meanings
  jlptLevel: varchar("jlpt_level", { length: 2 }).notNull(),
  strokeCount: integer("stroke_count"),
  exampleVocab: jsonb("example_vocab"), // Array of example vocabulary
  strokeOrderDiagram: varchar("stroke_order_diagram", { length: 500 }),
  radicals: text("radicals"),
  frequency: integer("frequency"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// JLPT Grammar table
export const jlptGrammar = pgTable("jlpt_grammar", {
  id: serial("id").primaryKey(),
  grammarPoint: text("grammar_point").notNull(),
  meaningEn: text("meaning_en").notNull(),
  structureNotes: text("structure_notes"),
  jlptLevel: varchar("jlpt_level", { length: 2 }).notNull(),
  exampleSentenceJp: text("example_sentence_jp"),
  exampleSentenceEn: text("example_sentence_en"),
  formationPattern: text("formation_pattern"),
  usageNotes: text("usage_notes"),
  relatedGrammar: jsonb("related_grammar"), // Array of related grammar points
  difficulty: integer("difficulty"), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Sentence cards - enhanced with JLPT relationships
export const sentenceCards = pgTable("sentence_cards", {
  id: serial("id").primaryKey(),
  japanese: text("japanese").notNull(),
  reading: text("reading"), // furigana/romaji
  english: text("english").notNull(),
  audioUrl: varchar("audio_url", { length: 500 }),
  
  // Content metadata
  jlptLevel: varchar("jlpt_level", { length: 5 }).notNull(),
  difficulty: integer("difficulty").notNull(), // 1-10 scale
  register: varchar("register", { length: 20 }).notNull(), // casual, polite, anime, etc.
  theme: varchar("theme", { length: 50 }), // "anime", "daily_life", "business", etc.
  source: varchar("source", { length: 100 }), // "My Hero Academia", "textbook", etc.
  
  // JLPT content relationships
  vocabularyIds: jsonb("vocabulary_ids"), // Array of vocabulary IDs
  kanjiIds: jsonb("kanji_ids"), // Array of kanji IDs
  grammarIds: jsonb("grammar_ids"), // Array of grammar IDs
  
  // Grammar breakdown
  grammarPoints: jsonb("grammar_points"), // array of grammar concepts
  vocabulary: jsonb("vocabulary"), // key vocabulary in the sentence
  culturalNotes: text("cultural_notes"),
  
  createdAt: timestamp("created_at").defaultNow()
});

// SRS items - user's learning progress for each card
export const srsItems = pgTable("srs_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sentenceCardId: integer("sentence_card_id").notNull().references(() => sentenceCards.id),
  
  // FSRS5 algorithm data
  interval: integer("interval").notNull().default(1), // days until next review
  difficulty: real("difficulty").notNull().default(5.0), // FSRS5 difficulty (1-10)
  stability: real("stability").notNull().default(1.0), // FSRS5 stability
  repetitions: integer("repetitions").notNull().default(0),
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review").notNull(),
  
  // Performance tracking
  correctCount: integer("correct_count").notNull().default(0),
  incorrectCount: integer("incorrect_count").notNull().default(0),
  mastery: varchar("mastery", { length: 20 }).notNull().default("new"), // new, learning, review, mastered
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Study sessions
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionType: varchar("session_type", { length: 20 }).notNull(), // review, new_cards, mixed
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, paused, completed, cancelled
  
  // Session metrics
  cardsReviewed: integer("cards_reviewed").notNull().default(0),
  cardsCorrect: integer("cards_correct").notNull().default(0),
  timeSpentMinutes: integer("time_spent_minutes").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
  
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});

// Achievements/badges
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // streak, mastery, milestone, etc.
  
  // Requirements
  threshold: integer("threshold"), // e.g., 30 for "30-day streak"
  beltRequired: varchar("belt_required", { length: 20 }),
  
  xpReward: integer("xp_reward").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow()
});

// Learning paths/decks
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // jlpt, anime, casual, etc.
  difficulty: integer("difficulty").notNull(),
  estimatedHours: integer("estimated_hours"),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Path progress
export const userPathProgress = pgTable("user_path_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  cardsCompleted: integer("cards_completed").notNull().default(0),
  totalCards: integer("total_cards").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Daily progress tracking table
export const dailyProgress = pgTable("daily_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  kanjiLearned: integer("kanji_learned").notNull().default(0),
  grammarLearned: integer("grammar_learned").notNull().default(0),
  vocabularyLearned: integer("vocabulary_learned").notNull().default(0),
  kanjiReviewed: integer("kanji_reviewed").notNull().default(0),
  grammarReviewed: integer("grammar_reviewed").notNull().default(0),
  vocabularyReviewed: integer("vocabulary_reviewed").notNull().default(0),
  timeSpentMinutes: integer("time_spent_minutes").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  srsItems: many(srsItems),
  studySessions: many(studySessions),
  userAchievements: many(userAchievements),
  userPathProgress: many(userPathProgress)
}));

export const sentenceCardsRelations = relations(sentenceCards, ({ many }) => ({
  srsItems: many(srsItems)
}));

export const srsItemsRelations = relations(srsItems, ({ one }) => ({
  user: one(users, {
    fields: [srsItems.userId],
    references: [users.id]
  }),
  sentenceCard: one(sentenceCards, {
    fields: [srsItems.sentenceCardId],
    references: [sentenceCards.id]
  })
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertSentenceCardSchema = createInsertSchema(sentenceCards).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSrsItemSchema = createInsertSchema(srsItems).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ 
  id: true, 
  startedAt: true 
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ 
  id: true, 
  createdAt: true 
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ 
  id: true, 
  unlockedAt: true 
});

// JLPT insert schemas
export const insertJlptVocabularySchema = createInsertSchema(jlptVocabulary).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertJlptKanjiSchema = createInsertSchema(jlptKanji).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertJlptGrammarSchema = createInsertSchema(jlptGrammar).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SentenceCard = typeof sentenceCards.$inferSelect;
export type InsertSentenceCard = z.infer<typeof insertSentenceCardSchema>;

export type SrsItem = typeof srsItems.$inferSelect;
export type InsertSrsItem = z.infer<typeof insertSrsItemSchema>;

// JLPT Types
export type JlptVocabulary = typeof jlptVocabulary.$inferSelect;
export type InsertJlptVocabulary = z.infer<typeof insertJlptVocabularySchema>;

export type JlptKanji = typeof jlptKanji.$inferSelect;
export type InsertJlptKanji = z.infer<typeof insertJlptKanjiSchema>;

export type JlptGrammar = typeof jlptGrammar.$inferSelect;
export type InsertJlptGrammar = z.infer<typeof insertJlptGrammarSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type LearningPath = typeof learningPaths.$inferSelect;
export type UserPathProgress = typeof userPathProgress.$inferSelect;