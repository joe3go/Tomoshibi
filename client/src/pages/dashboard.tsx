import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Target, Trophy, Award, Zap, Play, BarChart3, Settings } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

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



  if (showReviewMode) {
    return <ReviewMode onExit={() => setShowReviewMode(false)} />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 space-y-3 h-full overflow-y-auto">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          Welcome back, {user.displayName || user.username}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Ready to continue your Japanese learning journey?
        </p>
      </div>

      {/* Vocabulary Quick Stats */}
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Words</p>
              <p className="text-lg font-bold text-primary">{currentStats.totalWords}</p>
            </div>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Due Now</p>
              <p className="text-lg font-bold text-orange-400">{wordsToReview.length}</p>
            </div>
            <Target className="h-4 w-4 text-orange-400" />
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-lg font-bold text-green-400">{currentStats.successRate}%</p>
            </div>
            <Trophy className="h-4 w-4 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-lg font-bold text-yellow-400">{currentStats.streakDays} days</p>
            </div>
            <Zap className="h-4 w-4 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Main Actions */}
      {words.length === 0 ? (
        <Card className="p-6 text-center bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="text-4xl">📚</div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Start Building Your Vocabulary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your Japanese vocabulary collection with our spaced repetition system.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleLoadDemo} variant="outline" className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                Try Demo (5 words)
              </Button>
              <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Word
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Review Actions */}
          {wordsToReview.length > 0 && (
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Ready for Review</h3>
                  <p className="text-sm text-muted-foreground">
                    {wordsToReview.length} words are waiting for review
                  </p>
                </div>
                <Button onClick={startReview} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Review
                </Button>
              </div>
            </Card>
          )}

          {/* Study Actions Grid */}
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-3">
            <Link href="/vocabulary">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Vocabulary</span>
              </Button>
            </Link>

            <Button 
              variant="outline" 
              onClick={() => setShowVocabStats(!showVocabStats)}
              className="w-full h-16 flex flex-col items-center justify-center space-y-1"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Stats</span>
            </Button>

            <Link href="/jlpt-progress">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Award className="h-5 w-5" />
                <span className="text-sm">JLPT Progress</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Vocabulary Stats Panel */}
      {showVocabStats && words.length > 0 && (
        <VocabStats words={words} />
      )}

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
                  <Progress value={progress} className="flex-1 h-2" />
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