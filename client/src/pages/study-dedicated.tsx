import { useState, useEffect } from "react";

// Scroll to top when component mounts
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  ChevronLeft, 
  Volume2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Star, 
  Pause,
  Play,
  Square,
  RotateCcw
} from "lucide-react";
import { useLocation } from "wouter";
import { Furigana } from "@/components/furigana";
import { ReviewLoadingAnimation } from "@/components/ui/japanese-loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export default function StudyDedicatedPage() {
  useScrollToTop(); // Scroll to top on component mount
  
  const [, setLocation] = useLocation();
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
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());
  const [incorrectCards, setIncorrectCards] = useState<Set<number>>(new Set());

  // Get study mode from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const studyMode = urlParams.get('mode') || 'all-reviews';
  const resumeSession = urlParams.get('resume') === 'true';

  // Enhanced Japanese audio system
  const playAudio = async (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const getJapaneseVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const premiumVoices = [
          'Google 日本語',
          'Microsoft Ayumi - Japanese (Japan)',
          'Microsoft Haruka - Japanese (Japan)',
          'Google Japanese',
          'Japanese (Japan)'
        ];
        
        for (const preferred of premiumVoices) {
          const voice = voices.find(v => 
            v.name.includes(preferred.split(' ')[0]) && 
            (v.lang === 'ja-JP' || v.lang === 'ja')
          );
          if (voice) return voice;
        }
        
        return voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
      };
      
      const loadVoicesAndSpeak = () => {
        const selectedVoice = getJapaneseVoice();
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
      };
      
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoicesAndSpeak, { once: true });
        window.speechSynthesis.getVoices();
      } else {
        loadVoicesAndSpeak();
      }
      
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  // Fetch review queue with mode filtering
  const { data: reviewQueue, isLoading, error } = useQuery<ReviewCard[]>({
    queryKey: ["/api/review-queue", studyMode],
    queryFn: async () => {
      const response = await fetch(`/api/review-queue?mode=${studyMode}`);
      if (!response.ok) throw new Error('Failed to fetch review queue');
      return response.json();
    },
    refetchOnWindowFocus: false
  });

  // Start study session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionType: "review",
          mode: studyMode,
          resume: resumeSession
        })
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
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
    }
  });

  // Pause session
  const pauseSessionMutation = useMutation({
    mutationFn: async () => {
      if (!currentSession) return null;
      
      const timeSpentMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
      const response = await fetch(`/api/study-session/${currentSession.id}/pause`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardsReviewed: sessionStats.cardsReviewed,
          cardsCorrect: sessionStats.cardsCorrect,
          timeSpentMinutes,
          currentCardIndex
        })
      });
      if (!response.ok) throw new Error("Failed to pause session");
      return response.json();
    },
    onSuccess: () => {
      setLocation('/study-mode');
    }
  });

  // Wrap up session (complete only answered cards)
  const wrapUpSessionMutation = useMutation({
    mutationFn: async () => {
      if (!currentSession) return null;
      
      const timeSpentMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
      const response = await fetch(`/api/study-session/${currentSession.id}/wrap-up`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardsReviewed: sessionStats.cardsReviewed,
          cardsCorrect: sessionStats.cardsCorrect,
          timeSpentMinutes,
          incorrectCardIds: Array.from(incorrectCards)
        })
      });
      if (!response.ok) throw new Error("Failed to wrap up session");
      return response.json();
    }
  });

  // Cancel session
  const cancelSessionMutation = useMutation({
    mutationFn: async () => {
      if (!currentSession) return null;
      
      const response = await fetch(`/api/study-session/${currentSession.id}/cancel`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to cancel session");
      return response.json();
    },
    onSuccess: () => {
      setLocation('/study-mode');
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
          timeSpentMinutes,
          status: 'completed'
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

    // Track answered and incorrect cards
    setAnsweredCards(prev => new Set(prev).add(currentCardIndex));
    if (!wasCorrect) {
      setIncorrectCards(prev => new Set(prev).add(currentCardIndex));
    }

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
      window.scrollTo(0, 0); // Scroll to top for next card
    } else {
      // Session complete
      completeSessionMutation.mutate();
    }
  };

  // Vocabulary highlighting function
  const highlightVocabulary = (text: string, vocabulary: string[]) => {
    if (!vocabulary || vocabulary.length === 0) return text;
    
    let highlightedText = text;
    vocabulary.forEach(vocab => {
      if (vocab && vocab.trim()) {
        const regex = new RegExp(`(${vocab})`, 'g');
        highlightedText = highlightedText.replace(
          regex, 
          `<span class="bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-blue-100 px-1 rounded font-bold border-2 border-blue-400 dark:border-blue-300">$1</span>`
        );
      }
    });
    
    return highlightedText;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load review queue</h2>
          <p className="text-gray-600 dark:text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!reviewQueue || reviewQueue.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={() => setLocation('/study-mode')}
              className="text-lg"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          </div>

          <div className="text-center py-16">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">All caught up!</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              No cards are due for review right now. Great job on staying consistent!
            </p>
            <Button 
              size="lg"
              onClick={() => setLocation('/study-mode')}
            >
              Back to Study Mode
            </Button>
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
      <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <Star className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Session Complete!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-3xl font-bold text-primary">{sessionStats.cardsReviewed}</div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Cards Reviewed</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Accuracy</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-3xl font-bold text-purple-600">{timeSpent}</div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Minutes</div>
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg"
              onClick={() => setLocation('/study-mode')}
            >
              Back to Study Mode
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = reviewQueue[currentCardIndex];
  const progress = ((currentCardIndex + 1) / reviewQueue.length) * 100;

  // Register color coding
  const registerColors: Record<string, string> = {
    polite: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    casual: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    anime: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    workplace: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with session controls */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back button */}
          <Button
            variant="outline"
            onClick={() => setLocation('/study-mode')}
            className="text-lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back
          </Button>

          {/* Progress */}
          <div className="text-center flex-1 mx-8">
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Card {currentCardIndex + 1} of {reviewQueue.length}
            </div>
            <Progress value={progress} className="w-96 mx-auto h-3" />
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {sessionStats.cardsCorrect}/{sessionStats.cardsReviewed} correct
            </div>
          </div>
          
          {/* Session controls */}
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause Study Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your progress will be saved and you can resume later from where you left off.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Studying</AlertDialogCancel>
                  <AlertDialogAction onClick={() => pauseSessionMutation.mutate()}>
                    Pause Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Wrap Up
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Wrap Up Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will complete your session with the cards you've already reviewed. 
                    Incorrect answers will be scheduled for review again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Studying</AlertDialogCancel>
                  <AlertDialogAction onClick={() => wrapUpSessionMutation.mutate()}>
                    Wrap Up Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Study Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel your current session and discard all progress. 
                    Your SRS reviews will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Studying</AlertDialogCancel>
                  <AlertDialogAction onClick={() => cancelSessionMutation.mutate()}>
                    Cancel Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={registerColors[currentCard.sentenceCard.register] || "bg-gray-100 text-gray-800"}>
                    {currentCard.sentenceCard.register}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {currentCard.sentenceCard.jlptLevel}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {currentCard.sentenceCard.theme}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReading(!showReading)}
                    className="text-lg"
                  >
                    {showReading ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    Reading
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => playAudio(currentCard.sentenceCard.japanese)}
                    title="Play Japanese audio"
                    className="text-lg"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Japanese Sentence with highlighted vocabulary */}
              <div className="py-8 text-center">
                <div 
                  className="japanese-text text-4xl leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightVocabulary(currentCard.sentenceCard.japanese, currentCard.sentenceCard.vocabulary)
                  }}
                />
                {showReading && (
                  <div className="japanese-text text-xl text-gray-600 dark:text-gray-400 mt-4">
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
                    className="text-xl px-12 py-4"
                  >
                    Show Answer
                  </Button>
                </div>
              )}

              {/* Answer Section */}
              {showAnswer && (
                <div className="space-y-8">
                  {/* English Translation */}
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl text-gray-900 dark:text-white">
                      {currentCard.sentenceCard.english}
                    </div>
                  </div>

                  {/* Key Vocabulary */}
                  {currentCard.sentenceCard.vocabulary && currentCard.sentenceCard.vocabulary.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Key Vocabulary:</h3>
                      <div className="flex flex-wrap gap-3">
                        {currentCard.sentenceCard.vocabulary.map((vocab, index) => (
                          <Badge key={index} className="bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100 text-lg px-3 py-1">
                            {vocab}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grammar Points */}
                  {currentCard.sentenceCard.grammarPoints && currentCard.sentenceCard.grammarPoints.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Grammar Points:</h3>
                      <div className="flex flex-wrap gap-3">
                        {currentCard.sentenceCard.grammarPoints.map((point, index) => (
                          <Badge key={index} variant="secondary" className="text-lg px-3 py-1">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cultural Notes */}
                  {currentCard.sentenceCard.culturalNotes && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Cultural Notes:</h3>
                      <p className="text-blue-800 dark:text-blue-300">{currentCard.sentenceCard.culturalNotes}</p>
                    </div>
                  )}

                  {/* Answer Buttons - Simplified to Correct/Incorrect */}
                  <div className="flex justify-center gap-6 pt-6">
                    <Button
                      onClick={() => handleAnswer(0)}
                      variant="destructive"
                      size="lg"
                      className="text-xl px-12 py-6"
                    >
                      <XCircle className="mr-3 h-6 w-6" />
                      Incorrect
                    </Button>
                    <Button
                      onClick={() => handleAnswer(4)}
                      className="bg-green-500 hover:bg-green-600 text-white text-xl px-12 py-6"
                    >
                      <CheckCircle className="mr-3 h-6 w-6" />
                      Correct
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}