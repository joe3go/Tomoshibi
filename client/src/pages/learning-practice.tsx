import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Plus, 
  BarChart3, 
  Target,
  RefreshCw,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { LearningCard } from '@/components/learning-card';
import { LearningCardCreator } from '@/components/learning-card-creator';
import { LearningCard as LearningCardType } from '@shared/learning-schema';
import { sampleLearningCards } from '@shared/learning-schema';
import { 
  loadLearningCards, 
  saveLearningCards, 
  getStudyStats,
  addLearningCard
} from '@/lib/learning-storage';

export default function LearningPractice() {
  const [cards, setCards] = useState<LearningCardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const storedCards = loadLearningCards();
    if (storedCards.length === 0) {
      // Load sample cards if none exist
      saveLearningCards(sampleLearningCards);
      setCards(sampleLearningCards);
    } else {
      setCards(storedCards);
    }
    
    updateStats();
  }, []);

  const updateStats = () => {
    const currentStats = getStudyStats();
    setStats(currentStats);
  };

  const handleCardComplete = (cardId: string) => {
    setCompletedCards(prev => new Set([...Array.from(prev), cardId]));
    updateStats();
    
    // Auto-advance to next card
    if (currentCardIndex < cards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 1000);
    }
  };

  const resetProgress = () => {
    setCompletedCards(new Set());
    setCurrentCardIndex(0);
  };

  const loadDemoCards = () => {
    saveLearningCards(sampleLearningCards);
    setCards(sampleLearningCards);
    setCompletedCards(new Set());
    setCurrentCardIndex(0);
    updateStats();
  };

  const handleCardCreated = (newCard: LearningCardType) => {
    const updatedCards = loadLearningCards();
    setCards(updatedCards);
    updateStats();
  };

  const currentCard = cards[currentCardIndex];
  const progressPercentage = cards.length > 0 ? (completedCards.size / cards.length) * 100 : 0;

  if (cards.length === 0) {
    return (
      <div className="px-4 py-6 space-y-6 h-full overflow-y-auto">
        <Card className="p-8 text-center bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="text-6xl">📚</div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Start Learning</h2>
              <p className="text-muted-foreground mb-6">
                Begin your Japanese learning journey with interactive practice cards
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={loadDemoCards} variant="outline" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Load Demo Cards
              </Button>
              <Button onClick={() => setShowCreator(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your Own Card
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 h-full overflow-y-auto">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Learning Practice</h1>
            <p className="text-muted-foreground">
              Card {currentCardIndex + 1} of {cards.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetProgress}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">
                {completedCards.size}/{cards.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-400" />
                {completedCards.size} completed
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-orange-400" />
                {cards.length - completedCards.size} remaining
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-4 bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">Study Statistics</h3>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalCards}</div>
                <div className="text-xs text-muted-foreground">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.totalOutputs}</div>
                <div className="text-xs text-muted-foreground">Practice Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.uniqueVocabPracticed}</div>
                <div className="text-xs text-muted-foreground">Vocab Practiced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {stats.averageSRSLevel.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Avg SRS Level</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Card Navigation */}
      {cards.length > 1 && (
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
              disabled={currentCardIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCardIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentCardIndex 
                      ? 'bg-primary' 
                      : completedCards.has(cards[index].id)
                      ? 'bg-green-400'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentCardIndex(Math.min(cards.length - 1, currentCardIndex + 1))}
              disabled={currentCardIndex === cards.length - 1}
            >
              Next
            </Button>
          </div>
        </Card>
      )}

      {/* Current Learning Card */}
      {currentCard && (
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <LearningCard 
            card={currentCard}
            onComplete={handleCardComplete}
          />
        </motion.div>
      )}

      {/* Completion Message */}
      {completedCards.size === cards.length && cards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <Card className="p-8 text-center bg-card border-primary/20 max-w-md">
            <div className="space-y-4">
              <Trophy className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Congratulations!</h2>
                <p className="text-muted-foreground mb-4">
                  You've completed all learning cards in this session.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={resetProgress} variant="outline">
                  Practice Again
                </Button>
                <Button onClick={() => setCompletedCards(new Set())}>
                  Continue Learning
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Learning Card Creator Modal */}
      <LearningCardCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onCardCreated={handleCardCreated}
      />

      {/* Add New Card Button */}
      {cards.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setShowCreator(true)}
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}