import { Switch, Route } from "wouter";
import { useState, createContext, useContext } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
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
      <Route path="/achievements" component={Achievements} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Simple Language Toggle Component
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
      className="px-3 py-1 rounded border bg-background text-foreground"
    >
      {modes.map(mode => (
        <option key={mode.value} value={mode.value}>
          {mode.label}
        </option>
      ))}
    </select>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold japanese-heading">
            日本語学習 - Japanese Learning Tracker
          </h1>
        </div>
        <LanguageToggle />
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
    console.log('App: Setting language to:', mode);
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
