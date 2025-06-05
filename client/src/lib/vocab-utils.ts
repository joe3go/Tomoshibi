/**
 * Utility functions for vocabulary highlighting, feedback, and audio playback
 */

// Vocabulary highlighting functionality
export function highlightVocabInSentence(sentence: string, vocabWord: string): string {
  if (!sentence || !vocabWord) return sentence;
  
  // Create multiple patterns to catch different forms of the word
  const baseWord = vocabWord.replace(/[ます|る|う|く|ぐ|す|つ|ぬ|ぶ|む|ゆ|い|な]$/, '');
  const patterns = [
    vocabWord,
    baseWord,
    // Add common conjugation patterns
    `${baseWord}る`,
    `${baseWord}う`,
    `${baseWord}い`,
    `${baseWord}ます`,
    `${baseWord}た`,
  ].filter(p => p.length > 0);
  
  const escapedPatterns = patterns.map(p => 
    p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  );
  
  const regex = new RegExp(`(${escapedPatterns.join('|')})`, 'gi');
  
  return sentence.replace(regex, '<span class="vocab-highlight">$1</span>');
}

// React component version for safe HTML rendering
export function createHighlightedSentence(sentence: string, vocabWord: string) {
  if (!sentence || !vocabWord) return sentence;
  
  const baseWord = vocabWord.replace(/[ます|る|う|く|ぐ|す|つ|ぬ|ぶ|む|ゆ|い|な]$/, '');
  const patterns = [vocabWord, baseWord].filter(p => p.length > 0);
  
  let result = sentence;
  patterns.forEach(pattern => {
    const regex = new RegExp(`(${pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '|||HIGHLIGHT_START|||$1|||HIGHLIGHT_END|||');
  });
  
  return result.split('|||HIGHLIGHT_START|||').map((part, index) => {
    if (index === 0) return part;
    const [highlighted, ...rest] = part.split('|||HIGHLIGHT_END|||');
    return { highlighted, remaining: rest.join('|||HIGHLIGHT_END|||') };
  });
}

// Feedback mechanism for user input validation
export function checkVocabUsage(inputText: string, vocabWord: string): {
  isCorrect: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
} {
  if (!inputText.trim()) {
    return {
      isCorrect: false,
      message: 'Please enter a sentence to practice.',
      type: 'warning'
    };
  }
  
  const baseWord = vocabWord.replace(/[ます|る|う|く|ぐ|す|つ|ぬ|ぶ|む|ゆ|い|な]$/, '');
  const patterns = [vocabWord, baseWord];
  
  const hasVocab = patterns.some(pattern => 
    inputText.includes(pattern) || inputText.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (hasVocab) {
    return {
      isCorrect: true,
      message: 'Great! You used the vocabulary word correctly.',
      type: 'success'
    };
  } else {
    return {
      isCorrect: false,
      message: `Try to include "${vocabWord}" in your sentence.`,
      type: 'error'
    };
  }
}

// Saved responses management with localStorage
export interface SavedResponse {
  id: string;
  sentence: string;
  timestamp: string;
  vocabWord: string;
}

export function saveUserResponse(vocabWord: string, sentence: string): void {
  const key = `${vocabWord}-responses`;
  const responses = getUserResponses(vocabWord);
  
  const newResponse: SavedResponse = {
    id: Date.now().toString(),
    sentence: sentence.trim(),
    timestamp: new Date().toISOString(),
    vocabWord
  };
  
  responses.push(newResponse);
  localStorage.setItem(key, JSON.stringify(responses));
}

export function getUserResponses(vocabWord: string): SavedResponse[] {
  const key = `${vocabWord}-responses`;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading user responses:', error);
    return [];
  }
}

export function updateUserResponse(vocabWord: string, responseId: string, newSentence: string): void {
  const responses = getUserResponses(vocabWord);
  const updatedResponses = responses.map(response => 
    response.id === responseId 
      ? { ...response, sentence: newSentence.trim(), timestamp: new Date().toISOString() }
      : response
  );
  
  const key = `${vocabWord}-responses`;
  localStorage.setItem(key, JSON.stringify(updatedResponses));
}

export function deleteUserResponse(vocabWord: string, responseId: string): void {
  const responses = getUserResponses(vocabWord);
  const filteredResponses = responses.filter(response => response.id !== responseId);
  
  const key = `${vocabWord}-responses`;
  localStorage.setItem(key, JSON.stringify(filteredResponses));
}

// Audio playback functionality with Web Speech API
export class AudioManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  
  constructor() {
    this.setupSpeechSynthesis();
  }
  
  private setupSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech when page unloads
      window.addEventListener('beforeunload', () => {
        this.stopAudio();
      });
    }
  }
  
  playText(text: string, options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        const error = 'Speech synthesis not supported in this browser.';
        options.onError?.(error);
        reject(new Error(error));
        return;
      }
      
      // Stop any current speech
      this.stopAudio();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'ja-JP';
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      utterance.onstart = () => {
        this.isPlaying = true;
        options.onStart?.();
      };
      
      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        options.onEnd?.();
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        const error = `Speech synthesis error: ${event.error}`;
        options.onError?.(error);
        reject(new Error(error));
      };
      
      this.currentUtterance = utterance;
      speechSynthesis.speak(utterance);
    });
  }
  
  stopAudio(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }
  
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
  
  // Get available voices for language selection
  getAvailableVoices(lang: string = 'ja'): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) return [];
    
    return speechSynthesis.getVoices().filter(voice => 
      voice.lang.startsWith(lang)
    );
  }
}

// Create a singleton instance
export const audioManager = new AudioManager();

// Mobile responsive utilities
export function isMobileDevice(): boolean {
  return window.innerWidth <= 768;
}

export function getResponsiveFontSize(baseSize: number): number {
  if (window.innerWidth <= 480) {
    return baseSize * 0.875; // 87.5% of base size
  } else if (window.innerWidth <= 640) {
    return baseSize * 0.9375; // 93.75% of base size
  }
  return baseSize;
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format timestamp for display
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}