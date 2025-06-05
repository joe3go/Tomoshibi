import { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  buildDate: string;
  lastUpdate: string;
}

export function VersionDisplay() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '1.0.1',
    buildDate: new Date().toISOString().split('T')[0],
    lastUpdate: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    // Update timestamp and fetch version info
    const updateInfo = async () => {
      try {
        const response = await fetch('/api/version');
        const data = await response.json();
        setVersionInfo({
          version: data.version || '1.0.1',
          buildDate: data.buildDate || new Date().toISOString().split('T')[0],
          lastUpdate: new Date().toLocaleTimeString()
        });
      } catch (error) {
        // Fallback to default version
        setVersionInfo(prev => ({
          ...prev,
          lastUpdate: new Date().toLocaleTimeString()
        }));
      }
    };
    
    updateInfo();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-mono">
        <div className="flex items-center gap-2">
          <span>v{versionInfo.version}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-300">{versionInfo.lastUpdate}</span>
        </div>
      </div>
    </div>
  );
}