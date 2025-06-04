import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Languages, Type, Clock, Target, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguageContent } from "@/App";

interface GrammarPoint {
  id: number;
  title: string;
  titleJapanese: string;
  jlptLevel: string;
  structure: string;
  meaning: string;
  examples: Array<{
    japanese: string;
    english: string;
    reading: string;
  }>;
  notes?: string;
  tags?: string[];
  difficulty: number;
}

interface Kanji {
  id: number;
  character: string;
  jlptLevel: string;
  meaning: string;
  onyomi?: string[];
  kunyomi?: string[];
  radicals?: string[];
  strokeCount: number;
  frequency?: number;
  examples: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
  mnemonics?: string;
}

interface Vocabulary {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  jlptLevel: string;
  kanjiIds?: number[];
  examples: Array<{
    japanese: string;
    english: string;
    reading: string;
  }>;
  difficulty: number;
}

export default function StudyPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const content = useLanguageContent("en");

  const { data: grammarPoints = [], isLoading: grammarLoading } = useQuery<GrammarPoint[]>({
    queryKey: ["/api/grammar"],
  });

  const { data: kanji = [], isLoading: kanjiLoading } = useQuery<Kanji[]>({
    queryKey: ["/api/kanji"],
  });

  const { data: vocabulary = [], isLoading: vocabularyLoading } = useQuery<Vocabulary[]>({
    queryKey: ["/api/vocabulary"],
  });

  const { data: reviewQueue = [], isLoading: reviewLoading } = useQuery({
    queryKey: ["/api/reviews/queue"],
  });

  if (grammarLoading || kanjiLoading || vocabularyLoading || reviewLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading study content...</p>
        </div>
      </div>
    );
  }

  const studyStats = {
    grammar: {
      total: grammarPoints.length,
      learned: 0,
      reviews: reviewQueue.filter((item: any) => item.itemType === 'grammar').length
    },
    kanji: {
      total: kanji.length,
      learned: 0,
      reviews: reviewQueue.filter((item: any) => item.itemType === 'kanji').length
    },
    vocabulary: {
      total: vocabulary.length,
      learned: 0,
      reviews: reviewQueue.filter((item: any) => item.itemType === 'vocabulary').length
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">JLPT N5 Study Center</h1>
        <p className="text-gray-600">Master Japanese grammar, kanji, and vocabulary with our spaced repetition system</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="kanji">Kanji</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Review Queue */}
          {reviewQueue.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Clock className="h-5 w-5" />
                  Reviews Available
                </CardTitle>
                <CardDescription>
                  You have {reviewQueue.length} items ready for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Start Reviews ({reviewQueue.length})
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Study Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Grammar Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{studyStats.grammar.learned}/{studyStats.grammar.total}</span>
                </div>
                <Progress value={(studyStats.grammar.learned / studyStats.grammar.total) * 100} />
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {studyStats.grammar.reviews} reviews
                  </Badge>
                  <Button size="sm" variant="outline">
                    Study Grammar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-red-600" />
                  Kanji
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{studyStats.kanji.learned}/{studyStats.kanji.total}</span>
                </div>
                <Progress value={(studyStats.kanji.learned / studyStats.kanji.total) * 100} />
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {studyStats.kanji.reviews} reviews
                  </Badge>
                  <Button size="sm" variant="outline">
                    Study Kanji
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-green-600" />
                  Vocabulary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{studyStats.vocabulary.learned}/{studyStats.vocabulary.total}</span>
                </div>
                <Progress value={(studyStats.vocabulary.learned / studyStats.vocabulary.total) * 100} />
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {studyStats.vocabulary.reviews} reviews
                  </Badge>
                  <Button size="sm" variant="outline">
                    Study Vocabulary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="grammar" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Grammar Points</h2>
            <Badge variant="outline">{grammarPoints.length} total</Badge>
          </div>
          
          <div className="grid gap-4">
            {grammarPoints.map((point) => (
              <Card key={point.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{point.title}</CardTitle>
                      <CardDescription className="text-lg font-japanese">
                        {point.titleJapanese}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{point.jlptLevel}</Badge>
                      <Badge variant="outline">Level {point.difficulty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-sm">Structure:</p>
                    <p className="text-sm text-gray-600">{point.structure}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Meaning:</p>
                    <p className="text-sm text-gray-600">{point.meaning}</p>
                  </div>
                  {point.examples && point.examples.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">Example:</p>
                      <div className="bg-gray-50 p-3 rounded space-y-1">
                        <p className="font-japanese text-lg">{point.examples[0].japanese}</p>
                        <p className="text-sm text-gray-600">{point.examples[0].reading}</p>
                        <p className="text-sm">{point.examples[0].english}</p>
                      </div>
                    </div>
                  )}
                  <Button size="sm" className="w-full">
                    Study This Grammar Point
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kanji" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Kanji Characters</h2>
            <Badge variant="outline">{kanji.length} total</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kanji.map((kanjiChar) => (
              <Card key={kanjiChar.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="text-6xl font-bold text-gray-800 mb-2">
                    {kanjiChar.character}
                  </div>
                  <CardTitle className="text-lg">{kanjiChar.meaning}</CardTitle>
                  <div className="flex justify-center gap-2">
                    <Badge variant="secondary">{kanjiChar.jlptLevel}</Badge>
                    <Badge variant="outline">{kanjiChar.strokeCount} strokes</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {kanjiChar.onyomi && kanjiChar.onyomi.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">On'yomi:</p>
                      <p className="text-sm text-gray-600">{kanjiChar.onyomi.join(", ")}</p>
                    </div>
                  )}
                  {kanjiChar.kunyomi && kanjiChar.kunyomi.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">Kun'yomi:</p>
                      <p className="text-sm text-gray-600">{kanjiChar.kunyomi.join(", ")}</p>
                    </div>
                  )}
                  {kanjiChar.examples && kanjiChar.examples.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">Example:</p>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <p className="font-japanese">{kanjiChar.examples[0].word}</p>
                        <p className="text-gray-600">{kanjiChar.examples[0].reading}</p>
                        <p>{kanjiChar.examples[0].meaning}</p>
                      </div>
                    </div>
                  )}
                  <Button size="sm" className="w-full">
                    Study This Kanji
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Vocabulary Words</h2>
            <Badge variant="outline">{vocabulary.length} total</Badge>
          </div>
          
          <div className="grid gap-4">
            {vocabulary.map((word) => (
              <Card key={word.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-japanese">{word.word}</CardTitle>
                      <CardDescription className="text-lg">{word.reading}</CardDescription>
                      <p className="text-base">{word.meaning}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{word.jlptLevel}</Badge>
                      <Badge variant="outline">{word.partOfSpeech}</Badge>
                      <Badge variant="outline">Level {word.difficulty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {word.examples && word.examples.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">Example:</p>
                      <div className="bg-gray-50 p-3 rounded space-y-1">
                        <p className="font-japanese text-lg">{word.examples[0].japanese}</p>
                        <p className="text-sm text-gray-600">{word.examples[0].reading}</p>
                        <p className="text-sm">{word.examples[0].english}</p>
                      </div>
                    </div>
                  )}
                  <Button size="sm" className="w-full">
                    Study This Word
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}