import React, { useState, useEffect } from 'react';
import * as wanakana from 'wanakana';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

// Advanced furigana parser with intelligent reading mapping
function parseFurigana(japanese: string, reading?: string): Array<{ text: string; furigana?: string }> {
  if (!reading || japanese === reading) {
    return [{ text: japanese }];
  }

  const segments: Array<{ text: string; furigana?: string }> = [];
  
  // Clean the reading (remove punctuation)
  const cleanReading = reading.replace(/[、。！？\s]/g, '');
  
  let japaneseIndex = 0;
  let readingIndex = 0;
  
  while (japaneseIndex < japanese.length) {
    const char = japanese[japaneseIndex];
    
    if (wanakana.isKanji(char)) {
      // Find end of kanji sequence
      let kanjiEnd = japaneseIndex;
      while (kanjiEnd < japanese.length && wanakana.isKanji(japanese[kanjiEnd])) {
        kanjiEnd++;
      }
      
      const kanjiSequence = japanese.substring(japaneseIndex, kanjiEnd);
      
      // Find following hiragana in original text
      let hiraganaEnd = kanjiEnd;
      while (hiraganaEnd < japanese.length && wanakana.isHiragana(japanese[hiraganaEnd])) {
        hiraganaEnd++;
      }
      
      const followingHiragana = japanese.substring(kanjiEnd, hiraganaEnd);
      let kanjiReading = '';
      
      if (followingHiragana && readingIndex < cleanReading.length) {
        // Find this hiragana in the reading
        const hiraganaIndexInReading = cleanReading.indexOf(followingHiragana, readingIndex);
        if (hiraganaIndexInReading !== -1) {
          kanjiReading = cleanReading.substring(readingIndex, hiraganaIndexInReading);
          readingIndex = hiraganaIndexInReading;
        } else {
          // Fallback: estimate reading length
          const remainingKanji = (japanese.substring(japaneseIndex).match(/[\u4e00-\u9faf]/g) || []).length;
          const remainingReading = cleanReading.substring(readingIndex);
          const estimatedLength = Math.ceil(remainingReading.length / remainingKanji);
          kanjiReading = remainingReading.substring(0, estimatedLength);
          readingIndex += estimatedLength;
        }
      } else {
        // No following hiragana, use remaining reading
        kanjiReading = cleanReading.substring(readingIndex);
        readingIndex = cleanReading.length;
      }
      
      segments.push({ text: kanjiSequence, furigana: kanjiReading });
      japaneseIndex = kanjiEnd;
    } else {
      // Handle hiragana/katakana/punctuation
      let nonKanjiEnd = japaneseIndex;
      while (nonKanjiEnd < japanese.length && !wanakana.isKanji(japanese[nonKanjiEnd])) {
        nonKanjiEnd++;
      }
      
      const nonKanjiSequence = japanese.substring(japaneseIndex, nonKanjiEnd);
      segments.push({ text: nonKanjiSequence });
      
      // Advance reading index if this is hiragana
      if (wanakana.isHiragana(nonKanjiSequence)) {
        readingIndex = Math.min(readingIndex + nonKanjiSequence.length, cleanReading.length);
      }
      
      japaneseIndex = nonKanjiEnd;
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
    <div className="furigana-container text-center text-2xl font-medium" style={{ lineHeight: '3' }}>
      {segments.map((segment, index) => {
        const isHighlighted = highlightVocab && vocabulary?.some(v => segment.text.includes(v));
        
        if (showReading && segment.furigana) {
          return (
            <ruby key={index} className="inline-block relative mx-1">
              <span 
                className={isHighlighted ? 'vocabulary-highlight' : ''}
                style={{ display: 'inline-block', position: 'relative' }}
              >
                {segment.text}
              </span>
              <rt 
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                style={{ 
                  fontSize: '0.45em',
                  color: '#6b7280',
                  fontWeight: 400,
                  textAlign: 'center',
                  minWidth: '100%'
                }}
              >
                {segment.furigana}
              </rt>
            </ruby>
          );
        } else {
          return (
            <span 
              key={index}
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