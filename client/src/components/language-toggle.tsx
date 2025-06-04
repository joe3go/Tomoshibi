import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Languages, Globe } from "lucide-react";

export type LanguageMode = "en" | "jp" | "jp-furigana";

interface LanguageToggleProps {
  currentMode: LanguageMode;
  onModeChange: (mode: LanguageMode) => void;
}

export default function LanguageToggle({ currentMode, onModeChange }: LanguageToggleProps) {
  const modes = [
    { 
      id: "en" as LanguageMode, 
      label: "English", 
      icon: "🇺🇸",
      shortLabel: "EN"
    },
    { 
      id: "jp" as LanguageMode, 
      label: "日本語", 
      icon: "🇯🇵",
      shortLabel: "JP"
    },
    { 
      id: "jp-furigana" as LanguageMode, 
      label: "ふりがな", 
      icon: "ひ",
      shortLabel: "ふり"
    }
  ];

  return (
    <div className="flex items-center gap-2 bg-washi rounded-lg p-1 border">
      <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
        <Languages className="w-3 h-3" />
        <span className="hidden sm:inline">Display:</span>
      </div>
      
      <div className="flex bg-background rounded-md">
        {modes.map((mode) => (
          <Button
            key={mode.id}
            variant={currentMode === mode.id ? "default" : "ghost"}
            size="sm"
            className={`
              px-3 py-1 text-xs h-8 min-w-0 relative
              ${currentMode === mode.id 
                ? "matcha-gradient text-white shadow-sm" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }
            `}
            onClick={() => onModeChange(mode.id)}
          >
            <span className="flex items-center gap-1">
              <span className="text-sm">{mode.icon}</span>
              <span className="hidden sm:inline">{mode.label}</span>
              <span className="sm:hidden">{mode.shortLabel}</span>
            </span>
            {currentMode === mode.id && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-achievement-gold rounded-full"></div>
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Language context and utilities
export const LanguageContent = {
  en: {
    dashboard: "Dashboard",
    achievements: "Achievements", 
    settings: "Settings",
    progress: "Progress",
    journeyMap: "Learning Journey",
    wanikaniProgress: "WaniKani Progress",
    bunproProgress: "Bunpro Progress",
    kanjiLearned: "Kanji Learned",
    vocabulary: "Vocabulary", 
    grammarPoints: "Grammar Points",
    reviews: "Reviews",
    lessons: "Lessons",
    accuracy: "Accuracy",
    streak: "Day Streak",
    level: "Level",
    totalXP: "Total XP",
    syncData: "Sync Data",
    welcome: "Welcome back"
  },
  jp: {
    dashboard: "ダッシュボード",
    achievements: "実績",
    settings: "設定",
    progress: "進歩",
    journeyMap: "学習の旅",
    wanikaniProgress: "WaniKani進歩",
    bunproProgress: "Bunpro進歩", 
    kanjiLearned: "漢字習得",
    vocabulary: "語彙",
    grammarPoints: "文法項目",
    reviews: "復習",
    lessons: "レッスン",
    accuracy: "正確性",
    streak: "連続日数",
    level: "レベル",
    totalXP: "総XP",
    syncData: "データ同期",
    welcome: "お帰りなさい"
  },
  "jp-furigana": {
    dashboard: "ダッシュボード",
    achievements: "実績<ruby>じっせき</ruby>",
    settings: "設定<ruby>せってい</ruby>",
    progress: "進歩<ruby>しんぽ</ruby>",
    journeyMap: "学習<ruby>がくしゅう</ruby>の旅<ruby>たび</ruby>",
    wanikaniProgress: "WaniKani進歩<ruby>しんぽ</ruby>",
    bunproProgress: "Bunpro進歩<ruby>しんぽ</ruby>",
    kanjiLearned: "漢字<ruby>かんじ</ruby>習得<ruby>しゅうとく</ruby>",
    vocabulary: "語彙<ruby>ごい</ruby>",
    grammarPoints: "文法<ruby>ぶんぽう</ruby>項目<ruby>こうもく</ruby>",
    reviews: "復習<ruby>ふくしゅう</ruby>",
    lessons: "レッスン",
    accuracy: "正確性<ruby>せいかくせい</ruby>",
    streak: "連続<ruby>れんぞく</ruby>日数<ruby>にっすう</ruby>",
    level: "レベル",
    totalXP: "総<ruby>そう</ruby>XP",
    syncData: "データ同期<ruby>どうき</ruby>",
    welcome: "お帰<ruby>かえ</ruby>りなさい"
  }
};

export function useLanguageContent(mode: LanguageMode) {
  return LanguageContent[mode];
}