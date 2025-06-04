import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Trophy, BookOpen, Brain, Target, Zap, Star, Play, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface DashboardData {
  user: {
    id: number;
    displayName: string;
    currentBelt: string;
    currentJLPTLevel: string;
    totalXP: number;
    currentStreak: number;
    bestStreak: number;
    studyGoal: string;
    dailyGoalMinutes: number;
  };
  stats: {
    totalCards: number;
    masteredCards: number;
    reviewQueue: number;
    accuracy: number;
    currentLevel: number;
    xpToNextLevel: number;
    levelProgress: number;
    nextBelt: string | null;
  };
  recentSessions: Array<{
    id: number;
    cardsReviewed: number;
    cardsCorrect: number;
    timeSpentMinutes: number;
    xpEarned: number;
    startedAt: string;
  }>;
  achievements: Array<{
    id: number;
    unlockedAt: string;
    achievement: {
      name: string;
      description: string;
      icon: string;
      category: string;
      xpReward: number;
    };
  }>;
}

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const { user, stats, recentSessions, achievements } = dashboardData;

  // Belt system for visual progression
  const beltEmojis: Record<string, string> = {
    white: "🤍",
    yellow: "💛",
    orange: "🧡",
    green: "💚",
    blue: "💙",
    brown: "🤎",
    black: "🖤"
  };

  const beltOrder = ["white", "yellow", "orange", "green", "blue", "brown", "black"];
  const beltIndex = beltOrder.indexOf(user.currentBelt);
  const beltProgress = ((beltIndex + 1) / beltOrder.length) * 100;

  return (
    <div className="p-6 relative">
      {/* Floating Sakura Petals */}
      <div className="sakura-float" style={{ left: '10%', animationDelay: '0s' }}>🌸</div>
      <div className="sakura-float" style={{ left: '30%', animationDelay: '2s' }}>🌸</div>
      <div className="sakura-float" style={{ left: '60%', animationDelay: '4s' }}>🌸</div>
      <div className="sakura-float" style={{ left: '80%', animationDelay: '6s' }}>🌸</div>
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Zen Header */}
        <div className="text-center mb-8 zen-card p-8">
          <div className="japanese-welcome mb-4">
            おかえりなさい、{user.displayName}さん
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2 japanese-heading">
            Welcome back, {user.displayName}
          </h1>
          <p className="text-lg text-muted-foreground japanese-text">
            今日も一緒に日本語を学びましょう
          </p>
          <p className="text-base text-muted-foreground mt-1">
            Continue your Japanese learning journey
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="zen-card px-4 py-2 bg-gradient-to-r from-primary/10 to-matcha/10 border-primary/20">
              <span className="text-sm font-medium text-primary">
                {beltEmojis[user.currentBelt]} {user.currentBelt.charAt(0).toUpperCase() + user.currentBelt.slice(1)} Belt
              </span>
            </div>
            <div className="zen-card px-4 py-2 bg-gradient-to-r from-sakura/20 to-ume/20 border-accent/20">
              <span className="text-sm font-medium text-foreground">
                🎯 JLPT {user.currentJLPTLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Zen Study Action */}
        <div className="text-center mb-8">
          <Link href="/study-mode">
            <button className="zen-button text-lg px-12 py-4 group">
              <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="japanese-text">始めましょう</span>
              <span className="ml-2">({stats.reviewQueue} items ready)</span>
            </button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-3 japanese-text">
            今日の復習を始める準備ができています
          </p>
        </div>

        {/* Zen Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary japanese-text">総経験値</p>
                <p className="text-xs text-muted-foreground mb-1">Total XP</p>
                <p className="text-3xl font-bold text-foreground zen-pulse">{user.totalXP.toLocaleString()}</p>
                <p className="text-xs text-primary">Level {stats.currentLevel}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-br from-achievement/20 to-achievement-gold/20">
                <Star className="h-8 w-8 text-achievement" />
              </div>
            </div>
          </div>

          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 japanese-text">連続学習</p>
                <p className="text-xs text-muted-foreground mb-1">Study Streak</p>
                <p className="text-3xl font-bold text-foreground zen-pulse">{user.currentStreak} days</p>
                <p className="text-xs text-orange-600">Best: {user.bestStreak} days</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-achievement/20">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 japanese-text">正確性</p>
                <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-foreground zen-pulse">{stats.accuracy}%</p>
                <p className="text-xs text-green-600">Recent session</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-bamboo/20">
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 japanese-text">習得済み</p>
                <p className="text-xs text-muted-foreground mb-1">Cards Mastered</p>
                <p className="text-3xl font-bold text-foreground zen-pulse">{stats.masteredCards}</p>
                <p className="text-xs text-purple-600">of {stats.totalCards} total</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-ume/20">
                <Trophy className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Belt Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Belt Progression
                  </CardTitle>
                  <CardDescription>
                    Your journey through the dojo system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">
                        {beltEmojis[user.currentBelt]} {user.currentBelt.charAt(0).toUpperCase() + user.currentBelt.slice(1)} Belt
                      </span>
                      {stats.nextBelt && (
                        <span className="text-sm text-gray-600">
                          Next: {beltEmojis[stats.nextBelt]} {stats.nextBelt.charAt(0).toUpperCase() + stats.nextBelt.slice(1)}
                        </span>
                      )}
                    </div>
                    <Progress value={beltProgress} className="h-3" />
                    <div className="text-sm text-gray-600">
                      Belt {beltIndex + 1} of {beltOrder.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* XP Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Level Progress
                  </CardTitle>
                  <CardDescription>
                    Level {stats.currentLevel} • {stats.xpToNextLevel} XP to next level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={stats.levelProgress} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{user.totalXP % 1000} XP</span>
                      <span>1000 XP</span>
                    </div>
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
                      <span className="font-bold">{stats.masteredCards} / {stats.totalCards}</span>
                    </div>
                    <Progress value={(stats.masteredCards / Math.max(stats.totalCards, 1)) * 100} className="h-3" />
                    <div className="text-sm text-gray-600">
                      {Math.round((stats.masteredCards / Math.max(stats.totalCards, 1)) * 100)}% mastery rate
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                    {recentSessions.length > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span>Today's Progress</span>
                          <span className="font-bold">{recentSessions[0]?.timeSpentMinutes || 0} / {user.dailyGoalMinutes} min</span>
                        </div>
                        <Progress value={Math.min((recentSessions[0]?.timeSpentMinutes || 0) / user.dailyGoalMinutes * 100, 100)} className="h-3" />
                      </>
                    )}
                    <Link href="/study">
                      <Button variant="outline" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Continue Studying
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Study Sessions</CardTitle>
                <CardDescription>Your learning activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.length > 0 ? (
                    recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {session.cardsCorrect}/{session.cardsReviewed} correct
                            </div>
                            <div className="text-sm text-gray-600">
                              {session.timeSpentMinutes} minutes • {new Date(session.startedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">+{session.xpEarned} XP</div>
                          <div className="text-sm text-gray-600">
                            {Math.round((session.cardsCorrect / session.cardsReviewed) * 100)}% accuracy
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No study sessions yet. Start your first session!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your learning milestones and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.length > 0 ? (
                    achievements.map((userAchievement) => (
                      <div key={userAchievement.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{userAchievement.achievement.icon}</div>
                          <div>
                            <h3 className="font-semibold text-yellow-800">{userAchievement.achievement.name}</h3>
                            <p className="text-sm text-yellow-700">{userAchievement.achievement.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                +{userAchievement.achievement.xpReward} XP
                              </Badge>
                              <span className="text-xs text-yellow-600">
                                {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      No achievements unlocked yet. Keep studying to earn your first achievement!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                  <CardDescription>Your learning patterns and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900">Consistency is Key</div>
                      <div className="text-sm text-blue-700">
                        You've studied {user.currentStreak} days in a row! Maintaining daily practice is crucial for language retention.
                      </div>
                    </div>
                    
                    {stats.accuracy >= 80 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-900">Excellent Performance</div>
                        <div className="text-sm text-green-700">
                          Your {stats.accuracy}% accuracy shows strong understanding. Consider challenging yourself with new content.
                        </div>
                      </div>
                    )}
                    
                    {stats.reviewQueue > 20 && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="font-medium text-orange-900">Review Backlog</div>
                        <div className="text-sm text-orange-700">
                          You have {stats.reviewQueue} cards ready for review. Focus on clearing these before learning new material.
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Recommended actions to continue your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/study">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Complete {stats.reviewQueue} pending reviews
                      </Button>
                    </Link>
                    
                    {stats.nextBelt && (
                      <Button variant="outline" className="w-full justify-start" disabled>
                        <Award className="mr-2 h-4 w-4" />
                        Work towards {stats.nextBelt} belt
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Target className="mr-2 h-4 w-4" />
                      Set new study goals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}