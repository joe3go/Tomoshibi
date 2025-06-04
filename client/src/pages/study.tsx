import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ChevronLeft, Volume2, Eye, EyeOff, RotateCcw, CheckCircle, XCircle, Star } from "lucide-react";
import { Link } from "wouter";

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
    register: string;
    theme: string;
    source: string;
    grammarPoints: string[];
    vocabulary: string[];
    culturalNotes: string;
  };
}

interface StudySession {
  id: number;
  cardsReviewed: number;
  cardsCorrect: number;
  timeSpentMinutes: number;
}

export default function StudyPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    cardsCorrect: 0,
    totalCards: 0
  });

  // Audio functionality
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP'; // Japanese language
      utterance.rate = 0.8; // Slightly slower for learning
      utterance.pitch = 1.0;
      
      // Try to use a Japanese voice if available
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => 
        voice.lang.startsWith('ja') || voice.name.includes('Japanese')
      );
      
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fetch review queue
  const { data: reviewQueue, isLoading, error } = useQuery<ReviewCard[]>({
    queryKey: ["/api/review-queue"],
    refetchOnWindowFocus: false
  });

  // Start study session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionType: "review" })
      });
      if (!response.ok) throw new Error("Failed to start session");
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
    }
  });

  // Submit review
  const submitReviewMutation = useMutation({
    mutationFn: async ({ srsItemId, quality }: { srsItemId: number; quality: number }) => {
      const response = await fetch(`/api/review/${srsItemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality })
      });
      if (!response.ok) throw new Error("Failed to submit review");
      return response.json();
    },
    onSuccess: () => {
      // Refresh review queue
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
    }
  });

  // Complete session
  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!currentSession) return null;
      
      const timeSpentMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
      const response = await fetch(`/api/study-session/${currentSession.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardsReviewed: sessionStats.cardsReviewed,
          cardsCorrect: sessionStats.cardsCorrect,
          timeSpentMinutes
        })
      });
      if (!response.ok) throw new Error("Failed to complete session");
      return response.json();
    }
  });

  // Start session on component mount
  useEffect(() => {
    if (!currentSession && reviewQueue && reviewQueue.length > 0) {
      startSessionMutation.mutate();
      setSessionStats(prev => ({ ...prev, totalCards: reviewQueue.length }));
    }
  }, [reviewQueue]);

  const handleAnswer = async (quality: number) => {
    if (!reviewQueue || !reviewQueue[currentCardIndex]) return;

    const currentCard = reviewQueue[currentCardIndex];
    const wasCorrect = quality >= 3;

    // Submit review
    await submitReviewMutation.mutateAsync({
      srsItemId: currentCard.srsItem.id,
      quality
    });

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      cardsCorrect: prev.cardsCorrect + (wasCorrect ? 1 : 0)
    }));

    // Move to next card or complete session
    if (currentCardIndex < reviewQueue.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
      setShowReading(false);
    } else {
      // Session complete
      completeSessionMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load review queue</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!reviewQueue || reviewQueue.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center py-16">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-600 mb-6">
              No cards are due for review right now. Great job on staying consistent!
            </p>
            <Link href="/">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Session completed
  if (sessionStats.cardsReviewed >= reviewQueue.length) {
    const accuracy = Math.round((sessionStats.cardsCorrect / sessionStats.cardsReviewed) * 100);
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 60000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <Star className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Session Complete!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{sessionStats.cardsReviewed}</div>
                  <div className="text-sm text-gray-600">Cards Reviewed</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">{timeSpent}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Link href="/">
                <Button size="lg">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = reviewQueue[currentCardIndex];
  const progress = ((currentCardIndex + 1) / reviewQueue.length) * 100;

  // Register color coding
  const registerColors: Record<string, string> = {
    polite: "bg-blue-100 text-blue-800",
    casual: "bg-green-100 text-green-800",
    anime: "bg-purple-100 text-purple-800",
    workplace: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">
              Card {currentCardIndex + 1} of {reviewQueue.length}
            </div>
            <Progress value={progress} className="w-64" />
          </div>
          
          <div className="text-sm text-gray-600">
            {sessionStats.cardsCorrect}/{sessionStats.cardsReviewed} correct
          </div>
        </div>

        {/* Main Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={registerColors[currentCard.sentenceCard.register] || "bg-gray-100 text-gray-800"}>
                  {currentCard.sentenceCard.register}
                </Badge>
                <Badge variant="outline">{currentCard.sentenceCard.jlptLevel}</Badge>
                <Badge variant="outline">{currentCard.sentenceCard.theme}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReading(!showReading)}
                >
                  {showReading ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  Reading
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playAudio(currentCard.sentenceCard.japanese)}
                  title="Play audio"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Japanese Sentence */}
            <div className="text-center">
              <div className="text-4xl font-medium mb-2 text-gray-900 leading-relaxed">
                {currentCard.sentenceCard.japanese}
              </div>
              {showReading && (
                <div className="text-lg text-gray-600">
                  {currentCard.sentenceCard.reading}
                </div>
              )}
            </div>

            {/* Show Answer Button */}
            {!showAnswer && (
              <div className="text-center">
                <Button
                  onClick={() => setShowAnswer(true)}
                  size="lg"
                  className="px-8"
                >
                  Show Answer
                </Button>
              </div>
            )}

            {/* Answer Section */}
            {showAnswer && (
              <div className="space-y-6">
                {/* English Translation */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl text-gray-900">
                    {currentCard.sentenceCard.english}
                  </div>
                </div>

                {/* Grammar Points */}
                {currentCard.sentenceCard.grammarPoints && currentCard.sentenceCard.grammarPoints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Grammar Points:</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.sentenceCard.grammarPoints.map((point, index) => (
                        <Badge key={index} variant="secondary">{point}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary */}
                {currentCard.sentenceCard.vocabulary && currentCard.sentenceCard.vocabulary.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Key Vocabulary:</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.sentenceCard.vocabulary.map((word, index) => (
                        <Badge key={index} variant="outline">{word}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cultural Notes */}
                {currentCard.sentenceCard.culturalNotes && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Cultural Note:</h3>
                    <p className="text-blue-800">{currentCard.sentenceCard.culturalNotes}</p>
                  </div>
                )}

                {/* Source */}
                {currentCard.sentenceCard.source && (
                  <div className="text-sm text-gray-600 text-center">
                    Source: {currentCard.sentenceCard.source}
                  </div>
                )}

                {/* Answer Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleAnswer(1)}
                    variant="destructive"
                    size="lg"
                    className="flex flex-col py-6 h-auto"
                    disabled={submitReviewMutation.isPending}
                  >
                    <XCircle className="h-8 w-8 mb-2" />
                    <span className="text-lg font-semibold">No</span>
                    <span className="text-sm opacity-80">I didn't know this</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleAnswer(4)}
                    variant="default"
                    size="lg"
                    className="flex flex-col py-6 h-auto bg-green-600 hover:bg-green-700"
                    disabled={submitReviewMutation.isPending}
                  >
                    <CheckCircle className="h-8 w-8 mb-2" />
                    <span className="text-lg font-semibold">Yes</span>
                    <span className="text-sm opacity-80">I knew this</span>
                  </Button>
                </div>

                {/* SRS Info */}
                <div className="text-center text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <div>
                    Mastery: <span className="font-medium">{currentCard.srsItem.mastery}</span> •
                    Interval: <span className="font-medium">{currentCard.srsItem.interval} days</span> •
                    Reviews: <span className="font-medium">{currentCard.srsItem.repetitions}</span>
                  </div>
                  <div className="mt-1">
                    Success Rate: <span className="font-medium">
                      {currentCard.srsItem.correctCount + currentCard.srsItem.incorrectCount > 0
                        ? Math.round((currentCard.srsItem.correctCount / (currentCard.srsItem.correctCount + currentCard.srsItem.incorrectCount)) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}