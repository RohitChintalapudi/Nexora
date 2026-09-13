import React, { useState } from 'react';
import { Search, Plus, FolderGit2, CheckCircle2, Unlink } from 'lucide-react';
import { RepositoryEmptyState } from './RepositoryEmptyState';

interface RepositoriesViewProps {
  onConnectClick: () => void;
  onDisconnectClick?: () => void;
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  isConnecting?: boolean;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({
  onConnectClick,
  onDisconnectClick,
  isGitHubConnected = false,
  githubUsername = null,
  isConnecting = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Codebase Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Repositories
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {isGitHubConnected
              ? `Connected to GitHub as @${githubUsername}. Repository selection and indexing will activate in Milestone M3.`
              : 'Authorize your GitHub account to access codebases, index AST hierarchies, and manage branches.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isGitHubConnected ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>@{githubUsername}</span>
              </div>
              {onDisconnectClick && (
                <button
                  type="button"
                  onClick={onDisconnectClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onConnectClick}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all cursor-pointer shrink-0 disabled:opacity-60"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Connect GitHub</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search codebases and AST symbols..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200/80 rounded-full text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
          />
        </div>
      </div>

      {/* Repositories Content */}
      <RepositoryEmptyState
        onConnectClick={onConnectClick}
        isGitHubConnected={isGitHubConnected}
        githubUsername={githubUsername}
        isConnecting={isConnecting}
      />
    </div>
  );
};
