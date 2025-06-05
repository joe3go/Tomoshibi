export interface VocabWord {
  id: string;
  kanji: string;
  furigana: string;
  meaning: string;
  tags: string[];
  srsLevel: number; // 0-5
  nextReviewAt: number; // timestamp
  createdAt: number;
  lastReviewedAt?: number;
  correctCount: number;
  incorrectCount: number;
  isDemo?: boolean;
}

export interface ReviewSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  wordsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface UserStats {
  totalWords: number;
  wordsDueToday: number;
  successRate: number;
  streakDays: number;
  lastStudiedAt: number;
  totalReviews: number;
}

export type SRSLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const SRS_INTERVALS: Record<SRSLevel, number> = {
  0: 0, // New word
  1: 4 * 60 * 60 * 1000, // 4 hours
  2: 8 * 60 * 60 * 1000, // 8 hours
  3: 24 * 60 * 60 * 1000, // 1 day
  4: 3 * 24 * 60 * 60 * 1000, // 3 days
  5: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const SRS_LEVEL_COLORS: Record<SRSLevel, string> = {
  0: "bg-gray-500/20 text-gray-300", // New
  1: "bg-gray-400/20 text-gray-200", // Learning
  2: "bg-blue-500/20 text-blue-300", // Apprentice
  3: "bg-green-500/20 text-green-300", // Guru
  4: "bg-yellow-500/20 text-yellow-300", // Master
  5: "bg-amber-500/20 text-amber-300", // Enlightened
};

export const SRS_LEVEL_NAMES: Record<SRSLevel, string> = {
  0: "New",
  1: "Learning",
  2: "Apprentice", 
  3: "Guru",
  4: "Master",
  5: "Enlightened",
};