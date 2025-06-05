import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Trophy, Award, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 space-y-3 h-full overflow-y-auto">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          Welcome back, {user.displayName || user.username}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Ready to continue your Japanese learning journey?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-2 grid-cols-2">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total XP</p>
              <p className="text-lg font-bold text-primary">{user.totalXP}</p>
            </div>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-lg font-bold text-primary">{user.currentStreak}</p>
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Study Actions */}
      <div className="grid gap-2 grid-cols-2">
        <Link href="/study">
          <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-primary">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm">Study</span>
          </Button>
        </Link>
        
        <Link href="/jlpt-progress">
          <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
            <Award className="h-5 w-5" />
            <span className="text-sm">JLPT Progress</span>
          </Button>
        </Link>
      </div>

      {/* JLPT Progress Section */}
      <Card className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">JLPT Progress</h3>
            <Badge variant="secondary" className="text-xs">{user.currentJLPTLevel}</Badge>
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
        <Card className="p-3">
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
        <Card className="p-3">
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