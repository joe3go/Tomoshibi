import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Furigana } from "@/components/furigana";
import { ReviewLoadingAnimation } from "@/components/ui/japanese-loading";

interface ReviewCard {
  srsItem: {
    id: number;
    interval: number;
    repetitions: number;
    mastery: string;
    correctCount: number;
    incorrectCount: number;
  };
  sentenceCard: {
    id: number;
    japanese: string;
    reading: string;
    english: string;
    jlptLevel: string;
    difficulty: number;
    audioUrl?: string;
  };
}

export default function StudyFullscreenPage() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFurigana, setShowFurigana] = useState(false);

  // Get review queue
  const { data: cards = [], isLoading } = useQuery<ReviewCard[]>({
    queryKey: ["/api/review-queue"],
  });

  // Create study session
  const { mutate: createSession } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionType: "review" }),
      });
      return response.json();
    },
  });

  // Submit answer
  const { mutate: submitAnswer } = useMutation({
    mutationFn: async ({ srsItemId, score }: { srsItemId: number; score: number }) => {
      const response = await fetch("/api/srs-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ srsItemId, score }),
      });
      return response.json();
    },
    onSuccess: () => {
      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setShowFurigana(false);
      } else {
        // Session complete
        setLocation("/");
      }
    },
  });

  useEffect(() => {
    if (cards.length > 0) {
      createSession();
    }
  }, [cards.length]);

  const currentCard = cards[currentIndex];

  const handleAnswer = (score: number) => {
    if (currentCard) {
      submitAnswer({ srsItemId: currentCard.srsItem.id, score });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ReviewLoadingAnimation />
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
          <Button onClick={() => setLocation("/")} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Progress indicator */}
      <div className="absolute top-4 left-4 text-sm text-gray-400">
        {currentIndex + 1} of {cards.length}
      </div>

      {/* Exit button */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/")}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        
        {/* Japanese text with stable furigana */}
        <div className="text-center mb-16">
          <div className="text-6xl font-bold japanese-text mb-8" style={{ minHeight: '120px', lineHeight: '1.5' }}>
            <Furigana 
              japanese={currentCard.sentenceCard.japanese}
              reading={currentCard.sentenceCard.reading}
              showReading={showFurigana}
            />
          </div>
          
          {/* Furigana toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFurigana(!showFurigana)}
            className="mb-8 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {showFurigana ? "Hide" : "Show"} Reading
          </Button>
        </div>

        {/* Answer section */}
        {!showAnswer ? (
          <div className="text-center">
            <Button 
              onClick={() => setShowAnswer(true)}
              size="lg"
              className="text-xl px-12 py-4 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Show Answer ✓
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-8 w-full max-w-4xl">
            {/* English meaning */}
            <div className="text-2xl text-gray-300 mb-8">
              {currentCard.sentenceCard.english}
            </div>

            {/* Rating buttons */}
            <div className="grid grid-cols-4 gap-4">
              <Button
                onClick={() => handleAnswer(1)}
                className="flex flex-col items-center p-6 bg-red-600 hover:bg-red-700 text-white"
              >
                <span className="text-lg font-bold mb-1">1</span>
                <span className="text-sm">Again</span>
              </Button>
              
              <Button
                onClick={() => handleAnswer(2)}
                className="flex flex-col items-center p-6 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <span className="text-lg font-bold mb-1">2</span>
                <span className="text-sm">Hard</span>
              </Button>
              
              <Button
                onClick={() => handleAnswer(3)}
                className="flex flex-col items-center p-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="text-lg font-bold mb-1">3</span>
                <span className="text-sm">Good</span>
              </Button>
              
              <Button
                onClick={() => handleAnswer(4)}
                className="flex flex-col items-center p-6 bg-green-600 hover:bg-green-700 text-white"
              >
                <span className="text-lg font-bold mb-1">4</span>
                <span className="text-sm">Easy</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}