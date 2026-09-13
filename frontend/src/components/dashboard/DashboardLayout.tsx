import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ExternalLink,
  Search,
  Bell,
  Sun,
  Moon,
  Bot, 
  Layers, 
  ShieldCheck, 
  Radio
} from 'lucide-react';

export type DashboardTab = 'dashboard' | 'repositories' | 'settings';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  const { user, logout, navigateTo } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems: Array<{ id: DashboardTab; label: string }> = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'repositories', label: 'Repositories' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="dashboard-workspace min-h-screen bg-[#F0F4F8] text-slate-900 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* TOP FLOATING / CAPSULE NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#F0F4F8]/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3 transition-all">
        <div className="max-w-[1520px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo Pill */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onTabChange('dashboard');
                navigateTo('dashboard');
              }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-blue-500/30">
                <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                NEXORA
              </span>
            </button>
          </div>

          {/* Center: White & Royal Blue Segmented Navigation Pill */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-white/90 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`relative px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Controls & Profile Section */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Indicator Pill */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>

            {/* Time / Workspace Filter Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-xs">
              <span>M1 Workspace</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Quick Icon Actions */}
            <button
              type="button"
              className="p-2 rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              title="Quick Search"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              className="p-2 rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
            </button>

            {/* Profile Section (Exactly like screenshot) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 rounded-full bg-white border border-slate-200/80 hover:border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer text-left"
              >
                {/* Coral / Gradient Avatar Circle */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-500 text-white flex items-center justify-center font-extrabold text-[11px] shadow-xs shrink-0">
                  {getUserInitials(user?.name)}
                </div>

                {/* Stacked Name & Role */}
                <div className="hidden sm:flex flex-col leading-tight max-w-[110px]">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {user?.name || 'Platform Team'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 truncate">
                    {user?.email ? user.email.split('@')[0] : 'Owner · nexora'}
                  </span>
                </div>

                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-[0_16px_36px_rgba(0,0,0,0.1)] p-2 z-50 flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/80 rounded-xl mb-1">
                    <p className="font-bold text-slate-900 truncate">
                      {user?.name || 'Platform Team'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      {user?.email || 'user@nexora.dev'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigateTo('home');
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 font-bold text-left cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Public Landing Page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-bold text-left cursor-pointer transition-colors mt-0.5"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Segmented Bar */}
        <div className="md:hidden mt-2 flex items-center justify-center p-1 rounded-full bg-white border border-slate-200/80 shadow-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold text-center transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BODY WITH LEFT FLOATING DOCK RAIL & MAIN CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-5">
        
        {/* Left Floating Action Dock (from image) */}
        <aside className="hidden lg:flex flex-col items-center gap-3 shrink-0 py-1">
          
          {/* Theme Toggle Capsule */}
          <div className="p-1.5 rounded-full bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setIsDarkMode(false)}
              className={`p-1.5 rounded-full transition-colors ${
                !isDarkMode ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() => setIsDarkMode(true)}
              className={`p-1.5 rounded-full transition-colors ${
                isDarkMode ? 'bg-slate-900 text-white font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Main Floating Tool Rail */}
          <div className="p-1.5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title="Dashboard Overview"
            >
              <LayoutDashboard className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => onTabChange('repositories')}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'repositories'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title="Repositories"
            >
              <FolderGit2 className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              type="button"
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              title="Agents & AST"
            >
              <Bot className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              type="button"
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              title="Topology Graph"
            >
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              type="button"
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              title="Impact Sandbox"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => onTabChange('settings')}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
