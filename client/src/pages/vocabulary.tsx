import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Search, Filter } from "lucide-react";

interface VocabularyItem {
  id: number;
  kanji: string;
  kana_reading: string;
  english_meaning: string;
  example_sentence_jp: string;
  example_sentence_en: string;
  jlptLevel: string;
}

export default function VocabularyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const userJLPTLevel = user?.currentJLPTLevel || 'N5';

  // Set default filter to user's JLPT level
  useEffect(() => {
    if (userJLPTLevel && selectedLevel === "all") {
      setSelectedLevel(userJLPTLevel);
    }
  }, [userJLPTLevel]);

  const { data: vocabularyItems = [], isLoading } = useQuery<VocabularyItem[]>({
    queryKey: ["/api/vocabulary?level=" + (selectedLevel === "all" ? userJLPTLevel : selectedLevel)],
    retry: false,
  });

  const filteredItems = vocabularyItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.kanji.includes(searchTerm) ||
      item.kana_reading.includes(searchTerm) ||
      item.english_meaning.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === "all" || item.jlptLevel === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

  const speakJapanese = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading vocabulary...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Vocabulary Study</h1>
        <p className="text-muted-foreground">Master essential Japanese words and expressions</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vocabulary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="N5">N5 - Beginner</SelectItem>
                <SelectItem value="N4">N4 - Elementary</SelectItem>
                <SelectItem value="N3">N3 - Intermediate</SelectItem>
                <SelectItem value="N2">N2 - Upper Intermediate</SelectItem>
                <SelectItem value="N1">N1 - Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} vocabulary items
        </p>
        <Badge variant="outline">
          {selectedLevel === "all" ? "All Levels" : selectedLevel}
        </Badge>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              {/* Word Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.jlptLevel}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakJapanese(item.kanji || item.kana_reading)}
                    className="h-6 w-6 p-0"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Japanese Text */}
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {item.kanji}
                </div>
                <div className="text-lg text-muted-foreground">
                  {item.kana_reading}
                </div>
              </div>

              {/* English Meaning */}
              <div className="text-sm font-medium">
                {item.english_meaning}
              </div>

              {/* Example Sentence */}
              {item.example_sentence_jp && (
                <div className="space-y-1 pt-2 border-t">
                  <div className="text-sm text-primary">
                    {item.example_sentence_jp}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.example_sentence_en}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No vocabulary found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}