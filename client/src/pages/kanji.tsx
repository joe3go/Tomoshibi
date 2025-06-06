import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Volume2 } from "lucide-react";

interface KanjiItem {
  id: number;
  kanji: string;
  onyomi: string;
  kunyomi: string;
  english_meaning: string;
  stroke_count: number;
  example_vocab: string[];
  jlptLevel: string;
}

export default function KanjiPage() {
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: kanjiData, isLoading } = useQuery<{items: KanjiItem[]}>({
    queryKey: ["/api/jlpt", selectedLevel.toLowerCase(), "kanji"],
  });

  const filteredKanji = kanjiData?.items?.filter(item =>
    item.kanji.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.english_meaning.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kanji Study</h1>
          <p className="text-muted-foreground">Learn Japanese characters and their meanings</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search kanji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="N5">N5</TabsTrigger>
          <TabsTrigger value="N4">N4</TabsTrigger>
          <TabsTrigger value="N3">N3</TabsTrigger>
          <TabsTrigger value="N2">N2</TabsTrigger>
          <TabsTrigger value="N1">N1</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedLevel} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-8 bg-muted rounded w-16 mx-auto"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKanji.map((kanji) => (
                <Card key={kanji.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-3">
                    <div className="text-4xl font-bold text-primary mb-2">{kanji.kanji}</div>
                    <Badge variant="secondary" className="text-xs">
                      {kanji.stroke_count} strokes
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Meaning</h4>
                      <p className="text-sm">{kanji.english_meaning}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">On'yomi</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono">{kanji.onyomi}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(kanji.onyomi)}
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Kun'yomi</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono">{kanji.kunyomi}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(kanji.kunyomi)}
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {kanji.example_vocab && kanji.example_vocab.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Examples</h4>
                        <div className="flex flex-wrap gap-1">
                          {kanji.example_vocab.slice(0, 3).map((vocab, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {vocab}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredKanji.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No kanji found for your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}