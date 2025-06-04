import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Trophy, BookOpen, Brain, Target, Zap, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebar";
import SrsProgress from "@/components/srs-progress";
import { SRS_LEVELS } from "@shared/schema";
import { Link } from "wouter";

interface DashboardData {
  user: {
    id: number;
    displayName: string;
    username: string;
    totalXP: number;
    currentStreak: number;
    bestStreak: number;
    currentJLPTLevel: string;
    lastStudyDate: string | null;
  };
  studySessions: Array<{
    id: number;
    date: string;
    totalReviews: number;
    correctAnswers: number;
    xpEarned: number;
  }>;
  userAchievements: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  stats: {
    totalGrammarPoints: number;
    totalKanji: number;
    totalVocabulary: number;
    masteredItems: number;
    itemsInReview: number;
    dailyGoal: number;
    reviewsCompleted: number;
  };
}

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your learning journey...</p>
          </div>
        </div>
      </div>
    );
  }

  const user = dashboardData?.user;
  const stats = dashboardData?.stats;
  const studySessions = dashboardData?.studySessions || [];
  const userAchievements = dashboardData?.userAchievements || [];

  if (!user || !stats) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  const userLevel = Math.floor(user.totalXP / 1000) + 1;
  const xpToNextLevel = 1000 - (user.totalXP % 1000);
  const levelProgress = ((user.totalXP % 1000) / 1000) * 100;

  // Calculate study accuracy from recent sessions
  const totalReviews = studySessions.reduce((sum, session) => sum + session.totalReviews, 0);
  const totalCorrect = studySessions.reduce((sum, session) => sum + session.correctAnswers, 0);
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Daily goal progress
  const dailyProgress = Math.min((stats.reviewsCompleted / stats.dailyGoal) * 100, 100);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar user={user} />
      
      <div className="flex-1 p-6 ml-64">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.displayName}!
            </h1>
            <p className="text-gray-600">
              Continue your Japanese learning journey • JLPT {user.currentJLPTLevel} Level
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total XP</p>
                    <p className="text-2xl font-bold text-indigo-600">{user.totalXP.toLocaleString()}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{user.currentStreak} days</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Study Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Items Mastered</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.masteredItems}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">SRS Progress</TabsTrigger>
              <TabsTrigger value="content">JLPT Content</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Level Progress
                  </CardTitle>
                  <CardDescription>
                    Level {userLevel} • {xpToNextLevel} XP to next level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={levelProgress} className="h-3 mb-2" />
                  <p className="text-sm text-gray-600">
                    {user.totalXP % 1000} / 1000 XP
                  </p>
                </CardContent>
              </Card>

              {/* Daily Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Goal Progress
                  </CardTitle>
                  <CardDescription>
                    {stats.reviewsCompleted} / {stats.dailyGoal} reviews completed today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={dailyProgress} className="h-3 mb-4" />
                  <Link href="/study">
                    <Button className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Studying
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Study Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Study Sessions</CardTitle>
                  <CardDescription>Your last 5 study sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {studySessions.length > 0 ? (
                    <div className="space-y-3">
                      {studySessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {session.correctAnswers}/{session.totalReviews} correct
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(session.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">+{session.xpEarned} XP</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No study sessions yet. Start studying to see your progress!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <SrsProgress />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      Grammar Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats.totalGrammarPoints}
                      </div>
                      <p className="text-sm text-gray-600">JLPT N5 Grammar Patterns</p>
                      <Link href="/study">
                        <Button variant="outline" className="mt-4 w-full">
                          Study Grammar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-red-500" />
                      Kanji Characters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {stats.totalKanji}
                      </div>
                      <p className="text-sm text-gray-600">Essential Kanji</p>
                      <Link href="/study">
                        <Button variant="outline" className="mt-4 w-full">
                          Study Kanji
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Vocabulary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {stats.totalVocabulary}
                      </div>
                      <p className="text-sm text-gray-600">Core Vocabulary Words</p>
                      <Link href="/study">
                        <Button variant="outline" className="mt-4 w-full">
                          Study Vocabulary
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription>
                    Your learning milestones and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userAchievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <h3 className="font-semibold text-yellow-800">{achievement.name}</h3>
                            <p className="text-sm text-yellow-700">{achievement.description}</p>
                            <p className="text-xs text-yellow-600 mt-1">
                              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No achievements yet</p>
                      <p className="text-sm text-gray-400">Start studying to unlock your first achievement!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}