import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Target, Trophy, Award, Zap, Play, BarChart3, Settings } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: recentSessions } = useQuery<any[]>({
    queryKey: ["/api/dashboard/recent-sessions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: achievements } = useQuery<any[]>({
    queryKey: ["/api/dashboard/achievements"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // JLPT Level Selection Mutation
  const updateLevelMutation = useMutation({
    mutationFn: async (level: string) => {
      await apiRequest("PUT", "/api/user/jlpt-level", { jlptLevel: level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "JLPT Level Updated",
        description: "Your study content will now focus on this level",
      });
    },
  });

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

      {/* Quick Study Options */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Study</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/study-mode">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Play className="h-5 w-5" />
                <span className="text-sm">Study Session</span>
              </Button>
            </Link>

            <Link href="/learning-practice">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Target className="h-5 w-5" />
                <span className="text-sm">Practice Cards</span>
              </Button>
            </Link>

            <Link href="/jlpt-progress">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Award className="h-5 w-5" />
                <span className="text-sm">JLPT Progress</span>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Settings className="h-5 w-5" />
                <span className="text-sm">Settings</span>
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
                  <Progress value={progress} className="flex-1 h-2" />
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
    </div>
  );
}