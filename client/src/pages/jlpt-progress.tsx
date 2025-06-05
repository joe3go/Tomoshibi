import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Languages, GraduationCap, TrendingUp, Target, Star } from 'lucide-react';
import { Link } from 'wouter';

interface JLPTProgress {
  userId: string;
  progress: {
    n5: {
      vocab: number;
      kanji: number;
      grammar: number;
    };
    n4: {
      vocab: number;
      kanji: number;
      grammar: number;
    };
    n3: {
      vocab: number;
      kanji: number;
      grammar: number;
    };
    n2: {
      vocab: number;
      kanji: number;
      grammar: number;
    };
    n1: {
      vocab: number;
      kanji: number;
      grammar: number;
    };
  };
  totalItems: {
    n5: { vocab: number; kanji: number; grammar: number };
    n4: { vocab: number; kanji: number; grammar: number };
    n3: { vocab: number; kanji: number; grammar: number };
    n2: { vocab: number; kanji: number; grammar: number };
    n1: { vocab: number; kanji: number; grammar: number };
  };
}

const JLPT_LEVELS = [
  { 
    level: 'N5', 
    name: 'Beginner', 
    color: 'bg-green-500', 
    description: 'Basic Japanese',
    difficulty: 1
  },
  { 
    level: 'N4', 
    name: 'Elementary', 
    color: 'bg-blue-500', 
    description: 'Elementary Japanese',
    difficulty: 2
  },
  { 
    level: 'N3', 
    name: 'Intermediate', 
    color: 'bg-yellow-500', 
    description: 'Intermediate Japanese',
    difficulty: 3
  },
  { 
    level: 'N2', 
    name: 'Upper Intermediate', 
    color: 'bg-orange-500', 
    description: 'Advanced Japanese',
    difficulty: 4
  },
  { 
    level: 'N1', 
    name: 'Advanced', 
    color: 'bg-red-500', 
    description: 'Native-level Japanese',
    difficulty: 5
  }
];

export default function JLPTProgressPage() {
  const { data: progressData, isLoading } = useQuery<JLPTProgress>({
    queryKey: ['/api/jlpt/progress']
  });

  const calculateOverallProgress = (levelKey: string) => {
    if (!progressData) return 0;
    
    const level = levelKey.toLowerCase() as keyof typeof progressData.progress;
    const progress = progressData.progress[level];
    const totals = progressData.totalItems[level];
    
    const learned = progress.vocab + progress.kanji + progress.grammar;
    const total = totals.vocab + totals.kanji + totals.grammar;
    
    return total > 0 ? Math.round((learned / total) * 100) : 0;
  };

  const calculateCategoryProgress = (levelKey: string, category: 'vocab' | 'kanji' | 'grammar') => {
    if (!progressData) return { learned: 0, total: 0, percentage: 0 };
    
    const level = levelKey.toLowerCase() as keyof typeof progressData.progress;
    const learned = progressData.progress[level][category];
    const total = progressData.totalItems[level][category];
    const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
    
    return { learned, total, percentage };
  };

  const getProgressBadge = (percentage: number) => {
    if (percentage === 100) return { text: 'Completed', variant: 'default' as const };
    if (percentage >= 80) return { text: 'Almost Done', variant: 'secondary' as const };
    if (percentage >= 50) return { text: 'In Progress', variant: 'outline' as const };
    if (percentage > 0) return { text: 'Started', variant: 'outline' as const };
    return { text: 'Not Started', variant: 'secondary' as const };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Loading JLPT progress...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JLPT Progress Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your journey from beginner to advanced Japanese proficiency
        </p>
      </div>

      {/* Overall Stats */}
      {progressData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  JLPT_LEVELS.reduce((acc, level) => acc + calculateOverallProgress(level.level), 0) / 5
                )}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all JLPT levels
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {JLPT_LEVELS.find(level => calculateOverallProgress(level.level) > 0 && calculateOverallProgress(level.level) < 100)?.level || 'N5'}
              </div>
              <p className="text-xs text-muted-foreground">
                Actively studying
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Levels</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {JLPT_LEVELS.filter(level => calculateOverallProgress(level.level) === 100).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 5 levels
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* JLPT Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {JLPT_LEVELS.map((levelInfo) => {
          const overallProgress = calculateOverallProgress(levelInfo.level);
          const vocabProgress = calculateCategoryProgress(levelInfo.level, 'vocab');
          const kanjiProgress = calculateCategoryProgress(levelInfo.level, 'kanji');
          const grammarProgress = calculateCategoryProgress(levelInfo.level, 'grammar');
          const badge = getProgressBadge(overallProgress);

          return (
            <Card key={levelInfo.level} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 left-0 right-0 h-1 ${levelInfo.color}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">{levelInfo.level}</CardTitle>
                    <p className="text-sm text-muted-foreground">{levelInfo.name}</p>
                  </div>
                  <Badge variant={badge.variant} className="text-xs">
                    {badge.text}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {levelInfo.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span className="font-medium">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>

                {/* Category Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span>Vocabulary</span>
                        <span>{vocabProgress.learned}/{vocabProgress.total}</span>
                      </div>
                      <Progress value={vocabProgress.percentage} className="h-1 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Languages className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span>Kanji</span>
                        <span>{kanjiProgress.learned}/{kanjiProgress.total}</span>
                      </div>
                      <Progress value={kanjiProgress.percentage} className="h-1 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span>Grammar</span>
                        <span>{grammarProgress.learned}/{grammarProgress.total}</span>
                      </div>
                      <Progress value={grammarProgress.percentage} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/jlpt-content?level=${levelInfo.level}`}>
                  <Button 
                    variant={overallProgress > 0 ? "default" : "outline"} 
                    className="w-full text-xs"
                    size="sm"
                  >
                    {overallProgress === 100 ? 'Review' : overallProgress > 0 ? 'Continue' : 'Start Learning'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Study</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Jump into a study session based on your current progress
            </p>
            <div className="flex gap-2">
              <Link href="/study?mode=review">
                <Button variant="outline" size="sm">
                  Review Mode
                </Button>
              </Link>
              <Link href="/study?mode=new">
                <Button size="sm">
                  Learn New
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set daily goals and track your consistency
            </p>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="w-full">
                Configure Study Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}