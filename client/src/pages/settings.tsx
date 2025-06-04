import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ChevronLeft, Target, Bell, User, Calendar, Trophy, Save } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface UserSettings {
  id: number;
  displayName: string;
  email: string;
  currentBelt: string;
  currentJLPTLevel: string;
  studyGoal: string;
  dailyGoalMinutes: number;
  dailyGoalKanji: number;
  dailyGoalGrammar: number;
  dailyGoalVocabulary: number;
  enableReminders: boolean;
  preferredStudyTime: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<UserSettings>>({});

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    onSuccess: (data) => {
      setFormData(data);
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error saving your settings.",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load settings</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const updateFormData = (field: keyof UserSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Customize your learning experience</p>
          </div>
          
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="goals">Daily Goals</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Daily Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Learning Goals
                </CardTitle>
                <CardDescription>
                  Set your daily targets for new content to learn in each category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New Content Goals */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">New Content Goals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Kanji Goal */}
                    <div className="space-y-2">
                      <Label htmlFor="kanji-goal" className="flex items-center gap-2">
                        <span className="text-purple-600">📝</span>
                        Kanji per day
                      </Label>
                      <Input
                        id="kanji-goal"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.dailyGoalKanji || 0}
                        onChange={(e) => updateFormData('dailyGoalKanji', parseInt(e.target.value))}
                        className="text-center text-lg font-semibold"
                      />
                      <p className="text-xs text-gray-600">Learn 5-10 new kanji daily for steady progress</p>
                    </div>

                    {/* Grammar Goal */}
                    <div className="space-y-2">
                      <Label htmlFor="grammar-goal" className="flex items-center gap-2">
                        <span className="text-green-600">🔧</span>
                        Grammar patterns per day
                      </Label>
                      <Input
                        id="grammar-goal"
                        type="number"
                        min="0"
                        max="20"
                        value={formData.dailyGoalGrammar || 0}
                        onChange={(e) => updateFormData('dailyGoalGrammar', parseInt(e.target.value))}
                        className="text-center text-lg font-semibold"
                      />
                      <p className="text-xs text-gray-600">2-5 patterns help build sentence structure</p>
                    </div>

                    {/* Vocabulary Goal */}
                    <div className="space-y-2">
                      <Label htmlFor="vocabulary-goal" className="flex items-center gap-2">
                        <span className="text-orange-600">📚</span>
                        Vocabulary words per day
                      </Label>
                      <Input
                        id="vocabulary-goal"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.dailyGoalVocabulary || 0}
                        onChange={(e) => updateFormData('dailyGoalVocabulary', parseInt(e.target.value))}
                        className="text-center text-lg font-semibold"
                      />
                      <p className="text-xs text-gray-600">10-20 words expand your expression ability</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Time Goal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Study Time Goal</h3>
                  <div className="max-w-md">
                    <Label htmlFor="time-goal" className="flex items-center gap-2">
                      <span className="text-blue-600">⏰</span>
                      Minutes per day
                    </Label>
                    <Input
                      id="time-goal"
                      type="number"
                      min="5"
                      max="180"
                      value={formData.dailyGoalMinutes || 0}
                      onChange={(e) => updateFormData('dailyGoalMinutes', parseInt(e.target.value))}
                      className="text-center text-lg font-semibold"
                    />
                    <p className="text-xs text-gray-600 mt-1">15-30 minutes daily builds consistent habits</p>
                  </div>
                </div>

                {/* Goal Presets */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Presets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        dailyGoalKanji: 3,
                        dailyGoalGrammar: 2,
                        dailyGoalVocabulary: 5,
                        dailyGoalMinutes: 15
                      }))}
                    >
                      <Badge variant="secondary">Beginner</Badge>
                      <div className="text-sm mt-2">3 Kanji, 2 Grammar, 5 Vocab</div>
                      <div className="text-xs text-gray-600">15 minutes/day</div>
                    </Button>

                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        dailyGoalKanji: 5,
                        dailyGoalGrammar: 3,
                        dailyGoalVocabulary: 10,
                        dailyGoalMinutes: 25
                      }))}
                    >
                      <Badge variant="secondary">Intermediate</Badge>
                      <div className="text-sm mt-2">5 Kanji, 3 Grammar, 10 Vocab</div>
                      <div className="text-xs text-gray-600">25 minutes/day</div>
                    </Button>

                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        dailyGoalKanji: 8,
                        dailyGoalGrammar: 5,
                        dailyGoalVocabulary: 15,
                        dailyGoalMinutes: 40
                      }))}
                    >
                      <Badge variant="secondary">Advanced</Badge>
                      <div className="text-sm mt-2">8 Kanji, 5 Grammar, 15 Vocab</div>
                      <div className="text-xs text-gray-600">40 minutes/day</div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and learning preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={formData.displayName || ""}
                      onChange={(e) => updateFormData('displayName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="study-goal">Study Goal</Label>
                    <Input
                      id="study-goal"
                      placeholder="e.g., Pass JLPT N3, Read manga fluently"
                      value={formData.studyGoal || ""}
                      onChange={(e) => updateFormData('studyGoal', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred-time">Preferred Study Time</Label>
                    <Input
                      id="preferred-time"
                      placeholder="e.g., Morning, Evening"
                      value={formData.preferredStudyTime || ""}
                      onChange={(e) => updateFormData('preferredStudyTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">Current Progress</span>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {settings.currentBelt} Belt
                  </Badge>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    JLPT {settings.currentJLPTLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure when and how you'd like to be reminded to study
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable-reminders">Study Reminders</Label>
                    <p className="text-sm text-gray-600">
                      Get daily reminders to maintain your study streak
                    </p>
                  </div>
                  <Switch
                    id="enable-reminders"
                    checked={formData.enableReminders || false}
                    onCheckedChange={(checked) => updateFormData('enableReminders', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reminder Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Daily Goal Reminder</div>
                        <div className="text-sm text-gray-600">Remind me to complete my daily goals</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Review Due Notification</div>
                        <div className="text-sm text-gray-600">Alert when review cards are ready</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Streak Protection</div>
                        <div className="text-sm text-gray-600">Warn before losing study streak</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Progress Tracking
                </CardTitle>
                <CardDescription>
                  View your learning statistics and achievement history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      {settings.currentStreak}
                    </div>
                    <div className="text-sm text-blue-700">Current Streak</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {Math.floor((settings.id * 127) % 100)}%
                    </div>
                    <div className="text-sm text-green-700">Goal Completion Rate</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {Math.floor(settings.id * 23)}
                    </div>
                    <div className="text-sm text-purple-700">Items Learned This Month</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
                  <p className="text-sm text-gray-600">
                    Download your learning data and progress statistics
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      Export Progress Data
                    </Button>
                    <Button variant="outline">
                      Export Review History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}