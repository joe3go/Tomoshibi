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

// Pages
import Dashboard from "@/pages/dashboard";
import Study from "@/pages/study";
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

export function useLanguageContent(mode: LanguageMode) {
  const content = {
    en: {
      dashboard: "Dashboard",
      achievements: "Achievements",
      settings: "Settings",
      study: "Study",
      progress: "Progress"
    },
    jp: {
      dashboard: "ダッシュボード",
      achievements: "実績",
      settings: "設定",
      study: "学習",
      progress: "進歩"
    },
    "jp-furigana": {
      dashboard: "ダッシュボード",
      achievements: "実績",
      settings: "設定",
      study: "学習",
      progress: "進歩"
    }
  };
  
  return content[mode];
}

function MobileNavigation({ user }: { user: any }) {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/study", label: "Study", icon: BookOpen },
    { href: "/jlpt-progress", label: "Progress", icon: BarChart3 },
    { href: "/achievements", label: "Rewards", icon: Trophy },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <button className={`flex flex-col items-center space-y-1 p-2 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          </Link>
        );
      })}
    </div>
  );
}

function MobileHeader({ user }: { user: any }) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border h-11 flex items-center justify-between px-4 z-50">
      <div className="flex items-center space-x-3">
        <div className="text-lg font-bold text-primary">Tomoshibi</div>
      </div>
      
      <div className="flex items-center space-x-2">
        {user && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              <Target className="h-3 w-3 text-primary" />
              <span className="font-medium">{user.currentStreak}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Award className="h-3 w-3 text-primary" />
              <span className="font-medium">{user.totalXP}</span>
            </div>
          </div>
        )}
        <ThemeToggle />
      </div>
    </div>
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
      <MobileHeader user={user} />
      
      <div className="pt-11 pb-16 h-screen overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
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
      
      <MobileNavigation user={user} />
    </MobileWrapper>
  );
}

function App() {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>("en");

  useEffect(() => {
    const stored = localStorage.getItem('language-mode') as LanguageMode;
    if (stored && ['en', 'jp', 'jp-furigana'].includes(stored)) {
      setLanguageModeState(stored);
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
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <AppRouter />
            <VersionDisplay />
          </div>
        </LanguageContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;