import React from 'react';
import { 
  FolderGit2, 
  Lock, 
  Globe, 
  ArrowRight, 
  Plus, 
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';
import type { SavedRepository } from '../../hooks/useRepositories';

interface RecentRepositoriesProps {
  onConnectClick: () => void;
  onChooseRepoClick?: () => void;
  onViewRepoDetails?: (repo: SavedRepository) => void;
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  isConnecting?: boolean;
  repositories?: SavedRepository[];
}

export const RecentRepositories: React.FC<RecentRepositoriesProps> = ({
  onConnectClick,
  onChooseRepoClick,
  onViewRepoDetails,
  isGitHubConnected = false,
  githubUsername = null,
  isConnecting = false,
  repositories = []
}) => {
  const hasRepositories = repositories.length > 0;

  return (
    <section className="space-y-4 animate-in fade-in duration-150">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Registered Repositories
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Repositories connected to your NEXORA workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isGitHubConnected && onChooseRepoClick && (
            <button
              type="button"
              onClick={onChooseRepoClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 rounded-full transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Choose Repository</span>
            </button>
          )}

          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
            {repositories.length} {repositories.length === 1 ? 'Repository' : 'Repositories'}
          </span>
        </div>
      </div>

      {/* Repositories State */}
      {!hasRepositories ? (
        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-2xs">
            <FolderGit2 className="w-7 h-7 stroke-[2]" />
          </div>
          
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1.5">
            {isGitHubConnected ? 'No repository selected yet' : 'GitHub not connected'}
          </h3>

          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            {isGitHubConnected
              ? `Your GitHub account (@${githubUsername}) is connected. Choose a repository from your GitHub account to begin.`
              : 'Connect your GitHub account to authorize codebase access, select repositories, and inspect architecture graphs.'}
          </p>

          {isGitHubConnected ? (
            <button
              type="button"
              onClick={onChooseRepoClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Choose Repository</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnectClick}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isConnecting ? 'Connecting...' : 'Connect GitHub'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-bold text-slate-900 truncate">
                    {repo.name}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      repo.private
                        ? 'bg-amber-50 border border-amber-200 text-amber-800'
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {repo.private ? (
                      <>
                        <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Private</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Public</span>
                      </>
                    )}
                  </span>

                  {repo.language && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{repo.language}</span>
                    </span>
                  )}

                  {repo.isAnalyzed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Analyzed</span>
                    </span>
                  )}

                  {repo.latestJobStatus === 'PROCESSING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-800">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      <span>Analyzing</span>
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono text-slate-400 truncate">
                  {repo.fullName}
                </p>

                {repo.description && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {repo.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {repo.htmlUrl && (
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {onViewRepoDetails && (
                  <button
                    type="button"
                    onClick={() => onViewRepoDetails(repo)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all cursor-pointer shadow-2xs"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
