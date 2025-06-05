import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Award, 
  TrendingUp,
  Clock,
  Target,
  Star,
  Calendar,
  Brain
} from "lucide-react";
import { Link } from "wouter";

interface JLPTStats {
  level: string;
  vocabularyMastered: number;
  totalVocabulary: number;
  kanjiMastered: number;
  totalKanji: number;
  grammarMastered: number;
  totalGrammar: number;
  overallProgress: number;
  estimatedStudyTime: number;
  nextMilestone: string;
}

const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function JLPTProgress() {
  const { data: user } = useQuery<any>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: jlptStats } = useQuery<JLPTStats[]>({
    queryKey: ["/api/jlpt/progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: weeklyProgress } = useQuery<any[]>({
    queryKey: ["/api/jlpt/weekly-progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="mb-4">Please log in to view JLPT progress</p>
          <Link href="/auth">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentLevelStats = jlptStats?.find(stat => stat.level === user.currentJLPTLevel);

  return (
    <div className="px-2 py-2 space-y-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-lg font-bold">JLPT Progress</h1>
        <p className="text-sm text-muted-foreground">
          Track your Japanese proficiency journey
        </p>
      </div>

      {/* Current Level Overview */}
      {currentLevelStats && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-semibold">Current Level: {currentLevelStats.level}</span>
              </div>
              <Badge variant="secondary">
                {currentLevelStats.overallProgress}% Complete
              </Badge>
            </div>
            
            <Progress value={currentLevelStats.overallProgress} className="h-3" />
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Vocabulary</p>
                <p className="text-sm font-medium">
                  {currentLevelStats.vocabularyMastered}/{currentLevelStats.totalVocabulary}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Kanji</p>
                <p className="text-sm font-medium">
                  {currentLevelStats.kanjiMastered}/{currentLevelStats.totalKanji}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Grammar</p>
                <p className="text-sm font-medium">
                  {currentLevelStats.grammarMastered}/{currentLevelStats.totalGrammar}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Study Goals */}
      <Card className="p-3">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Study Goals</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Daily Goal</span>
              <div className="flex items-center space-x-2">
                <Progress value={75} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground">15/20 min</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Weekly Goal</span>
              <div className="flex items-center space-x-2">
                <Progress value={60} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground">4/7 days</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* JLPT Levels Overview */}
      <Card className="p-3">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">JLPT Levels</span>
          </div>
          
          <div className="space-y-2">
            {jlptLevels.map((level) => {
              const stats = jlptStats?.find(s => s.level === level);
              const progress = stats?.overallProgress || 0;
              const isCurrentLevel = level === user.currentJLPTLevel;
              
              return (
                <div key={level} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 w-12">
                    <span className={`text-xs font-mono ${isCurrentLevel ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {level}
                    </span>
                    {isCurrentLevel && <Star className="h-3 w-3 text-primary" />}
                  </div>
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-8">
                    {progress}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Study Categories */}
      <Tabs defaultValue="vocabulary" className="space-y-3">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vocabulary" className="text-xs">Vocabulary</TabsTrigger>
          <TabsTrigger value="kanji" className="text-xs">Kanji</TabsTrigger>
          <TabsTrigger value="grammar" className="text-xs">Grammar</TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="space-y-2">
          <Card className="p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vocabulary Progress</span>
                <Badge variant="outline">{currentLevelStats?.level || 'N5'}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Words Mastered</span>
                  <span>{currentLevelStats?.vocabularyMastered || 0} / {currentLevelStats?.totalVocabulary || 800}</span>
                </div>
                <Progress value={(currentLevelStats?.vocabularyMastered || 0) / (currentLevelStats?.totalVocabulary || 800) * 100} className="h-2" />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="flex-1 mr-1">
                  Review Words
                </Button>
                <Button size="sm" className="flex-1 ml-1">
                  Learn New
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="kanji" className="space-y-2">
          <Card className="p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Kanji Progress</span>
                <Badge variant="outline">{currentLevelStats?.level || 'N5'}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Kanji Mastered</span>
                  <span>{currentLevelStats?.kanjiMastered || 0} / {currentLevelStats?.totalKanji || 80}</span>
                </div>
                <Progress value={(currentLevelStats?.kanjiMastered || 0) / (currentLevelStats?.totalKanji || 80) * 100} className="h-2" />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="flex-1 mr-1">
                  Review Kanji
                </Button>
                <Button size="sm" className="flex-1 ml-1">
                  Learn New
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="grammar" className="space-y-2">
          <Card className="p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Grammar Progress</span>
                <Badge variant="outline">{currentLevelStats?.level || 'N5'}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Grammar Points</span>
                  <span>{currentLevelStats?.grammarMastered || 0} / {currentLevelStats?.totalGrammar || 120}</span>
                </div>
                <Progress value={(currentLevelStats?.grammarMastered || 0) / (currentLevelStats?.totalGrammar || 120) * 100} className="h-2" />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="flex-1 mr-1">
                  Review Grammar
                </Button>
                <Button size="sm" className="flex-1 ml-1">
                  Learn New
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weekly Activity */}
      <Card className="p-3">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">This Week</span>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day}</div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index < 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {index < 4 ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">4 day streak this week!</p>
          </div>
        </div>
      </Card>

      {/* Study Recommendations */}
      <Card className="p-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Recommended Study</span>
          </div>
          
          <div className="space-y-2">
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-sm font-medium">Focus on Vocabulary</p>
              <p className="text-xs text-muted-foreground">
                You're making great progress! Review 10 words today to maintain momentum.
              </p>
            </div>
            
            <Link href="/study">
              <Button className="w-full">Start Studying</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}