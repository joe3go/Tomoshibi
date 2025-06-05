import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { VocabWord, SRSLevel } from '@/types/vocab';
import { VocabStorage } from '@/lib/vocab-storage';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordAdded?: (word: VocabWord) => void;
}

export function AddWordModal({ isOpen, onClose, onWordAdded }: AddWordModalProps) {
  const [form, setForm] = useState({
    kanji: '',
    furigana: '',
    meaning: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kanji.trim() || !form.meaning.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please enter at least the kanji and meaning.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newWord = VocabStorage.addWord({
        kanji: form.kanji.trim(),
        furigana: form.furigana.trim(),
        meaning: form.meaning.trim(),
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        srsLevel: 0 as SRSLevel,
        nextReviewAt: Date.now(), // Available for immediate review
      });

      onWordAdded?.(newWord);
      setForm({ kanji: '', furigana: '', meaning: '', tags: '' });
      onClose();
      
      toast({
        title: "Word added successfully",
        description: `${newWord.kanji} has been added to your vocabulary.`,
      });
    } catch (error) {
      toast({
        title: "Error adding word",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ kanji: '', furigana: '', meaning: '', tags: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="p-6 bg-card/95 backdrop-blur-sm border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Add New Word</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kanji" className="text-sm font-medium">
                    Kanji <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="kanji"
                    value={form.kanji}
                    onChange={(e) => setForm({ ...form, kanji: e.target.value })}
                    placeholder="漢字"
                    className="text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="furigana" className="text-sm font-medium">
                    Furigana
                  </Label>
                  <Input
                    id="furigana"
                    value={form.furigana}
                    onChange={(e) => setForm({ ...form, furigana: e.target.value })}
                    placeholder="かんじ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meaning" className="text-sm font-medium">
                    English Meaning <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="meaning"
                    value={form.meaning}
                    onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                    placeholder="Chinese characters"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="N5, grammar, verbs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Word"}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <motion.div
      className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 border border-primary/20"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}