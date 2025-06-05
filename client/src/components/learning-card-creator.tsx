import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Save, 
  X,
  BookOpen,
  Target
} from 'lucide-react';
import { LearningCard, ContextSentence } from '@shared/learning-schema';
import { addLearningCard } from '@/lib/learning-storage';

interface LearningCardCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: (card: LearningCard) => void;
}

export function LearningCardCreator({ isOpen, onClose, onCardCreated }: LearningCardCreatorProps) {
  const [vocab, setVocab] = useState('');
  const [reading, setReading] = useState('');
  const [type, setType] = useState('');
  const [meaning, setMeaning] = useState('');
  const [grammar, setGrammar] = useState('');
  const [prompt, setPrompt] = useState('');
  const [hintAnswer, setHintAnswer] = useState('');
  const [contextSentences, setContextSentences] = useState<ContextSentence[]>([
    { japanese: '', english: '', difficulty: 'easy' },
    { japanese: '', english: '', difficulty: 'medium' },
    { japanese: '', english: '', difficulty: 'hard' }
  ]);

  const resetForm = () => {
    setVocab('');
    setReading('');
    setType('');
    setMeaning('');
    setGrammar('');
    setPrompt('');
    setHintAnswer('');
    setContextSentences([
      { japanese: '', english: '', difficulty: 'easy' },
      { japanese: '', english: '', difficulty: 'medium' },
      { japanese: '', english: '', difficulty: 'hard' }
    ]);
  };

  const handleSave = () => {
    if (!vocab.trim() || !meaning.trim() || !prompt.trim()) {
      return;
    }

    const validSentences = contextSentences.filter(s => s.japanese.trim() && s.english.trim());
    if (validSentences.length === 0) {
      return;
    }

    const newCard: LearningCard = {
      id: `${vocab.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      vocab: vocab.trim(),
      reading: reading.trim() || undefined,
      type: type.trim() || 'word',
      meaning: meaning.trim(),
      grammar: grammar.trim() || undefined,
      prompt: prompt.trim(),
      hintAnswer: hintAnswer.trim() || undefined,
      contextSentences: validSentences,
      srsLevel: 0,
      tags: []
    };

    addLearningCard(newCard);
    onCardCreated(newCard);
    resetForm();
    onClose();
  };

  const updateContextSentence = (index: number, field: keyof ContextSentence, value: string) => {
    const updated = [...contextSentences];
    updated[index] = { ...updated[index], [field]: value };
    setContextSentences(updated);
  };

  const addContextSentence = () => {
    setContextSentences([...contextSentences, { japanese: '', english: '', difficulty: 'easy' }]);
  };

  const removeContextSentence = (index: number) => {
    if (contextSentences.length > 1) {
      setContextSentences(contextSentences.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-6 bg-card border-border">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Create Learning Card</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Vocabulary *</label>
                  <Input 
                    value={vocab}
                    onChange={(e) => setVocab(e.target.value)}
                    placeholder="e.g., 習う"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reading</label>
                  <Input 
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder="e.g., ならう"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Type</label>
                  <Input 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g., godan verb, i-adjective"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Grammar Pattern</label>
                  <Input 
                    value={grammar}
                    onChange={(e) => setGrammar(e.target.value)}
                    placeholder="e.g., 〜を習う"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Meaning *</label>
                <Input 
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  placeholder="e.g., to learn, to study"
                />
              </div>
            </div>

            <Separator />

            {/* Context Sentences */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Context Sentences</h3>
                <Button variant="outline" size="sm" onClick={addContextSentence}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Sentence
                </Button>
              </div>

              <div className="space-y-4">
                {contextSentences.map((sentence, index) => (
                  <Card key={index} className="p-4 bg-background/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={
                          sentence.difficulty === 'easy' ? 'default' : 
                          sentence.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {sentence.difficulty}
                        </Badge>
                        {contextSentences.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeContextSentence(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Input 
                          value={sentence.japanese}
                          onChange={(e) => updateContextSentence(index, 'japanese', e.target.value)}
                          placeholder="Japanese sentence"
                        />
                        <Input 
                          value={sentence.english}
                          onChange={(e) => updateContextSentence(index, 'english', e.target.value)}
                          placeholder="English translation"
                        />
                        <select
                          value={sentence.difficulty}
                          onChange={(e) => updateContextSentence(index, 'difficulty', e.target.value as 'easy' | 'medium' | 'hard')}
                          className="w-full p-2 rounded border bg-background text-foreground"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Practice Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Practice Setup</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Practice Prompt *</label>
                <Textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Write a sentence about something you want to learn using 習う."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Hint Answer</label>
                <Input 
                  value={hintAnswer}
                  onChange={(e) => setHintAnswer(e.target.value)}
                  placeholder="e.g., 私は料理を習いたいです。"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!vocab.trim() || !meaning.trim() || !prompt.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Create Card
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}