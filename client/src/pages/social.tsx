import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Trophy, Users, MessageSquare, Target, Calendar, Plus, Search, Filter } from "lucide-react";
import { useLanguageMode, useLanguageContent } from "@/App";
import { queryClient } from "@/lib/queryClient";

export default function Social() {
  const { languageMode } = useLanguageMode();
  const content = useLanguageContent(languageMode);
  const [activeTab, setActiveTab] = useState("leaderboards");

  // Fetch social data
  const { data: socialData, isLoading } = useQuery({
    queryKey: ["/api/social"],
  });

  // Leaderboards Section
  const LeaderboardsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{languageMode === 'en' ? 'Leaderboards' : languageMode === 'jp' ? 'リーダーボード' : 'リーダーボード（りーだーぼーど）'}</h2>
        <div className="flex gap-2">
          <Select defaultValue="weekly">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{languageMode === 'en' ? 'Weekly' : languageMode === 'jp' ? '週間' : '週間（しゅうかん）'}</SelectItem>
              <SelectItem value="monthly">{languageMode === 'en' ? 'Monthly' : languageMode === 'jp' ? '月間' : '月間（げっかん）'}</SelectItem>
              <SelectItem value="all_time">{languageMode === 'en' ? 'All Time' : languageMode === 'jp' ? '全期間' : '全期間（ぜんきかん）'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* XP Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="truncate">
                {languageMode === 'en' ? 'Top XP Earners' : languageMode === 'jp' ? 'XP獲得ランキング' : 'XP獲得（かくとく）ランキング'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {socialData?.leaderboards?.xp?.map((user: any, index: number) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback className="text-xs">{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.totalXP.toLocaleString()} XP</p>
                  </div>
                  {index === 0 && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              {languageMode === 'en' ? 'Most Reviews' : languageMode === 'jp' ? 'レビュー数ランキング' : 'レビュー数（すう）ランキング'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialData?.leaderboards?.reviews?.map((user: any, index: number) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.reviewsCompleted.toLocaleString()} {languageMode === 'en' ? 'reviews' : languageMode === 'jp' ? 'レビュー' : 'レビュー'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Study Groups Section
  const StudyGroupsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{languageMode === 'en' ? 'Study Groups' : languageMode === 'jp' ? '学習グループ' : '学習（がくしゅう）グループ'}</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {languageMode === 'en' ? 'Create Group' : languageMode === 'jp' ? 'グループ作成' : 'グループ作成（さくせい）'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{languageMode === 'en' ? 'Create Study Group' : languageMode === 'jp' ? '学習グループを作成' : '学習（がくしゅう）グループを作成（さくせい）'}</DialogTitle>
              <DialogDescription>
                {languageMode === 'en' ? 'Start a new study group to learn together with other Japanese learners.' : languageMode === 'jp' ? '他の日本語学習者と一緒に学ぶための新しい学習グループを始めましょう。' : '他（ほか）の日本語（にほんご）学習者（がくしゅうしゃ）と一緒（いっしょ）に学（まな）ぶための新（あたら）しい学習（がくしゅう）グループを始（はじ）めましょう。'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">{languageMode === 'en' ? 'Group Name' : languageMode === 'jp' ? 'グループ名' : 'グループ名（めい）'}</Label>
                <Input id="groupName" placeholder={languageMode === 'en' ? 'Enter group name...' : languageMode === 'jp' ? 'グループ名を入力...' : 'グループ名（めい）を入力（にゅうりょく）...'} />
              </div>
              <div>
                <Label htmlFor="jlptLevel">JLPT {languageMode === 'en' ? 'Level' : languageMode === 'jp' ? 'レベル' : 'レベル'}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={languageMode === 'en' ? 'Select level...' : languageMode === 'jp' ? 'レベルを選択...' : 'レベルを選択（せんたく）...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N5">N5</SelectItem>
                    <SelectItem value="N4">N4</SelectItem>
                    <SelectItem value="N3">N3</SelectItem>
                    <SelectItem value="N2">N2</SelectItem>
                    <SelectItem value="N1">N1</SelectItem>
                    <SelectItem value="mixed">{languageMode === 'en' ? 'Mixed Levels' : languageMode === 'jp' ? '混合レベル' : '混合（こんごう）レベル'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">{languageMode === 'en' ? 'Description' : languageMode === 'jp' ? '説明' : '説明（せつめい）'}</Label>
                <Textarea id="description" placeholder={languageMode === 'en' ? 'Describe your study group...' : languageMode === 'jp' ? '学習グループの説明...' : '学習（がくしゅう）グループの説明（せつめい）...'} />
              </div>
              <Button className="w-full">
                {languageMode === 'en' ? 'Create Group' : languageMode === 'jp' ? 'グループを作成' : 'グループを作成（さくせい）'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {socialData?.studyGroups?.map((group: any) => (
          <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <Badge variant="secondary">{group.jlptLevel}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{group.memberCount} {languageMode === 'en' ? 'members' : languageMode === 'jp' ? 'メンバー' : 'メンバー'}</span>
                </div>
                <Button size="sm">
                  {languageMode === 'en' ? 'Join' : languageMode === 'jp' ? '参加' : '参加（さんか）'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Challenges Section
  const ChallengesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{languageMode === 'en' ? 'Challenges' : languageMode === 'jp' ? 'チャレンジ' : 'チャレンジ'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {languageMode === 'en' ? 'Filter' : languageMode === 'jp' ? 'フィルター' : 'フィルター'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {socialData?.challenges?.map((challenge: any) => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {challenge.title}
                  </CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant={challenge.type === 'daily' ? 'default' : challenge.type === 'weekly' ? 'secondary' : 'outline'}>
                    {challenge.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">+{challenge.xpReward} XP</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{languageMode === 'en' ? 'Progress' : languageMode === 'jp' ? '進捗' : '進捗（しんちょく）'}</span>
                  <span>{challenge.userProgress || 0} / {challenge.target}</span>
                </div>
                <Progress value={((challenge.userProgress || 0) / challenge.target) * 100} className="h-2" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {languageMode === 'en' ? `Ends ${new Date(challenge.endDate).toLocaleDateString()}` : 
                       languageMode === 'jp' ? `終了: ${new Date(challenge.endDate).toLocaleDateString()}` : 
                       `終了（しゅうりょう）: ${new Date(challenge.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  <Button size="sm" disabled={challenge.isJoined}>
                    {challenge.isJoined ? 
                      (languageMode === 'en' ? 'Joined' : languageMode === 'jp' ? '参加中' : '参加中（さんかちゅう）') :
                      (languageMode === 'en' ? 'Join Challenge' : languageMode === 'jp' ? 'チャレンジに参加' : 'チャレンジに参加（さんか）')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Study Buddies Section
  const StudyBuddiesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{languageMode === 'en' ? 'Study Buddies' : languageMode === 'jp' ? '学習パートナー' : '学習（がくしゅう）パートナー'}</h2>
        <Button>
          <Search className="h-4 w-4 mr-2" />
          {languageMode === 'en' ? 'Find Buddies' : languageMode === 'jp' ? 'パートナー検索' : 'パートナー検索（けんさく）'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Study Buddies */}
        <Card>
          <CardHeader>
            <CardTitle>{languageMode === 'en' ? 'Your Study Buddies' : languageMode === 'jp' ? 'あなたの学習パートナー' : 'あなたの学習（がくしゅう）パートナー'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialData?.studyBuddies?.map((buddy: any) => (
                <div key={buddy.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={buddy.profileImageUrl} />
                    <AvatarFallback>{buddy.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{buddy.displayName}</p>
                    <p className="text-sm text-muted-foreground">{buddy.currentJLPTLevel} • {buddy.totalXP.toLocaleString()} XP</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Buddy Requests */}
        <Card>
          <CardHeader>
            <CardTitle>{languageMode === 'en' ? 'Buddy Requests' : languageMode === 'jp' ? 'パートナー申請' : 'パートナー申請（しんせい）'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialData?.buddyRequests?.map((request: any) => (
                <div key={request.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.profileImageUrl} />
                      <AvatarFallback>{request.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{request.displayName}</p>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      {languageMode === 'en' ? 'Accept' : languageMode === 'jp' ? '承認' : '承認（しょうにん）'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      {languageMode === 'en' ? 'Decline' : languageMode === 'jp' ? '拒否' : '拒否（きょひ）'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {languageMode === 'en' ? 'Loading social features...' : languageMode === 'jp' ? 'ソーシャル機能を読み込み中...' : 'ソーシャル機能（きのう）を読（よ）み込（こ）み中（ちゅう）...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{languageMode === 'en' ? 'Social Hub' : languageMode === 'jp' ? 'ソーシャルハブ' : 'ソーシャルハブ'}</h1>
        <p className="text-muted-foreground">
          {languageMode === 'en' ? 'Connect with other Japanese learners, compete in challenges, and grow together!' : 
           languageMode === 'jp' ? '他の日本語学習者とつながり、チャレンジで競い合い、一緒に成長しましょう！' : 
           '他（ほか）の日本語（にほんご）学習者（がくしゅうしゃ）とつながり、チャレンジで競（きそ）い合（あ）い、一緒（いっしょ）に成長（せいちょう）しましょう！'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            {languageMode === 'en' ? 'Leaderboards' : languageMode === 'jp' ? 'ランキング' : 'ランキング'}
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {languageMode === 'en' ? 'Groups' : languageMode === 'jp' ? 'グループ' : 'グループ'}
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {languageMode === 'en' ? 'Challenges' : languageMode === 'jp' ? 'チャレンジ' : 'チャレンジ'}
          </TabsTrigger>
          <TabsTrigger value="buddies" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {languageMode === 'en' ? 'Buddies' : languageMode === 'jp' ? 'パートナー' : 'パートナー'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboards" className="space-y-6">
          <LeaderboardsSection />
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <StudyGroupsSection />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <ChallengesSection />
        </TabsContent>

        <TabsContent value="buddies" className="space-y-6">
          <StudyBuddiesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}