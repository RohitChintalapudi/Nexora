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
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  onConnectClick?: () => void;
  onDisconnectClick?: () => void;
  isConnecting?: boolean;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  isGitHubConnected = false,
  githubUsername = null,
  onConnectClick,
  onDisconnectClick,
  isConnecting = false,
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

          {/* Right: GitHub Integration & Profile Section */}
          <div className="flex items-center gap-2.5">
            {/* GitHub Connection Status / Action */}
            {isGitHubConnected ? (
              <div className="flex items-center gap-1.5 p-1 pl-2.5 pr-1 rounded-full bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-xs">
                {/* GitHub Green Pulsing Dot & Username */}
                <div className="flex items-center gap-1.5 pr-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-mono font-bold text-slate-800 text-[11px] max-w-[100px] sm:max-w-[130px] truncate">
                    @{githubUsername}
                  </span>
                </div>

                {/* Disconnect Button */}
                {onDisconnectClick && (
                  <button
                    type="button"
                    onClick={onDisconnectClick}
                    className="px-2.5 py-1 text-[10px] font-bold text-red-600 bg-red-50/80 hover:bg-red-100 border border-red-200/70 rounded-full transition-all cursor-pointer shadow-2xs"
                    title="Disconnect GitHub"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            ) : onConnectClick ? (
              <button
                type="button"
                onClick={onConnectClick}
                disabled={isConnecting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold text-white bg-slate-900 hover:bg-black active:scale-[0.98] rounded-full shadow-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>{isConnecting ? 'Connecting...' : 'Connect GitHub'}</span>
              </button>
            ) : null}

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
