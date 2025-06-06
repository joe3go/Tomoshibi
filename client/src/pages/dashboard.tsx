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
import { Card } from "@/components/ui/card";
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

      {/* JLPT Level Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your JLPT Level</h3>
            <Badge variant="secondary" className="text-sm">
              Current: {user.currentJLPTLevel || 'N5'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={user.currentJLPTLevel || 'N5'}
                onValueChange={(value) => updateLevelMutation.mutate(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your JLPT level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N5">N5 - Beginner</SelectItem>
                  <SelectItem value="N4">N4 - Elementary</SelectItem>
                  <SelectItem value="N3">N3 - Intermediate</SelectItem>
                  <SelectItem value="N2">N2 - Upper Intermediate</SelectItem>
                  <SelectItem value="N1">N1 - Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link href="/jlpt-progress">
              <Button variant="outline" size="sm">
                <Trophy className="h-4 w-4 mr-2" />
                View Progress
              </Button>
            </Link>
          </div>
        </div>
      </Card>

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