import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGitHub } from '../hooks/useGitHub';
import { useRepositories, type SavedRepository } from '../hooks/useRepositories';
import { DashboardLayout, type DashboardTab } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { RecentRepositories } from '../components/dashboard/RecentRepositories';
import { RepositoriesView } from '../components/dashboard/RepositoriesView';
import { SettingsView } from '../components/dashboard/SettingsView';
import { ConnectRepoModal } from '../components/dashboard/ConnectRepoModal';
import { DisconnectGithubModal } from '../components/dashboard/DisconnectGithubModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading, navigateTo } = useAuth();
  const {
    connected: isGitHubConnected,
    githubUsername,
    isConnecting,
    notification,
    connectGitHub,
    disconnectGitHub,
    dismissNotification
  } = useGitHub();

  const {
    savedRepositories,
    setActiveSavedRepo
  } = useRepositories(isGitHubConnected);

  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [initialRepo, setInitialRepo] = useState<SavedRepository | null>(null);
  const [initialSubView, setInitialSubView] = useState<'list' | 'details' | 'progress' | 'analysis'>('list');

  // URL Deep-linking for /repositories/:id and /repositories/:id/analysis
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const target = path.startsWith('/repositories') ? path : hash.replace(/^#/, '');

    const match = target.match(/\/repositories\/(\d+)(\/analysis)?/);
    if (match) {
      const repoId = parseInt(match[1], 10);
      const isAnalysis = Boolean(match[2]);
      const found = savedRepositories.find((r) => r.id === repoId);
      if (found) {
        setInitialRepo(found);
        setActiveSavedRepo(found);
        setActiveTab('repositories');
        setInitialSubView(isAnalysis ? 'analysis' : 'details');
      }
    }
  }, [savedRepositories, setActiveSavedRepo]);

  // Protected route guard: Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigateTo('signin');
    }
  }, [isLoading, isAuthenticated, navigateTo]);

  const handleOpenConnect = () => {
    setIsConnectModalOpen(true);
  };

  const handleAuthorizeGitHub = async () => {
    setIsConnectModalOpen(false);
    await connectGitHub();
  };

  const handleConfirmDisconnect = async () => {
    setIsDisconnecting(true);
    await disconnectGitHub();
    setIsDisconnecting(false);
    setIsDisconnectModalOpen(false);
  };

  const handleViewSavedRepo = (repo: SavedRepository) => {
    setActiveSavedRepo(repo);
    setInitialRepo(repo);
    setInitialSubView('details');
    setActiveTab('repositories');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {/* Toast Notification for GitHub OAuth Feedback */}
      {notification && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <p className="text-xs font-bold leading-normal">
              {notification.message}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissNotification}
            className="p-1 rounded-full hover:bg-black/5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <DashboardHeader
            onConnectClick={handleOpenConnect}
            onDisconnectClick={() => setIsDisconnectModalOpen(true)}
            onChooseRepoClick={() => {
              setInitialRepo(null);
              setInitialSubView('list');
              setActiveTab('repositories');
            }}
            isGitHubConnected={isGitHubConnected}
            githubUsername={githubUsername}
            isConnecting={isConnecting}
          />
          <RecentRepositories
            onConnectClick={handleOpenConnect}
            onChooseRepoClick={() => {
              setInitialRepo(null);
              setInitialSubView('list');
              setActiveTab('repositories');
            }}
            onViewRepoDetails={handleViewSavedRepo}
            isGitHubConnected={isGitHubConnected}
            githubUsername={githubUsername}
            isConnecting={isConnecting}
            repositories={savedRepositories}
          />
        </div>
      )}

      {/* REPOSITORIES TAB */}
      {activeTab === 'repositories' && (
        <div className="animate-in fade-in duration-150">
          <RepositoriesView
            onConnectClick={handleOpenConnect}
            onDisconnectClick={() => setIsDisconnectModalOpen(true)}
            isGitHubConnected={isGitHubConnected}
            githubUsername={githubUsername}
            isConnecting={isConnecting}
            initialSelectedRepo={initialRepo}
            initialSubView={initialSubView}
          />
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="animate-in fade-in duration-150">
          <SettingsView
            isGitHubConnected={isGitHubConnected}
            githubUsername={githubUsername}
            onConnectGitHub={handleOpenConnect}
            onDisconnectGitHub={() => setIsDisconnectModalOpen(true)}
            isConnecting={isConnecting}
          />
        </div>
      )}

      {/* Connect GitHub OAuth Modal */}
      <ConnectRepoModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAuthorizeGitHub={handleAuthorizeGitHub}
        isConnecting={isConnecting}
      />

      {/* Disconnect GitHub Confirmation Modal */}
      <DisconnectGithubModal
        isOpen={isDisconnectModalOpen}
        username={githubUsername}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleConfirmDisconnect}
        isProcessing={isDisconnecting}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
