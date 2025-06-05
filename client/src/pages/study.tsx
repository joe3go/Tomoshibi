import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Volume2, 
  Check, 
  X, 
  RotateCcw, 
  Zap,
  Target,
  Trophy,
  Clock
} from "lucide-react";
import { Link } from "wouter";

interface StudyCard {
  id: number;
  japanese: string;
  reading: string | null;
  english: string;
  jlptLevel: string;
  difficulty: number;
}

export default function Study() {
  const [currentCard, setCurrentCard] = useState<StudyCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [cardsStudied, setCardsStudied] = useState(0);

  const { data: reviewQueue } = useQuery<StudyCard[]>({
    queryKey: ["/api/study/review-queue"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ cardId, difficulty }: { cardId: number; difficulty: number }) => {
      return await apiRequest("POST", "/api/study/review", { cardId, difficulty });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study/review-queue"] });
      setCardsStudied(prev => prev + 1);
      loadNextCard();
    },
  });

  useEffect(() => {
    if (reviewQueue && reviewQueue.length > 0 && !currentCard) {
      setCurrentCard(reviewQueue[0]);
    }
  }, [reviewQueue, currentCard]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadNextCard = () => {
    if (reviewQueue && reviewQueue.length > 1) {
      const nextIndex = Math.floor(Math.random() * (reviewQueue.length - 1)) + 1;
      setCurrentCard(reviewQueue[nextIndex]);
      setShowAnswer(false);
    } else {
      setCurrentCard(null);
    }
  };

  const handleReview = (difficulty: number) => {
    if (!currentCard) return;

    const xpGained = difficulty >= 3 ? 10 : difficulty >= 2 ? 5 : 2;
    setSessionXP(prev => prev + xpGained);
    
    if (difficulty >= 3) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    reviewMutation.mutate({ cardId: currentCard.id, difficulty });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="mb-4">Please log in to start studying</p>
          <Link href="/auth">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="px-4 py-6 text-center space-y-4">
        <Trophy className="h-16 w-16 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Study Session Complete!</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">Cards studied: {cardsStudied}</p>
          <p className="text-muted-foreground">XP earned: {sessionXP}</p>
          <p className="text-muted-foreground">Time: {formatTime(timeSpent)}</p>
        </div>
        <Link href="/dashboard">
          <Button className="w-full">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 space-y-3 h-full overflow-y-auto">
      {/* Study Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{formatTime(timeSpent)}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{streak}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{sessionXP}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Cards studied: {cardsStudied}</span>
          <Badge variant="secondary">{currentCard.jlptLevel}</Badge>
        </div>
        <Progress value={(cardsStudied / (reviewQueue?.length || 1)) * 100} className="h-2" />
      </div>

      {/* Study Card */}
      <Card className="p-6 text-center space-y-4 min-h-[300px] flex flex-col justify-center">
        <div className="space-y-3">
          <div className="text-3xl font-bold text-primary font-japanese">
            {currentCard.japanese}
          </div>
          
          {currentCard.reading && showAnswer && (
            <div className="text-lg text-muted-foreground font-japanese">
              {currentCard.reading}
            </div>
          )}
          
          {showAnswer && (
            <div className="text-lg font-medium">
              {currentCard.english}
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="mx-auto"
            onClick={() => {
              // Audio pronunciation would go here
              console.log("Playing audio for:", currentCard.japanese);
            }}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      {!showAnswer ? (
        <Button 
          className="w-full h-12 text-lg"
          onClick={() => setShowAnswer(true)}
        >
          Show Answer
        </Button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="destructive"
            className="h-12 flex flex-col items-center justify-center space-y-1"
            onClick={() => handleReview(1)}
            disabled={reviewMutation.isPending}
          >
            <X className="h-4 w-4" />
            <span className="text-xs">Again</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-12 flex flex-col items-center justify-center space-y-1"
            onClick={() => handleReview(2)}
            disabled={reviewMutation.isPending}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-xs">Hard</span>
          </Button>
          
          <Button
            variant="secondary"
            className="h-12 flex flex-col items-center justify-center space-y-1"
            onClick={() => handleReview(3)}
            disabled={reviewMutation.isPending}
          >
            <Check className="h-4 w-4" />
            <span className="text-xs">Good</span>
          </Button>
          
          <Button
            className="h-12 flex flex-col items-center justify-center space-y-1"
            onClick={() => handleReview(4)}
            disabled={reviewMutation.isPending}
          >
            <Zap className="h-4 w-4" />
            <span className="text-xs">Easy</span>
          </Button>
        </div>
      )}

      {/* Study Tips */}
      <Card className="p-3">
        <div className="text-sm text-muted-foreground text-center">
          <p className="font-medium mb-1">Study Tip</p>
          <p>Focus on the meaning first, then the reading. Take your time to understand the context.</p>
        </div>
      </Card>
    </div>
  );
}