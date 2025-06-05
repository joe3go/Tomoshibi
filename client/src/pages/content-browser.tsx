import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, PenTool, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  srs_level: string;
  [key: string]: any;
}

interface VocabItem extends ContentItem {
  kanji: string;
  kana_reading: string;
  english_meaning: string;
  example_sentence_jp: string;
  example_sentence_en: string;
}

interface KanjiItem extends ContentItem {
  kanji: string;
  onyomi: string;
  kunyomi: string;
  english_meaning: string;
  stroke_count: number;
  example_vocab: string[];
}

interface GrammarItem extends ContentItem {
  grammar_point: string;
  meaning_en: string;
  structure_notes: string;
  example_sentence_jp: string;
  example_sentence_en: string;
}

const getSRSLevelColor = (level: string) => {
  switch (level) {
    case "Apprentice I":
    case "Apprentice II":
    case "Apprentice III":
    case "Apprentice IV":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    case "Guru I":
    case "Guru II":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Master":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Enlightened":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Burned":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export default function ContentBrowserPage() {
  const [selectedLevel, setSelectedLevel] = useState("n5");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("vocab");

  const { data: vocabData = [], isLoading: vocabLoading } = useQuery<VocabItem[]>({
    queryKey: ["/api/jlpt", selectedLevel, "vocab"],
    enabled: activeTab === "vocab"
  });

  const { data: kanjiData = [], isLoading: kanjiLoading } = useQuery<KanjiItem[]>({
    queryKey: ["/api/jlpt", selectedLevel, "kanji"],
    enabled: activeTab === "kanji"
  });

  const { data: grammarData = [], isLoading: grammarLoading } = useQuery<GrammarItem[]>({
    queryKey: ["/api/jlpt", selectedLevel, "grammar"],
    enabled: activeTab === "grammar"
  });

  const filterItems = (items: ContentItem[], searchTerm: string) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filteredVocab = filterItems(vocabData, searchQuery);
  const filteredKanji = filterItems(kanjiData, searchQuery);
  const filteredGrammar = filterItems(grammarData, searchQuery);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Content Library
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse all JLPT content with SRS progress tracking
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* JLPT Level Selector */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select JLPT Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n5">JLPT N5</SelectItem>
              <SelectItem value="n4">JLPT N4</SelectItem>
              <SelectItem value="n3">JLPT N3</SelectItem>
              <SelectItem value="n2">JLPT N2</SelectItem>
              <SelectItem value="n1">JLPT N1</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vocab" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Vocabulary ({filteredVocab.length})
            </TabsTrigger>
            <TabsTrigger value="kanji" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Kanji ({filteredKanji.length})
            </TabsTrigger>
            <TabsTrigger value="grammar" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Grammar ({filteredGrammar.length})
            </TabsTrigger>
          </TabsList>

          {/* Vocabulary Tab */}
          <TabsContent value="vocab" className="mt-6">
            {vocabLoading ? (
              <div className="text-center py-8">Loading vocabulary...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVocab.map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="japanese-text text-2xl">
                          {item.kanji}
                        </CardTitle>
                        <Badge className={getSRSLevelColor(item.srs_level)}>
                          {item.srs_level}
                        </Badge>
                      </div>
                      <div className="japanese-text text-lg text-gray-600 dark:text-gray-400">
                        {item.kana_reading}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.english_meaning}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Example:
                          </div>
                          <div className="japanese-text text-lg mb-1">
                            {item.example_sentence_jp}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.example_sentence_en}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Kanji Tab */}
          <TabsContent value="kanji" className="mt-6">
            {kanjiLoading ? (
              <div className="text-center py-8">Loading kanji...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredKanji.map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="japanese-text text-4xl">
                          {item.kanji}
                        </CardTitle>
                        <Badge className={getSRSLevelColor(item.srs_level)}>
                          {item.srs_level}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.stroke_count} strokes
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.english_meaning}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            On'yomi:
                          </div>
                          <div className="japanese-text text-lg">
                            {item.onyomi}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Kun'yomi:
                          </div>
                          <div className="japanese-text text-lg">
                            {item.kunyomi}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Example words:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.example_vocab.map((vocab, idx) => (
                              <Badge key={idx} variant="secondary" className="japanese-text">
                                {vocab}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Grammar Tab */}
          <TabsContent value="grammar" className="mt-6">
            {grammarLoading ? (
              <div className="text-center py-8">Loading grammar...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {filteredGrammar.map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="japanese-text text-xl">
                          {item.grammar_point}
                        </CardTitle>
                        <Badge className={getSRSLevelColor(item.srs_level)}>
                          {item.srs_level}
                        </Badge>
                      </div>
                      <div className="text-lg text-gray-600 dark:text-gray-400">
                        {item.meaning_en}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Structure:
                          </div>
                          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {item.structure_notes}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Example:
                          </div>
                          <div className="japanese-text text-lg mb-1">
                            {item.example_sentence_jp}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.example_sentence_en}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}