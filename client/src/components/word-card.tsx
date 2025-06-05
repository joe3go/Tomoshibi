import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VocabWord, SRS_LEVEL_COLORS, SRS_LEVEL_NAMES, SRSLevel } from '@/types/vocab';
import { VocabStorage } from '@/lib/vocab-storage';
import { Edit2, Trash2, ChevronUp, ChevronDown, Check, X, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WordCardProps {
  word: VocabWord;
  onUpdate?: (word: VocabWord) => void;
  onDelete?: (id: string) => void;
  showReviewButtons?: boolean;
  onReview?: (id: string, correct: boolean) => void;
  className?: string;
}

export function WordCard({
  word,
  onUpdate,
  onDelete,
  showReviewButtons = false,
  onReview,
  className = "",
}: WordCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    kanji: word.kanji,
    furigana: word.furigana,
    meaning: word.meaning,
    tags: word.tags.join(', '),
  });
  const { toast } = useToast();

  const handleSave = () => {
    const updatedWord = VocabStorage.updateWord(word.id, {
      kanji: editForm.kanji,
      furigana: editForm.furigana,
      meaning: editForm.meaning,
      tags: editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });

    if (updatedWord) {
      onUpdate?.(updatedWord);
      setIsEditing(false);
      toast({
        title: "Word updated",
        description: "Your changes have been saved successfully.",
      });
    }
  };

  const handleCancel = () => {
    setEditForm({
      kanji: word.kanji,
      furigana: word.furigana,
      meaning: word.meaning,
      tags: word.tags.join(', '),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      VocabStorage.deleteWord(word.id);
      onDelete?.(word.id);
      toast({
        title: "Word deleted",
        description: "The word has been removed from your collection.",
        variant: "destructive",
      });
    }
  };

  const handleSrsLevelChange = (increase: boolean) => {
    const newLevel = increase 
      ? Math.min(5, word.srsLevel + 1) 
      : Math.max(0, word.srsLevel - 1);
    
    const updatedWord = VocabStorage.updateWord(word.id, { srsLevel: newLevel as SRSLevel });
    if (updatedWord) {
      onUpdate?.(updatedWord);
      toast({
        title: `SRS level ${increase ? 'increased' : 'decreased'}`,
        description: `Word is now at ${SRS_LEVEL_NAMES[newLevel as SRSLevel]} level.`,
      });
    }
  };

  const handleReview = (correct: boolean) => {
    onReview?.(word.id, correct);
    
    const action = correct ? 'correct' : 'incorrect';
    toast({
      title: `Marked as ${action}`,
      description: correct 
        ? "Great job! SRS level increased." 
        : "Don't worry, practice makes perfect!",
    });
  };

  const formatNextReview = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return "Due now";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      <Card className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-200">
        <div className="space-y-3">
          {/* Header with SRS Badge and Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                className={`text-xs px-2 py-1 ${SRS_LEVEL_COLORS[word.srsLevel as SRSLevel]}`}
              >
                {SRS_LEVEL_NAMES[word.srsLevel as SRSLevel]}
              </Badge>
              {word.isDemo && (
                <Badge variant="outline" className="text-xs">
                  Demo
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatNextReview(word.nextReviewAt)}
              </span>
            </div>
            
            {!showReviewButtons && (
              <div className="flex items-center gap-1">
                {!isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Word Content */}
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editForm.kanji}
                  onChange={(e) => setEditForm({ ...editForm, kanji: e.target.value })}
                  placeholder="Kanji"
                  className="text-lg font-bold"
                />
                <Input
                  value={editForm.furigana}
                  onChange={(e) => setEditForm({ ...editForm, furigana: e.target.value })}
                  placeholder="Furigana"
                  className="text-sm"
                />
                <Input
                  value={editForm.meaning}
                  onChange={(e) => setEditForm({ ...editForm, meaning: e.target.value })}
                  placeholder="English meaning"
                  className="text-sm"
                />
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="Tags (comma separated)"
                  className="text-xs"
                />
              </div>
            ) : (
              <>
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {word.kanji}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground mb-2">
                    {word.furigana}
                  </div>
                  <div className="text-sm sm:text-base text-foreground">
                    {word.meaning}
                  </div>
                </div>

                {/* Tags */}
                {word.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {word.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>✓ {word.correctCount}</span>
                  <span>✗ {word.incorrectCount}</span>
                  <span>
                    {word.correctCount + word.incorrectCount > 0
                      ? `${Math.round((word.correctCount / (word.correctCount + word.incorrectCount)) * 100)}%`
                      : 'New'
                    }
                  </span>
                </div>
              </>
            )}
          </div>

          {/* SRS Level Controls */}
          {!isEditing && !showReviewButtons && (
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSrsLevelChange(false)}
                disabled={word.srsLevel === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Level {word.srsLevel}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSrsLevelChange(true)}
                disabled={word.srsLevel === 5}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Review Buttons */}
          {showReviewButtons && (
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReview(false)}
                className="flex-1"
              >
                I Forgot
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleReview(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                I Remember
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}