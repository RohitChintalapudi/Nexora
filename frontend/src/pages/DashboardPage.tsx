import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout, type DashboardTab } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { RecentRepositories } from '../components/dashboard/RecentRepositories';
import { RepositoriesView } from '../components/dashboard/RepositoriesView';
import { SettingsView } from '../components/dashboard/SettingsView';
import { ConnectRepoModal } from '../components/dashboard/ConnectRepoModal';

export const DashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading, navigateTo } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Protected route guard: Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigateTo('signin');
    }
  }, [isLoading, isAuthenticated, navigateTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <DashboardHeader onConnectClick={() => setIsConnectModalOpen(true)} />
          <RecentRepositories
            onConnectClick={() => setIsConnectModalOpen(true)}
            repositories={[]}
          />
        </div>
      )}

      {activeTab === 'repositories' && (
        <div className="animate-in fade-in duration-150">
          <RepositoriesView onConnectClick={() => setIsConnectModalOpen(true)} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="animate-in fade-in duration-150">
          <SettingsView />
        </div>
      )}

      <ConnectRepoModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
