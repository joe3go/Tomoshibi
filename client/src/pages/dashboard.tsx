import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, Trophy, Calendar, TrendingUp, Zap, Brain, Award } from "lucide-react";
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user.displayName || user.username}!
        </h1>
        <p className="text-muted-foreground">
          Ready to continue your Japanese learning journey?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{user.totalXP}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.todayXP || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{user.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Best: {user.bestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.masteredCards || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCards || 0} total cards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">JLPT Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{user.currentJLPTLevel}</div>
            <p className="text-xs text-muted-foreground">
              {user.currentBelt} belt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Daily Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Goal
                </CardTitle>
                <CardDescription>
                  {user.dailyGoalMinutes} minutes per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions && recentSessions.length > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Today's Progress</span>
                        <span className="font-bold">{recentSessions[0]?.timeSpentMinutes || 0} / {user.dailyGoalMinutes} min</span>
                      </div>
                      <Progress value={Math.min((recentSessions[0]?.timeSpentMinutes || 0) / user.dailyGoalMinutes * 100, 100)} className="h-3" />
                    </>
                  )}
                  <Link href="/study-fullscreen">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Studying
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card Mastery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Card Mastery
                </CardTitle>
                <CardDescription>
                  Your sentence card progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Mastered Cards</span>
                    <span className="font-bold">{stats?.masteredCards || 0} / {stats?.totalCards || 0}</span>
                  </div>
                  <Progress value={(stats?.masteredCards || 0) / Math.max(stats?.totalCards || 1, 1) * 100} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    {Math.round((stats?.masteredCards || 0) / Math.max(stats?.totalCards || 1, 1) * 100)}% mastery rate
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  Your latest accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements && achievements.length > 0 ? (
                    achievements.slice(0, 3).map((achievement: any) => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{achievement.achievement?.name}</div>
                          <div className="text-xs text-muted-foreground">{achievement.achievement?.description}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No achievements yet. Keep studying!</div>
                  )}
                  <Link href="/achievements">
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Achievements
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your Japanese learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* JLPT Progress */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">JLPT Progress</h3>
                    <Badge variant="secondary">{user.currentJLPTLevel}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((level, index) => (
                      <div
                        key={level}
                        className={`text-center p-2 rounded-lg transition-all ${
                          level === user.currentJLPTLevel
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/50'
                        }`}
                      >
                        <div className="text-sm font-medium">{level}</div>
                        <div className={`w-full h-1 rounded-full mt-1 ${
                          index < ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(user.currentJLPTLevel) + 1
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Study Sessions</CardTitle>
              <CardDescription>Your learning activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions && recentSessions.length > 0 ? (
                  recentSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {session.timeSpentMinutes} minutes studied
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary">
                          +{session.xpEarned || 0} XP
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.cardsStudied || 0} cards
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No study sessions yet. Start studying to see your progress!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}