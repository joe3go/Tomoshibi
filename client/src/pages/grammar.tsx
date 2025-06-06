import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Volume2, BookOpen } from "lucide-react";

interface GrammarItem {
  id: number;
  grammar_point: string;
  meaning_en: string;
  structure_notes: string;
  example_sentence_jp: string;
  example_sentence_en: string;
  jlptLevel: string;
}

export default function GrammarPage() {
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: grammarData, isLoading } = useQuery<{items: GrammarItem[]}>({
    queryKey: ["/api/jlpt", selectedLevel.toLowerCase(), "grammar"],
  });

  const filteredGrammar = grammarData?.items?.filter(item =>
    item.grammar_point.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.meaning_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.structure_notes.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold">Grammar Study</h1>
          <p className="text-muted-foreground">Learn Japanese grammar patterns and structures</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search grammar..."
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredGrammar.map((grammar) => (
                <Card key={grammar.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-primary">
                        {grammar.grammar_point}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {selectedLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {grammar.meaning_en}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Structure
                      </h4>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <p className="text-sm font-mono">{grammar.structure_notes}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Example</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                          <span className="text-sm font-medium flex-1">{grammar.example_sentence_jp}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(grammar.example_sentence_jp)}
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="pl-2">
                          <p className="text-sm text-muted-foreground italic">
                            {grammar.example_sentence_en}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredGrammar.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No grammar patterns found for your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}