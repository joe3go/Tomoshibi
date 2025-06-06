
import { Pool } from 'pg';
import { 
  User, InsertUser, 
  SentenceCard, InsertSentenceCard,
  SrsItem, InsertSrsItem,
  StudySession, InsertStudySession,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  LearningPath, UserPathProgress
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/tomoshibi',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    this.initializeTables();
  }

  private async initializeTables() {
    const client = await this.pool.connect();
    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password TEXT NOT NULL,
          display_name VARCHAR(255),
          profile_image_url TEXT,
          google_id VARCHAR(255) UNIQUE,
          user_type VARCHAR(50) DEFAULT 'free_user',
          current_belt VARCHAR(50) DEFAULT 'white',
          current_jlpt_level VARCHAR(2) DEFAULT 'N5',
          total_xp INTEGER DEFAULT 0,
          current_streak INTEGER DEFAULT 0,
          best_streak INTEGER DEFAULT 0,
          last_study_date TIMESTAMP,
          study_goal TEXT,
          daily_goal_minutes INTEGER DEFAULT 30,
          daily_goal_kanji INTEGER DEFAULT 5,
          daily_goal_grammar INTEGER DEFAULT 3,
          daily_goal_vocabulary INTEGER DEFAULT 10,
          preferred_study_time VARCHAR(50) DEFAULT 'evening',
          enable_reminders BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // JLPT Content tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS jlpt_vocabulary (
          id SERIAL PRIMARY KEY,
          kanji TEXT NOT NULL,
          kana_reading TEXT NOT NULL,
          english_meaning JSONB NOT NULL,
          jlpt_level VARCHAR(2) NOT NULL,
          part_of_speech VARCHAR(50),
          example_sentence_jp TEXT,
          example_sentence_en TEXT,
          audio_url TEXT,
          frequency INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS jlpt_kanji (
          id SERIAL PRIMARY KEY,
          kanji VARCHAR(1) UNIQUE NOT NULL,
          onyomi TEXT,
          kunyomi TEXT,
          english_meaning JSONB NOT NULL,
          jlpt_level VARCHAR(2) NOT NULL,
          stroke_count INTEGER,
          example_vocab JSONB,
          stroke_order_diagram TEXT,
          radicals TEXT,
          frequency INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS jlpt_grammar (
          id SERIAL PRIMARY KEY,
          grammar_point TEXT NOT NULL,
          structure TEXT,
          meaning_en TEXT NOT NULL,
          jlpt_level VARCHAR(2) NOT NULL,
          example_sentence_jp TEXT,
          example_sentence_en TEXT,
          structure_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // SRS Items table
      await client.query(`
        CREATE TABLE IF NOT EXISTS srs_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content_type VARCHAR(50) NOT NULL, -- 'vocabulary', 'kanji', 'grammar'
          content_id INTEGER NOT NULL, -- references jlpt_vocabulary, jlpt_kanji, or jlpt_grammar
          sentence_card_id INTEGER,
          interval INTEGER DEFAULT 1,
          ease_factor DECIMAL(3,2) DEFAULT 2.50,
          repetitions INTEGER DEFAULT 0,
          next_review TIMESTAMP NOT NULL,
          last_reviewed TIMESTAMP,
          correct_count INTEGER DEFAULT 0,
          incorrect_count INTEGER DEFAULT 0,
          mastery VARCHAR(20) DEFAULT 'learning',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create indexes for performance
      await client.query('CREATE INDEX IF NOT EXISTS idx_srs_user_next_review ON srs_items(user_id, next_review)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_vocab_jlpt_level ON jlpt_vocabulary(jlpt_level)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_kanji_jlpt_level ON jlpt_kanji(jlpt_level)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_grammar_jlpt_level ON jlpt_grammar(jlpt_level)');

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
    } finally {
      client.release();
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      return {
        id: row.id,
        username: row.username,
        email: row.email,
        password: row.password,
        displayName: row.display_name,
        profileImageUrl: row.profile_image_url,
        googleId: row.google_id,
        userType: row.user_type,
        currentBelt: row.current_belt,
        currentJLPTLevel: row.current_jlpt_level,
        totalXP: row.total_xp,
        currentStreak: row.current_streak,
        bestStreak: row.best_streak,
        lastStudyDate: row.last_study_date,
        studyGoal: row.study_goal,
        dailyGoalMinutes: row.daily_goal_minutes,
        dailyGoalKanji: row.daily_goal_kanji,
        dailyGoalGrammar: row.daily_goal_grammar,
        dailyGoalVocabulary: row.daily_goal_vocabulary,
        preferredStudyTime: row.preferred_study_time,
        enableReminders: row.enable_reminders,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } finally {
      client.release();
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) return undefined;
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      if (result.rows.length === 0) return undefined;
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO users (
          username, email, password, display_name, profile_image_url, google_id,
          user_type, current_belt, current_jlpt_level, study_goal,
          daily_goal_minutes, daily_goal_kanji, daily_goal_grammar, daily_goal_vocabulary,
          preferred_study_time, enable_reminders
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `, [
        userData.username, userData.email, userData.password, userData.displayName,
        userData.profileImageUrl, userData.googleId, userData.userType || 'free_user',
        userData.currentBelt || 'white', userData.currentJLPTLevel || 'N5',
        userData.studyGoal, userData.dailyGoalMinutes || 30, userData.dailyGoalKanji || 5,
        userData.dailyGoalGrammar || 3, userData.dailyGoalVocabulary || 10,
        userData.preferredStudyTime || 'evening', userData.enableReminders !== false
      ]);
      
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // JLPT Content operations
  async getJlptVocabulary(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT * FROM jlpt_vocabulary';
      const params: any[] = [];
      
      if (filters?.jlptLevel) {
        query += ' WHERE jlpt_level = $1';
        params.push(filters.jlptLevel);
      }
      
      query += ' ORDER BY frequency ASC';
      
      if (filters?.limit) {
        const limitParam = params.length + 1;
        query += ` LIMIT $${limitParam}`;
        params.push(filters.limit);
        
        if (filters?.offset) {
          const offsetParam = params.length + 1;
          query += ` OFFSET $${offsetParam}`;
          params.push(filters.offset);
        }
      }
      
      const result = await client.query(query, params);
      return result.rows.map(row => ({
        id: row.id,
        kanji: row.kanji,
        kanaReading: row.kana_reading,
        englishMeaning: row.english_meaning,
        jlptLevel: row.jlpt_level,
        partOfSpeech: row.part_of_speech,
        exampleSentenceJp: row.example_sentence_jp,
        exampleSentenceEn: row.example_sentence_en,
        audioUrl: row.audio_url,
        frequency: row.frequency,
        type: 'vocabulary'
      }));
    } finally {
      client.release();
    }
  }

  async getJlptKanji(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT * FROM jlpt_kanji';
      const params: any[] = [];
      
      if (filters?.jlptLevel) {
        query += ' WHERE jlpt_level = $1';
        params.push(filters.jlptLevel);
      }
      
      query += ' ORDER BY frequency ASC';
      
      if (filters?.limit) {
        const limitParam = params.length + 1;
        query += ` LIMIT $${limitParam}`;
        params.push(filters.limit);
        
        if (filters?.offset) {
          const offsetParam = params.length + 1;
          query += ` OFFSET $${offsetParam}`;
          params.push(filters.offset);
        }
      }
      
      const result = await client.query(query, params);
      return result.rows.map(row => ({
        id: row.id,
        kanji: row.kanji,
        onyomi: row.onyomi,
        kunyomi: row.kunyomi,
        englishMeaning: row.english_meaning,
        jlptLevel: row.jlpt_level,
        strokeCount: row.stroke_count,
        exampleVocab: row.example_vocab,
        strokeOrderDiagram: row.stroke_order_diagram,
        radicals: row.radicals,
        frequency: row.frequency,
        type: 'kanji'
      }));
    } finally {
      client.release();
    }
  }

  async getJlptGrammar(filters?: {
    jlptLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT * FROM jlpt_grammar';
      const params: any[] = [];
      
      if (filters?.jlptLevel) {
        query += ' WHERE jlpt_level = $1';
        params.push(filters.jlptLevel);
      }
      
      query += ' ORDER BY id';
      
      if (filters?.limit) {
        const limitParam = params.length + 1;
        query += ` LIMIT $${limitParam}`;
        params.push(filters.limit);
        
        if (filters?.offset) {
          const offsetParam = params.length + 1;
          query += ` OFFSET $${offsetParam}`;
          params.push(filters.offset);
        }
      }
      
      const result = await client.query(query, params);
      return result.rows.map(row => ({
        id: row.id,
        grammarPoint: row.grammar_point,
        structure: row.structure,
        meaningEn: row.meaning_en,
        jlptLevel: row.jlpt_level,
        exampleSentenceJp: row.example_sentence_jp,
        exampleSentenceEn: row.example_sentence_en,
        structureNotes: row.structure_notes,
        type: 'grammar'
      }));
    } finally {
      client.release();
    }
  }

  // SRS operations
  async getUserSrsItems(userId: number): Promise<SrsItem[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM srs_items WHERE user_id = $1', [userId]);
      return result.rows.map(this.mapRowToSrsItem);
    } finally {
      client.release();
    }
  }

  async getReviewQueue(userId: number, limit?: number, categoryFilter?: string): Promise<SrsItem[]> {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT * FROM srs_items 
        WHERE user_id = $1 AND next_review <= NOW()
      `;
      const params: any[] = [userId];
      
      if (categoryFilter) {
        query += ' AND content_type = $2';
        params.push(categoryFilter);
      }
      
      query += ' ORDER BY next_review ASC';
      
      if (limit) {
        const limitParam = params.length + 1;
        query += ` LIMIT $${limitParam}`;
        params.push(limit);
      }
      
      const result = await client.query(query, params);
      return result.rows.map(this.mapRowToSrsItem);
    } finally {
      client.release();
    }
  }

  // Helper methods
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      displayName: row.display_name,
      profileImageUrl: row.profile_image_url,
      googleId: row.google_id,
      userType: row.user_type,
      currentBelt: row.current_belt,
      currentJLPTLevel: row.current_jlpt_level,
      totalXP: row.total_xp,
      currentStreak: row.current_streak,
      bestStreak: row.best_streak,
      lastStudyDate: row.last_study_date,
      studyGoal: row.study_goal,
      dailyGoalMinutes: row.daily_goal_minutes,
      dailyGoalKanji: row.daily_goal_kanji,
      dailyGoalGrammar: row.daily_goal_grammar,
      dailyGoalVocabulary: row.daily_goal_vocabulary,
      preferredStudyTime: row.preferred_study_time,
      enableReminders: row.enable_reminders,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToSrsItem(row: any): SrsItem {
    return {
      id: row.id,
      userId: row.user_id,
      contentType: row.content_type,
      contentId: row.content_id,
      sentenceCardId: row.sentence_card_id,
      interval: row.interval,
      easeFactor: row.ease_factor,
      repetitions: row.repetitions,
      nextReview: row.next_review,
      lastReviewed: row.last_reviewed,
      correctCount: row.correct_count,
      incorrectCount: row.incorrect_count,
      mastery: row.mastery,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Placeholder implementations for interface compliance
  async getAllUsers(): Promise<User[]> { return []; }
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> { return undefined; }
  async getSentenceCards(): Promise<SentenceCard[]> { return []; }
  async getSentenceCard(id: number): Promise<SentenceCard | undefined> { return undefined; }
  async createSentenceCard(card: InsertSentenceCard): Promise<SentenceCard> { throw new Error('Not implemented'); }
  async updateSentenceCard(id: number, updates: Partial<SentenceCard>): Promise<SentenceCard | undefined> { return undefined; }
  async deleteSentenceCard(id: number): Promise<boolean> { return false; }
  async getSrsItem(id: number): Promise<SrsItem | undefined> { return undefined; }
  async createSrsItem(item: InsertSrsItem): Promise<SrsItem> { throw new Error('Not implemented'); }
  async updateSrsItem(id: number, updates: Partial<SrsItem>): Promise<SrsItem | undefined> { return undefined; }
  async createStudySession(session: InsertStudySession): Promise<StudySession> { throw new Error('Not implemented'); }
  async getUserStudySessions(userId: number, limit?: number): Promise<StudySession[]> { return []; }
  async updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined> { return undefined; }
  async getAllAchievements(): Promise<Achievement[]> { return []; }
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> { throw new Error('Not implemented'); }
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> { return []; }
  async unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> { throw new Error('Not implemented'); }
  async hasUserAchievement(userId: number, achievementId: number): Promise<boolean> { return false; }
  async getAllLearningPaths(): Promise<LearningPath[]> { return []; }
  async getUserPathProgress(userId: number): Promise<UserPathProgress[]> { return []; }
  async getVocabulary(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]> {
    return this.getJlptVocabulary(filters);
  }
  async getKanji(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]> {
    return this.getJlptKanji(filters);
  }
  async getGrammar(filters?: { limit?: number; jlptLevel?: string }): Promise<any[]> {
    return this.getJlptGrammar(filters);
  }
  async searchJlptContent(query: string, type?: 'vocabulary' | 'kanji' | 'grammar'): Promise<any[]> { return []; }
}
