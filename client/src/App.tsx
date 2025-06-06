import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Route, Switch, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  Loader2, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  BarChart3, 
  BookOpen, 
  Search,
  Home,
  Trophy,
  Settings as SettingsIcon,
  User,
  Target,
  Award
} from "lucide-react";
import { VersionDisplay } from "@/components/version-display";
import { MobileWrapper } from "@/components/mobile-wrapper";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { useState, useEffect, createContext, useContext } from "react";
import { LanternLogo } from "@/components/lantern-logo";

// Pages
import Dashboard from "@/pages/dashboard";
import Study from "@/pages/study";
import Vocabulary from "@/pages/vocabulary";
import KanjiPage from "@/pages/kanji";
import GrammarPage from "@/pages/grammar";
import LearningPractice from "@/pages/learning-practice";
import JLPTProgress from "@/pages/jlpt-progress";
import StudyPage from "@/pages/study";
import StudyDedicatedPage from "@/pages/study-dedicated";
import StudyFullscreenPage from "@/pages/study-fullscreen";
import StudyModePage from "@/pages/study-mode";
import JLPTContentPage from "@/pages/jlpt-content";
import ContentBrowserPage from "@/pages/content-browser";
import Social from "@/pages/social";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { GlobalJLPTLevelSelector } from "@/components/jlpt-level-selector";

// Theme context
const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-1 md:p-1.5 rounded-lg hover:bg-accent transition-colors touch-feedback flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}

// Language context
export type LanguageMode = "en" | "jp" | "jp-furigana";

interface LanguageContextType {
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  languageMode: "en",
  setLanguageMode: () => {},
});

export const useLanguageMode = () => useContext(LanguageContext);

// Language content hook
export function useLanguageContent(mode: LanguageMode) {
  const content = {
    en: {
      loading: "Loading...",
      error: "Error",
      retry: "Retry",
      menu: "Menu",
      home: "Home",
      study: "Study",
      progress: "Progress",
      achievements: "Achievements",
      settings: "Settings",
    },
    jp: {
      loading: "読み込み中...",
      error: "エラー",
      retry: "再試行",
      menu: "メニュー",
      home: "ホーム",
      study: "学習",
      progress: "進捗",
      achievements: "達成",
      settings: "設定",
    },
    "jp-furigana": {
      loading: "読み込み中...",
      error: "エラー",
      retry: "再試行",
      menu: "メニュー",
      home: "ホーム",
      study: "学習",
      progress: "進捗",
      achievements: "達成",
      settings: "設定",
    },
  };

  return content[mode];
}

function Header({ user }: { user: any }) {
  const [location] = useLocation();
  const [showMobileNav, setShowMobileNav] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/vocabulary", label: "Vocab", icon: BookOpen },
    { href: "/kanji", label: "Kanji", icon: BarChart3 },
    { href: "/grammar", label: "Grammar", icon: Search },
    { href: "/learning-practice", label: "Practice", icon: Target },
    { href: "/study-mode", label: "Study", icon: Award },
    { href: "/jlpt-progress", label: "Progress", icon: Trophy },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="flex items-center justify-center px-4 h-14 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <LanternLogo size={32} className="text-primary drop-shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-sm -z-10"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary tracking-wide">Tomoshibi</h1>
              <p className="text-xs text-muted-foreground -mt-1">Japanese Learning</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* User Stats */}
          {user && (
            <div className="hidden md:flex items-center gap-4 mr-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <Badge variant="secondary" className="bg-primary/20 text-primary font-semibold">
                  {user.currentJLPTLevel || 'N5'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  {user.totalXP || 0} XP
                </span>
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 md:hidden"
            onClick={() => setShowMobileNav(!showMobileNav)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <ThemeToggle />
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {showMobileNav && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="flex flex-col p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <button 
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors w-full text-left ${
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                    onClick={() => setShowMobileNav(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

function AppRouter() {
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <MobileWrapper>
      <Header user={user} />

      <div className="pt-14 min-h-screen overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/vocabulary" component={Vocabulary} />
          <Route path="/kanji" component={KanjiPage} />
          <Route path="/grammar" component={GrammarPage} />
          <Route path="/learning-practice" component={LearningPractice} />
          <Route path="/study" component={Study} />
          <Route path="/jlpt-progress" component={JLPTProgress} />
          <Route path="/study-dedicated" component={StudyDedicatedPage} />
          <Route path="/study-fullscreen" component={StudyFullscreenPage} />
          <Route path="/study-mode" component={StudyModePage} />
          <Route path="/jlpt-content" component={JLPTContentPage} />
          <Route path="/content-browser" component={ContentBrowserPage} />
          <Route path="/social" component={Social} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/settings" component={Settings} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </MobileWrapper>
  );
}

function App() {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>("en");

  const setLanguageMode = (mode: LanguageMode) => {
    setLanguageModeState(mode);
    localStorage.setItem("languageMode", mode);
  };

  useEffect(() => {
    const stored = localStorage.getItem("languageMode") as LanguageMode;
    if (stored && ["en", "jp", "jp-furigana"].includes(stored)) {
      setLanguageModeState(stored);
    }
  }, []);

  const contextValue = {
    languageMode,
    setLanguageMode
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageContext.Provider value={contextValue}>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <AppRouter />
            <VersionDisplay />
            <GlobalJLPTLevelSelector />
          </div>
        </LanguageContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;