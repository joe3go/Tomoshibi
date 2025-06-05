import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VocabWord } from '@/types/vocab';
import { VocabStorage } from '@/lib/vocab-storage';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewModeProps {
  onExit: () => void;
}

export function ReviewMode({ onExit }: ReviewModeProps) {
  const [reviewWords, setReviewWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const wordsToReview = VocabStorage.getWordsDueForReview();
    setReviewWords(wordsToReview);
    setSessionStats(prev => ({ ...prev, total: wordsToReview.length }));

    if (wordsToReview.length === 0) {
      setIsComplete(true);
    }
  }, []);

  const currentWord = reviewWords[currentIndex];
  const progress = reviewWords.length > 0 ? ((currentIndex + 1) / reviewWords.length) * 100 : 0;

  const handleReview = (correct: boolean) => {
    if (!currentWord) return;

    const updatedWord = VocabStorage.reviewWord(currentWord.id, correct);
    if (updatedWord) {
      setSessionStats(prev => ({
        ...prev,
        correct: correct ? prev.correct + 1 : prev.correct,
        incorrect: !correct ? prev.incorrect + 1 : prev.incorrect,
      }));

      // Update word in our local array
      setReviewWords(prev => 
        prev.map(w => w.id === currentWord.id ? updatedWord : w)
      );

      // Move to next word or complete session
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        setIsComplete(true);
        VocabStorage.markStudiedToday();
      }

      const action = correct ? 'correct' : 'incorrect';
      toast({
        title: `Marked as ${action}`,
        description: correct 
          ? "Great job! SRS level increased." 
          : "Don't worry, practice makes perfect!",
      });
    }
  };

  const handleRestart = () => {
    const wordsToReview = VocabStorage.getWordsDueForReview();
    setReviewWords(wordsToReview);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0, total: wordsToReview.length });
    setIsComplete(false);
  };

  if (isComplete) {
    const successRate = sessionStats.total > 0 
      ? Math.round((sessionStats.correct / sessionStats.total) * 100) 
      : 0;

    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 text-center bg-card/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-foreground">
                {sessionStats.total === 0 ? "All Caught Up!" : "Session Complete!"}
              </h2>
              
              {sessionStats.total > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="text-lg text-muted-foreground">
                      You reviewed <span className="font-bold text-foreground">{sessionStats.total}</span> words
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="text-green-400 font-bold">{sessionStats.correct}</div>
                        <div className="text-muted-foreground">Correct</div>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <div className="text-red-400 font-bold">{sessionStats.incorrect}</div>
                        <div className="text-muted-foreground">Incorrect</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {successRate}% Success Rate
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-lg text-muted-foreground">
                  No words are due for review right now. Great job staying on top of your studies!
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={onExit} className="flex-1">
                  Back to Dashboard
                </Button>
                {sessionStats.total > 0 && (
                  <Button onClick={handleRestart} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Review Again
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading review session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Review
            </Button>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} of {reviewWords.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Review Card */}
      <div className="p-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Question Card */}
              <Card className="p-8 text-center bg-card/50 backdrop-blur-sm min-h-[300px] flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-foreground mb-4">
                    {currentWord.kanji}
                  </div>
                  
                  {!showAnswer ? (
                    <Button 
                      onClick={() => setShowAnswer(true)}
                      className="w-full"
                      size="lg"
                    >
                      Show Answer
                    </Button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-lg text-muted-foreground">
                        {currentWord.furigana}
                      </div>
                      <div className="text-xl text-foreground">
                        {currentWord.meaning}
                      </div>
                      
                      {currentWord.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {currentWord.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-secondary/50 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </Card>

              {/* Review Buttons */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => handleReview(false)}
                    className="flex-1"
                  >
                    I Forgot
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleReview(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    I Remember
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Session Stats */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-green-400 font-bold">{sessionStats.correct}</div>
              <div>Correct</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-bold">{sessionStats.incorrect}</div>
              <div>Incorrect</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}