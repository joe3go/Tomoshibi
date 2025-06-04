import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Add current theme class to both html and body
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Force apply theme colors with highest priority
    if (theme === 'dark') {
      root.style.setProperty('--background', '220 20% 11%', 'important');
      root.style.setProperty('--foreground', '45 25% 90%', 'important');
      root.style.setProperty('--card', '220 25% 14%', 'important');
      root.style.setProperty('--card-foreground', '45 25% 90%', 'important');
      root.style.setProperty('--muted', '220 15% 16%', 'important');
      root.style.setProperty('--muted-foreground', '45 10% 62%', 'important');
      root.style.setProperty('--border', '220 15% 22%', 'important');
      root.style.setProperty('--primary', '38 75% 67%', 'important');
      
      root.style.backgroundColor = 'hsl(220, 20%, 11%)';
      root.style.color = 'hsl(45, 25%, 90%)';
      body.style.backgroundColor = 'hsl(220, 20%, 11%)';
      body.style.color = 'hsl(45, 25%, 90%)';
    } else {
      root.style.setProperty('--background', '43 45% 93%', 'important');
      root.style.setProperty('--foreground', '30 20% 25%', 'important');
      root.style.setProperty('--card', '45 50% 95%', 'important');
      root.style.setProperty('--card-foreground', '30 20% 25%', 'important');
      root.style.setProperty('--muted', '45 40% 94%', 'important');
      root.style.setProperty('--muted-foreground', '30 15% 50%', 'important');
      root.style.setProperty('--border', '45 30% 88%', 'important');
      root.style.setProperty('--primary', '280 100% 70%', 'important');
      
      root.style.backgroundColor = 'hsl(43, 45%, 93%)';
      root.style.color = 'hsl(30, 20%, 25%)';
      body.style.backgroundColor = 'hsl(43, 45%, 93%)';
      body.style.color = 'hsl(30, 20%, 25%)';
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}