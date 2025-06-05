// Type declarations for kuroshiro modules
declare module 'kuroshiro' {
  export default class Kuroshiro {
    init(analyzer: any): Promise<void>;
    convert(text: string, options: { to: string; mode: string }): Promise<string>;
  }
}

declare module 'kuroshiro-analyzer-kuromoji' {
  export default class KuromojiAnalyzer {
    constructor();
  }
}

const Kuroshiro = require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

let kuroshiro: Kuroshiro | null = null;

export async function initializeKuroshiro() {
  if (kuroshiro) return kuroshiro;
  
  try {
    kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer());
    console.log('Kuroshiro initialized successfully');
    return kuroshiro;
  } catch (error) {
    console.error('Failed to initialize Kuroshiro:', error);
    throw error;
  }
}

export async function generateFurigana(japanese: string): Promise<string> {
  try {
    if (!kuroshiro) {
      await initializeKuroshiro();
    }
    
    if (!kuroshiro) {
      throw new Error('Kuroshiro not initialized');
    }
    
    // Generate furigana using kuroshiro
    const result = await kuroshiro.convert(japanese, {
      to: 'hiragana',
      mode: 'furigana'
    });
    
    return result;
  } catch (error) {
    console.error('Error generating furigana:', error);
    return japanese; // Return original text if furigana generation fails
  }
}

export function removeBracketedFurigana(text: string): string {
  // Remove existing bracketed furigana like 学生（がくせい）
  return text.replace(/（[ぁ-ん]+）/g, '')
             .replace(/\([ぁ-ん]+\)/g, '')
             .replace(/\[[ぁ-ん]+\]/g, '')
             .trim();
}

export function extractReadingFromBrackets(text: string): string | null {
  // Extract reading from brackets if present
  const match = text.match(/（([ぁ-ん]+)）/) || text.match(/\(([ぁ-ん]+)\)/) || text.match(/\[([ぁ-ん]+)\]/);
  return match ? match[1] : null;
}

export async function processSentenceForFurigana(japanese: string): Promise<{ 
  cleanJapanese: string; 
  furigana: string; 
  hasKanji: boolean 
}> {
  try {
    // Remove any existing bracketed furigana
    const cleanJapanese = removeBracketedFurigana(japanese);
    
    // Check if the text contains kanji
    const hasKanji = /[\u4e00-\u9faf]/.test(cleanJapanese);
    
    if (!hasKanji) {
      // If no kanji, return as-is
      return {
        cleanJapanese,
        furigana: cleanJapanese,
        hasKanji: false
      };
    }
    
    // Generate furigana for kanji text
    const furigana = await generateFurigana(cleanJapanese);
    
    return {
      cleanJapanese,
      furigana,
      hasKanji: true
    };
  } catch (error) {
    console.error('Error processing sentence for furigana:', error);
    const cleanJapanese = removeBracketedFurigana(japanese);
    return {
      cleanJapanese,
      furigana: cleanJapanese,
      hasKanji: /[\u4e00-\u9faf]/.test(cleanJapanese)
    };
  }
}