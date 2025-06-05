import React from 'react';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

// Furigana parser that groups text into words and applies readings
function parseFurigana(japanese: string, reading?: string): Array<{ text: string; furigana?: string }> {
  if (!reading || japanese === reading) {
    return [{ text: japanese }];
  }

  // For demonstration, show the full reading above the entire text
  // This ensures furigana is visible while we work on more sophisticated parsing
  return [{ 
    text: japanese, 
    furigana: reading 
  }];
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