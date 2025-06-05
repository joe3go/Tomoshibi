import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Device } from '@capacitor/device';

interface MobileWrapperProps {
  children: React.ReactNode;
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const initializeMobile = async () => {
      try {
        // Check if running on mobile device
        const info = await Device.getInfo();
        setIsMobile(info.platform !== 'web');

        if (info.platform !== 'web') {
          // Configure status bar for mobile
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#1a1a1a' });

          // Hide splash screen after app loads
          await SplashScreen.hide();

          // Handle keyboard events
          Keyboard.addListener('keyboardWillShow', () => {
            document.body.classList.add('keyboard-open');
          });

          Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-open');
          });

          // Handle app state changes
          App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
              // App became active
              console.log('App became active');
            } else {
              // App went to background
              console.log('App went to background');
            }
          });

          // Handle back button
          App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp();
            } else {
              window.history.back();
            }
          });
        }
      } catch (error) {
        console.log('Not running in mobile environment');
      }
    };

    initializeMobile();
  }, []);

  return (
    <div className={`mobile-app ${isMobile ? 'mobile-platform' : 'web-platform'}`}>
      {children}
      <style>{`
        .mobile-app {
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }
        
        .mobile-platform {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        .keyboard-open {
          height: calc(100vh - var(--keyboard-height, 0px));
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .main-content {
            padding: 8px !important;
          }
          
          .japanese-text {
            font-size: 1.5rem !important;
          }
          
          .text-6xl {
            font-size: 3rem !important;
          }
          
          .study-fullscreen {
            padding: 16px !important;
          }
          
          .furigana-container {
            line-height: 2 !important;
            min-height: 3em !important;
          }
        }
        
        /* Touch-friendly buttons */
        .mobile-platform button {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Prevent text selection on mobile */
        .mobile-platform .japanese-text {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
}