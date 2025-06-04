import { Switch, Route } from "wouter";
import { useState, createContext, useContext, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Social from "@/pages/social";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth";
import Landing from "@/pages/landing";
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
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in preview mode (add ?preview=true to URL)
    const urlParams = new URLSearchParams(window.location.search);
    const isPreviewMode = urlParams.get('preview') === 'true';
    
    if (isPreviewMode) {
      // Auto-login with test user in preview mode
      const testUser = {
        id: 1,
        username: "preview_user",
        email: "preview@example.com",
        totalXP: 1250,
        currentStreak: 7,
        jlptLevel: "N4",
        wanikaniApiKey: "preview_wk_key",
        bunproApiKey: "preview_bp_key",
        createdAt: new Date().toISOString()
      };
      setUser(testUser);
      localStorage.setItem("user", JSON.stringify(testUser));
      setIsLoading(false);
      return;
    }

    // Check for stored user data
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sakura via-shiro to-kawa flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-momiji mx-auto mb-4"></div>
          <p className="text-yami/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {user ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/social" component={Social} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/settings" component={Settings} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      )}
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
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="flex h-12 items-center justify-between px-3 lg:px-4 lg:ml-64">
        <div className="flex items-center gap-2 ml-12 lg:ml-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">日</span>
          </div>
          <h1 className="hidden sm:block text-base font-semibold text-gray-900">
            Journey
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <SimpleLanguageToggle />
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full">
            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
            <span className="text-xs font-medium text-emerald-700">Live</span>
          </div>
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
