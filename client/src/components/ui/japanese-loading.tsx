import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface JapaneseLoadingProps {
  className?: string;
  type?: "hiragana" | "kanji" | "sakura" | "torii" | "wave";
  size?: "sm" | "md" | "lg";
  message?: string;
}

const hiraganaChars = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ"];
const kanjiChars = ["学", "習", "勉", "強", "日", "本", "語", "文", "字", "書"];

export function JapaneseLoading({ 
  className, 
  type = "hiragana", 
  size = "md", 
  message = "読み込み中..." 
}: JapaneseLoadingProps) {
  const [currentChar, setCurrentChar] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChar((prev) => (prev + 1) % 10);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 600);
    return () => clearInterval(fadeInterval);
  }, []);

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl"
  };

  if (type === "hiragana") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn(
            "font-japanese transition-all duration-300",
            sizeClasses[size],
            isVisible ? "opacity-100 scale-100" : "opacity-60 scale-95"
          )}>
            {hiraganaChars.map((char, index) => (
              <span
                key={index}
                className={cn(
                  "inline-block mx-1 transition-all duration-200",
                  index === currentChar 
                    ? "text-blue-500 dark:text-blue-400 scale-125 animate-bounce" 
                    : "text-gray-400 dark:text-gray-600"
                )}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  if (type === "kanji") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn(
            "font-japanese transition-all duration-300",
            sizeClasses[size],
            isVisible ? "opacity-100 scale-100" : "opacity-60 scale-95"
          )}>
            {kanjiChars.map((char, index) => (
              <span
                key={index}
                className={cn(
                  "inline-block mx-1 transition-all duration-200",
                  index === currentChar 
                    ? "text-purple-500 dark:text-purple-400 scale-125 animate-bounce" 
                    : "text-gray-400 dark:text-gray-600"
                )}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  if (type === "sakura") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 animate-spin">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-pink-400 rounded-full"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-24px)`,
                  animationDelay: `${i * 0.1}s`
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-pink-300 to-pink-500 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  if (type === "torii") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative w-20 h-16">
          {/* Torii gate structure */}
          <div className="absolute top-2 left-2 right-2 h-2 bg-red-600 dark:bg-red-500 rounded animate-pulse" />
          <div className="absolute top-4 left-0 right-0 h-1 bg-red-500 dark:bg-red-400 rounded" />
          <div className="absolute top-6 left-4 w-1 h-8 bg-red-600 dark:bg-red-500 rounded animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="absolute top-6 right-4 w-1 h-8 bg-red-600 dark:bg-red-500 rounded animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  if (type === "wave") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                transform: `scaleY(${0.4 + Math.sin(Date.now() * 0.001 + i) * 0.6})`
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  return null;
}

// Specialized loading components for different contexts
export function StudyLoadingAnimation() {
  return (
    <JapaneseLoading 
      type="hiragana" 
      size="lg" 
      message="学習の準備をしています..."
      className="min-h-[200px]"
    />
  );
}

export function ReviewLoadingAnimation() {
  return (
    <JapaneseLoading 
      type="kanji" 
      size="md" 
      message="復習を読み込んでいます..."
      className="min-h-[150px]"
    />
  );
}

export function DashboardLoadingAnimation() {
  return (
    <JapaneseLoading 
      type="sakura" 
      size="md" 
      message="ダッシュボードを準備中..."
      className="min-h-[100px]"
    />
  );
}

export function DataLoadingAnimation() {
  return (
    <JapaneseLoading 
      type="wave" 
      size="sm" 
      message="データを取得中..."
      className="min-h-[80px]"
    />
  );
}

// Additional specialized loading components
export function VocabularyLoadingAnimation() {
  return (
    <JapaneseLoading 
      type="hiragana" 
      size="md" 
      message="語彙を読み込み中..."
      className="min-h-[120px]"
    />
  );
}

export function KanjiLoadingAnimation() {
  return (
    <JapaneseLoading 
      type="kanji" 
      size="md" 
      message="漢字を読み込み中..."
      className="min-h-[120px]"
    />
  );
}

export function GrammarLoadingAnimation() {
  return (
    <JapaneseLoading 
      type="torii" 
      size="md" 
      message="文法を読み込み中..."
      className="min-h-[120px]"
    />
  );
}