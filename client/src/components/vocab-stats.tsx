import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { VocabWord, SRS_LEVEL_NAMES, SRS_LEVEL_COLORS, SRSLevel } from '@/types/vocab';
import { VocabStorage } from '@/lib/vocab-storage';
import { BookOpen, Target, Trophy, TrendingUp, Clock, Flame } from 'lucide-react';

interface VocabStatsProps {
  words: VocabWord[];
  className?: string;
}

export function VocabStats({ words, className = "" }: VocabStatsProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const tomorrow = today + 24 * 60 * 60 * 1000;

    const totalWords = words.length;
    const wordsDueToday = words.filter(w => w.nextReviewAt >= today && w.nextReviewAt < tomorrow).length;
    const wordsDueNow = words.filter(w => w.nextReviewAt <= now).length;
    
    const totalReviews = words.reduce((sum, w) => sum + w.correctCount + w.incorrectCount, 0);
    const correctReviews = words.reduce((sum, w) => sum + w.correctCount, 0);
    const successRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

    const levelCounts = words.reduce((acc, word) => {
      acc[word.srsLevel as SRSLevel] = (acc[word.srsLevel as SRSLevel] || 0) + 1;
      return acc;
    }, {} as Record<SRSLevel, number>);

    const userStats = VocabStorage.getStats();

    return {
      totalWords,
      wordsDueToday,
      wordsDueNow,
      successRate,
      totalReviews,
      levelCounts,
      streakDays: userStats.streakDays,
    };
  }, [words]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Words</p>
              <p className="text-lg font-bold text-foreground">{stats.totalWords}</p>
            </div>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </div>
        </Card>

        <Card className="p-3 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Due Now</p>
              <p className="text-lg font-bold text-orange-400">{stats.wordsDueNow}</p>
            </div>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
        </Card>

        <Card className="p-3 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-lg font-bold text-green-400">{stats.successRate}%</p>
            </div>
            <Target className="h-4 w-4 text-green-400" />
          </div>
        </Card>

        <Card className="p-3 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-lg font-bold text-yellow-400">{stats.streakDays} days</p>
            </div>
            <Flame className="h-4 w-4 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* SRS Level Distribution */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">SRS Level Distribution</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            {([0, 1, 2, 3, 4, 5] as SRSLevel[]).map((level) => {
              const count = stats.levelCounts[level] || 0;
              const percentage = stats.totalWords > 0 ? (count / stats.totalWords) * 100 : 0;
              
              return (
                <div key={level} className="flex items-center gap-3">
                  <Badge className={`text-xs px-2 py-1 w-20 justify-center ${SRS_LEVEL_COLORS[level]}`}>
                    {SRS_LEVEL_NAMES[level]}
                  </Badge>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Review Progress */}
      {stats.totalReviews > 0 && (
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Review Performance</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <div className="text-lg font-bold text-foreground">{stats.totalReviews}</div>
                <div className="text-xs text-muted-foreground">Total Reviews</div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="text-lg font-bold text-green-400">
                  {stats.totalReviews - (stats.totalReviews - Math.round(stats.totalReviews * stats.successRate / 100))}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <div className="text-lg font-bold text-red-400">
                  {stats.totalReviews - Math.round(stats.totalReviews * stats.successRate / 100)}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Accuracy</span>
                <span>{stats.successRate}%</span>
              </div>
              <Progress value={stats.successRate} className="h-2" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}