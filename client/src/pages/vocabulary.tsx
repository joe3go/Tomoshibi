import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WordCard } from '@/components/word-card';
import { AddWordModal, FloatingAddButton } from '@/components/add-word-modal';
import { ReviewMode } from '@/components/review-mode';
import { VocabStats } from '@/components/vocab-stats';
import { VocabWord, SRS_LEVEL_NAMES, SRSLevel } from '@/types/vocab';
import { VocabStorage } from '@/lib/vocab-storage';
import { Search, Filter, Play, BarChart3, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Vocabulary() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<VocabWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [words, searchQuery, selectedLevel, selectedTag]);

  const loadWords = () => {
    const loadedWords = VocabStorage.getVocabWords();
    setWords(loadedWords);
  };

  const filterWords = () => {
    let filtered = words;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(word =>
        word.kanji.toLowerCase().includes(query) ||
        word.furigana.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query) ||
        word.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // SRS Level filter
    if (selectedLevel !== 'all') {
      const level = parseInt(selectedLevel);
      filtered = filtered.filter(word => word.srsLevel === level);
    }

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(word => word.tags.includes(selectedTag));
    }

    setFilteredWords(filtered);
  };

  const handleWordUpdate = (updatedWord: VocabWord) => {
    setWords(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
  };

  const handleWordDelete = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const handleWordAdded = (newWord: VocabWord) => {
    setWords(prev => [...prev, newWord]);
  };

  const handleLoadDemo = () => {
    const demoWords = VocabStorage.loadDemoWords();
    setWords(prev => [...prev, ...demoWords]);
    toast({
      title: "Demo words loaded",
      description: `Added ${demoWords.length} sample words to try out the features.`,
    });
  };

  const handleClearDemo = () => {
    VocabStorage.clearDemoWords();
    loadWords();
    toast({
      title: "Demo words cleared",
      description: "All demo words have been removed.",
    });
  };

  const startReview = () => {
    const wordsToReview = VocabStorage.getWordsDueForReview();
    if (wordsToReview.length === 0) {
      toast({
        title: "No words to review",
        description: "All your words are up to date! Great job!",
      });
      return;
    }
    setShowReviewMode(true);
  };

  const allTags = Array.from(new Set(words.flatMap(word => word.tags))).sort();
  const wordsToReview = VocabStorage.getWordsDueForReview();

  if (showReviewMode) {
    return <ReviewMode onExit={() => setShowReviewMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vocabulary</h1>
            <p className="text-sm text-muted-foreground">
              {words.length} words • {wordsToReview.length} due for review
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Stats
            </Button>
            
            {wordsToReview.length > 0 && (
              <Button
                onClick={startReview}
                className="flex items-center gap-2 bg-primary"
              >
                <Play className="h-4 w-4" />
                Review Now ({wordsToReview.length})
              </Button>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <VocabStats words={words} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Section */}
        {words.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-4"
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-foreground">No vocabulary words yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start building your Japanese vocabulary collection. You can add words manually or try our demo to see how it works.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleLoadDemo} variant="outline">
                <Shuffle className="h-4 w-4 mr-2" />
                Try Demo (5 words)
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Word
              </Button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {words.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search words, meanings, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="SRS Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {Object.entries(SRS_LEVEL_NAMES).map(([level, name]) => (
                  <SelectItem key={level} value={level}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {allTags.length > 0 && (
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Demo Controls */}
        {words.some(w => w.isDemo) && (
          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-400 border-blue-400">Demo Mode</Badge>
              <span className="text-sm text-muted-foreground">
                You have demo words loaded. These are just for testing.
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearDemo}>
              Clear Demo
            </Button>
          </div>
        )}

        {/* Word Grid */}
        {filteredWords.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filteredWords.map((word) => (
                <WordCard
                  key={word.id}
                  word={word}
                  onUpdate={handleWordUpdate}
                  onDelete={handleWordDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : words.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No words found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : null}
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setShowAddModal(true)} />

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onWordAdded={handleWordAdded}
      />
    </div>
  );
}