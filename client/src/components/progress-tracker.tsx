import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Target,
  Award,
  TrendingUp,
  Clock,
  Flame,
  Star,
  BookOpen,
  ChevronRight,
  BarChart3,
  Trophy
} from "lucide-react";
import { format, isToday, differenceInDays } from "date-fns";

interface ProgressTrackerProps {
  user: any;
  studyOptions: any;
}

export function ProgressTracker({ user, studyOptions }: ProgressTrackerProps) {
  const { data: studySessions } = useQuery({
    queryKey: ["/api/study-sessions/recent"],
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements/user"],
  });

  // Calculate streak
  const calculateStreak = () => {
    if (!studySessions || !Array.isArray(studySessions) || studySessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    // Check if studied today
    const hasStudiedToday = studySessions.some((session: any) => 
      isToday(new Date(session.startedAt))
    );
    
    if (hasStudiedToday) streak = 1;
    
    // Count consecutive days
    for (let i = 1; i < 30; i++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      
      const hasStudiedOnDate = studySessions.some((session: any) => {
        const sessionDate = new Date(session.startedAt);
        return sessionDate.toDateString() === targetDate.toDateString();
      });
      
      if (hasStudiedOnDate) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate learning statistics
  const stats = {
    currentStreak: calculateStreak(),
    totalCards: (studyOptions?.reviews?.vocabulary || 0) + 
                (studyOptions?.reviews?.kanji || 0) + 
                (studyOptions?.reviews?.grammar || 0),
    dueCards: studyOptions?.reviews?.total || 0,
    completedToday: Array.isArray(studySessions) ? studySessions.filter((session: any) => 
      isToday(new Date(session.startedAt))
    ).length : 0,
    totalXP: user?.totalXP || 0,
    currentLevel: user?.currentJLPTLevel || "N5"
  };

  // Calculate progress to next level
  const getLevelProgress = () => {
    const levels = ["N5", "N4", "N3", "N2", "N1"];
    const currentIndex = levels.indexOf(stats.currentLevel);
    const xpThresholds = [0, 1000, 2500, 5000, 10000, 20000];
    
    if (currentIndex === -1 || currentIndex >= levels.length - 1) {
      return { current: stats.totalXP, target: xpThresholds[xpThresholds.length - 1], percentage: 100 };
    }
    
    const currentThreshold = xpThresholds[currentIndex];
    const nextThreshold = xpThresholds[currentIndex + 1];
    const progress = stats.totalXP - currentThreshold;
    const total = nextThreshold - currentThreshold;
    
    return {
      current: progress,
      target: total,
      percentage: Math.min((progress / total) * 100, 100)
    };
  };

  const levelProgress = getLevelProgress();

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <Badge variant={stats.currentStreak > 0 ? "default" : "secondary"}>
                {stats.currentStreak > 7 ? "🔥" : stats.currentStreak > 3 ? "⚡" : "📚"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        {/* Due Cards */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <Badge variant={stats.dueCards > 0 ? "destructive" : "outline"}>
                {stats.dueCards > 0 ? "Due" : "Clear"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.dueCards}</p>
              <p className="text-xs text-muted-foreground">Cards Due</p>
            </div>
          </CardContent>
        </Card>

        {/* Total XP */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <Badge variant="secondary">{stats.currentLevel}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <Badge variant={stats.completedToday > 0 ? "default" : "outline"}>
                Today
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.completedToday}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              JLPT Progress
            </CardTitle>
            <Badge variant="outline">{stats.currentLevel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {stats.currentLevel}</span>
              <span>{Math.round(levelProgress.percentage)}%</span>
            </div>
            <Progress value={levelProgress.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{levelProgress.current.toLocaleString()} XP</span>
              <span>{levelProgress.target.toLocaleString()} XP to next level</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vocabulary */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">語</span>
              </div>
              <div>
                <p className="font-medium text-sm">Vocabulary</p>
                <p className="text-xs text-muted-foreground">
                  {studyOptions?.reviews?.vocabulary || 0} cards in review
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Kanji */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">漢</span>
              </div>
              <div>
                <p className="font-medium text-sm">Kanji</p>
                <p className="text-xs text-muted-foreground">
                  {studyOptions?.reviews?.kanji || 0} cards in review
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Grammar */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">文</span>
              </div>
              <div>
                <p className="font-medium text-sm">Grammar</p>
                <p className="text-xs text-muted-foreground">
                  {studyOptions?.reviews?.grammar || 0} cards in review
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievements && Array.isArray(achievements) && achievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {achievements.slice(0, 3).map((achievement: any) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}