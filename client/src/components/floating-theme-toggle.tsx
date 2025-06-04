import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-20 right-4 z-[9999] w-14 h-14 rounded-full border-2 shadow-lg transition-all duration-200 hover:scale-110"
      style={{
        backgroundColor: theme === 'dark' ? 'hsl(220, 25%, 14%)' : 'hsl(45, 50%, 95%)',
        borderColor: theme === 'dark' ? 'hsl(38, 75%, 67%)' : 'hsl(280, 100%, 70%)',
        color: theme === 'dark' ? 'hsl(38, 75%, 67%)' : 'hsl(280, 100%, 70%)'
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-7 w-7 mx-auto" />
      ) : (
        <Moon className="h-7 w-7 mx-auto" />
      )}
    </button>
  );
}