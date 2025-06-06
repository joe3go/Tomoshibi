import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookOpen, Target, BarChart3, Search } from "lucide-react";

interface ContentItem {
  id: number;
  japanese: string;
  reading: string;
  english: string;
  jlptLevel: string;
  difficulty: number;
  srsLevel?: number;
  nextReview?: Date;
}

const srsColors = {
  0: "bg-gray-500", // New
  1: "bg-red-500",  // Apprentice 1
  2: "bg-red-400",  // Apprentice 2
  3: "bg-orange-500", // Apprentice 3
  4: "bg-orange-400", // Apprentice 4
  5: "bg-yellow-500", // Guru 1
  6: "bg-yellow-400", // Guru 2
  7: "bg-green-500",  // Master
  8: "bg-blue-500",   // Enlightened
  9: "bg-purple-500"  // Burned
};

const srsLabels = {
  0: "New",
  1: "Apprentice 1",
  2: "Apprentice 2", 
  3: "Apprentice 3",
  4: "Apprentice 4",
  5: "Guru 1",
  6: "Guru 2",
  7: "Master",
  8: "Enlightened",
  9: "Burned"
};

export default function ContentBrowser() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("vocabulary");

  const { data: vocabularyData } = useQuery({
    queryKey: ["/api/vocabulary", { level: selectedLevel }],
    retry: false,
  });

  const { data: kanjiData } = useQuery({
    queryKey: ["/api/kanji", { level: selectedLevel }],
    retry: false,
  });

  const { data: grammarData } = useQuery({
    queryKey: ["/api/grammar", { level: selectedLevel }],
    retry: false,
  });

  const filterItems = (items: any[]) => {
    if (!items) return [];
    
    let filtered = items;
    
    if (selectedLevel !== "all") {
      filtered = filtered.filter(item => item.jlptLevel === selectedLevel);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.japanese?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.english?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderContentList = (items: any[], type: string) => {
    const filteredItems = filterItems(items);
    
    if (!filteredItems.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type} found for the selected criteria.
        </div>
      );
    }

    // Group by JLPT level
    const groupedItems = filteredItems.reduce((acc, item) => {
      const level = item.jlptLevel || 'Unknown';
      if (!acc[level]) acc[level] = [];
      acc[level].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'].filter(level => groupedItems[level]);

    return (
      <div className="space-y-6">
        {levels.map(level => (
          <div key={level} className="space-y-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{level}</h3>
              <Badge variant="outline">{groupedItems[level].length} items</Badge>
            </div>
            
            <div className="grid gap-3">
              {groupedItems[level].map((item, index) => {
                const srsLevel = Math.floor(Math.random() * 10); // Mock SRS level
                
                return (
                  <Card key={item.id || index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-japanese">
                            {item.japanese || item.kanji}
                          </div>
                          {item.reading && (
                            <div className="text-sm text-muted-foreground">
                              {item.reading || item.kana_reading}
                            </div>
                          )}
                        </div>
                        <div className="text-sm mt-1">
                          {item.english || item.english_meaning}
                        </div>
                        {item.example_sentence_en && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            {item.example_sentence_en}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`${srsColors[srsLevel as keyof typeof srsColors]} text-white`}
                        >
                          {srsLabels[srsLevel as keyof typeof srsLabels]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.jlptLevel}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Content Browser</h1>
        <p className="text-muted-foreground">
          Browse all vocabulary, kanji, and grammar organized by JLPT level with SRS progress tracking.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by JLPT Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="N5">N5</SelectItem>
              <SelectItem value="N4">N4</SelectItem>
              <SelectItem value="N3">N3</SelectItem>
              <SelectItem value="N2">N2</SelectItem>
              <SelectItem value="N1">N1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* SRS Legend */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">SRS Progress Legend</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(srsLabels).map(([level, label]) => (
            <Badge 
              key={level}
              className={`${srsColors[parseInt(level) as keyof typeof srsColors]} text-white text-xs`}
            >
              {label}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vocabulary" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Vocabulary</span>
          </TabsTrigger>
          <TabsTrigger value="kanji" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Kanji</span>
          </TabsTrigger>
          <TabsTrigger value="grammar" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Grammar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="mt-6">
          {renderContentList(vocabularyData || [], "vocabulary")}
        </TabsContent>

        <TabsContent value="kanji" className="mt-6">
          {renderContentList(kanjiData || [], "kanji")}
        </TabsContent>

        <TabsContent value="grammar" className="mt-6">
          {renderContentList(grammarData || [], "grammar")}
        </TabsContent>
      </Tabs>
    </div>
  );
}