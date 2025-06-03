import { useQuery } from "@tanstack/react-query";
import { fetchAchievements } from "@/lib/api-clients";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Achievements() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { achievements = [], userAchievements = [] } = data || {};
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

  const categories = {
    milestone: { name: "Milestones", color: "bg-blue-500", icon: "fas fa-flag" },
    kanji: { name: "Kanji Mastery", color: "bg-red-500", icon: "fas fa-language" },
    vocabulary: { name: "Vocabulary", color: "bg-green-500", icon: "fas fa-book" },
    grammar: { name: "Grammar", color: "bg-yellow-500", icon: "fas fa-graduation-cap" },
    streak: { name: "Study Streaks", color: "bg-orange-500", icon: "fas fa-fire" },
    jlpt: { name: "JLPT Levels", color: "bg-purple-500", icon: "fas fa-trophy" },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-washi via-gray-50 to-sakura/5">
      <Sidebar />
      
      <div className="flex-1 overflow-auto lg:ml-0">
        {/* Header */}
        <header className="bg-gradient-to-r from-washi via-white to-sakura/10 border-b border-sakura/30 px-4 lg:px-8 py-6 lg:py-8 pt-20 lg:pt-8 relative overflow-hidden">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-sumi">実績 (Achievements)</h2>
            <p className="text-momiji font-medium mt-1">
              Track your progress and unlock rewards for your dedication
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{achievements.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Unlocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{userAchievements.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((userAchievements.length / achievements.length) * 100)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Categories */}
          {Object.entries(categories).map(([categoryKey, category]) => {
            const categoryAchievements = achievements.filter(a => a.category === categoryKey);
            if (categoryAchievements.length === 0) return null;

            return (
              <div key={categoryKey} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                    <i className={`${category.icon} text-white text-sm`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                  <Badge variant="secondary">
                    {categoryAchievements.filter(a => unlockedIds.has(a.id)).length}/{categoryAchievements.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAchievements.map((achievement) => {
                    const isUnlocked = unlockedIds.has(achievement.id);
                    const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

                    return (
                      <Card
                        key={achievement.id}
                        className={`relative overflow-hidden ${
                          isUnlocked 
                            ? "border-green-200 bg-green-50" 
                            : "border-gray-200 bg-gray-50 opacity-75"
                        }`}
                      >
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <i className="fas fa-check text-white text-xs"></i>
                            </div>
                          </div>
                        )}
                        
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 ${
                              isUnlocked ? category.color : "bg-gray-400"
                            } rounded-full flex items-center justify-center`}>
                              <i className={`${achievement.icon} text-white text-lg`}></i>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">{achievement.name}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-star text-yellow-500 text-sm"></i>
                              <span className="text-sm font-medium text-gray-900">
                                {achievement.xpReward} XP
                              </span>
                            </div>
                            
                            {isUnlocked && userAchievement && (
                              <div className="text-xs text-gray-500">
                                Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {achievement.threshold && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-500">
                                Requirement: {achievement.threshold} {categoryKey === "streak" ? "days" : "items"}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
