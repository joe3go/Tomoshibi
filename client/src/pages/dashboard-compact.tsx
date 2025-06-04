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

  const { user, stats, recentSessions, achievements } = dashboardData;

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
    <div className="p-4 relative max-h-screen overflow-y-auto">
      {/* Subtle background sakura pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
        <div className="absolute top-20 left-10 text-4xl rotate-12">🌸</div>
        <div className="absolute top-40 right-20 text-3xl -rotate-6">🌸</div>
        <div className="absolute bottom-32 left-1/4 text-3xl rotate-45">🌸</div>
        <div className="absolute top-1/3 right-1/3 text-2xl -rotate-12">🌸</div>
        <div className="absolute bottom-20 right-10 text-3xl rotate-6">🌸</div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-4 relative z-10">
        {/* Compact Header */}
        <div className="zen-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="japanese-welcome text-lg mb-1">おかえりなさい、{user.displayName}さん</div>
              <div className="flex items-center gap-3">
                <div className="zen-card px-2 py-1 bg-gradient-to-r from-primary/10 to-matcha/10 border-primary/20">
                  <span className="text-xs font-medium text-primary">
                    {beltEmojis[user.currentBelt]} {user.currentBelt} • JLPT {user.currentJLPTLevel}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/study-mode">
              <button className="zen-button px-6 py-2">
                <Play className="mr-2 h-4 w-4" />
                始める ({stats.reviewQueue})
              </button>
            </Link>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* XP with Progress Ring */}
          <div className="zen-card p-3">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
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
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="h-3 w-3 text-achievement" />
                </div>
              </div>
              <div>
                <p className="text-xs text-primary japanese-text">総経験値</p>
                <p className="text-lg font-bold">{user.totalXP.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Streak with Calendar Dots */}
          <div className="zen-card p-3">
            <div>
              <p className="text-xs text-orange-600 japanese-text">連続学習</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">{user.currentStreak}</p>
                <p className="text-xs text-orange-600">days</p>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mt-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i < user.currentStreak % 7 ? 'bg-orange-400' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Accuracy with Progress Bar */}
          <div className="zen-card p-3">
            <div>
              <p className="text-xs text-green-600 japanese-text">正確性</p>
              <p className="text-lg font-bold">{stats.accuracy}%</p>
              <div className="zen-progress h-1 mt-1">
                <div 
                  className="zen-progress-fill h-full"
                  style={{ width: `${stats.accuracy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mastery with Mini Chart */}
          <div className="zen-card p-3">
            <div>
              <p className="text-xs text-purple-600 japanese-text">習得済み</p>
              <p className="text-lg font-bold">{stats.masteredCards}</p>
              <div className="flex gap-0.5 h-2 mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-200 to-purple-400 rounded-sm"
                    style={{
                      opacity: Math.min(1, (stats.masteredCards / stats.totalCards) + (i * 0.2))
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Tabs */}
        <Tabs defaultValue="progress" className="space-y-3">
          <div className="zen-card p-1">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-8">
              <TabsTrigger value="progress" className="text-xs zen-nav-item h-6">進捗</TabsTrigger>
              <TabsTrigger value="sessions" className="text-xs zen-nav-item h-6">学習</TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs zen-nav-item h-6">成果</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs zen-nav-item h-6">分析</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="progress" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Belt Progress */}
              <div className="zen-card p-4">
                <h3 className="font-semibold japanese-heading text-sm mb-2">帯の進歩</h3>
                <div className="flex gap-1 mb-2">
                  {beltOrder.map((belt, index) => (
                    <div
                      key={belt}
                      className={`flex-1 h-4 rounded transition-all ${
                        index <= beltIndex 
                          ? 'bg-gradient-to-t from-achievement to-achievement-gold' 
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
                <div className="zen-progress h-2">
                  <div 
                    className="zen-progress-fill h-full"
                    style={{ width: `${beltProgress}%` }}
                  />
                </div>
              </div>

              {/* JLPT Progress */}
              <div className="zen-card p-4">
                <h3 className="font-semibold japanese-heading text-sm mb-2">JLPT レベル</h3>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {['N5', 'N4', 'N3', 'N2', 'N1'].map((level, index) => (
                    <div
                      key={level}
                      className={`text-center p-1 rounded text-xs ${
                        level === user.currentJLPTLevel
                          ? 'bg-gradient-to-t from-primary/20 to-matcha/20 border border-primary/30'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="font-medium">{level}</div>
                      <div className={`w-full h-0.5 rounded-full mt-0.5 ${
                        index < ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(user.currentJLPTLevel) + 1
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-3">
            <div className="zen-card p-4">
              <h3 className="font-semibold japanese-heading text-sm mb-2">最近の学習</h3>
              {recentSessions.length > 0 ? (
                <div className="space-y-2">
                  {recentSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium">{session.cardsReviewed}</span>
                        <span className="text-muted-foreground">{Math.round((session.cardsCorrect / Math.max(session.cardsReviewed, 1)) * 100)}%</span>
                        <span className="text-muted-foreground">{session.timeSpentMinutes}min</span>
                      </div>
                      <span className="text-sm font-bold text-primary">+{session.xpEarned}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-2 text-muted-foreground text-sm japanese-text">まだ学習セッションがありません</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {achievements.length > 0 ? (
                achievements.slice(0, 4).map((userAchievement) => (
                  <div key={userAchievement.id} className="zen-card p-3 bg-gradient-to-r from-achievement/10 to-achievement-gold/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{userAchievement.achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{userAchievement.achievement.name}</h4>
                        <p className="text-xs text-muted-foreground">{userAchievement.achievement.category}</p>
                      </div>
                      <span className="text-xs font-medium text-achievement">+{userAchievement.achievement.xpReward}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center py-2 text-muted-foreground text-sm japanese-text">成果はまだありません</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="zen-card p-3">
                <h3 className="font-semibold japanese-heading text-sm mb-2">学習の推奨</h3>
                <div className="space-y-2">
                  <button className="zen-button w-full text-sm py-2">
                    <BookOpen className="mr-2 h-3 w-3" />
                    復習 {stats.reviewQueue} カード
                  </button>
                  {stats.nextBelt && (
                    <div className="zen-card p-2 text-xs text-center">
                      次の帯: {stats.nextBelt}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="zen-card p-3">
                <h3 className="font-semibold japanese-heading text-sm mb-2">今週の統計</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-bold">{user.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">連続日数</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-bold">{stats.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">正確性</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}