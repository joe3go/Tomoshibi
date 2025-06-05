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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-12 flex items-center justify-around z-50 md:left-80">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <button className={`flex flex-col items-center space-y-0 p-1 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Icon className="h-4 w-4" />
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
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border h-11 flex items-center justify-between px-4 z-50 md:left-80">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-primary">Tomoshibi</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Sidebar({ user }: { user: any }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/study", label: "Study", icon: BookOpen },
    { href: "/jlpt-progress", label: "JLPT Progress", icon: BarChart3 },
    { href: "/achievements", label: "Achievements", icon: Trophy },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 bg-background border border-border rounded-lg shadow-lg md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:w-1/3 max-w-sm`}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1 hover:bg-accent rounded md:hidden"
          >
            <X className="h-4 w-4" />
          </button>

          {/* User Profile */}
          <div className="mb-6 mt-8 md:mt-4">
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{user.displayName || user.username}</div>
                <div className="text-xs text-muted-foreground">{user.currentBelt} belt • {user.totalXP} XP</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <button 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
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
      <Sidebar user={user} />
      
      <div className="pt-11 pb-12 md:pl-80 h-screen overflow-hidden">
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
          </div>
        </LanguageContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;