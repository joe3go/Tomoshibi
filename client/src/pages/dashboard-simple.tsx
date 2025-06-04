import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Trophy, BookOpen, Brain, Target, Zap, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import SrsProgress from "@/components/srs-progress";
import { Link } from "wouter";

export default function Dashboard() {
  // Demo user data for motivational progression display
  const user = {
    id: 1,
    displayName: "Alex Tanaka",
    username: "demo_user",
    totalXP: 1250,
    currentStreak: 7,
    bestStreak: 12,
    currentJLPTLevel: "N5",
    lastStudyDate: new Date().toISOString()
  };

  // JLPT N5 authentic content statistics
  const stats = {
    totalGrammarPoints: 5,
    totalKanji: 8, 
    totalVocabulary: 10,
    masteredItems: 3,
    itemsInReview: 8,
    dailyGoal: 20,
    reviewsCompleted: 12
  };

  // Demo achievements to show progression motivation
  const userAchievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first study session",
      icon: "🚪",
      unlockedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      name: "Consistency",
      description: "Study for 7 days in a row",
      icon: "🔥",
      unlockedAt: new Date().toISOString()
    }
  ];

  // Demo study sessions showing progress
  const studySessions = [
    {
      id: 1,
      date: new Date().toISOString(),
      totalReviews: 15,
      correctAnswers: 13,
      xpEarned: 65
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000).toISOString(),
      totalReviews: 20,
      correctAnswers: 17,
      xpEarned: 85
    }
  ];

  const userLevel = Math.floor(user.totalXP / 1000) + 1;
  const xpToNextLevel = 1000 - (user.totalXP % 1000);
  const levelProgress = ((user.totalXP % 1000) / 1000) * 100;

  // Calculate study accuracy
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

          <Tabs defaultValue="overview" className="space-y-6">
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
                  <CardDescription>Your last study sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studySessions.map((session) => (
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}