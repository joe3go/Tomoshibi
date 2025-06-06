import fs from 'fs';
import path from 'path';

// Interface for CSV vocabulary data
export interface CSVVocabularyItem {
  expression: string;
  reading: string;
  meaning: string;
  tags: string;
}

// Processed vocabulary item for the API
export interface ProcessedVocabularyItem {
  id: number;
  japanese: string;
  reading: string;
  english: string;
  jlptLevel: string;
  difficulty: number;
  register: string;
  theme: string;
  source: string;
  tags: string[];
}

// Parse CSV content into vocabulary items
function parseCSV(csvContent: string): CSVVocabularyItem[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const items: CSVVocabularyItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    if (values.length >= 4) {
      items.push({
        expression: values[0],
        reading: values[1],
        meaning: values[2],
        tags: values[3] || ''
      });
    }
  }

  return items;
}

// Determine theme based on meaning
function determineTheme(meaning: string): string {
  const themes = {
    'daily_life': ['daily', 'life', 'home', 'family', 'house', 'kitchen', 'room', 'bed', 'food', 'eat', 'drink', 'cook'],
    'work': ['work', 'job', 'office', 'business', 'company', 'meeting', 'money', 'economy', 'trade'],
    'education': ['school', 'study', 'learn', 'teach', 'student', 'teacher', 'book', 'read', 'write'],
    'travel': ['travel', 'trip', 'station', 'train', 'car', 'airplane', 'hotel', 'road', 'map'],
    'nature': ['nature', 'tree', 'flower', 'mountain', 'river', 'sea', 'sky', 'weather', 'animal'],
    'social': ['friend', 'people', 'society', 'culture', 'tradition', 'festival', 'party', 'meet'],
    'health': ['health', 'doctor', 'hospital', 'medicine', 'sick', 'body', 'exercise', 'pain'],
    'technology': ['computer', 'phone', 'internet', 'technology', 'machine', 'electronic']
  };

  const lowerMeaning = meaning.toLowerCase();
  
  for (const [theme, keywords] of Object.entries(themes)) {
    if (keywords.some(keyword => lowerMeaning.includes(keyword))) {
      return theme;
    }
  }
  
  return 'general';
}

// Determine register based on tags and meaning
function determineRegister(tags: string, meaning: string): string {
  const tagLower = tags.toLowerCase();
  const meaningLower = meaning.toLowerCase();
  
  if (tagLower.includes('formal') || tagLower.includes('polite') || tagLower.includes('honorific')) {
    return 'formal';
  }
  if (tagLower.includes('casual') || tagLower.includes('informal') || tagLower.includes('col')) {
    return 'casual';
  }
  if (meaningLower.includes('polite') || meaningLower.includes('formal')) {
    return 'formal';
  }
  
  return 'neutral';
}

// Calculate difficulty based on JLPT level
function getDifficulty(jlptLevel: string): number {
  switch (jlptLevel) {
    case 'N5': return 1;
    case 'N4': return 2;
    case 'N3': return 3;
    case 'N2': return 4;
    case 'N1': return 5;
    default: return 3;
  }
}

// Process vocabulary data for a specific JLPT level
export function processJLPTLevel(csvContent: string, level: string): ProcessedVocabularyItem[] {
  const rawItems = parseCSV(csvContent);
  const processedItems: ProcessedVocabularyItem[] = [];

  rawItems.forEach((item, index) => {
    const tags = item.tags.split(/\s+/).filter(tag => tag.length > 0);
    
    processedItems.push({
      id: index + 1,
      japanese: item.expression,
      reading: item.reading,
      english: item.meaning,
      jlptLevel: level,
      difficulty: getDifficulty(level),
      register: determineRegister(item.tags, item.meaning),
      theme: determineTheme(item.meaning),
      source: 'Official JLPT Vocabulary List',
      tags: tags
    });
  });

  return processedItems;
}

// Load and process all JLPT vocabulary data
export function loadAllJLPTData(): Map<string, ProcessedVocabularyItem[]> {
  const jlptData = new Map<string, ProcessedVocabularyItem[]>();
  
  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  
  levels.forEach(level => {
    try {
      const csvPath = path.join(process.cwd(), 'attached_assets', `${level.toLowerCase()}.csv`);
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const processedData = processJLPTLevel(csvContent, level);
        jlptData.set(level, processedData);
        console.log(`Loaded ${processedData.length} vocabulary items for ${level}`);
      } else {
        console.warn(`CSV file not found for ${level}: ${csvPath}`);
      }
    } catch (error) {
      console.error(`Error loading ${level} data:`, error);
    }
  });
  
  return jlptData;
}