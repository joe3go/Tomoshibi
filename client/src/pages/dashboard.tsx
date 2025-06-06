import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  BarChart3, 
  Target, 
  Play, 
  Award, 
  Settings, 
  Trophy,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  Eye,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useJLPTLevelCheck } from "@/components/jlpt-level-selector";
import { useState } from "react";

// Study Session Preview Component
function StudySessionPreview({ mode, studyOptions }: { mode: 'learn' | 'review', studyOptions: any }) {
  const { data: vocabularyData } = useQuery({
    queryKey: ["/api/vocabulary"],
    enabled: mode === 'learn'
  });

  const { data: kanjiData } = useQuery({
    queryKey: ["/api/kanji"],
    enabled: mode === 'learn'
  });

  const { data: grammarData } = useQuery({
    queryKey: ["/api/grammar"],
    enabled: mode === 'learn'
  });

  const { data: reviewQueue } = useQuery({
    queryKey: ["/api/review-queue"],
    enabled: mode === 'review'
  });

  const getPreviewData = () => {
    if (mode === 'review') {
      const items = reviewQueue || [];
      return {
        total: items.length,
        breakdown: {
          kanji: items.filter((item: any) => item.srsItem?.contentType === 'kanji').length,
          vocabulary: items.filter((item: any) => item.srsItem?.contentType === 'vocabulary').length,
          grammar: items.filter((item: any) => item.srsItem?.contentType === 'grammar').length
        },
        items: items.slice(0, 5).map((item: any) => ({
          type: item.srsItem?.contentType || 'vocabulary',
          content: item.sentenceCard?.japanese || item.content?.japanese || 'Content item',
          english: item.sentenceCard?.english || item.content?.english || 'Translation'
        }))
      };
    } else {
      const vocab = vocabularyData || [];
      const kanji = kanjiData || [];
      const grammar = grammarData || [];
      
      const allItems = [
        ...vocab.slice(0, 3).map((item: any) => ({ type: 'vocabulary', content: item.japanese || item.kanji, english: item.english || item.meaning })),
        ...kanji.slice(0, 2).map((item: any) => ({ type: 'kanji', content: item.character || item.kanji, english: item.meaning || item.english })),
        ...grammar.slice(0, 2).map((item: any) => ({ type: 'grammar', content: item.pattern || item.japanese, english: item.meaning || item.english }))
      ];

      return {
        total: vocab.length + kanji.length + grammar.length,
        breakdown: {
          vocabulary: vocab.length,
          kanji: kanji.length,
          grammar: grammar.length
        },
        items: allItems.slice(0, 5)
      };
    }
  };

  const previewData = getPreviewData();
  const isReview = mode === 'review';

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {previewData.breakdown.kanji}
          </div>
          <div className="text-xs text-muted-foreground">Kanji</div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {previewData.breakdown.vocabulary}
          </div>
          <div className="text-xs text-muted-foreground">Vocabulary</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {previewData.breakdown.grammar}
          </div>
          <div className="text-xs text-muted-foreground">Grammar</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">
          {isReview ? 'Items Due for Review:' : 'New Items to Study:'}
        </h4>
        {previewData.items.length > 0 ? (
          <div className="space-y-2">
            {previewData.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="font-medium">{item.content}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.english}
                </span>
              </div>
            ))}
            {previewData.total > 5 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                + {previewData.total - 5} more items
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No {isReview ? 'reviews' : 'new items'} available
          </div>
        )}
      </div>
    </div>
  );
}

// Study All Button Component
function StudyAllButton({ studyOptions }: { studyOptions: any }) {
  const [, setLocation] = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  
  const createStudySession = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/study-session", data),
    onSuccess: (session) => {
      setLocation(`/study-mode?sessionId=${session.id}&type=all&mode=learn`);
    }
  });

  const totalNew = (studyOptions?.new?.kanji || 0) + 
                  (studyOptions?.new?.vocabulary || 0) + 
                  (studyOptions?.new?.grammar || 0);

  const handleStudyAll = () => {
    setShowPreview(false);
    if (totalNew > 0) {
      createStudySession.mutate({
        sessionType: "study-all",
        status: "active"
      });
    }
  };

  return (
    <div className="relative">
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            className="absolute top-0 right-0 z-10 p-2"
            disabled={totalNew === 0}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Study Session Preview</DialogTitle>
          </DialogHeader>
          <StudySessionPreview mode="learn" studyOptions={studyOptions} />
          <div className="flex gap-2 pt-4">
            <Button onClick={handleStudyAll} className="flex-1" disabled={createStudySession.isPending}>
              {createStudySession.isPending ? "Starting..." : "Start Session"}
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button 
        onClick={handleStudyAll}
        disabled={totalNew === 0 || createStudySession.isPending}
        className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg pr-12"
      >
        <Play className="h-6 w-6 mr-3" />
        <div className="flex flex-col items-start">
          <span>Study All New</span>
          <span className="text-sm opacity-90">{totalNew} items pending</span>
        </div>
        <ChevronRight className="h-5 w-5 ml-auto" />
      </Button>
    </div>
  );
}

// Review All Button Component  
function ReviewAllButton({ studyOptions }: { studyOptions: any }) {
  const [, setLocation] = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  
  const createReviewSession = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/study-session", data),
    onSuccess: (session) => {
      setLocation(`/study-mode?sessionId=${session.id}&type=all&mode=review`);
    }
  });

  const totalReviews = (studyOptions?.reviews?.kanji || 0) + 
                      (studyOptions?.reviews?.vocabulary || 0) + 
                      (studyOptions?.reviews?.grammar || 0);

  const handleReviewAll = () => {
    setShowPreview(false);
    if (totalReviews > 0) {
      createReviewSession.mutate({
        sessionType: "review-all",
        status: "active"
      });
    }
  };

  return (
    <div className="relative">
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            className="absolute top-0 right-0 z-10 p-2"
            disabled={totalReviews === 0}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Session Preview</DialogTitle>
          </DialogHeader>
          <StudySessionPreview mode="review" studyOptions={studyOptions} />
          <div className="flex gap-2 pt-4">
            <Button onClick={handleReviewAll} className="flex-1" disabled={createReviewSession.isPending}>
              {createReviewSession.isPending ? "Starting..." : "Start Review"}
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button 
        onClick={handleReviewAll}
        disabled={totalReviews === 0 || createReviewSession.isPending}
        className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg pr-12"
      >
        <Target className="h-6 w-6 mr-3" />
        <div className="flex flex-col items-start">
          <span>Review All</span>
          <span className="text-sm opacity-90">{totalReviews} items due</span>
        </div>
        <ChevronRight className="h-5 w-5 ml-auto" />
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const { showLevelSelector, setShowLevelSelector } = useJLPTLevelCheck();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const { data: studyOptions } = useQuery({
    queryKey: ["/api/study-options"],
    enabled: !!user,
  });

  const updateLevelMutation = useMutation({
    mutationFn: async (level: string) => {
      const response = await apiRequest("PATCH", "/api/user/jlpt-level", { level });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const { data: recentSessions } = useQuery({
    queryKey: ["/api/study-sessions/recent"],
    retry: false,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements/user"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Welcome back, {user.displayName || user.username}!</h1>
        <p className="text-muted-foreground">Continue your Japanese learning journey</p>
      </div>

      {/* Study All / Review All Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StudyAllButton studyOptions={studyOptions || {}} />
        <ReviewAllButton studyOptions={studyOptions || {}} />
      </div>

      {/* Interactive Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Kanji Progress */}
        <Card className="relative overflow-hidden border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">漢</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Kanji</h3>
                  <p className="text-sm text-muted-foreground">Characters</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300">
                45/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar value={45} className="h-3 bg-red-100 dark:bg-red-900/20" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Link href="/study-dedicated?mode=kanji-reviews" className="block">
                  <Button variant="ghost" className="w-full h-auto p-2 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors flex flex-col items-center" onClick={() => window.scrollTo(0, 0)}>
                    <div className="font-semibold text-orange-600 dark:text-orange-400">12</div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </Button>
                </Link>
                <Link href="/study-dedicated?mode=learn-kanji" className="block">
                  <Button variant="ghost" className="w-full h-auto p-2 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors flex flex-col items-center" onClick={() => window.scrollTo(0, 0)}>
                    <div className="font-semibold text-green-600 dark:text-green-400">5</div>
                    <div className="text-xs text-muted-foreground">New</div>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>

        </Card>

        {/* Vocabulary Progress */}
        <Card className="relative overflow-hidden border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Vocabulary</h3>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300">
                234/800
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar value={29} className="h-3 bg-blue-100 dark:bg-blue-900/20" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Link href="/study-dedicated?mode=vocabulary-reviews" className="block">
                  <Button variant="ghost" className="w-full h-auto p-2 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors flex flex-col items-center" onClick={() => window.scrollTo(0, 0)}>
                    <div className="font-semibold text-orange-600 dark:text-orange-400">28</div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </Button>
                </Link>
                <Link href="/study-dedicated?mode=learn-vocabulary" className="block">
                  <Button variant="ghost" className="w-full h-auto p-2 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors flex flex-col items-center" onClick={() => window.scrollTo(0, 0)}>
                    <div className="font-semibold text-green-600 dark:text-green-400">10</div>
                    <div className="text-xs text-muted-foreground">New</div>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>

        </Card>

        {/* Grammar Progress */}
        <Card className="relative overflow-hidden border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">文</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Grammar</h3>
                  <p className="text-sm text-muted-foreground">Patterns</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300">
                67/120
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar value={56} className="h-3 bg-green-100 dark:bg-green-900/20" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Link href="/study-dedicated?mode=grammar-reviews" className="block">
                  <Button variant="ghost" className="w-full h-auto p-2 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors flex flex-col items-center" onClick={() => window.scrollTo(0, 0)}>
                    <div className="font-semibold text-orange-600 dark:text-orange-400">8</div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </Button>
                </Link>
                <Link href="/study-dedicated?mode=learn-grammar" className="block">
                  <Button variant="ghost" className="w-full h-auto p-2 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors flex flex-col items-center" onClick={() => window.scrollTo(0, 0)}>
                    <div className="font-semibold text-green-600 dark:text-green-400">3</div>
                    <div className="text-xs text-muted-foreground">New</div>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>

        </Card>
      </div>

      

      {/* Progress Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Streak & Daily Progress */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Study Streak
            </CardTitle>
            <CardDescription>Your learning consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Current Streak */}
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">7</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">🔥 Keep it up!</div>
              </div>
              
              {/* Weekly Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span className="text-muted-foreground">5/7 days</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 flex-1 rounded ${
                        i < 5
                          ? 'bg-green-500 dark:bg-green-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Monthly Progress
            </CardTitle>
            <CardDescription>XP earned over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Monthly Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">1,240</div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">85</div>
                  <div className="text-xs text-muted-foreground">Cards/Day</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">92%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>
              
              {/* Simple Progress Bars for Recent Days */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Recent Activity</div>
                {['Today', 'Yesterday', '2 days ago', '3 days ago'].map((day, index) => {
                  const progress = [85, 92, 78, 95][index];
                  return (
                    <div key={day} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{day}</span>
                        <span className="text-muted-foreground">{progress} XP</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JLPT Progress Section */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">JLPT Progress</h3>
            <Badge variant="secondary" className="text-xs">{user.currentJLPTLevel || 'N5'}</Badge>
          </div>

          <div className="space-y-2">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => {
              const progress = level === 'N5' ? 85 : level === 'N4' ? 15 : 0;
              return (
                <div key={level} className="flex items-center space-x-3">
                  <span className="text-xs font-mono w-6">{level}</span>
                  <ProgressBar value={progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      {recentSessions && recentSessions.length > 0 && (
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
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
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
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