import React, { useState } from 'react';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

/**
 * Individual Character Toggle - Each kanji can be clicked separately
 */
function CharacterWithFurigana({ 
  char, 
  reading, 
  index 
}: { 
  char: string; 
  reading: string; 
  index: number;
}) {
  const [showReading, setShowReading] = useState(true);
  const isKanji = /[\u4e00-\u9faf]/.test(char);

  if (!isKanji || !reading) {
    return <span className="japanese-text text-3xl">{char}</span>;
  }

  return (
    <ruby
      onClick={() => setShowReading(!showReading)}
      className="japanese-text text-3xl hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 transition-colors cursor-pointer"
      style={{ 
        margin: "0 0.125rem",
        position: "relative",
        display: "inline-block",
        verticalAlign: "baseline"
      }}
      aria-label={showReading ? `Hide reading for ${char}` : `Show reading for ${char}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setShowReading(!showReading);
        }
      }}
    >
      {char}
      {showReading && (
        <rt 
          className="japanese-text"
          style={{
            fontSize: "0.5em",
            fontFamily: "'Noto Sans JP', 'Noto Sans', sans-serif",
            letterSpacing: "-0.05em",
            color: "#2563eb",
            fontWeight: "500"
          }}
        >
          {reading}
        </rt>
      )}
    </ruby>
  );
}

/**
 * FuriganaToggle Component - Clean implementation like Bunpro
 * Displays furigana correctly above each kanji character with toggle functionality
 */
function FuriganaToggle({ word, furigana }: { word: string; furigana: string[] }) {
  // Sanity check: ensure word and furigana are valid
  if (!word || !furigana) {
    return <span className="text-2xl font-medium">{word}</span>;
  }

  return (
    <div style={{ lineHeight: "2.5", display: "inline-block" }}>
      {Array.from(word).map((char, i) => (
        <CharacterWithFurigana
          key={i}
          char={char}
          reading={furigana[i] || ""}
          index={i}
        />
      ))}
    </div>
  );
}

/**
 * Generate furigana array from word and reading
 * This creates proper character-by-character furigana mappings
 */
function generateFuriganaArray(word: string, reading: string): string[] {
  // Comprehensive mapping for N5 kanji with proper individual readings
  const kanjiReadings: { [key: string]: string } = {
    "私": "わたし",
    "学": "がく",
    "生": "せい", 
    "今": "きょ",
    "日": "にち",
    "本": "ほん",
    "水": "みず",
    "家": "いえ",
    "校": "こう",
    "友": "とも",
    "達": "だち",
    "映": "えい",
    "画": "が",
    "音": "おん",
    "楽": "がく",
    "朝": "あさ",
    "電": "でん",
    "車": "しゃ",
    "会": "かい",
    "社": "しゃ",
    "毎": "まい",
    "新": "しん",
    "聞": "ぶん",
    "母": "はは",
    "買": "か",
    "物": "もの",
    "図": "と",
    "書": "しょ",
    "館": "かん",
    "勉": "べん",
    "強": "きょう",
    "公": "こう",
    "園": "えん",
    "犬": "いぬ",
    "散": "さん",
    "歩": "ぽ"
  };

  // Special compound word mappings for proper pronunciation
  const compoundMappings: { [key: string]: string[] } = {
    "学生": ["がく", "せい"],
    "今日": ["きょ", "う"],
    "学校": ["がっ", "こう"],
    "友達": ["とも", "だち"],
    "映画": ["えい", "が"],
    "音楽": ["おん", "がく"],
    "電車": ["でん", "しゃ"],
    "会社": ["かい", "しゃ"],
    "毎日": ["まい", "にち"],
    "新聞": ["しん", "ぶん"],
    "買い物": ["か", "い", "もの"],
    "図書館": ["と", "しょ", "かん"],
    "勉強": ["べん", "きょう"],
    "公園": ["こう", "えん"],
    "散歩": ["さん", "ぽ"]
  };

  // Check for compound word first
  if (compoundMappings[word]) {
    const readings = compoundMappings[word];
    const result: string[] = [];
    let readingIndex = 0;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (/[\u4e00-\u9faf]/.test(char)) {
        result.push(readings[readingIndex] || "");
        readingIndex++;
      } else {
        result.push(""); // No furigana for kana
      }
    }
    return result;
  }

  // Character-by-character mapping
  const result: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (/[\u4e00-\u9faf]/.test(char)) {
      result.push(kanjiReadings[char] || "");
    } else {
      result.push(""); // No furigana for kana
    }
  }
  
  return result;
}

export function Furigana({ 
  japanese, 
  reading, 
  vocabulary, 
  showReading = false, 
  highlightVocab = false 
}: FuriganaProps) {
  
  // Always reserve space for furigana to prevent layout shifts
  const containerStyle = {
    lineHeight: '2.5',
    minHeight: '4em', // Reserve space for furigana
    padding: '0.5em 0',
    display: 'inline-block'
  };

  if (japanese) {
    // Check if text has kanji that needs furigana
    const hasKanji = /[\u4e00-\u9faf]/.test(japanese);
    
    if (!hasKanji) {
      // No kanji, display as plain text but keep same container height
      return (
        <div className="text-center text-2xl font-medium japanese-text" style={containerStyle}>
          <span>{japanese}</span>
        </div>
      );
    }

    // Generate furigana array for the word
    const furiganaArray = generateFuriganaArray(japanese, reading || "");
    
    return (
      <div className="text-center japanese-text" style={containerStyle}>
        {Array.from(japanese).map((char, i) => {
          const isKanji = /[\u4e00-\u9faf]/.test(char);
          
          if (!isKanji) {
            return <span key={i} className="text-3xl">{char}</span>;
          }
          
          return (
            <ruby key={i} style={{ position: 'relative', display: 'inline-block', margin: '0 0.125rem' }}>
              <span className="text-3xl">{char}</span>
              {showReading && furiganaArray[i] && (
                <rt style={{
                  position: 'absolute',
                  top: '-1.5em',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.5em',
                  color: '#ef4444',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  opacity: showReading ? 1 : 0,
                  transition: 'opacity 0.2s ease'
                }}>
                  {furiganaArray[i]}
                </rt>
              )}
            </ruby>
          );
        })}
      </div>
    );
  }
  
  // Fallback
  return (
    <div className="text-center text-2xl font-medium japanese-text" style={containerStyle}>
      <span>{japanese}</span>
    </div>
  );
}