import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDashboard, setupApiKeys } from "@/lib/api-clients";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Settings() {
  const [wanikaniKey, setWanikaniKey] = useState("");
  const [bunproKey, setBunproKey] = useState("");
  const [showWanikaniKey, setShowWanikaniKey] = useState(false);
  const [showBunproKey, setShowBunproKey] = useState(false);
  const { toast } = useToast();

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const setupMutation = useMutation({
    mutationFn: async (data: { wanikaniApiKey?: string; bunproApiKey?: string }) => {
      const user = localStorage.getItem("user");
      if (!user) throw new Error("Not authenticated");
      
      const userData = JSON.parse(user);
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          wanikaniApiKey: data.wanikaniApiKey,
          bunproApiKey: data.bunproApiKey,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update API keys");
      }
      
      return response.json();
    },
    onSuccess: async () => {
      // Show specific message based on which keys were updated
      const updatedServices = [];
      if (wanikaniKey) updatedServices.push("WaniKani");
      if (bunproKey) updatedServices.push("Bunpro");
      
      toast({
        title: "API keys updated",
        description: `Your ${updatedServices.join(" and ")} API key${updatedServices.length > 1 ? 's have' : ' has'} been securely saved. Syncing data...`,
      });
      
      // Trigger data sync immediately after saving keys
      try {
        await fetch("/api/sync-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        // Invalidate cache to refresh dashboard with new data
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        
        toast({
          title: "Data synchronized",
          description: "Your progress data has been updated from the connected services",
        });
      } catch (error) {
        console.error("Sync error:", error);
        toast({
          title: "Sync incomplete",
          description: "API keys saved but data sync failed. Please check your API keys are valid.",
          variant: "destructive",
        });
      }
      
      setWanikaniKey("");
      setBunproKey("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API keys",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setupMutation.mutate({
      wanikaniApiKey: wanikaniKey || undefined,
      bunproApiKey: bunproKey || undefined,
    });
  };

  const user = dashboardData?.user;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600 mt-1">
              Configure your API integrations and preferences
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 max-w-4xl">
          {/* API Integration Setup */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Integration Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* WaniKani Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-crab text-pink-500 text-xl"></i>
                    <h3 className="text-lg font-bold text-gray-900">WaniKani Integration</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      user?.wanikaniApiKey ? "bg-green-400" : "bg-red-400"
                    }`} />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How to get your WaniKani API key:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-4">
                          <li>Log in to your WaniKani account</li>
                          <li>Go to Settings → API Tokens</li>
                          <li>Generate a new API token with read permissions</li>
                          <li>Copy and paste it below</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wanikani-key">WaniKani API Token</Label>
                    <div className="relative">
                      <Input
                        id="wanikani-key"
                        type={showWanikaniKey ? "text" : "password"}
                        value={wanikaniKey}
                        onChange={(e) => setWanikaniKey(e.target.value)}
                        placeholder={user?.wanikaniApiKey ? "API key is set" : "Enter your WaniKani API token"}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWanikaniKey(!showWanikaniKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className={`fas ${showWanikaniKey ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bunpro Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-book text-blue-500 text-xl"></i>
                    <h3 className="text-lg font-bold text-gray-900">Bunpro Integration</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      user?.bunproApiKey ? "bg-green-400" : "bg-red-400"
                    }`} />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How to get your Bunpro API key:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-4">
                          <li>Log in to your Bunpro account</li>
                          <li>Go to Settings → API</li>
                          <li>Generate a new API key</li>
                          <li>Copy and paste it below</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bunpro-key">Bunpro API Key</Label>
                    <div className="relative">
                      <Input
                        id="bunpro-key"
                        type={showBunproKey ? "text" : "password"}
                        value={bunproKey}
                        onChange={(e) => setBunproKey(e.target.value)}
                        placeholder={user?.bunproApiKey ? "API key is set" : "Enter your Bunpro API key"}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBunproKey(!showBunproKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className={`fas ${showBunproKey ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={setupMutation.isPending || (!wanikaniKey && !bunproKey)}
                    className="w-full"
                  >
                    {setupMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Save API Keys
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-crab text-pink-500"></i>
                    <div>
                      <div className="font-medium text-gray-900">WaniKani</div>
                      <div className="text-sm text-gray-600">
                        {user?.wanikaniApiKey ? "Connected and ready to sync" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user?.wanikaniApiKey
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {user?.wanikaniApiKey ? "Connected" : "Disconnected"}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-book text-blue-500"></i>
                    <div>
                      <div className="font-medium text-gray-900">Bunpro</div>
                      <div className="text-sm text-gray-600">
                        {user?.bunproApiKey ? "Connected and ready to sync" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user?.bunproApiKey
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {user?.bunproApiKey ? "Connected" : "Disconnected"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
