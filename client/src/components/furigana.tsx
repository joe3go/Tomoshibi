import React from 'react';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

// Enhanced furigana parser for kanji-hiragana patterns
function parseFurigana(japanese: string, reading?: string): Array<{ text: string; furigana?: string }> {
  if (!reading || japanese === reading) {
    return [{ text: japanese }];
  }

  const kanjiRegex = /[\u4e00-\u9faf]+/g;
  const hiraganaRegex = /[\u3040-\u309f]+/g;
  
  // Split Japanese text into segments (kanji and hiragana)
  const segments: Array<{ text: string; furigana?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = kanjiRegex.exec(japanese)) !== null) {
    // Add hiragana before kanji
    if (match.index > lastIndex) {
      segments.push({ text: japanese.substring(lastIndex, match.index) });
    }
    
    // Add kanji with furigana
    segments.push({ 
      text: match[0], 
      furigana: reading // For now, show full reading - can be enhanced
    });
    
    lastIndex = kanjiRegex.lastIndex;
  }
  
  // Add remaining hiragana
  if (lastIndex < japanese.length) {
    segments.push({ text: japanese.substring(lastIndex) });
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