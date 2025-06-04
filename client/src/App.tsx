import { Switch, Route } from "wouter";
import { useState, createContext, useContext } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Social from "@/pages/social";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Language types and context
export type LanguageMode = "en" | "jp" | "jp-furigana";

interface LanguageContextType {
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  languageMode: "en",
  setLanguageMode: () => {}
});

export const useLanguageMode = () => useContext(LanguageContext);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/social" component={Social} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Language content for all components
export const LanguageContent = {
  en: {
    dashboard: "Dashboard",
    social: "Social Hub",
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
    social: "ソーシャルハブ",
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
    dashboard: "ダッシュボード",
    social: "ソーシャルハブ",
    achievements: "実績（じっせき）",
    settings: "設定（せってい）",
    progress: "進歩（しんぽ）追跡（ついせき）",
    wanikaniLevel: "WaniKaniレベル",
    bunproGrammar: "Bunpro文法（ぶんぽう）ポイント",
    wanikaniAccuracy: "WaniKani精度（せいど）",
    bunproAccuracy: "Bunpro精度（せいど）",
    sync: "データ同期（どうき）",
    syncing: "同期中（どうきちゅう）...",
    lastSynced: "最終（さいしゅう）同期（どうき）",
    setupApiKeys: "APIキー設定（せってい）",
    wanikaniReviews: "WaniKaniレビュー",
    bunproReviews: "Bunproレビュー",
    totalXP: "総（そう）経験値（けいけんち）",
    currentStreak: "現在（げんざい）の連続（れんぞく）記録（きろく）",
    bestStreak: "最高（さいこう）連続（れんぞく）記録（きろく）",
    jlptLevel: "JLPTレベル",
    recentActivity: "最近（さいきん）の活動（かつどう）",
    unlockedAchievements: "解放（かいほう）された実績（じっせき）",
    viewAll: "すべて表示（ひょうじ）"
  }
};

export function useLanguageContent(mode: LanguageMode) {
  return LanguageContent[mode];
}

// Simple Language Toggle Component
function SimpleLanguageToggle() {
  const { languageMode, setLanguageMode } = useLanguageMode();
  
  const modes = [
    { value: "en", label: "English" },
    { value: "jp", label: "日本語" },
    { value: "jp-furigana", label: "ふりがな" }
  ] as const;
  
  return (
    <select 
      value={languageMode} 
      onChange={(e) => setLanguageMode(e.target.value as LanguageMode)}
      className="px-3 py-1 rounded border bg-background text-foreground"
    >
      {modes.map((mode) => (
        <option key={mode.value} value={mode.value}>
          {mode.label}
        </option>
      ))}
    </select>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 sm:h-14 items-center justify-between px-2 sm:px-4 ml-0 lg:ml-64">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-sm sm:text-lg font-bold japanese-heading truncate">
            <span className="hidden sm:inline">日本語学習 - Japanese Learning Tracker</span>
            <span className="sm:hidden">日本語学習</span>
          </h1>
        </div>
        <div className="flex-shrink-0">
          <SimpleLanguageToggle />
        </div>
      </div>
    </header>
  );
}

function App() {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem('language-mode');
    return (saved as LanguageMode) || "en";
  });

  const setLanguageMode = (mode: LanguageMode) => {
    setLanguageModeState(mode);
    localStorage.setItem('language-mode', mode);
  };

  const contextValue = {
    languageMode,
    setLanguageMode
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={contextValue}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <AppHeader />
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
