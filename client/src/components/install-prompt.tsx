import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt) return null;

  // Check if user previously dismissed
  if (localStorage.getItem('installPromptDismissed') === 'true') return null;

  return (
    <Card 
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
      style={{
        backgroundColor: 'hsl(220, 25%, 14%)',
        borderColor: 'hsl(220, 15%, 22%)',
        color: 'hsl(45, 25%, 90%)'
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium" style={{ color: 'hsl(45, 25%, 90%)' }}>
              Install JapanLearn
            </h3>
            <p className="text-xs mt-1" style={{ color: 'hsl(45, 10%, 62%)' }}>
              Add to your home screen for quick access to your Japanese learning journey
            </p>
            
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="flex items-center space-x-1"
                style={{
                  backgroundColor: 'hsl(38, 75%, 67%)',
                  color: 'hsl(220, 20%, 11%)',
                  fontSize: '12px'
                }}
              >
                <Download className="h-3 w-3" />
                <span>Install</span>
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs"
                style={{
                  color: 'hsl(45, 10%, 62%)',
                  fontSize: '12px'
                }}
              >
                Not now
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="p-1"
            style={{ color: 'hsl(45, 10%, 62%)' }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}