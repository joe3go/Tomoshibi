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
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-mountain text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nihongo Journey</h1>
            <p className="text-sm text-gray-500">日本語の旅</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  location === item.path
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white"></i>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {user?.displayName || "Guest User"}
            </p>
            <p className="text-sm text-gray-500">Level {userLevel} Scholar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
