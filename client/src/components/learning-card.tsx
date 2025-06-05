import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Mic, 
  MicOff, 
  Lightbulb, 
  Save, 
  Volume2,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { LearningCard as LearningCardType, UserOutput } from '@shared/learning-schema';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { 
  saveUserOutput, 
  getUserOutputsForVocab, 
  updateSRSLevel 
} from '@/lib/learning-storage';

interface LearningCardProps {
  card: LearningCardType;
  onComplete?: (cardId: string) => void;
  className?: string;
}

export function LearningCard({ card, onComplete, className = "" }: LearningCardProps) {
  const [textInput, setTextInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showPreviousOutputs, setShowPreviousOutputs] = useState(false);
  const [previousOutputs, setPreviousOutputs] = useState<UserOutput[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const {
    transcript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition();

  useEffect(() => {
    const outputs = getUserOutputsForVocab(card.id);
    setPreviousOutputs(outputs);
  }, [card.id]);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  const handleSaveOutput = () => {
    if (!textInput.trim() && !transcript.trim()) return;

    const output: UserOutput = {
      vocabId: card.id,
      textOutput: textInput.trim(),
      spokenOutput: transcript.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    saveUserOutput(output);
    
    // Update SRS level on successful practice
    updateSRSLevel(card.id, card.srsLevel + 1);
    
    // Refresh previous outputs
    const updatedOutputs = getUserOutputsForVocab(card.id);
    setPreviousOutputs(updatedOutputs);
    
    // Reset inputs
    setTextInput('');
    resetTranscript();
    
    // Notify completion
    onComplete?.(card.id);
  };

  const playAudio = (text: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    try {
      // Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const highlightVocab = (sentence: string) => {
    const vocabBase = card.vocab.replace(/[ます|る|う|く|ぐ|す|つ|ぬ|ぶ|む|ゆ]$/, '');
    const regex = new RegExp(`(${card.vocab}|${vocabBase})`, 'g');
    
    return sentence.split(regex).map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-pink-500/20 text-pink-300 font-semibold px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">{card.vocab}</h2>
                {card.reading && (
                  <span className="text-lg text-muted-foreground">({card.reading})</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playAudio(card.vocab)}
                  className="h-8 w-8 p-0"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {card.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  SRS Level {card.srsLevel}
                </Badge>
              </div>
              <p className="text-foreground font-medium">{card.meaning}</p>
              {card.grammar && (
                <p className="text-sm text-muted-foreground">Grammar: {card.grammar}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Input Section - Context Sentences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Context Examples</h3>
            <div className="space-y-3">
              {card.contextSentences.map((sentence, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="p-4 bg-background/30 hover:bg-background/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <p className="text-base text-foreground leading-relaxed">
                          {highlightVocab(sentence.japanese)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sentence.english}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={sentence.difficulty === 'easy' ? 'default' : 
                                 sentence.difficulty === 'medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {sentence.difficulty}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(sentence.japanese)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Output Practice Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Practice Output</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {showHint ? 'Hide' : 'Show'} Hint
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {card.prompt}
            </p>

            <AnimatePresence>
              {showHint && card.hintAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/10 border border-primary/20 p-3 rounded-lg"
                >
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Hint: </span>
                    {card.hintAnswer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Write your sentence:
              </label>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="日本語で文を書いてください..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Voice Input */}
            {speechSupported && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Voice input:
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    onClick={isListening ? stopListening : startListening}
                    className="flex items-center gap-2"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? 'Stop' : 'Start'} Recording
                  </Button>
                  {transcript && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetTranscript}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
                {transcript && (
                  <div className="bg-background/50 p-3 rounded-lg border">
                    <p className="text-sm text-foreground">{transcript}</p>
                  </div>
                )}
                {speechError && (
                  <p className="text-sm text-destructive">Error: {speechError}</p>
                )}
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSaveOutput}
              disabled={!textInput.trim() && !transcript.trim()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Practice
            </Button>
          </div>

          {/* Previous Outputs */}
          {previousOutputs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  Your Previous Practice ({previousOutputs.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviousOutputs(!showPreviousOutputs)}
                >
                  {showPreviousOutputs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <AnimatePresence>
                {showPreviousOutputs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {previousOutputs.slice(0, 3).map((output, index) => (
                      <Card key={index} className="p-3 bg-background/20">
                        <div className="space-y-2">
                          {output.textOutput && (
                            <p className="text-sm text-foreground">{output.textOutput}</p>
                          )}
                          {output.spokenOutput && (
                            <p className="text-xs text-muted-foreground">
                              Spoken: {output.spokenOutput}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(output.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}