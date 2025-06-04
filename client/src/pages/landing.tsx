import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguageMode } from "@/App";
import { useLanguageContent } from "@/components/language-toggle";
import ProgressCircle from "@/components/progress-circle";
import JLPTJourney from "@/components/jlpt-journey";
import { 
  Book, 
  Target, 
  Trophy, 
  Users, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Award,
  Flame,
  Zap
} from "lucide-react";

export default function Landing() {
  const { languageMode } = useLanguageMode();
  const content = useLanguageContent(languageMode);

  // Sample data for demonstration
  const sampleProgress = {
    wanikaniData: {
      subjects: {
        kanji: 125,
        vocabulary: 380,
        radicals: 45
      },
      subscription: {
        active: true,
        type: "lifetime"
      }
    },
    bunproData: {
      grammar_points_learned: 67,
      grammar_points_total: 180,
      subscription: {
        active: true
      }
    }
  };

  const sampleUser = {
    displayName: "田中太郎",
    currentJLPTLevel: "N4",
    totalXP: 2850,
    currentStreak: 12,
    bestStreak: 28
  };

  const sampleAchievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first study session",
      icon: "👣",
      xpReward: 50,
      category: "milestone",
      unlockedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: "Kanji Explorer",
      description: "Learn 100 kanji characters",
      icon: "📖",
      xpReward: 200,
      category: "learning",
      unlockedAt: new Date('2024-02-01')
    },
    {
      id: 3,
      name: "Week Warrior",
      description: "Study for 7 consecutive days",
      icon: "🔥",
      xpReward: 150,
      category: "consistency",
      unlockedAt: new Date('2024-02-10')
    }
  ];

  const sampleSessions = [
    {
      id: 1,
      sessionType: "wanikani",
      duration: 25,
      xpGained: 75,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      sessionType: "bunpro",
      duration: 15,
      xpGained: 50,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-washi via-white to-sakura/10">
      {/* Header with Login/Signup */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-momiji to-ume rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">日</span>
            </div>
            <h1 className="text-xl font-bold text-sumi">Japanese Learning Hub</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="bg-gradient-to-r from-momiji to-ume hover:from-momiji/90 hover:to-ume/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-sumi mb-4">
            Master Japanese with <span className="text-transparent bg-clip-text bg-gradient-to-r from-momiji to-ume">Confidence</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Track your progress across WaniKani and Bunpro, earn achievements, and join a community of dedicated learners on your JLPT journey.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-yellow-800 font-medium">✨ Preview Mode - Sample Data Shown</p>
            <p className="text-yellow-700 text-sm mt-1">Sign up to track your real progress with WaniKani and Bunpro integration</p>
          </div>
        </div>

        {/* JLPT Journey Progress */}
        <div className="mb-8">
          <JLPTJourney currentLevel={sampleUser.currentJLPTLevel} progress={sampleProgress} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <ProgressCircle
                  percentage={75}
                  size={80}
                  strokeWidth={8}
                  color="#10b981"
                  label="XP"
                  value={sampleUser.totalXP.toString()}
                />
              </div>
              <h3 className="font-semibold text-gray-900">Total Experience</h3>
              <p className="text-sm text-gray-600">Earned through consistent study</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Flame className="w-12 h-12 text-orange-500" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {sampleUser.currentStreak}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Current Streak</h3>
              <p className="text-sm text-gray-600">{sampleUser.currentStreak} days in a row</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Book className="w-12 h-12 text-blue-500" />
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {sampleProgress.wanikaniData.subjects.kanji}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Kanji Learned</h3>
              <p className="text-sm text-gray-600">From WaniKani</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Target className="w-12 h-12 text-purple-500" />
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {sampleProgress.bunproData.grammar_points_learned}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Grammar Points</h3>
              <p className="text-sm text-gray-600">From Bunpro</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* WaniKani Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>🟠 WaniKani Progress</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">Connected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{sampleProgress.wanikaniData.subjects.radicals}</div>
                    <div className="text-sm text-gray-600">Radicals</div>
                    <Progress value={78} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{sampleProgress.wanikaniData.subjects.kanji}</div>
                    <div className="text-sm text-gray-600">Kanji</div>
                    <Progress value={65} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{sampleProgress.wanikaniData.subjects.vocabulary}</div>
                    <div className="text-sm text-gray-600">Vocabulary</div>
                    <Progress value={82} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bunpro Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>🔵 Bunpro Grammar</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">Connected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold">{sampleProgress.bunproData.grammar_points_learned}</div>
                    <div className="text-sm text-gray-600">Grammar Points Learned</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-600">
                      /{sampleProgress.bunproData.grammar_points_total}
                    </div>
                    <div className="text-sm text-gray-500">Total Available</div>
                  </div>
                </div>
                <Progress 
                  value={(sampleProgress.bunproData.grammar_points_learned / sampleProgress.bunproData.grammar_points_total) * 100} 
                  className="mb-2"
                />
                <div className="text-sm text-center text-gray-600">
                  {Math.round((sampleProgress.bunproData.grammar_points_learned / sampleProgress.bunproData.grammar_points_total) * 100)}% Complete
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Study Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          session.sessionType === 'wanikani' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <div className="font-medium capitalize">{session.sessionType}</div>
                          <div className="text-sm text-gray-600">{session.duration} minutes</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">+{session.xpGained} XP</div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Achievements & Features */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.name}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-green-600">+{achievement.xpReward} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-sm">API Integration</div>
                      <div className="text-xs text-gray-600">Connect WaniKani & Bunpro accounts</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">Progress Tracking</div>
                      <div className="text-xs text-gray-600">Comprehensive JLPT journey overview</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium text-sm">Achievement System</div>
                      <div className="text-xs text-gray-600">Unlock badges and earn XP</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-medium text-sm">Social Features</div>
                      <div className="text-xs text-gray-600">Study groups and leaderboards</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    <div>
                      <div className="font-medium text-sm">Community Forums</div>
                      <div className="text-xs text-gray-600">Connect with fellow learners</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-momiji/10 to-ume/10 border-momiji/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2">Ready to Begin?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Join thousands of learners tracking their Japanese journey
                </p>
                <Link href="/auth">
                  <Button className="w-full bg-gradient-to-r from-momiji to-ume hover:from-momiji/90 hover:to-ume/90">
                    Start Your Journey
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}