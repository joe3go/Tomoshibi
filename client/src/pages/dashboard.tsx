import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDashboard, syncData } from "@/lib/api-clients";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import JLPTJourney from "@/components/jlpt-journey";
import AchievementModal from "@/components/achievement-modal";
import ProgressCircle from "@/components/progress-circle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const { toast } = useToast();

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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!
              </h2>
              <p className="text-gray-600 mt-1">Ready to continue your Japanese learning journey?</p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{user?.totalXP || 0}</div>
                <div className="text-sm text-gray-500">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{user?.currentStreak || 0}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{achievements?.length || 0}</div>
                <div className="text-sm text-gray-500">Achievements</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {/* JLPT Progress Journey */}
          <JLPTJourney currentLevel={user?.currentJLPTLevel || "N5"} progress={progress} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* WaniKani Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>WaniKani Progress</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${
                    user?.wanikaniApiKey ? "bg-green-400" : "bg-red-400"
                  }`} title={user?.wanikaniApiKey ? "Connected" : "Not Connected"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kanji Learned</span>
                  <span className="font-bold text-gray-900">
                    {progress?.wanikaniData?.subjects?.kanji || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vocabulary</span>
                  <span className="font-bold text-gray-900">
                    {progress?.wanikaniData?.subjects?.vocabulary || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Level</span>
                  <span className="font-bold text-blue-500">
                    {progress?.wanikaniData?.level || 1}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Reviews Available</span>
                    <span className="text-gray-900">
                      {progress?.wanikaniData?.reviewsAvailable || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
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
