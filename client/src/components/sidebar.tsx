import { Link, useLocation } from "wouter";

interface SidebarProps {
  user?: {
    displayName: string;
    totalXP: number;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
    { path: "/achievements", label: "Achievements", icon: "fas fa-trophy" },
    { path: "/streaks", label: "Streaks", icon: "fas fa-fire" },
    { path: "/settings", label: "Settings", icon: "fas fa-cog" },
  ];

  const userLevel = user ? Math.floor(user.totalXP / 200) + 1 : 1;

  return (
    <div className="w-64 bg-gradient-to-b from-washi to-white shadow-lg border-r border-gray-200 h-full flex flex-col relative">
      {/* Decorative Japanese pattern */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="32" cy="32" r="4" fill="currentColor"/>
        </svg>
      </div>
      
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-momiji via-ume to-sakura rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">日</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-sumi">Nihongo Journey</h1>
            <p className="text-sm text-momiji font-medium">日本語の旅路</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  location === item.path
                    ? "text-white bg-gradient-to-r from-momiji to-ume shadow-lg"
                    : "text-sumi hover:text-momiji hover:bg-sakura/20"
                }`}
              >
                <i className={`${item.icon} w-5`}></i>
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="mt-auto p-6 border-t border-sakura/30 bg-gradient-to-r from-sakura/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-achievement-gold to-achievement rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-lg font-bold">{userLevel}</span>
          </div>
          <div>
            <p className="font-bold text-sumi">
              {user?.displayName || "Guest User"}
            </p>
            <p className="text-sm text-momiji font-medium">
              Level {userLevel} 学者 (Scholar)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
