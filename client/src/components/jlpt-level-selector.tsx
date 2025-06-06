import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Award, CheckCircle } from "lucide-react";

interface JLPTLevelSelectorProps {
  currentLevel?: string;
  onLevelSelect?: (level: string) => void;
  showModal?: boolean;
  onClose?: () => void;
}

const jlptLevels = [
  {
    level: "N5",
    name: "Beginner",
    description: "Basic greetings, numbers, family terms",
    vocabulary: "~800 words",
    kanji: "~100 kanji",
    color: "bg-green-500"
  },
  {
    level: "N4", 
    name: "Elementary",
    description: "Daily conversations, basic grammar",
    vocabulary: "~1,500 words",
    kanji: "~300 kanji",
    color: "bg-blue-500"
  },
  {
    level: "N3",
    name: "Intermediate",
    description: "Work situations, complex sentences",
    vocabulary: "~3,750 words", 
    kanji: "~650 kanji",
    color: "bg-yellow-500"
  },
  {
    level: "N2",
    name: "Upper Intermediate", 
    description: "News, academic topics, nuanced expression",
    vocabulary: "~6,000 words",
    kanji: "~1,000 kanji",
    color: "bg-orange-500"
  },
  {
    level: "N1",
    name: "Advanced",
    description: "Native-level comprehension, complex texts",
    vocabulary: "~10,000 words",
    kanji: "~2,000 kanji", 
    color: "bg-red-500"
  }
];

export function JLPTLevelSelector({ 
  currentLevel, 
  onLevelSelect, 
  showModal = false, 
  onClose 
}: JLPTLevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>(currentLevel || "");
  const [hasInitialSelection, setHasInitialSelection] = useState(false);

  const updateLevelMutation = useMutation({
    mutationFn: async (level: string) => {
      const response = await apiRequest("PATCH", "/api/user/jlpt-level", { level });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setHasInitialSelection(true);
      localStorage.setItem("jlptLevelSelected", "true");
      if (onLevelSelect) {
        onLevelSelect(selectedLevel);
      }
      if (onClose) {
        onClose();
      }
    },
  });

  useEffect(() => {
    const hasSelected = localStorage.getItem("jlptLevelSelected");
    setHasInitialSelection(!!hasSelected || !!currentLevel);
  }, [currentLevel]);

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    updateLevelMutation.mutate(level);
  };

  const levelSelector = (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Award className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Choose Your JLPT Level</h2>
        <p className="text-muted-foreground">
          Select your target JLPT level to personalize your learning experience.
          You can always access content from other levels.
        </p>
      </div>

      <div className="grid gap-4">
        {jlptLevels.map((jlptLevel) => (
          <Card 
            key={jlptLevel.level}
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedLevel === jlptLevel.level 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedLevel(jlptLevel.level)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg ${jlptLevel.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{jlptLevel.level}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{jlptLevel.name}</h3>
                    <Badge variant="outline" className="text-xs">{jlptLevel.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {jlptLevel.description}
                  </p>
                  <div className="flex space-x-4 text-xs text-muted-foreground mt-2">
                    <span>{jlptLevel.vocabulary}</span>
                    <span>{jlptLevel.kanji}</span>
                  </div>
                </div>
              </div>
              
              {selectedLevel === jlptLevel.level && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={() => handleLevelSelect(selectedLevel)}
          disabled={!selectedLevel || updateLevelMutation.isPending}
          className="w-full max-w-md"
        >
          {updateLevelMutation.isPending ? "Saving..." : "Set JLPT Level"}
        </Button>
      </div>
    </div>
  );

  if (showModal) {
    return (
      <Dialog open={showModal} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>JLPT Level Selection</DialogTitle>
            <DialogDescription>
              Choose your primary JLPT study level
            </DialogDescription>
          </DialogHeader>
          {levelSelector}
        </DialogContent>
      </Dialog>
    );
  }

  return levelSelector;
}

export function useJLPTLevelCheck() {
  const [showLevelSelector, setShowLevelSelector] = useState(false);

  useEffect(() => {
    const hasSelected = localStorage.getItem("jlptLevelSelected");
    const timer = setTimeout(() => {
      if (!hasSelected) {
        setShowLevelSelector(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    showLevelSelector,
    setShowLevelSelector
  };
}