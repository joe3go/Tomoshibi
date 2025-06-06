import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  BookOpen, 
  BarChart3, 
  Target, 
  Play, 
  Award, 
  Settings, 
  Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { JLPTLevelSelector, useJLPTLevelCheck } from "@/components/jlpt-level-selector";

export default function Dashboard() {
  const { showLevelSelector, setShowLevelSelector } = useJLPTLevelCheck();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const updateLevelMutation = useMutation({
    mutationFn: async (level: string) => {
      const response = await apiRequest("PATCH", "/api/user/jlpt-level", { level });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const { data: recentSessions } = useQuery({
    queryKey: ["/api/study-sessions/recent"],
    retry: false,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements/user"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Welcome back, {user.displayName || user.username}!</h1>
        <p className="text-muted-foreground">Continue your Japanese learning journey</p>
      </div>

      {/* Interactive Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Kanji Progress */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-red-200 dark:hover:border-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">漢</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Kanji</h3>
                  <p className="text-sm text-muted-foreground">Characters</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300">
                45/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar value={45} className="h-3 bg-red-100 dark:bg-red-900/20" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="font-semibold text-orange-600 dark:text-orange-400">12</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="font-semibold text-green-600 dark:text-green-400">5</div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Vocabulary Progress */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Vocabulary</h3>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300">
                234/800
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar value={29} className="h-3 bg-blue-100 dark:bg-blue-900/20" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="font-semibold text-orange-600 dark:text-orange-400">28</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="font-semibold text-green-600 dark:text-green-400">10</div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Grammar Progress */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">文</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Grammar</h3>
                  <p className="text-sm text-muted-foreground">Patterns</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300">
                67/120
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar value={56} className="h-3 bg-green-100 dark:bg-green-900/20" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="font-semibold text-orange-600 dark:text-orange-400">8</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="font-semibold text-green-600 dark:text-green-400">3</div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </div>

      {/* Study Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/vocabulary">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Vocabulary</h3>
              <p className="text-sm text-muted-foreground">Study words and meanings</p>
            </div>
          </Card>
        </Link>

        <Link href="/kanji">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Kanji</h3>
              <p className="text-sm text-muted-foreground">Learn characters and readings</p>
            </div>
          </Card>
        </Link>

        <Link href="/grammar">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Grammar</h3>
              <p className="text-sm text-muted-foreground">Master sentence patterns</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Learn Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Learn</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href="/vocabulary">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Vocabulary</span>
              </Button>
            </Link>

            <Link href="/kanji">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Target className="h-5 w-5" />
                <span className="text-sm">Kanji</span>
              </Button>
            </Link>

            <Link href="/grammar">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Grammar</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Review Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href="/study-mode">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Play className="h-5 w-5" />
                <span className="text-sm">Study Session</span>
              </Button>
            </Link>

            <Link href="/content-browser">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Award className="h-5 w-5" />
                <span className="text-sm">Content Browser</span>
              </Button>
            </Link>

            <Link href="/jlpt-progress">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Trophy className="h-5 w-5" />
                <span className="text-sm">Progress</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* JLPT Progress Section */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">JLPT Progress</h3>
            <Badge variant="secondary" className="text-xs">{user.currentJLPTLevel || 'N5'}</Badge>
          </div>

          <div className="space-y-2">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => {
              const progress = level === 'N5' ? 85 : level === 'N4' ? 15 : 0;
              return (
                <div key={level} className="flex items-center space-x-3">
                  <span className="text-xs font-mono w-6">{level}</span>
                  <ProgressBar value={progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      {recentSessions && recentSessions.length > 0 && (
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <div className="space-y-2">
              {recentSessions.slice(0, 3).map((session: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {session.cardsReviewed} cards reviewed
                  </span>
                  <span className="text-primary font-medium">
                    +{session.xpEarned} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recent Achievements</h3>
            <div className="flex space-x-2 overflow-x-auto">
              {achievements.slice(0, 4).map((achievement: any, index: number) => (
                <div key={index} className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      {/* JLPT Level Selection Modal */}
      <JLPTLevelSelector
        currentLevel={user?.currentJLPTLevel}
        showModal={showLevelSelector}
        onClose={() => setShowLevelSelector(false)}
        onLevelSelect={() => setShowLevelSelector(false)}
      />
    </div>
  );
}