import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useLanguageMode, useLanguageContent } from "@/App";

interface SidebarProps {
  user?: {
    displayName: string;
    totalXP: number;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { languageMode } = useLanguageMode();
  const content = useLanguageContent(languageMode);

  const navItems = [
    { path: "/", label: content.dashboard, icon: "fas fa-chart-line" },
    { path: "/social", label: content.social, icon: "fas fa-users" },
    { path: "/achievements", label: content.achievements, icon: "fas fa-trophy" },
    { path: "/settings", label: content.settings, icon: "fas fa-cog" },
  ];

  const userLevel = user ? Math.floor(user.totalXP / 200) + 1 : 1;

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-gradient-to-br from-momiji to-ume rounded-lg shadow-lg flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 lg:w-64 
        bg-gradient-to-b from-washi to-white shadow-lg border-r border-gray-200 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Decorative Japanese pattern */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="32" cy="32" r="4" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="p-6 relative z-10 pt-20 lg:pt-6">
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 lg:py-3 rounded-xl font-medium transition-all duration-200 text-base lg:text-sm ${
                    location === item.path
                      ? "text-white bg-gradient-to-r from-momiji to-ume shadow-lg"
                      : "text-sumi hover:text-momiji hover:bg-sakura/20"
                  }`}
                >
                  <i className={`${item.icon} w-5 text-lg lg:text-base`}></i>
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
    </>
  );
}
