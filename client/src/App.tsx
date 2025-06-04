import { Switch, Route } from "wouter";
import { useState, createContext, useContext } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LanguageToggle, { type LanguageMode } from "@/components/language-toggle";
import Dashboard from "@/pages/dashboard";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Language context for global language state
const LanguageContext = createContext<{
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
}>({
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

function AppHeader() {
  const { languageMode, setLanguageMode } = useLanguageMode();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold japanese-heading">
            日本語学習 - Japanese Learning Tracker
          </h1>
        </div>
        <LanguageToggle 
          currentMode={languageMode}
          onModeChange={setLanguageMode}
        />
      </div>
    </header>
  );
}

function App() {
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('language-mode');
    return (saved as LanguageMode) || "en";
  });

  // Save to localStorage when changed
  const handleLanguageChange = (mode: LanguageMode) => {
    console.log('Language changing to:', mode);
    setLanguageMode(mode);
    localStorage.setItem('language-mode', mode);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={{ 
        languageMode, 
        setLanguageMode: handleLanguageChange 
      }}>
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
