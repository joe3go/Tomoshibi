import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Palette } from 'lucide-react';

type ThemeMode = 'warm-dark' | 'cool-dark';

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = "" }: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('warm-dark');

  useEffect(() => {
    const stored = localStorage.getItem('tomoshibi-theme') as ThemeMode;
    if (stored && ['warm-dark', 'cool-dark'].includes(stored)) {
      setCurrentTheme(stored);
      applyTheme(stored);
    } else {
      setCurrentTheme('warm-dark');
      applyTheme('warm-dark');
    }
  }, []);

  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement;
    
    if (theme === 'warm-dark') {
      // Warm dark theme (default cozy bar aesthetic)
      root.style.setProperty('--background', '12 10% 9%'); // Dark warm brown
      root.style.setProperty('--foreground', '24 9.8% 95%'); // Warm white
      root.style.setProperty('--card', '12 6.5% 15%'); // Warm dark card
      root.style.setProperty('--card-foreground', '24 9.8% 95%');
      root.style.setProperty('--popover', '12 10% 9%');
      root.style.setProperty('--popover-foreground', '24 9.8% 95%');
      root.style.setProperty('--primary', '24 9.8% 70%'); // Warm amber
      root.style.setProperty('--primary-foreground', '12 10% 9%');
      root.style.setProperty('--secondary', '12 3.9% 21%');
      root.style.setProperty('--secondary-foreground', '24 5.4% 83%');
      root.style.setProperty('--muted', '12 3.9% 21%');
      root.style.setProperty('--muted-foreground', '24 5.4% 63%');
      root.style.setProperty('--accent', '12 3.9% 21%');
      root.style.setProperty('--accent-foreground', '24 5.4% 83%');
      root.style.setProperty('--destructive', '0 84.2% 60.2%');
      root.style.setProperty('--destructive-foreground', '24 9.8% 95%');
      root.style.setProperty('--border', '12 3.9% 21%');
      root.style.setProperty('--input', '12 3.9% 21%');
      root.style.setProperty('--ring', '24 9.8% 70%');
    } else {
      // Cool dark theme (softer grays)
      root.style.setProperty('--background', '222.2 84% 4.9%'); // Cool dark blue
      root.style.setProperty('--foreground', '210 40% 98%'); // Cool white
      root.style.setProperty('--card', '222.2 84% 4.9%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--popover', '222.2 84% 4.9%');
      root.style.setProperty('--popover-foreground', '210 40% 98%');
      root.style.setProperty('--primary', '217.2 91.2% 59.8%'); // Cool blue
      root.style.setProperty('--primary-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--secondary', '217.2 32.6% 17.5%');
      root.style.setProperty('--secondary-foreground', '210 40% 80%');
      root.style.setProperty('--muted', '217.2 32.6% 17.5%');
      root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
      root.style.setProperty('--accent', '217.2 32.6% 17.5%');
      root.style.setProperty('--accent-foreground', '210 40% 80%');
      root.style.setProperty('--destructive', '0 62.8% 30.6%');
      root.style.setProperty('--destructive-foreground', '210 40% 98%');
      root.style.setProperty('--border', '217.2 32.6% 17.5%');
      root.style.setProperty('--input', '217.2 32.6% 17.5%');
      root.style.setProperty('--ring', '217.2 91.2% 59.8%');
    }
  };

  const toggleTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('tomoshibi-theme', theme);
  };

  const themes = [
    {
      id: 'warm-dark' as ThemeMode,
      name: 'Warm Dark',
      description: 'Cozy bar atmosphere',
      icon: Moon,
      gradient: 'from-amber-900/20 to-orange-900/20',
    },
    {
      id: 'cool-dark' as ThemeMode,
      name: 'Cool Dark',
      description: 'Softer grays',
      icon: Sun,
      gradient: 'from-blue-900/20 to-slate-900/20',
    },
  ];

  return (
    <Card className={`p-4 bg-card/50 backdrop-blur-sm ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Theme</h3>
        </div>
        
        <div className="grid gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isActive = currentTheme === theme.id;
            
            return (
              <motion.div
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isActive ? "default" : "outline"}
                  onClick={() => toggleTheme(theme.id)}
                  className={`w-full h-auto p-3 justify-start ${
                    isActive ? 'bg-primary' : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{theme.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {theme.description}
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}