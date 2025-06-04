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
      {/* Subtle background sakura pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
        <div className="absolute top-20 left-10 text-6xl rotate-12">🌸</div>
        <div className="absolute top-40 right-20 text-4xl -rotate-6">🌸</div>
        <div className="absolute bottom-32 left-1/4 text-5xl rotate-45">🌸</div>
        <div className="absolute top-1/3 right-1/3 text-3xl -rotate-12">🌸</div>
        <div className="absolute bottom-20 right-10 text-4xl rotate-6">🌸</div>
      </div>
      
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

        {/* Enhanced Visual Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Progress Ring */}
          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary japanese-text">総経験値</p>
                <p className="text-xs text-muted-foreground mb-2">Total XP</p>
                <p className="text-2xl font-bold text-foreground">{user.totalXP.toLocaleString()}</p>
                <p className="text-xs text-primary">Level {stats.currentLevel}</p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="hsl(var(--achievement))"
                    strokeWidth="2"
                    strokeDasharray={`${stats.levelProgress}, 100`}
                    className="zen-pulse"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="h-6 w-6 text-achievement" />
                </div>
              </div>
            </div>
          </div>

          {/* Streak Calendar Visual */}
          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div>
              <p className="text-sm font-medium text-orange-600 japanese-text mb-1">連続学習</p>
              <p className="text-xs text-muted-foreground mb-3">Study Streak</p>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-2xl font-bold text-foreground">{user.currentStreak}</p>
                <p className="text-sm text-orange-600">days</p>
              </div>
              
              {/* Mini calendar dots */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < user.currentStreak % 7 
                        ? 'bg-orange-400' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-orange-600">Best: {user.bestStreak} days</p>
            </div>
          </div>

          {/* Accuracy Gauge */}
          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div>
              <p className="text-sm font-medium text-green-600 japanese-text mb-1">正確性</p>
              <p className="text-xs text-muted-foreground mb-3">Accuracy</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground mb-2">{stats.accuracy}%</p>
                  <div className="zen-progress h-2">
                    <div 
                      className="zen-progress-fill h-full"
                      style={{ width: `${stats.accuracy}%` }}
                    />
                  </div>
                </div>
                <div className="relative">
                  <Target className="h-8 w-8 text-green-500" />
                  {stats.accuracy >= 90 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mastery Progress Chart */}
          <div className="zen-card p-6 group hover:shadow-lg transition-all">
            <div>
              <p className="text-sm font-medium text-purple-600 japanese-text mb-1">習得済み</p>
              <p className="text-xs text-muted-foreground mb-3">Cards Mastered</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{stats.masteredCards}</p>
                  <p className="text-xs text-purple-600 mb-2">of {stats.totalCards} total</p>
                  
                  {/* Mini bar chart */}
                  <div className="flex gap-1 h-8 items-end">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-purple-200 to-purple-400 rounded-sm"
                        style={{
                          height: `${Math.min(100, (stats.masteredCards / stats.totalCards) * 100 + (i * 10))}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <Trophy className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Sections */}
        <Tabs defaultValue="progress" className="space-y-6">
          <div className="zen-card p-1 bg-gradient-to-r from-muted/50 to-accent/50">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger value="progress" className="zen-nav-item">
                <span className="japanese-text">進捗</span>
                <span className="ml-1 text-xs">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="zen-nav-item">
                <span className="japanese-text">学習</span>
                <span className="ml-1 text-xs">Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="zen-nav-item">
                <span className="japanese-text">成果</span>
                <span className="ml-1 text-xs">Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="zen-nav-item">
                <span className="japanese-text">分析</span>
                <span className="ml-1 text-xs">Insights</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Belt Progression */}
              <div className="zen-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-gradient-to-br from-achievement/20 to-achievement-gold/20">
                    <Award className="h-5 w-5 text-achievement" />
                  </div>
                  <div>
                    <h3 className="font-semibold japanese-heading">帯の進歩</h3>
                    <p className="text-sm text-muted-foreground">Belt Progression</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">
                      {beltEmojis[user.currentBelt]} {user.currentBelt.charAt(0).toUpperCase() + user.currentBelt.slice(1)} Belt
                    </span>
                    {stats.nextBelt && (
                      <span className="text-sm text-muted-foreground">
                        Next: {beltEmojis[stats.nextBelt]} {stats.nextBelt.charAt(0).toUpperCase() + stats.nextBelt.slice(1)}
                      </span>
                    )}
                  </div>
                  
                  {/* Interactive belt visualization */}
                  <div className="flex gap-2 my-4">
                    {beltOrder.map((belt, index) => (
                      <div
                        key={belt}
                        className={`flex-1 h-8 rounded-lg transition-all ${
                          index <= beltIndex 
                            ? 'bg-gradient-to-t from-achievement to-achievement-gold shadow-md' 
                            : 'bg-muted'
                        }`}
                        title={`${belt} belt`}
                      >
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs">{beltEmojis[belt]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="zen-progress h-3">
                    <div 
                      className="zen-progress-fill h-full"
                      style={{ width: `${beltProgress}%` }}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Belt {beltIndex + 1} of {beltOrder.length}
                  </div>
                </div>
              </div>

              {/* JLPT Level Radar Chart */}
              <div className="zen-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-matcha/20">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold japanese-heading">JLPT レベル</h3>
                    <p className="text-sm text-muted-foreground">Level {stats.currentLevel} • {stats.xpToNextLevel} XP to next</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Circular progress for current level */}
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="3"
                      />
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeDasharray={`${stats.levelProgress}, 100`}
                        className="zen-pulse"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{stats.currentLevel}</span>
                      <span className="text-xs text-muted-foreground">Level</span>
                    </div>
                  </div>
                  
                  {/* JLPT level indicators */}
                  <div className="grid grid-cols-5 gap-2">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((level, index) => (
                      <div
                        key={level}
                        className={`text-center p-2 rounded-lg transition-all ${
                          level === user.currentJLPTLevel
                            ? 'bg-gradient-to-t from-primary/20 to-matcha/20 border border-primary/30'
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
            </div>
          </TabsContent>

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