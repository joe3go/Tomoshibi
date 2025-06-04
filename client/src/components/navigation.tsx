import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Users, 
  Settings, 
  Target,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  user?: {
    displayName: string;
    totalXP: number;
    currentBelt: string;
    currentStreak: number;
  };
}

export function Sidebar({ user }: NavigationProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      description: "Overview and progress"
    },
    {
      name: "Study Mode",
      href: "/study-mode",
      icon: BookOpen,
      description: "Learn new content"
    },
    {
      name: "Study Session",
      href: "/study",
      icon: Target,
      description: "Practice and review"
    },
    {
      name: "Achievements",
      href: "/achievements",
      icon: Trophy,
      description: "Your accomplishments"
    },
    {
      name: "Social",
      href: "/social",
      icon: Users,
      description: "Connect with others"
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      description: "Preferences and goals"
    }
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-50",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">日</span>
              </div>
              <span className="font-bold text-gray-900">JapanLearn</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className={cn(
            "flex items-center space-x-3",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.displayName}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {user.currentBelt} Belt
                  </Badge>
                  <span className="text-xs text-gray-600">
                    {user.totalXP} XP
                  </span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Calendar className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-600">
                    {user.currentStreak} day streak
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "w-full flex items-center rounded-lg p-3 transition-colors cursor-pointer",
                      isCollapsed && "justify-center px-2",
                      isActive ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-gray-100"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      !isCollapsed && "mr-3"
                    )} />
                    
                    {!isCollapsed && (
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-2">
              Daily Goal Progress
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              65% complete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileNav({ user }: NavigationProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home
    },
    {
      name: "Study Mode",
      href: "/study-mode",
      icon: BookOpen
    },
    {
      name: "Study Session",
      href: "/study",
      icon: Target
    },
    {
      name: "Achievements",
      href: "/achievements",
      icon: Trophy
    },
    {
      name: "Social",
      href: "/social",
      icon: Users
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">日</span>
            </div>
            <span className="font-bold text-gray-900">JapanLearn</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}>
          <div className="fixed left-0 top-16 bottom-0 w-80 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            {/* User Profile Section */}
            {user && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.currentBelt} Belt
                      </Badge>
                      <span className="text-sm text-gray-600">{user.totalXP} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            isActive && "bg-blue-600 text-white"
                          )}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}