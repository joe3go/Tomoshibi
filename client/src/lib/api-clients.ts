import { apiRequest } from "./queryClient";

export interface DashboardData {
  user: {
    id: number;
    username: string;
    displayName: string;
    totalXP: number;
    currentStreak: number;
    bestStreak: number;
    currentJLPTLevel: string;
    wanikaniApiKey?: string;
    bunproApiKey?: string;
  };
  progress?: {
    wanikaniData?: any;
    bunproData?: any;
    lastSyncedAt: string;
  };
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    unlockedAt: string;
    achievement: {
      name: string;
      description: string;
      icon: string;
      xpReward: number;
      category: string;
    };
  }>;
  recentSessions: Array<{
    id: number;
    date: string;
    wanikaniReviews: number;
    bunproReviews: number;
    xpEarned: number;
  }>;
}

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await apiRequest("GET", "/api/dashboard");
  return await response.json();
}

export async function setupApiKeys(data: { wanikaniApiKey?: string; bunproApiKey?: string }) {
  const response = await apiRequest("POST", "/api/setup-keys", data);
  return await response.json();
}

export async function syncData() {
  const response = await apiRequest("POST", "/api/sync-data");
  return await response.json();
}

export async function recordStudySession(data: {
  wanikaniReviews?: number;
  bunproReviews?: number;
  xpEarned?: number;
}) {
  const response = await apiRequest("POST", "/api/study-session", data);
  return await response.json();
}

export async function fetchAchievements() {
  const response = await apiRequest("GET", "/api/achievements");
  return await response.json();
}
