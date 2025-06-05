import React from 'react';
import * as wanakana from 'wanakana';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

// Simplified furigana parser for reliable display
function parseFurigana(japanese: string, reading?: string): Array<{ text: string; furigana?: string }> {
  if (!reading || japanese === reading) {
    return [{ text: japanese }];
  }

  const segments: Array<{ text: string; furigana?: string }> = [];
  const isKanji = (char: string) => /[\u4e00-\u9faf]/.test(char);
  
  let i = 0;
  while (i < japanese.length) {
    const char = japanese[i];
    
    if (isKanji(char)) {
      // Collect consecutive kanji
      let kanjiGroup = '';
      while (i < japanese.length && isKanji(japanese[i])) {
        kanjiGroup += japanese[i];
        i++;
      }
      
      // Add kanji with full reading for now (can be refined later)
      segments.push({ 
        text: kanjiGroup, 
        furigana: reading 
      });
    } else {
      // Collect consecutive non-kanji
      let textGroup = '';
      while (i < japanese.length && !isKanji(japanese[i])) {
        textGroup += japanese[i];
        i++;
      }
      
      segments.push({ text: textGroup });
    }
  }
  
  return segments;
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
      {segments.map((segment, index) => {
        const isHighlighted = highlightVocab && vocabulary?.some(v => segment.text.includes(v));
        
        if (showReading && segment.furigana) {
          return (
            <ruby key={`ruby-${index}`} style={{ lineHeight: '2.5', margin: '0 0.1em' }}>
              <span className={isHighlighted ? 'vocabulary-highlight' : ''}>
                {segment.text}
              </span>
              <rt style={{ 
                fontSize: '0.5em', 
                color: '#6b7280', 
                fontWeight: 400,
                textAlign: 'center',
                lineHeight: 1
              }}>
                {segment.furigana}
              </rt>
            </ruby>
          );
        } else {
          return (
            <span 
              key={`span-${index}`}
              className={isHighlighted ? 'vocabulary-highlight' : ''}
            >
              {segment.text}
            </span>
          );
        }
      })}
      
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