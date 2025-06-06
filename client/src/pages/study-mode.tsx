import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, BookOpen, Brain, Type, Eye, Plus, Play } from "lucide-react";
import { Link } from "wouter";

interface StudyOptions {
  reviews: {
    kanji: number;
    grammar: number;
    vocabulary: number;
    total: number;
  };
  newItems: {
    kanji: number;
    grammar: number;
    vocabulary: number;
  };
  currentLevel: string;
  todayProgress: {
    kanjiLearned: number;
    grammarLearned: number;
    vocabularyLearned: number;
    goals: {
      kanji: number;
      grammar: number;
      vocabulary: number;
    };
  };
}

export default function StudyModePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>("all");
  
  // Check URL parameters for direct study/review
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  const modeParam = urlParams.get('mode');

  const { data: studyOptions, isLoading } = useQuery<StudyOptions>({
    queryKey: ["/api/study-options"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const userJLPTLevel = user?.currentJLPTLevel || 'N5';

  const { data: vocabulary } = useQuery({
    queryKey: ["/api/vocabulary?level=" + userJLPTLevel],
    retry: false,
  });

  const { data: kanji } = useQuery({
    queryKey: ["/api/kanji?level=" + userJLPTLevel],
    retry: false,
  });

  const { data: grammar } = useQuery({
    queryKey: ["/api/grammar?level=" + userJLPTLevel],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studyOptions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load study options</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const jlptLevels = ["N5", "N4", "N3", "N2", "N1"];
  const currentLevelIndex = jlptLevels.indexOf(studyOptions.currentLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
            <p className="text-gray-600">Choose what to study today</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {studyOptions.currentLevel}
            </Badge>
          </div>
        </div>

        {/* Content Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Content Type
            </CardTitle>
            <CardDescription>
              Choose what type of content you want to study
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedContentType} onValueChange={setSelectedContentType}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Content</TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="kanji">Kanji</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="learn">Learn New</TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {studyOptions.reviews.total} items ready for review
              </h2>
              <p className="text-gray-600">
                Keep your knowledge fresh with spaced repetition
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* All Reviews */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900">All Reviews</CardTitle>
                  <CardDescription>Mixed practice</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-900 mb-2">
                    {studyOptions.reviews.total}
                  </div>
                  <p className="text-sm text-blue-700 mb-4">items pending</p>
                  <Link href="/study-dedicated?mode=all-reviews">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Start Reviews
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Kanji Reviews */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                    <Type className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-purple-900">Kanji</CardTitle>
                  <CardDescription>Character practice</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-900 mb-2">
                    {studyOptions.reviews.kanji}
                  </div>
                  <p className="text-sm text-purple-700 mb-4">kanji pending</p>
                  <Link href="/study-dedicated?mode=kanji-reviews">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={studyOptions.reviews.kanji === 0}
                    >
                      {studyOptions.reviews.kanji > 0 ? "Review Kanji" : "No Reviews"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Grammar Reviews */}
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-2">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-green-900">Grammar</CardTitle>
                  <CardDescription>Structure practice</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-900 mb-2">
                    {studyOptions.reviews.grammar}
                  </div>
                  <p className="text-sm text-green-700 mb-4">patterns pending</p>
                  <Link href="/study-dedicated?mode=grammar-reviews">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={studyOptions.reviews.grammar === 0}
                    >
                      {studyOptions.reviews.grammar > 0 ? "Review Grammar" : "No Reviews"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Vocabulary Reviews */}
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-2">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-orange-900">Vocabulary</CardTitle>
                  <CardDescription>Word practice</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-orange-900 mb-2">
                    {studyOptions.reviews.vocabulary}
                  </div>
                  <p className="text-sm text-orange-700 mb-4">words pending</p>
                  <Link href="/study-dedicated?mode=vocabulary-reviews">
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={studyOptions.reviews.vocabulary === 0}
                    >
                      {studyOptions.reviews.vocabulary > 0 ? "Review Vocab" : "No Reviews"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learn New Tab */}
          <TabsContent value="learn" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Learn New Content
              </h2>
              <p className="text-gray-600">
                Expand your knowledge with {studyOptions.currentLevel} level content
              </p>
            </div>

            {/* Daily Goals Progress */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-center">Today's Learning Goals</CardTitle>
                <CardDescription className="text-center">
                  Track your daily progress in each category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Kanji Progress */}
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-purple-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={`${(studyOptions.todayProgress.kanjiLearned / studyOptions.todayProgress.goals.kanji) * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-600">
                          {studyOptions.todayProgress.kanjiLearned}
                        </span>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">Kanji</div>
                    <div className="text-sm text-gray-600">
                      {studyOptions.todayProgress.kanjiLearned} of {studyOptions.todayProgress.goals.kanji}
                    </div>
                    <Badge 
                      variant={studyOptions.todayProgress.kanjiLearned >= studyOptions.todayProgress.goals.kanji ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {studyOptions.todayProgress.kanjiLearned >= studyOptions.todayProgress.goals.kanji ? "Complete!" : "In Progress"}
                    </Badge>
                  </div>

                  {/* Grammar Progress */}
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-green-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={`${(studyOptions.todayProgress.grammarLearned / studyOptions.todayProgress.goals.grammar) * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">
                          {studyOptions.todayProgress.grammarLearned}
                        </span>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">Grammar</div>
                    <div className="text-sm text-gray-600">
                      {studyOptions.todayProgress.grammarLearned} of {studyOptions.todayProgress.goals.grammar}
                    </div>
                    <Badge 
                      variant={studyOptions.todayProgress.grammarLearned >= studyOptions.todayProgress.goals.grammar ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {studyOptions.todayProgress.grammarLearned >= studyOptions.todayProgress.goals.grammar ? "Complete!" : "In Progress"}
                    </Badge>
                  </div>

                  {/* Vocabulary Progress */}
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-orange-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={`${(studyOptions.todayProgress.vocabularyLearned / studyOptions.todayProgress.goals.vocabulary) * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-600">
                          {studyOptions.todayProgress.vocabularyLearned}
                        </span>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">Vocabulary</div>
                    <div className="text-sm text-gray-600">
                      {studyOptions.todayProgress.vocabularyLearned} of {studyOptions.todayProgress.goals.vocabulary}
                    </div>
                    <Badge 
                      variant={studyOptions.todayProgress.vocabularyLearned >= studyOptions.todayProgress.goals.vocabulary ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {studyOptions.todayProgress.vocabularyLearned >= studyOptions.todayProgress.goals.vocabulary ? "Complete!" : "In Progress"}
                    </Badge>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      Adjust Goals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Learn Kanji */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Type className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-purple-900">New Kanji</CardTitle>
                  <CardDescription>Learn {studyOptions.currentLevel} level characters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-900 mb-1">
                      {studyOptions.newItems.kanji}
                    </div>
                    <p className="text-sm text-purple-700">available to learn</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">JLPT Progress:</p>
                    <div className="flex justify-center space-x-1">
                      {jlptLevels.map((level, index) => (
                        <Badge 
                          key={level}
                          variant={index <= currentLevelIndex ? "default" : "outline"}
                          className={`text-xs ${
                            index <= currentLevelIndex 
                              ? "bg-purple-600 text-white" 
                              : "text-purple-600"
                          }`}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link href="/study-dedicated?mode=learn-kanji">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={studyOptions.newItems.kanji === 0}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {studyOptions.newItems.kanji > 0 ? "Learn Kanji" : "All Learned"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Learn Grammar */}
              <Card className="border-2 border-green-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Brain className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-green-900">New Grammar</CardTitle>
                  <CardDescription>Learn {studyOptions.currentLevel} level patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {studyOptions.newItems.grammar}
                    </div>
                    <p className="text-sm text-green-700">patterns to learn</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">JLPT Progress:</p>
                    <div className="flex justify-center space-x-1">
                      {jlptLevels.map((level, index) => (
                        <Badge 
                          key={level}
                          variant={index <= currentLevelIndex ? "default" : "outline"}
                          className={`text-xs ${
                            index <= currentLevelIndex 
                              ? "bg-green-600 text-white" 
                              : "text-green-600"
                          }`}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link href="/study-dedicated?mode=learn-grammar">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={studyOptions.newItems.grammar === 0}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {studyOptions.newItems.grammar > 0 ? "Learn Grammar" : "All Learned"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Learn Vocabulary */}
              <Card className="border-2 border-orange-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-900">New Vocabulary</CardTitle>
                  <CardDescription>Learn {studyOptions.currentLevel} level words</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-900 mb-1">
                      {studyOptions.newItems.vocabulary}
                    </div>
                    <p className="text-sm text-orange-700">words to learn</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">JLPT Progress:</p>
                    <div className="flex justify-center space-x-1">
                      {jlptLevels.map((level, index) => (
                        <Badge 
                          key={level}
                          variant={index <= currentLevelIndex ? "default" : "outline"}
                          className={`text-xs ${
                            index <= currentLevelIndex 
                              ? "bg-orange-600 text-white" 
                              : "text-orange-600"
                          }`}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link href="/study-dedicated?mode=learn-vocabulary">
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={studyOptions.newItems.vocabulary === 0}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {studyOptions.newItems.vocabulary > 0 ? "Learn Vocab" : "All Learned"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* JLPT Level Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-center">JLPT Learning Path</CardTitle>
                <CardDescription className="text-center">
                  Structured progression from beginner to advanced
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {jlptLevels.map((level, index) => {
                    const isUnlocked = index <= currentLevelIndex;
                    const isCurrent = level === studyOptions.currentLevel;

                    return (
                      <div 
                        key={level}
                        className={`p-4 rounded-lg text-center ${
                          isCurrent 
                            ? "bg-blue-600 text-white" 
                            : isUnlocked 
                              ? "bg-white border-2 border-blue-200" 
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <div className="font-bold text-lg">{level}</div>
                        <div className="text-sm mt-1">
                          {isCurrent ? "Current" : isUnlocked ? "Unlocked" : "Locked"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Complete {studyOptions.currentLevel} to unlock the next level
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}