import React, { useState } from 'react';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

/**
 * FuriganaToggle Component - Clean implementation like Bunpro
 * Displays furigana correctly above each kanji character with toggle functionality
 */
function FuriganaToggle({ word, furigana }: { word: string; furigana: string[] }) {
  const [showFurigana, setShowFurigana] = useState(true);

  // Sanity check: ensure word and furigana are valid
  if (!word || !furigana || furigana.length > word.length) {
    return <span className="text-2xl font-medium">{word}</span>;
  }

  return (
    <ruby
      onClick={() => setShowFurigana(!showFurigana)}
      style={{ 
        cursor: "pointer", 
        userSelect: "none",
        fontSize: "24px",
        lineHeight: "2.5"
      }}
      className="inline-block hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 transition-colors"
      aria-label={showFurigana ? "Hide furigana" : "Show furigana"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setShowFurigana(!showFurigana);
        }
      }}
    >
      {Array.from(word).map((char, i) => (
        <React.Fragment key={i}>
          {char}
          {showFurigana && furigana[i] ? (
            <rt style={{ 
              fontSize: "12px", 
              color: "#666", 
              fontWeight: 400,
              lineHeight: "1"
            }}>
              {furigana[i]}
            </rt>
          ) : null}
        </React.Fragment>
      ))}
    </ruby>
  );
}

/**
 * Generate furigana array from word and reading
 * This is a simplified implementation - for full automation use kuroshiro.js
 */
function generateFuriganaArray(word: string, reading: string): string[] {
  // Basic mapping for common N5 vocabulary
  const furiganaMap: { [key: string]: string[] } = {
    "私": ["わたし"],
    "学生": ["がく", "せい"],
    "今日": ["きょ", "う"],
    "本": ["ほん"],
    "水": ["みず"],
    "家": ["いえ"],
    "学校": ["がっ", "こう"],
    "友達": ["とも", "だち"],
    "映画": ["えい", "が"],
    "音楽": ["おん", "がく"],
    "朝": ["あさ"],
    "電車": ["でん", "sha"],
    "会社": ["かい", "しゃ"],
    "毎日": ["まい", "にち"],
    "新聞": ["しん", "ぶん"],
    "母": ["はは"],
    "買い物": ["か", "い", "もの"],
    "図書館": ["と", "しょ", "かん"],
    "勉強": ["べん", "きょう"],
    "公園": ["こう", "えん"],
    "犬": ["いぬ"],
    "散歩": ["さん", "ぽ"]
  };

  // Check if we have a predefined furigana mapping
  if (furiganaMap[word]) {
    const kanjiReadings = furiganaMap[word];
    const result: string[] = [];
    let readingIndex = 0;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      // Check if character is kanji
      if (/[\u4e00-\u9faf]/.test(char)) {
        result.push(kanjiReadings[readingIndex] || "");
        readingIndex++;
      } else {
        // Hiragana/katakana gets empty furigana
        result.push("");
      }
    }
    return result;
  }

  // Fallback: simple character-by-character mapping
  return Array.from(word).map(char => {
    if (/[\u4e00-\u9faf]/.test(char)) {
      // For kanji without mapping, try to extract from reading
      return reading || "";
    }
    return ""; // No furigana for kana
  });
}

export function Furigana({ 
  japanese, 
  reading, 
  vocabulary, 
  showReading = false, 
  highlightVocab = false 
}: FuriganaProps) {
  
  if (showReading && japanese) {
    // Check if text has kanji that needs furigana
    const hasKanji = /[\u4e00-\u9faf]/.test(japanese);
    
    if (!hasKanji) {
      // No kanji, display as plain text
      return (
        <div className="text-center text-2xl font-medium">
          <span>{japanese}</span>
        </div>
      );
    }

    // Generate furigana array for the word
    const furiganaArray = generateFuriganaArray(japanese, reading || "");
    
    return (
      <div className="text-center" style={{ lineHeight: '3', padding: '10px 0' }}>
        <FuriganaToggle word={japanese} furigana={furiganaArray} />
        {reading && (
          <div className="text-sm text-gray-500 mt-2">
            Reading: {reading}
          </div>
        )}
      </div>
    );
  }
  
  // Normal display without furigana
  return (
    <div className="text-center text-2xl font-medium">
      <span>{japanese}</span>
    </div>
  );
}