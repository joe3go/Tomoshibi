import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDashboard, syncData } from "@/lib/api-clients";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import JLPTJourney from "@/components/jlpt-journey";
import JourneyMap from "@/components/journey-map";
import ProgressTracker from "@/components/progress-tracker";
import AchievementModal from "@/components/achievement-modal";
import ProgressCircle from "@/components/progress-circle";
import { useLanguageMode } from "@/App";
import { useLanguageContent } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const { toast } = useToast();
  const { languageMode } = useLanguageMode();
  const content = useLanguageContent(languageMode);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const syncMutation = useMutation({
    mutationFn: syncData,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Data synced successfully",
        description: `WaniKani: ${data.wanikaniSynced ? "✓" : "✗"} | Bunpro: ${data.bunproSynced ? "✓" : "✗"}`,
      });
      
      if (data.newAchievements?.length > 0) {
        setSelectedAchievement(data.newAchievements[0]);
      }
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Failed to sync data from external APIs",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen washi-texture">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="space-y-8">
            <div className="peaceful-loading h-32 w-full rounded-xl" />
            <div className="peaceful-loading h-64 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="peaceful-loading h-48 rounded-xl" />
              <div className="peaceful-loading h-48 rounded-xl" />
              <div className="peaceful-loading h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, progress, achievements, recentSessions } = dashboardData || {};

  // Calculate week data for streak visualization
  const getWeekData = () => {
    const today = new Date();
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const hasStudied = recentSessions?.some(session => 
        new Date(session.date).toDateString() === day.toDateString()
      );
      weekDays.push({
        day: day.toLocaleDateString('en', { weekday: 'narrow' }),
        studied: hasStudied
      });
    }
    return weekDays;
  };

  const weekData = getWeekData();

  // Calculate progress percentages
  const getProgressData = () => {
    if (!progress) return null;

    const wanikani = progress.wanikaniData;
    const bunpro = progress.bunproData;

    return {
      kanji: {
        percentage: wanikani ? Math.round((wanikani.subjects?.kanji || 0) / 400 * 100) : 0,
        value: `${wanikani?.subjects?.kanji || 0}/400`
      },
      vocabulary: {
        percentage: wanikani ? Math.round((wanikani.subjects?.vocabulary || 0) / 1200 * 100) : 0,
        value: `${wanikani?.subjects?.vocabulary || 0}/1200`
      },
      grammar: {
        percentage: bunpro ? Math.round((bunpro.grammar_points_learned || 0) / 150 * 100) : 0,
        value: `${bunpro?.grammar_points_learned || 0}/150`
      },
      reading: {
        percentage: 55, // This would be calculated based on various metrics
        value: "55/100"
      }
    };
  };

  const progressData = getProgressData();

  return (
    <div className="flex min-h-screen washi-texture">
      <Sidebar user={user} />
      
      <div className="flex-1 overflow-auto lg:ml-0 w-full pt-12">
        {/* Modern Welcome Section */}
        <div className="px-4 lg:px-8 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Welcome back, {user?.username || 'Learner'}!
              </h2>
              <p className="text-sm text-gray-600">
                Continue your Japanese learning journey
              </p>
            </div>
            
            {/* Weekly Progress Indicators */}
            <div className="hidden lg:flex items-center gap-2">
              {weekData.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    day.studied 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {day.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-4 lg:p-8">
          {/* JLPT Progress Journey */}
          <JLPTJourney currentLevel={user?.currentJLPTLevel || "N5"} progress={progress} />

          {/* Comprehensive Progress Tracker */}
          <div className="mt-8">
            <ProgressTracker 
              progress={progress}
              hasApiKeys={!!(user?.wanikaniApiKey || user?.bunproApiKey)}
              onSync={() => syncMutation.mutate()}
              isLoading={syncMutation.isPending}
            />
          </div>

          {/* Interactive Learning Journey Map */}
          <div className="mt-8">
            <JourneyMap 
              userProgress={progress}
              userLevel={user?.currentJLPTLevel || "N5"}
              totalXP={user?.totalXP || 0}
            />
          </div>

          {/* Peaceful Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mt-6 lg:mt-8">
            {/* WaniKani Integration - Zen style */}
            <Card className="japanese-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="japanese-heading">漢字の旅 - WaniKani</CardTitle>
                  <div className={`w-3 h-3 rounded-full zen-pulse ${
                    user?.wanikaniApiKey ? "bg-matcha" : "bg-muted"
                  }`} title={user?.wanikaniApiKey ? "Connected" : "Not Connected"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="japanese-text text-muted-foreground">漢字習得</span>
                  <span className="font-bold text-matcha japanese-text">
                    {progress?.wanikaniData?.subjects?.kanji || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="japanese-text text-muted-foreground">語彙</span>
                  <span className="font-bold text-matcha japanese-text">
                    {progress?.wanikaniData?.subjects?.vocabulary || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="japanese-text text-muted-foreground">現在のレベル</span>
                  <span className="font-bold text-primary japanese-text">
                    {progress?.wanikaniData?.level || 1}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="japanese-text text-muted-foreground">復習待ち</span>
                    <span className="text-foreground japanese-text">
                      {progress?.wanikaniData?.reviewsAvailable || 0}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="matcha-gradient h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min((progress?.wanikaniData?.reviewsAvailable || 0) / 50 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bunpro Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bunpro Progress</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${
                    user?.bunproApiKey ? "bg-green-400" : "bg-red-400"
                  }`} title={user?.bunproApiKey ? "Connected" : "Not Connected"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Grammar Points</span>
                  <span className="font-bold text-gray-900">
                    {progress?.bunproData?.grammar_points_learned || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SRS Level Avg</span>
                  <span className="font-bold text-gray-900">
                    {progress?.bunproData?.srs_average?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-bold text-blue-500">
                    {progress?.bunproData?.accuracy || 0}%
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Reviews Available</span>
                    <span className="text-gray-900">
                      {progress?.bunproData?.reviewsAvailable || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((progress?.bunproData?.reviewsAvailable || 0) / 30 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Study Streak</CardTitle>
                  <i className="fas fa-fire text-orange-500 text-xl"></i>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-orange-500 mb-2">
                    {user?.currentStreak || 0}
                  </div>
                  <div className="text-gray-600">Days in a row</div>
                </div>
                
                {/* Weekly Calendar */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {weekData.map((day, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                        day.studied 
                          ? "bg-orange-500 text-white" 
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 text-center">
                  Personal best: <span className="font-medium text-gray-900">
                    {user?.bestStreak || 0} days
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements & Sync */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Achievements</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements?.length > 0 ? (
                  achievements.slice(0, 3).map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <i className={`${userAchievement.achievement.icon} text-white text-lg`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {userAchievement.achievement.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {userAchievement.achievement.description}
                        </div>
                        <div className="text-xs text-orange-500 font-medium">
                          +{userAchievement.achievement.xpReward} XP
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No achievements yet. Start studying to unlock your first achievement!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Sync */}
            <Card>
              <CardHeader>
                <CardTitle>Data Sync</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-crab text-pink-500"></i>
                      <span className="font-medium text-gray-900">WaniKani</span>
                    </div>
                    <Badge variant={user?.wanikaniApiKey ? "default" : "secondary"}>
                      {user?.wanikaniApiKey ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-book text-blue-500"></i>
                      <span className="font-medium text-gray-900">Bunpro</span>
                    </div>
                    <Badge variant={user?.bunproApiKey ? "default" : "secondary"}>
                      {user?.bunproApiKey ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    className="w-full"
                  >
                    {syncMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync-alt mr-2"></i>
                        Sync Data
                      </>
                    )}
                  </Button>
                </div>

                {progress?.lastSyncedAt && (
                  <div className="text-sm text-gray-600 text-center">
                    Last synced: {new Date(progress.lastSyncedAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Level Progress Details */}
          {progressData && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Current Level Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ProgressCircle
                    percentage={progressData.kanji.percentage}
                    color="#3B82F6"
                    label="Kanji"
                    value={progressData.kanji.value}
                  />
                  <ProgressCircle
                    percentage={progressData.vocabulary.percentage}
                    color="#10B981"
                    label="Vocabulary"
                    value={progressData.vocabulary.value}
                  />
                  <ProgressCircle
                    percentage={progressData.grammar.percentage}
                    color="#F59E0B"
                    label="Grammar"
                    value={progressData.grammar.value}
                  />
                  <ProgressCircle
                    percentage={progressData.reading.percentage}
                    color="#EF4444"
                    label="Reading"
                    value={progressData.reading.value}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Achievement Modal */}
      <AchievementModal
        achievement={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
}
