import * as wanakana from 'wanakana';

interface FuriganaProps {
  japanese: string;
  reading?: string;
  vocabulary?: string[];
  showReading?: boolean;
  highlightVocab?: boolean;
}

export function Furigana({ 
  japanese, 
  reading, 
  vocabulary, 
  showReading = false, 
  highlightVocab = false 
}: FuriganaProps) {
  
  // Simple test to verify furigana works
  if (showReading && reading) {
    return (
      <div className="text-center text-2xl font-medium" style={{ lineHeight: '3', padding: '20px 0' }}>
        <ruby style={{ fontSize: '24px', lineHeight: '3' }}>
          私
          <rt style={{ fontSize: '12px', color: '#666' }}>わたし</rt>
        </ruby>
        は
        <ruby style={{ fontSize: '24px', lineHeight: '3' }}>
          学生
          <rt style={{ fontSize: '12px', color: '#666' }}>がくせい</rt>
        </ruby>
        です。
        <br />
        <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>
          Test: {japanese} → {reading}
        </small>
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