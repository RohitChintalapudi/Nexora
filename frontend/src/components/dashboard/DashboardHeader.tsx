import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FolderGit2, Sparkles, ShieldCheck, Plus } from 'lucide-react';
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
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
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-black active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(15,23,42,0.3)] transition-all cursor-pointer disabled:opacity-60"
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-full transition-all cursor-pointer shadow-2xs"
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
        <div className="flex-1 sm:flex-initial flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[160px] sm:min-w-[185px] shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 text-slate-900 flex items-center justify-center shadow-xs shrink-0">
            <FolderGit2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
              {registeredCount}
            </p>
            <p className="text-xs font-bold text-slate-700 mt-1">
              Registered Repos
            </p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              Workspace connected
            </p>
          </div>
        </div>

        {/* Analyzed Repositories Card */}
        <div className="flex-1 sm:flex-initial flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[160px] sm:min-w-[185px] shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/90 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
              {analyzedCount}
            </p>
            <p className="text-xs font-bold text-slate-700 mt-1">
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
    </div>
  );
};
