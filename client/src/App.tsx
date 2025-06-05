import { Switch, Route, Redirect } from "wouter";
import { useState, createContext, useContext, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar, MobileNav } from "@/components/navigation";
import InstallPrompt from "@/components/install-prompt";
import ThemeToggle from "@/components/theme-toggle";
import FloatingThemeToggle from "@/components/floating-theme-toggle";
import { ThemeProvider } from "@/hooks/use-theme";
import Dashboard from "@/pages/dashboard-compact";
import Social from "@/pages/social";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import StudyPage from "@/pages/study";
import StudyModePage from "@/pages/study-mode";
import AuthPage from "@/pages/auth";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

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

  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: false
  });

  useEffect(() => {
    if (!isUserLoading) {
      setUser(userData || null);
      setIsLoading(false);
    }
  }, [userData, isUserLoading]);

  // Refetch user data when window gains focus (after login in another tab)
  useEffect(() => {
    const handleFocus = () => {
      refetchUser();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchUser]);

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

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar user={{
              displayName: user.displayName || "User",
              totalXP: user.totalXP || 0,
              currentBelt: user.currentBelt || "white",
              currentStreak: user.currentStreak || 0
            }} />
          </div>
          
          {/* Mobile Navigation */}
          <MobileNav user={{
            displayName: user.displayName || "User",
            totalXP: user.totalXP || 0,
            currentBelt: user.currentBelt || "white",
            currentStreak: user.currentStreak || 0
          }} />
          
          {/* Main Content */}
          <div className="flex-1 md:ml-64 mt-16 md:mt-0 min-h-screen">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/study" component={StudyPage} />
              <Route path="/study-mode" component={StudyModePage} />
              <Route path="/social" component={Social} />
              <Route path="/achievements" component={Achievements} />
              <Route path="/settings" component={Settings} />
              <Route path="/auth" component={AuthPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={Landing} />
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
    kanjiMastered: "Kanji Mastered",
    grammarPoints: "Grammar Points",
    vocabularyAccuracy: "Vocabulary Accuracy",
    kanjiAccuracy: "Kanji Accuracy",
    sync: "Sync Data",
    syncing: "Syncing...",
    lastSynced: "Last synced",
    setupApiKeys: "Import WaniKani Progress",
    kanjiReviews: "Kanji Reviews",
    grammarReviews: "Grammar Reviews",
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

function AppHeader({ user }: { user?: any }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border shadow-sm">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">日</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Tomoshibi
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <SimpleLanguageToggle />
          {user ? (
            <AuthenticatedUserMenu user={user} />
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <a href="/auth" className="hover:text-primary transition-colors">Sign In</a>
              <span className="text-muted-foreground">|</span>
              <a href="/auth" className="hover:text-primary transition-colors">Get Started</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AuthenticatedUserMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { 
        method: "POST",
        credentials: "include" 
      });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium">{user.displayName || user.username}</div>
          <div className="text-xs text-muted-foreground">{user.currentBelt} belt • {user.totalXP} XP</div>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <a href="/settings" className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
              Settings
            </a>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors text-destructive"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem('language-mode');
    return (saved as LanguageMode) || "en";
  });

  // Register service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

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
      <ThemeProvider>
        <LanguageContext.Provider value={contextValue}>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <FloatingThemeToggle />
              <Toaster />
              <Router />
              <InstallPrompt />
            </div>
          </TooltipProvider>
        </LanguageContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
