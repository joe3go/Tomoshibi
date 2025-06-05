import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, Menu, X, Sun, Moon } from "lucide-react";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { useState, useEffect, createContext, useContext } from "react";
import logoImage from "@assets/generation-6a02e368-0179-44e8-b30c-e27dd8718770_1749086561653.png";

// Pages
import Dashboard from "@/pages/dashboard";
import StudyPage from "@/pages/study";
import StudyModePage from "@/pages/study-mode";
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
      className="p-2 rounded-lg hover:bg-accent transition-colors"
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
      progress: "Progress",
      study: "Study",
      social: "Social",
      welcome: "Welcome back",
      totalXP: "Total XP",
      currentStreak: "Current Streak",
      jlptLevel: "JLPT Level",
      recentActivity: "Recent Activity"
    },
    jp: {
      dashboard: "ダッシュボード",
      achievements: "実績",
      settings: "設定",
      progress: "進歩",
      study: "勉強",
      social: "ソーシャル",
      welcome: "おかえりなさい",
      totalXP: "総経験値",
      currentStreak: "現在の連続記録",
      jlptLevel: "JLPTレベル",
      recentActivity: "最近の活動"
    },
    "jp-furigana": {
      dashboard: "ダッシュボード",
      achievements: "実績（じっせき）",
      settings: "設定（せってい）",
      progress: "進歩（しんぽ）",
      study: "勉強（べんきょう）",
      social: "ソーシャル",
      welcome: "おかえりなさい",
      totalXP: "総経験値（そうけいけんち）",
      currentStreak: "現在（げんざい）の連続記録（れんぞくきろく）",
      jlptLevel: "JLPTレベル",
      recentActivity: "最近（さいきん）の活動（かつどう）"
    }
  };
  
  return content[mode] || content.en;
}

function LanguageToggle() {
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
      className="px-3 py-1 rounded border bg-background text-foreground text-sm"
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
    <header className="app-header">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="Tomoshibi" 
            className="h-10 w-auto object-contain"
            style={{
              filter: 'drop-shadow(0 0 0 transparent)',
              mixBlendMode: 'multiply'
            }}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <a href="/auth" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function UserMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
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

function Navigation({ user }: { user: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: "🏠" },
    { href: "/study", label: "Study", icon: "📚" },
    { href: "/study-mode", label: "Study Mode", icon: "🎯" },
    { href: "/social", label: "Social", icon: "👥" },
    { href: "/achievements", label: "Achievements", icon: "🏆" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-20 left-4 z-40 p-2 bg-background border border-border rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-border">
        <div className="p-4">
          <div className="mb-6">
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
          <nav className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border z-50 md:hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader user={user} />
        <Navigation user={user} />
        <div className="main-content with-sidebar">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/study" component={StudyPage} />
            <Route path="/study-mode" component={StudyModePage} />
            <Route path="/social" component={Social} />
            <Route path="/achievements" component={Achievements} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="main-content">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={Landing} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
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
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Toaster />
              <AppRouter />
            </div>
          </TooltipProvider>
        </LanguageContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;