import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Plus } from 'lucide-react';
import type { SavedRepository } from '../../hooks/useRepositories';

interface DashboardHeaderProps {
  onConnectClick?: () => void;
  onChooseRepoClick?: () => void;
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  isConnecting?: boolean;
  repositories?: SavedRepository[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onConnectClick,
  onChooseRepoClick,
  isGitHubConnected = false,
  githubUsername = null,
  isConnecting = false,
  repositories = []
}) => {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Developer';

  const registeredCount = repositories.length;
  const analyzedCount = repositories.filter(
    (r) => r.isAnalyzed || r.latestJobStatus === 'COMPLETED'
  ).length;

  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      
      {/* Left: Welcome Headline & Subtitle */}
      <div className="space-y-2.5 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
          <span>Workspace Overview</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome, {displayName}
        </h1>

        <p className="text-sm font-medium text-slate-500 leading-relaxed">
          {isGitHubConnected
            ? `Your GitHub account (@${githubUsername}) is securely authorized. NEXORA is ready to index your repository architecture and dependencies.`
            : 'Connect your GitHub account to authorize repository ingestion, parse AST hierarchies, and simulate change impact.'}
        </p>

        {!isGitHubConnected && onConnectClick && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onConnectClick}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isConnecting ? 'Connecting...' : 'Connect GitHub'}</span>
            </button>
          </div>
        )}

        {isGitHubConnected && registeredCount === 0 && onChooseRepoClick && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onChooseRepoClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-full transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Choose Repository</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Analyzed & Registered Repository Statistics */}
      <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0">
        {/* Registered Repositories Card */}
        <div className="flex-1 sm:flex-initial p-4 sm:px-5 sm:py-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[145px] sm:min-w-[165px] shadow-2xs">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
            {registeredCount}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1.5">
            Registered Repos
          </p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
            Workspace connected
          </p>
        </div>

        {/* Analyzed Repositories Card */}
        <div className="flex-1 sm:flex-initial p-4 sm:px-5 sm:py-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[145px] sm:min-w-[165px] shadow-2xs">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
            {analyzedCount}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1.5">
            Analyzed Repos
          </p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
            {registeredCount > 0
              ? `${analyzedCount} of ${registeredCount} indexed`
              : 'Architecture indexed'}
          </p>
        </div>
      </div>
    </div>
  );
};
