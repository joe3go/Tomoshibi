import { LearningCard, UserOutput } from '@shared/learning-schema';

const LEARNING_CARDS_KEY = 'tomoshibi-learning-cards';
const USER_OUTPUT_KEY = 'tomoshibi-user-output';

// Learning Cards Storage
export const saveLearningCards = (cards: LearningCard[]) => {
  localStorage.setItem(LEARNING_CARDS_KEY, JSON.stringify(cards));
};

export const loadLearningCards = (): LearningCard[] => {
  try {
    const stored = localStorage.getItem(LEARNING_CARDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading learning cards:', error);
    return [];
  }
};

export const addLearningCard = (card: LearningCard) => {
  const cards = loadLearningCards();
  const updatedCards = [...cards.filter(c => c.id !== card.id), card];
  saveLearningCards(updatedCards);
};

export const updateLearningCard = (id: string, updates: Partial<LearningCard>) => {
  const cards = loadLearningCards();
  const updatedCards = cards.map(card => 
    card.id === id ? { ...card, ...updates } : card
  );
  saveLearningCards(updatedCards);
};

export const deleteLearningCard = (id: string) => {
  const cards = loadLearningCards();
  const filteredCards = cards.filter(card => card.id !== id);
  saveLearningCards(filteredCards);
};

export const getLearningCard = (id: string): LearningCard | undefined => {
  const cards = loadLearningCards();
  return cards.find(card => card.id === id);
};

// User Output Storage
export const saveUserOutput = (output: UserOutput) => {
  const outputs = loadUserOutputs();
  const key = `${output.vocabId}-${output.timestamp}`;
  const updatedOutputs = { ...outputs, [key]: output };
  localStorage.setItem(USER_OUTPUT_KEY, JSON.stringify(updatedOutputs));
};

export const loadUserOutputs = (): Record<string, UserOutput> => {
  try {
    const stored = localStorage.getItem(USER_OUTPUT_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading user outputs:', error);
    return {};
  }
};

export const getUserOutputsForVocab = (vocabId: string): UserOutput[] => {
  const outputs = loadUserOutputs();
  return Object.values(outputs).filter(output => output.vocabId === vocabId);
};

export const getAllUserOutputs = (): UserOutput[] => {
  const outputs = loadUserOutputs();
  return Object.values(outputs).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// SRS Level Management
export const updateSRSLevel = (vocabId: string, newLevel: number) => {
  updateLearningCard(vocabId, { srsLevel: Math.max(0, Math.min(5, newLevel)) });
};

export const getCardsForReview = (srsLevel?: number): LearningCard[] => {
  const cards = loadLearningCards();
  if (srsLevel !== undefined) {
    return cards.filter(card => card.srsLevel === srsLevel);
  }
  return cards;
};

// Statistics
export const getStudyStats = () => {
  const cards = loadLearningCards();
  const outputs = getAllUserOutputs();
  
  return {
    totalCards: cards.length,
    completedCards: cards.filter(card => card.srsLevel > 0).length,
    totalOutputs: outputs.length,
    uniqueVocabPracticed: new Set(outputs.map(o => o.vocabId)).size,
    averageSRSLevel: cards.length > 0 ? 
      cards.reduce((sum, card) => sum + card.srsLevel, 0) / cards.length : 0,
    recentActivity: outputs.slice(0, 10)
  };
};