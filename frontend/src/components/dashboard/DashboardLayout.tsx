import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Logo';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { 
  LogOut, 
  ChevronDown, 
  ExternalLink,
  Menu,
  X
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'repositories', label: 'Repositories' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="dashboard-workspace min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* TOP NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#F1F5F9]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/60 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Original NEXORA Logo (Directly on navbar, not inside card) */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                onTabChange('dashboard');
                navigateTo('dashboard');
              }}
              className="flex items-center cursor-pointer focus:outline-none group"
            >
              <Logo theme="light" size={26} />
            </button>
          </div>

          {/* Center: White & Royal Blue Segmented Navigation Pill */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`relative px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.35)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Profile Section */}
          <div className="flex items-center gap-3">
            {/* Profile Section */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-3.5 rounded-full bg-white border border-slate-200/80 hover:border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer text-left"
              >
                {/* Coral / Orange-Red Gradient Avatar Circle */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-500 text-white flex items-center justify-center font-extrabold text-[11px] shadow-xs shrink-0">
                  {getUserInitials(user?.name)}
                </div>

                {/* Stacked Name & Role */}
                <div className="hidden sm:flex flex-col leading-tight max-w-[120px]">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {user?.name || 'Developer'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 truncate">
                    {user?.email ? user.email.split('@')[0] : 'workspace · owner'}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-[0_16px_36px_rgba(0,0,0,0.1)] p-2 z-50 flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/80 rounded-xl mb-1">
                    <p className="font-bold text-slate-900 truncate">
                      {user?.name || 'Developer'}
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
                      setIsLogoutModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-bold text-left cursor-pointer transition-colors mt-0.5"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-950"
              aria-label="Toggle navigation menu"
            >
              {isMobileNavOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Menu className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </div>
        </div>

        {/* Mobile Segmented Bar */}
        {isMobileNavOpen && (
          <div className="md:hidden mt-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* Logout Confirmation Popup Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
};
