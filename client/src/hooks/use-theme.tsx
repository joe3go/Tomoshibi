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
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Apply theme colors directly to root elements
    if (theme === 'dark') {
      root.style.backgroundColor = 'hsl(220, 20%, 11%)';
      root.style.color = 'hsl(45, 25%, 90%)';
      document.body.style.backgroundColor = 'hsl(220, 20%, 11%)';
      document.body.style.color = 'hsl(45, 25%, 90%)';
    } else {
      root.style.backgroundColor = 'hsl(43, 45%, 93%)';
      root.style.color = 'hsl(30, 20%, 25%)';
      document.body.style.backgroundColor = 'hsl(43, 45%, 93%)';
      document.body.style.color = 'hsl(30, 20%, 25%)';
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