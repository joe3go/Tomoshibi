import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 border-2"
      style={{
        backgroundColor: theme === 'dark' ? 'hsl(220, 25%, 14%)' : 'hsl(45, 50%, 95%)',
        borderColor: theme === 'dark' ? 'hsl(38, 75%, 67%)' : 'hsl(280, 100%, 70%)',
        color: theme === 'dark' ? 'hsl(38, 75%, 67%)' : 'hsl(280, 100%, 70%)'
      }}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}