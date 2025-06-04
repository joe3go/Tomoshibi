import { Badge } from "@/components/ui/badge";
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
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="zen-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-matcha opacity-20 animate-ping"></div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-matcha to-primary absolute top-2 left-2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="zen-card p-8 max-w-md mx-auto">
          <p className="text-muted-foreground japanese-text">接続に問題があります</p>
          <p className="text-sm text-muted-foreground mt-2">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <div className="zen-card p-8 max-w-md mx-auto">
          <p className="text-muted-foreground japanese-text">データがありません</p>
          <p className="text-sm text-muted-foreground mt-2">No data available</p>
        </div>
      </div>
    );
  }

  const user = dashboardData.user;
  const stats = dashboardData.stats;
  const recentSessions = dashboardData.recentSessions || [];
  const achievements = dashboardData.achievements || [];

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
    <div className="p-4 relative max-h-screen overflow-y-auto bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Welcome Header */}
        <div className="bg-card text-card-foreground border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg mb-1 font-semibold text-foreground">
                おかえりなさい、{user.displayName}さん
              </div>
              <div className="text-sm text-muted-foreground">
                {beltEmojis[user.currentBelt]} {user.currentBelt.charAt(0).toUpperCase() + user.currentBelt.slice(1)} Belt • JLPT {user.currentJLPTLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/study-mode">
            <div className="p-6 rounded-xl border transition-all cursor-pointer hover:border-primary/50" style={{ backgroundColor: 'hsl(var(--surface-4dp))', borderColor: 'hsl(var(--primary) / 0.3)' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full text-white" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                  <Play className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Start Review</h3>
                  <p className="text-muted-foreground">{stats.reviewQueue} cards ready to review</p>
                  <div className="text-sm text-primary font-medium mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    Continue your learning journey
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/study">
            <div className="p-6 rounded-xl border transition-all cursor-pointer hover:border-neon-cyan/50" style={{ backgroundColor: 'hsl(var(--surface-4dp))', borderColor: 'hsl(var(--neon-cyan) / 0.3)' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full text-white" style={{ backgroundColor: 'hsl(var(--neon-cyan))' }}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Learn New</h3>
                  <p className="text-muted-foreground">Practice with new sentence cards</p>
                  <div className="text-sm text-neon-cyan font-medium mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></span>
                    Expand your knowledge
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* XP Progress */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'hsl(var(--surface-2dp))', borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold text-foreground">{user.totalXP.toLocaleString()}</p>
                <p className="text-xs text-achievement">Level {stats.currentLevel}</p>
              </div>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="3"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="hsl(var(--achievement))"
                    strokeWidth="3"
                    strokeDasharray={`${stats.levelProgress}, 100`}
                    className="zen-pulse"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="h-4 w-4 text-achievement" />
                </div>
              </div>
            </div>
          </div>

          {/* Study Streak */}
          <div className="p-4 rounded-xl border bg-card text-card-foreground border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-foreground">{user.currentStreak}</p>
                  <p className="text-sm text-primary">days</p>
                </div>
                <p className="text-xs text-muted-foreground">Best: {user.bestStreak}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Zap className="h-6 w-6 text-primary" />
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < user.currentStreak % 7 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Accuracy Rate */}
          <div className="p-4 rounded-xl border bg-card text-card-foreground border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-foreground">{stats.accuracy}%</p>
                <div className="h-2 w-16 mt-1 rounded-full overflow-hidden bg-muted">
                  <div 
                    className="h-full rounded-full transition-all duration-300 bg-cyan-500"
                    style={{ width: `${stats.accuracy}%` }}
                  />
                </div>
              </div>
              <div className="relative">
                <Target className="h-6 w-6 text-cyan-500" />
                {stats.accuracy >= 90 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                )}
              </div>
            </div>
          </div>

          {/* Cards Mastered */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'hsl(var(--surface-2dp))', borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mastered</p>
                <p className="text-2xl font-bold text-foreground">{stats.masteredCards}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalCards}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Trophy className="h-6 w-6 text-sakura" />
                <div className="flex gap-0.5 h-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-sakura rounded-sm transition-opacity ${
                        i < Math.floor((stats.masteredCards / stats.totalCards) * 5) ? 'opacity-100' : 'opacity-20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Belt & JLPT Progress */}
          <div className="space-y-4">
            {/* Belt Progress */}
            <div className="zen-card p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-achievement" />
                Belt Progression
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{beltEmojis[user.currentBelt]} {user.currentBelt.charAt(0).toUpperCase() + user.currentBelt.slice(1)} Belt</span>
                  {stats.nextBelt && <span className="text-muted-foreground">Next: {stats.nextBelt}</span>}
                </div>
                <div className="flex gap-1">
                  {beltOrder.map((belt, index) => (
                    <div
                      key={belt}
                      className={`flex-1 h-3 rounded transition-all ${
                        index <= beltIndex 
                          ? 'bg-gradient-to-t from-achievement to-achievement-gold' 
                          : 'bg-muted'
                      }`}
                      title={`${belt} belt`}
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-[10px]">{beltEmojis[belt]}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="zen-progress h-2">
                  <div 
                    className="zen-progress-fill h-full"
                    style={{ width: `${beltProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* JLPT Progress */}
            <div className="zen-card p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                JLPT Level Progress
              </h3>
              <div className="grid grid-cols-5 gap-1">
                {['N5', 'N4', 'N3', 'N2', 'N1'].map((level, index) => (
                  <div
                    key={level}
                    className={`text-center p-2 rounded text-xs transition-all ${
                      level === user.currentJLPTLevel
                        ? 'bg-gradient-to-t from-primary/20 to-matcha/20 border border-primary/30'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="font-medium">{level}</div>
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

          {/* Recent Activity & Recommendations */}
          <div className="space-y-4">
            {/* Recent Sessions */}
            <div className="zen-card p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Recent Study Sessions
              </h3>
              {recentSessions.length > 0 ? (
                <div className="space-y-2">
                  {recentSessions.slice(0, 3).map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium">{session.cardsReviewed} cards</span>
                        <span className="text-muted-foreground">{Math.round((session.cardsCorrect / Math.max(session.cardsReviewed, 1)) * 100)}%</span>
                        <span className="text-muted-foreground">{session.timeSpentMinutes}min</span>
                      </div>
                      <span className="text-sm font-bold text-primary">+{session.xpEarned}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-2 text-muted-foreground text-sm">No recent sessions</p>
              )}
            </div>

            {/* Achievements Preview */}
            <div className="zen-card p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-achievement" />
                Recent Achievements
              </h3>
              {achievements.length > 0 ? (
                <div className="space-y-2">
                  {achievements.slice(0, 2).map((userAchievement: any) => (
                    <div key={userAchievement.id} className="flex items-center gap-3 p-2 bg-gradient-to-r from-achievement/10 to-achievement-gold/10 rounded">
                      <span className="text-lg">{userAchievement.achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{userAchievement.achievement.name}</h4>
                        <p className="text-xs text-muted-foreground">{userAchievement.achievement.category}</p>
                      </div>
                      <span className="text-xs font-medium text-achievement">+{userAchievement.achievement.xpReward}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-2 text-muted-foreground text-sm">No achievements yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="zen-card p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Study Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded">
              <div className="text-lg font-bold text-foreground">{user.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded">
              <div className="text-lg font-bold text-foreground">{stats.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded">
              <div className="text-lg font-bold text-foreground">{Math.round((stats.masteredCards / stats.totalCards) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Mastery Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}