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
  RotateCcw,
  Pause,
  AlertCircle
} from 'lucide-react';
import { LearningCard as LearningCardType, UserOutput } from '@shared/learning-schema';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { SavedResponses } from '@/components/saved-responses';
import { 
  saveUserOutput, 
  getUserOutputsForVocab, 
  updateSRSLevel 
} from '@/lib/learning-storage';
import {
  createHighlightedSentence,
  checkVocabUsage,
  saveUserResponse,
  audioManager,
  isMobileDevice
} from '@/lib/vocab-utils';

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
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [refreshResponses, setRefreshResponses] = useState(0);

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
  }, [card.id, refreshResponses]);

  useEffect(() => {
    return () => {
      audioManager.stopAudio();
    };
  }, []);

  const handleSaveOutput = () => {
    const inputToCheck = textInput.trim() || transcript.trim();
    if (!inputToCheck) return;

    // Check if vocabulary is used correctly
    const feedbackResult = checkVocabUsage(inputToCheck, card.vocab);
    setFeedback(feedbackResult);

    if (feedbackResult.isCorrect) {
      // Save to both systems for compatibility
      const output: UserOutput = {
        vocabId: card.id,
        textOutput: textInput.trim(),
        spokenOutput: transcript.trim() || undefined,
        timestamp: new Date().toISOString(),
      };

      saveUserOutput(output);
      saveUserResponse(card.vocab, inputToCheck);
      
      // Update SRS level on successful practice
      updateSRSLevel(card.id, card.srsLevel + 1);
      
      // Reset inputs
      setTextInput('');
      resetTranscript();
      
      // Refresh saved responses
      setRefreshResponses(prev => prev + 1);
      
      // Clear feedback after success
      setTimeout(() => setFeedback(null), 3000);
      
      // Notify completion
      onComplete?.(card.id);
    }
  };

  const playAudio = async (text: string, id: string) => {
    if (playingAudioId === id) {
      // Stop if currently playing this audio
      audioManager.stopAudio();
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(id);
      await audioManager.playText(text, {
        lang: 'ja-JP',
        rate: 0.8,
        onStart: () => setPlayingAudioId(id),
        onEnd: () => setPlayingAudioId(null),
        onError: (error) => {
          console.error('Audio playback error:', error);
          setPlayingAudioId(null);
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      setPlayingAudioId(null);
    }
  };

  const renderHighlightedSentence = (sentence: string) => {
    const parts = createHighlightedSentence(sentence, card.vocab);
    
    if (typeof parts === 'string') {
      return <span className="context-sentence">{parts}</span>;
    }
    
    return (
      <span className="context-sentence">
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            return part;
          }
          return (
            <span key={index}>
              {part.highlighted && (
                <span className="vocab-highlight">{part.highlighted}</span>
              )}
              {part.remaining}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-container ${className}`}
    >
      <Card className="p-4 md:p-6 bg-card/50 backdrop-blur-sm border-border/50">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <h2 className="vocab-title text-xl md:text-2xl font-bold text-foreground">{card.vocab}</h2>
                {card.reading && (
                  <span className="text-base md:text-lg text-muted-foreground">({card.reading})</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playAudio(card.vocab, `vocab-${card.id}`)}
                  className={`h-8 w-8 p-0 mobile-button audio-button ${
                    playingAudioId === `vocab-${card.id}` ? 'playing' : ''
                  }`}
                >
                  {playingAudioId === `vocab-${card.id}` ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
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
                  <Card className="p-3 md:p-4 bg-background/30 hover:bg-background/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 md:gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="text-sm md:text-base text-foreground leading-relaxed">
                          {renderHighlightedSentence(sentence.japanese)}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {sentence.english}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
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
                          onClick={() => playAudio(sentence.japanese, `sentence-${index}`)}
                          className={`h-8 w-8 p-0 mobile-button audio-button transition-opacity ${
                            isMobileDevice() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          } ${playingAudioId === `sentence-${index}` ? 'playing' : ''}`}
                        >
                          {playingAudioId === `sentence-${index}` ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
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

            {/* Feedback Display */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg border ${
                    feedback.type === 'success' ? 'feedback-success' : 'feedback-error'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {feedback.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium">{feedback.message}</p>
                  </div>
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
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (feedback) setFeedback(null); // Clear feedback on new input
                }}
                placeholder="日本語で文を書いてください..."
                className="min-h-[80px] resize-none input-field"
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
              className="w-full mobile-button"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Practice
            </Button>
          </div>

          {/* Saved Responses Component */}
          <SavedResponses 
            vocabWord={card.vocab}
            onResponseUpdate={() => setRefreshResponses(prev => prev + 1)}
          />
        </div>
      </Card>
    </motion.div>
  );
}