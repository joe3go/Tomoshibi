import React from 'react';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

// Advanced furigana parser that maps kanji to their specific readings
function parseFurigana(japanese: string, reading?: string): Array<{ text: string; furigana?: string }> {
  if (!reading || japanese === reading) {
    return [{ text: japanese }];
  }

  const segments: Array<{ text: string; furigana?: string }> = [];
  const kanjiRegex = /[\u4e00-\u9faf]/g;
  const hiraganaRegex = /[\u3040-\u309f]/g;
  
  // Split reading into parts (remove spaces and punctuation)
  const cleanReading = reading.replace(/[、。\s]/g, '');
  
  let japaneseIndex = 0;
  let readingIndex = 0;
  
  while (japaneseIndex < japanese.length) {
    const char = japanese[japaneseIndex];
    
    if (kanjiRegex.test(char)) {
      // This is a kanji character - find its reading
      let kanjiReading = '';
      
      // Look ahead to find the end of this kanji sequence
      let kanjiEnd = japaneseIndex + 1;
      while (kanjiEnd < japanese.length && kanjiRegex.test(japanese[kanjiEnd])) {
        kanjiEnd++;
      }
      
      // Get the kanji sequence
      const kanjiSequence = japanese.substring(japaneseIndex, kanjiEnd);
      
      // Find the next hiragana in the original text (if any)
      let nextHiragana = '';
      if (kanjiEnd < japanese.length && hiraganaRegex.test(japanese[kanjiEnd])) {
        let hiraganaEnd = kanjiEnd;
        while (hiraganaEnd < japanese.length && hiraganaRegex.test(japanese[hiraganaEnd])) {
          hiraganaEnd++;
        }
        nextHiragana = japanese.substring(kanjiEnd, hiraganaEnd);
      }
      
      // Extract reading for this kanji sequence
      if (nextHiragana) {
        // Find where this hiragana appears in the reading
        const hiraganaIndex = cleanReading.indexOf(nextHiragana, readingIndex);
        if (hiraganaIndex > readingIndex) {
          kanjiReading = cleanReading.substring(readingIndex, hiraganaIndex);
          readingIndex = hiraganaIndex;
        }
      } else {
        // No following hiragana, take remaining reading
        kanjiReading = cleanReading.substring(readingIndex);
        readingIndex = cleanReading.length;
      }
      
      segments.push({ 
        text: kanjiSequence, 
        furigana: kanjiReading || undefined 
      });
      
      japaneseIndex = kanjiEnd;
    } else {
      // This is hiragana/katakana or other character
      let nonKanjiEnd = japaneseIndex + 1;
      while (nonKanjiEnd < japanese.length && !kanjiRegex.test(japanese[nonKanjiEnd])) {
        nonKanjiEnd++;
      }
      
      const nonKanjiSequence = japanese.substring(japaneseIndex, nonKanjiEnd);
      segments.push({ text: nonKanjiSequence });
      
      // Advance reading index past this hiragana
      if (hiraganaRegex.test(nonKanjiSequence[0])) {
        readingIndex = cleanReading.indexOf(nonKanjiSequence, readingIndex) + nonKanjiSequence.length;
      }
      
      japaneseIndex = nonKanjiEnd;
    }
  }
  
  return segments.length > 0 ? segments : [{ text: japanese, furigana: reading }];
}

function highlightVocabulary(text: string, vocabulary?: string[]): string {
  if (!vocabulary || vocabulary.length === 0) return text;
  
  let highlightedText = text;
  vocabulary.forEach((vocab) => {
    if (vocab && text.includes(vocab)) {
      highlightedText = highlightedText.replace(
        new RegExp(vocab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<span class="vocabulary-highlight">${vocab}</span>`
      );
    }
  });
  
  return highlightedText;
}

export function Furigana({ 
  japanese, 
  reading, 
  vocabulary, 
  showReading = false, 
  highlightVocab = false 
}: FuriganaProps) {
  const segments = parseFurigana(japanese, showReading ? reading : undefined);
  
  return (
    <div className="furigana-container text-center text-2xl leading-relaxed font-medium">
      {segments.map((segment, index) => (
        <ruby key={index} className="inline-block mx-0.5">
          <span 
            className="japanese-text"
            dangerouslySetInnerHTML={{
              __html: highlightVocab 
                ? highlightVocabulary(segment.text, vocabulary)
                : segment.text
            }}
          />
          {segment.furigana && showReading && (
            <rt className="text-xs text-gray-500 font-normal">{segment.furigana}</rt>
          )}
        </ruby>
      ))}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .vocabulary-highlight {
            color: #dc2626 !important;
            background-color: #fef2f2;
            padding: 0.1em 0.3em;
            border-radius: 0.25rem;
            font-weight: 600;
            border-bottom: 2px solid #dc2626;
          }
          
          ruby {
            ruby-align: center;
            line-height: 2.5;
          }
          
          rt {
            ruby-position: over;
            font-size: 0.6em;
            line-height: 1;
            color: #6b7280;
            font-weight: 400;
            text-align: center;
            display: block;
            margin-bottom: 0.2em;
          }
        `
      }} />
    </div>
  );
}