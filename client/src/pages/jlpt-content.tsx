import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Volume2, Search, BookOpen, Languages, GraduationCap } from 'lucide-react';
import { Furigana } from '@/components/furigana';

interface JLPTItem {
  id: number;
  term?: string;
  kanji?: string;
  reading: string;
  meaning: string[];
  jlpt_level: string;
  examples: string[];
  tags: string[];
  srs: {
    interval: number;
    ease: number;
    due: string | null;
    reviews: any[];
  };
}

interface JLPTGrammar {
  id: number;
  grammar_point: string;
  structure: string;
  meaning: string[];
  jlpt_level: string;
  difficulty: number;
  examples: Array<{
    japanese: string;
    reading: string;
    english: string;
    breakdown: string;
  }>;
  notes: string;
  tags: string[];
  srs: {
    interval: number;
    ease: number;
    due: string | null;
    reviews: any[];
  };
}

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function JLPTContentPage() {
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [contentType, setContentType] = useState<'vocab' | 'kanji' | 'grammar'>('vocab');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: vocabData, isLoading: vocabLoading } = useQuery<JLPTItem[]>({
    queryKey: ['/api/jlpt', selectedLevel.toLowerCase(), 'vocab'],
    enabled: contentType === 'vocab'
  });

  const { data: kanjiData, isLoading: kanjiLoading } = useQuery<JLPTItem[]>({
    queryKey: ['/api/jlpt', selectedLevel.toLowerCase(), 'kanji'],
    enabled: contentType === 'kanji'
  });

  const { data: grammarData, isLoading: grammarLoading } = useQuery<JLPTGrammar[]>({
    queryKey: ['/api/jlpt', selectedLevel.toLowerCase(), 'grammar'],
    enabled: contentType === 'grammar'
  });

  // Get current data based on content type
  const getCurrentData = () => {
    switch (contentType) {
      case 'vocab': return vocabData || [];
      case 'kanji': return kanjiData || [];
      case 'grammar': return grammarData || [];
      default: return [];
    }
  };

  // Filter data based on search and tags
  const filteredData = getCurrentData().filter(item => {
    const searchMatch = searchTerm === '' || 
      ('term' in item && item.term && item.term.includes(searchTerm)) ||
      ('kanji' in item && item.kanji && item.kanji.includes(searchTerm)) ||
      ('reading' in item && item.reading && item.reading.includes(searchTerm)) ||
      ('grammar_point' in item && item.grammar_point && item.grammar_point.includes(searchTerm)) ||
      item.meaning.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const tagMatch = selectedTags.length === 0 || 
      selectedTags.some(tag => item.tags.includes(tag));
    
    return searchMatch && tagMatch;
  });

  // Get all unique tags from current data
  const allTags = Array.from(new Set(getCurrentData().flatMap(item => item.tags)));

  const isLoading = vocabLoading || kanjiLoading || grammarLoading;

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderVocabCard = (item: JLPTItem) => (
    <Card key={item.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Furigana 
              japanese={item.term || ''} 
              reading={item.reading}
              showReading={true}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playAudio(item.term || item.reading)}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="secondary">{item.jlpt_level}</Badge>
        </div>
        <div className="text-lg font-medium text-blue-700 dark:text-blue-300">
          {item.meaning.join(', ')}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {item.examples.map((example, idx) => (
            <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Example:</div>
              <div className="font-medium">{example}</div>
            </div>
          ))}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderKanjiCard = (item: JLPTItem) => (
    <Card key={item.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-center">{item.kanji}</div>
          <Badge variant="secondary">{item.jlpt_level}</Badge>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Reading: {item.reading}</div>
          <div className="text-lg font-medium text-blue-700 dark:text-blue-300">
            {item.meaning.join(', ')}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {item.examples.map((example, idx) => (
            <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <Furigana japanese={example} showReading={true} />
            </div>
          ))}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderGrammarCard = (item: JLPTGrammar) => (
    <Card key={item.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {item.grammar_point}
          </div>
          <Badge variant="secondary">{item.jlpt_level}</Badge>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Structure: {item.structure}
        </div>
        <div className="text-lg font-medium">
          {item.meaning.join(', ')}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {item.examples.map((example, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <Furigana japanese={example.japanese} reading={example.reading} showReading={true} />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {example.english}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {example.breakdown}
              </div>
            </div>
          ))}
          {item.notes && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
              <div className="text-sm">{item.notes}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">JLPT Content Library</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive Japanese learning content organized by JLPT levels
        </p>
      </div>

      {/* JLPT Level Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {JLPT_LEVELS.map(level => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level)}
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Type Tabs */}
      <Tabs value={contentType} onValueChange={(value) => setContentType(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vocab" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="kanji" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Kanji
          </TabsTrigger>
          <TabsTrigger value="grammar" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Grammar
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search terms, readings, or meanings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filter by tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Content Display */}
        <TabsContent value="vocab" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading vocabulary...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No vocabulary items found for {selectedLevel}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredData.length} vocabulary items
              </div>
              {filteredData.map(item => renderVocabCard(item as JLPTItem))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kanji" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading kanji...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No kanji items found for {selectedLevel}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredData.length} kanji items
              </div>
              {filteredData.map(item => renderKanjiCard(item as JLPTItem))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="grammar" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading grammar...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No grammar items found for {selectedLevel}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredData.length} grammar points
              </div>
              {filteredData.map(item => renderGrammarCard(item as JLPTGrammar))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}