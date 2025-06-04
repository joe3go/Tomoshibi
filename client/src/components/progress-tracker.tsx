import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Target, Clock } from "lucide-react";
import { useLanguageMode } from "@/App";
import { useLanguageContent } from "@/components/language-toggle";

interface ProgressData {
  wanikaniData?: {
    level: number;
    subjects: {
      kanji: number;
      vocabulary: number;
      radicals: number;
      total: number;
    };
    reviewsAvailable: number;
    lessonsAvailable: number;
    accuracy: number;
    srsDistribution: Record<number, number>;
    levelProgression: any[];
    lastSynced: string;
  };
  bunproData?: {
    grammar_points_learned: number;
    reviews_completed: number;
    srs_average: number;
    accuracy: number;
    reviews_available: number;
    study_queue_length: number;
    grammar_by_level: Record<string, number>;
    streak: number;
    lastSynced: string;
  };
}

interface ProgressTrackerProps {
  progress?: ProgressData;
  hasApiKeys: boolean;
  onSync: () => void;
  isLoading?: boolean;
}

export default function ProgressTracker({ progress, hasApiKeys, onSync, isLoading }: ProgressTrackerProps) {
  const { languageMode } = useLanguageMode();
  const content = useLanguageContent(languageMode);
  const wanikani = progress?.wanikaniData;
  const bunpro = progress?.bunproData;

  // Calculate progress rates and trends
  const calculateTrend = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return { icon: TrendingUp, color: "text-matcha", label: "Excellent" };
    if (percentage >= 70) return { icon: Activity, color: "text-bamboo", label: "Good" };
    return { icon: TrendingDown, color: "text-muted-foreground", label: "Needs Focus" };
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="japanese-heading text-2xl font-bold">
          {languageMode === 'en' ? content.progress :
           languageMode === 'jp' ? '進歩追跡' :
           '進歩<ruby>しんぽ</ruby>追跡<ruby>ついせき</ruby>'} - {content.progress}
        </h2>
        <Button 
          onClick={onSync} 
          disabled={!hasApiKeys || isLoading}
          className="matcha-gradient text-white"
        >
          {isLoading ? 
            (languageMode === 'en' ? "Syncing..." : 
             languageMode === 'jp' ? "同期中..." : 
             "同期<ruby>どうき</ruby>中<ruby>ちゅう</ruby>...") :
            content.syncData}
        </Button>
      </div>

      {!hasApiKeys && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Target className="w-4 h-4" />
              <span className="text-sm">
                Configure WaniKani and Bunpro API keys in Settings to track authentic progress data
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WaniKani Progress */}
        <Card className="japanese-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="japanese-heading flex items-center gap-2">
                <span className="text-2xl">漢</span>
                WaniKani Progress
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatLastSync(wanikani?.lastSynced)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {wanikani ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-washi">
                    <div className="text-2xl font-bold text-primary japanese-text">
                      {wanikani.level}
                    </div>
                    <div className="text-xs text-muted-foreground">Current Level</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-washi">
                    <div className="text-2xl font-bold text-matcha japanese-text">
                      {wanikani.accuracy}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Kanji Learned</span>
                      <span className="japanese-text">{wanikani.subjects.kanji}</span>
                    </div>
                    <Progress value={(wanikani.subjects.kanji / 2000) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Vocabulary</span>
                      <span className="japanese-text">{wanikani.subjects.vocabulary}</span>
                    </div>
                    <Progress value={(wanikani.subjects.vocabulary / 6000) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Radicals</span>
                      <span className="japanese-text">{wanikani.subjects.radicals}</span>
                    </div>
                    <Progress value={(wanikani.subjects.radicals / 480) * 100} className="h-2" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary japanese-text">
                      {wanikani.reviewsAvailable}
                    </div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-bamboo japanese-text">
                      {wanikani.lessonsAvailable}
                    </div>
                    <div className="text-xs text-muted-foreground">Lessons</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Connect WaniKani to track kanji and vocabulary progress</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bunpro Progress */}
        <Card className="japanese-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="japanese-heading flex items-center gap-2">
                <span className="text-2xl">文</span>
                Bunpro Progress
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatLastSync(bunpro?.lastSynced)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bunpro ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-washi">
                    <div className="text-2xl font-bold text-primary japanese-text">
                      {bunpro.grammar_points_learned}
                    </div>
                    <div className="text-xs text-muted-foreground">Grammar Points</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-washi">
                    <div className="text-2xl font-bold text-matcha japanese-text">
                      {bunpro.accuracy}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(bunpro.grammar_by_level || {}).map(([level, count]) => {
                    const maxPoints = { N5: 120, N4: 120, N3: 180, N2: 200, N1: 180 }[level] || 100;
                    return (
                      <div key={level}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{level} Grammar</span>
                          <span className="japanese-text">{count}/{maxPoints}</span>
                        </div>
                        <Progress value={(count / maxPoints) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary japanese-text">
                      {bunpro.reviews_available}
                    </div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-bamboo japanese-text">
                      {bunpro.streak}
                    </div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Connect Bunpro to track grammar progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Combined Progress Overview */}
      {(wanikani || bunpro) && (
        <Card className="japanese-card">
          <CardHeader>
            <CardTitle className="japanese-heading">Overall Progress Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wanikani && (
                <div className="text-center p-4 rounded-lg bg-washi">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-matcha" />
                    <span className="text-sm font-medium">Kanji Mastery</span>
                  </div>
                  <div className="text-2xl font-bold japanese-text">
                    {Math.round((wanikani.subjects.kanji / 2000) * 100)}%
                  </div>
                  <Badge variant="outline" className="mt-1">
                    Level {wanikani.level}
                  </Badge>
                </div>
              )}

              {bunpro && (
                <div className="text-center p-4 rounded-lg bg-washi">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-bamboo" />
                    <span className="text-sm font-medium">Grammar Points</span>
                  </div>
                  <div className="text-2xl font-bold japanese-text">
                    {bunpro.grammar_points_learned}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {bunpro.srs_average.toFixed(1)} SRS Avg
                  </Badge>
                </div>
              )}

              {wanikani && bunpro && (
                <div className="text-center p-4 rounded-lg bg-washi">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Combined Accuracy</span>
                  </div>
                  <div className="text-2xl font-bold japanese-text">
                    {Math.round((wanikani.accuracy + bunpro.accuracy) / 2)}%
                  </div>
                  <Badge variant="outline" className="mt-1">
                    Overall Performance
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}