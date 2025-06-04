import { useState, createContext, useContext, useEffect } from "react";

export type LanguageMode = "en" | "jp" | "jp-furigana";

interface LanguageContextType {
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguageMode() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageMode must be used within a LanguageProvider');
  }
  return context;
}

export function useLanguageProvider() {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('language-mode');
    return (saved as LanguageMode) || "en";
  });

  const setLanguageMode = (mode: LanguageMode) => {
    console.log('Setting language to:', mode);
    setLanguageModeState(mode);
    localStorage.setItem('language-mode', mode);
  };

  return {
    languageMode,
    setLanguageMode,
    LanguageProvider: LanguageContext.Provider,
  };
}

export const LanguageContent = {
  en: {
    dashboard: "Dashboard",
    achievements: "Achievements", 
    settings: "Settings",
    progress: "Progress Tracking",
    wanikaniLevel: "WaniKani Level",
    bunproGrammar: "Bunpro Grammar Points",
    wanikaniAccuracy: "WaniKani Accuracy",
    bunproAccuracy: "Bunpro Accuracy",
    sync: "Sync Data",
    syncing: "Syncing...",
    lastSynced: "Last synced",
    setupApiKeys: "Setup API Keys",
    wanikaniReviews: "WaniKani Reviews",
    bunproReviews: "Bunpro Reviews",
    totalXP: "Total XP",
    currentStreak: "Current Streak",
    bestStreak: "Best Streak",
    jlptLevel: "JLPT Level",
    recentActivity: "Recent Activity",
    unlockedAchievements: "Unlocked Achievements",
    viewAll: "View All"
  },
  jp: {
    dashboard: "ダッシュボード",
    achievements: "実績",
    settings: "設定",
    progress: "進歩追跡",
    wanikaniLevel: "WaniKaniレベル",
    bunproGrammar: "Bunpro文法ポイント",
    wanikaniAccuracy: "WaniKani精度",
    bunproAccuracy: "Bunpro精度",
    sync: "データ同期",
    syncing: "同期中...",
    lastSynced: "最終同期",
    setupApiKeys: "APIキー設定",
    wanikaniReviews: "WaniKaniレビュー",
    bunproReviews: "Bunproレビュー",
    totalXP: "総経験値",
    currentStreak: "現在の連続記録",
    bestStreak: "最高連続記録",
    jlptLevel: "JLPTレベル",
    recentActivity: "最近の活動",
    unlockedAchievements: "解放された実績",
    viewAll: "すべて表示"
  },
  "jp-furigana": {
    dashboard: "<ruby>ダッシュボード<rt>だっしゅぼーど</rt></ruby>",
    achievements: "<ruby>実績<rt>じっせき</rt></ruby>",
    settings: "<ruby>設定<rt>せってい</rt></ruby>",
    progress: "<ruby>進歩<rt>しんぽ</rt></ruby><ruby>追跡<rt>ついせき</rt></ruby>",
    wanikaniLevel: "WaniKani<ruby>レベル<rt>れべる</rt></ruby>",
    bunproGrammar: "Bunpro<ruby>文法<rt>ぶんぽう</rt></ruby><ruby>ポイント<rt>ぽいんと</rt></ruby>",
    wanikaniAccuracy: "WaniKani<ruby>精度<rt>せいど</rt></ruby>",
    bunproAccuracy: "Bunpro<ruby>精度<rt>せいど</rt></ruby>",
    sync: "<ruby>データ<rt>でーた</rt></ruby><ruby>同期<rt>どうき</rt></ruby>",
    syncing: "<ruby>同期中<rt>どうきちゅう</rt></ruby>...",
    lastSynced: "<ruby>最終<rt>さいしゅう</rt></ruby><ruby>同期<rt>どうき</rt></ruby>",
    setupApiKeys: "API<ruby>キー<rt>きー</rt></ruby><ruby>設定<rt>せってい</rt></ruby>",
    wanikaniReviews: "WaniKani<ruby>レビュー<rt>れびゅー</rt></ruby>",
    bunproReviews: "Bunpro<ruby>レビュー<rt>れびゅー</rt></ruby>",
    totalXP: "<ruby>総<rt>そう</rt></ruby><ruby>経験値<rt>けいけんち</rt></ruby>",
    currentStreak: "<ruby>現在<rt>げんざい</rt></ruby>の<ruby>連続<rt>れんぞく</rt></ruby><ruby>記録<rt>きろく</rt></ruby>",
    bestStreak: "<ruby>最高<rt>さいこう</rt></ruby><ruby>連続<rt>れんぞく</rt></ruby><ruby>記録<rt>きろく</rt></ruby>",
    jlptLevel: "JLPT<ruby>レベル<rt>れべる</rt></ruby>",
    recentActivity: "<ruby>最近<rt>さいきん</rt></ruby>の<ruby>活動<rt>かつどう</rt></ruby>",
    unlockedAchievements: "<ruby>解放<rt>かいほう</rt></ruby>された<ruby>実績<rt>じっせき</rt></ruby>",
    viewAll: "すべて<ruby>表示<rt>ひょうじ</rt></ruby>"
  }
};

export function useLanguageContent(mode: LanguageMode) {
  return LanguageContent[mode];
}