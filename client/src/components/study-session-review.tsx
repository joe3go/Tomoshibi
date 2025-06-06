import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Award, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Brain,
  Star,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";

interface StudySessionReviewProps {
  sessionData: {
    id: number;
    cardsReviewed: number;
    cardsCorrect: number;
    timeSpentMinutes: number;
    xpEarned: number;
    startedAt: string;
    completedAt: string;
  };
  cardResults: Array<{
    id: number;
    japanese: string;
    english: string;
    rating: 'again' | 'hard' | 'good' | 'easy';
    responseTime: number;
    cardType: 'vocabulary' | 'kanji' | 'grammar';
    difficulty: number;
    nextReview: string;
  }>;
  onContinue: () => void;
  onReviewMistakes: () => void;
}

export function StudySessionReview({ 
  sessionData, 
  cardResults, 
  onContinue, 
  onReviewMistakes 
}: StudySessionReviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'insights'>('overview');

  // Calculate statistics
  const accuracy = sessionData.cardsReviewed > 0 
    ? (sessionData.cardsCorrect / sessionData.cardsReviewed) * 100 
    : 0;

  const avgResponseTime = cardResults.length > 0
    ? cardResults.reduce((sum, card) => sum + card.responseTime, 0) / cardResults.length
    : 0;

  const difficultyBreakdown = cardResults.reduce((acc, card) => {
    acc[card.rating] = (acc[card.rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = cardResults.reduce((acc, card) => {
    acc[card.cardType] = (acc[card.cardType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mistakeCards = cardResults.filter(card => card.rating === 'again');
  const difficultCards = cardResults.filter(card => card.rating === 'hard');

  // Performance rating
  const getPerformanceRating = () => {
    if (accuracy >= 90) return { rating: 'Excellent', color: 'text-green-600', icon: <Star className="w-4 h-4" /> };
    if (accuracy >= 75) return { rating: 'Good', color: 'text-blue-600', icon: <CheckCircle className="w-4 h-4" /> };
    if (accuracy >= 60) return { rating: 'Fair', color: 'text-yellow-600', icon: <Target className="w-4 h-4" /> };
    return { rating: 'Needs Work', color: 'text-red-600', icon: <AlertCircle className="w-4 h-4" /> };
  };

  const performance = getPerformanceRating();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Study Session Complete
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(sessionData.startedAt), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            <Badge variant="outline" className={`${performance.color} border-current`}>
              {performance.icon}
              {performance.rating}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{sessionData.cardsReviewed}</p>
              <p className="text-xs text-muted-foreground">Cards Reviewed</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{Math.round(accuracy)}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{sessionData.timeSpentMinutes}m</p>
              <p className="text-xs text-muted-foreground">Time Spent</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{sessionData.xpEarned}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
          { id: 'details', label: 'Card Details', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'insights', label: 'Learning Insights', icon: <Brain className="w-4 h-4" /> }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 flex items-center gap-2"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Correct</span>
                  </div>
                  <span className="font-medium">{sessionData.cardsCorrect}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Incorrect</span>
                  </div>
                  <span className="font-medium">{sessionData.cardsReviewed - sessionData.cardsCorrect}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Avg. Response Time</span>
                  </div>
                  <span className="font-medium">{Math.round(avgResponseTime)}s</span>
                </div>
              </div>
              <Progress value={accuracy} className="h-2" />
            </CardContent>
          </Card>

          {/* Difficulty Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'again', label: 'Again', color: 'bg-red-500', textColor: 'text-red-600' },
                { key: 'hard', label: 'Hard', color: 'bg-orange-500', textColor: 'text-orange-600' },
                { key: 'good', label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' },
                { key: 'easy', label: 'Easy', color: 'bg-green-500', textColor: 'text-green-600' }
              ].map((item) => {
                const count = difficultyBreakdown[item.key] || 0;
                const percentage = cardResults.length > 0 ? (count / cardResults.length) * 100 : 0;
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className={item.textColor}>{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-4">
          {/* Mistake Cards */}
          {mistakeCards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Cards to Review ({mistakeCards.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mistakeCards.slice(0, 5).map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{card.japanese}</p>
                        <p className="text-xs text-muted-foreground">{card.english}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Review in 1m
                      </Badge>
                    </div>
                  ))}
                  {mistakeCards.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{mistakeCards.length - 5} more cards to review
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Difficult Cards */}
          {difficultCards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Challenging Cards ({difficultCards.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {difficultCards.slice(0, 3).map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{card.japanese}</p>
                        <p className="text-xs text-muted-foreground">{card.english}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(card.nextReview), 'MMM d')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {accuracy < 70 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm text-blue-700 mb-1">Study Tip</h4>
                    <p className="text-xs text-blue-600">
                      Consider reviewing fundamentals before tackling new material. Focus on accuracy over speed.
                    </p>
                  </div>
                )}
                {avgResponseTime > 10 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-sm text-yellow-700 mb-1">Speed Improvement</h4>
                    <p className="text-xs text-yellow-600">
                      Try to respond more quickly. Hesitation often indicates uncertainty - mark those cards as "Hard".
                    </p>
                  </div>
                )}
                {mistakeCards.length > sessionData.cardsReviewed * 0.3 && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-sm text-red-700 mb-1">Review Strategy</h4>
                    <p className="text-xs text-red-600">
                      Many cards need additional review. Consider reducing new cards and focusing on review queue.
                    </p>
                  </div>
                )}
                {accuracy >= 85 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-sm text-green-700 mb-1">Great Progress!</h4>
                    <p className="text-xs text-green-600">
                      Excellent performance! You're ready to tackle more challenging material.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(categoryBreakdown).map(([category, count]) => {
                const categoryCards = cardResults.filter(card => card.cardType === category);
                const categoryAccuracy = categoryCards.length > 0
                  ? (categoryCards.filter(card => card.rating !== 'again').length / categoryCards.length) * 100
                  : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span>{Math.round(categoryAccuracy)}% ({count} cards)</span>
                    </div>
                    <Progress value={categoryAccuracy} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {mistakeCards.length > 0 && (
          <Button
            variant="outline"
            onClick={onReviewMistakes}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Review Mistakes ({mistakeCards.length})
          </Button>
        )}
        <Button 
          onClick={onContinue}
          className="flex items-center gap-2 flex-1"
        >
          Continue Learning
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}