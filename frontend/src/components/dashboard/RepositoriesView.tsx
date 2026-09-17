import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FolderGit2, 
  CheckCircle2, 
  Unlink, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight
} from 'lucide-react';
import { useRepositories, type SavedRepository } from '../../hooks/useRepositories';
import { useAnalysisJob } from '../../hooks/useAnalysisJob';
import { RepositoryCard } from './RepositoryCard';
import { RepositoryDetailsView } from './RepositoryDetailsView';
import { AnalysisProgressView } from './AnalysisProgressView';
import { AnalysisPageView } from './analysis/AnalysisPageView';
import { AnalysisErrorBoundary } from './analysis/AnalysisErrorBoundary';
import { NexoraLoader } from '../common/NexoraLoader';

interface RepositoriesViewProps {
  onConnectClick: () => void;
  onDisconnectClick?: () => void;
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  isConnecting?: boolean;
  initialSelectedRepo?: SavedRepository | null;
  initialSubView?: 'list' | 'details' | 'progress' | 'analysis';
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({
  onConnectClick,
  onDisconnectClick,
  isGitHubConnected = false,
  githubUsername = null,
  isConnecting = false,
  initialSelectedRepo = null,
  initialSubView = 'list'
}) => {
  const {
    gitHubRepos,
    savedRepositories,
    selectedRepo,
    activeSavedRepo,
    searchQuery,
    page,
    hasMore,
    totalCount,
    isLoadingGitHub,
    isSaving,
    error,
    needsReauth,
    setSelectedRepo,
    setActiveSavedRepo,
    handleSearchChange,
    handleNextPage,
    handlePrevPage,
    saveSelectedRepository,
    refetchGitHub
  } = useRepositories(isGitHubConnected);

  const {
    job,
    isLoadingJob,
    isStarting: isStartingAnalysis,
    startAnalysis,
    fetchLatestJob,
    resetJob
  } = useAnalysisJob();

  const [subView, setSubView] = useState<'list' | 'details' | 'progress' | 'analysis'>(initialSubView);

  // Handle initialSelectedRepo if passed from Dashboard
  useEffect(() => {
    if (initialSelectedRepo) {
      setActiveSavedRepo(initialSelectedRepo);
      setSubView(initialSubView === 'analysis' ? 'analysis' : 'details');
      fetchLatestJob(initialSelectedRepo.id);
    }
  }, [initialSelectedRepo, initialSubView, setActiveSavedRepo, fetchLatestJob]);

  // When an active saved repo is clicked
  const handleOpenDetails = (repo: SavedRepository) => {
    setActiveSavedRepo(repo);
    setSubView('details');
    fetchLatestJob(repo.id);
  };

  const handleStartAnalysis = async () => {
    if (!activeSavedRepo) return;
    const started = await startAnalysis(activeSavedRepo.id);
    if (started) {
      setSubView('progress');
    }
  };

  const handleRetryAnalysis = async () => {
    if (!activeSavedRepo) return;
    resetJob();
    await startAnalysis(activeSavedRepo.id);
  };

  // If viewing analysis page
  if (subView === 'analysis' && activeSavedRepo) {
    return (
      <AnalysisErrorBoundary onReset={() => setSubView('details')}>
        <AnalysisPageView
          repository={activeSavedRepo}
          onBack={() => setSubView('details')}
          onViewProgress={() => setSubView('progress')}
        />
      </AnalysisErrorBoundary>
    );
  }

  // If viewing analysis progress
  if (subView === 'progress' && activeSavedRepo) {
    return (
      <AnalysisProgressView
        repository={activeSavedRepo}
        job={job}
        isStarting={isStartingAnalysis}
        onBackToDetails={() => setSubView('details')}
        onRetry={handleRetryAnalysis}
        onViewAnalysis={() => setSubView('analysis')}
      />
    );
  }

  // If viewing details of a selected saved repository
  if (subView === 'details' && activeSavedRepo) {
    return (
      <RepositoryDetailsView
        repository={activeSavedRepo}
        latestJob={job}
        isLoadingJob={isLoadingJob}
        onBackToSelection={() => {
          setActiveSavedRepo(null);
          setSubView('list');
          resetJob();
        }}
        onStartAnalysis={handleStartAnalysis}
        isStartingAnalysis={isStartingAnalysis}
        onViewAnalysisProgress={() => setSubView('progress')}
        onViewAnalysis={() => setSubView('analysis')}
      />
    );
  }

  const handleContinue = async () => {
    if (!selectedRepo) return;
    const saved = await saveSelectedRepository();
    if (saved) {
      setSubView('details');
      fetchLatestJob(saved.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-2 shadow-2xs">
            <FolderGit2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Repository Ingestion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Repositories
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-xl">
            {isGitHubConnected
              ? `Select a repository belonging to @${githubUsername} to register and inspect with NEXORA.`
              : 'Connect your GitHub account to access codebases, select repositories, and begin architecture inspection.'}
          </p>
        </div>

        {/* Action Header Pill */}
        <div className="flex items-center gap-3 shrink-0">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-full transition-all cursor-pointer shadow-2xs"
                  title="Disconnect GitHub"
                >
                  <Unlink className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="hidden sm:inline">Disconnect</span>
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

      {/* 2. Disconnected Empty State */}
      {!isGitHubConnected && (
        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-2xs">
            <FolderGit2 className="w-7 h-7 stroke-[2]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
            GitHub isn't connected yet
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Connect your authorized GitHub account to browse your public and private repositories, select a codebase, and manage architecture indexing.
          </p>
          <button
            type="button"
            onClick={onConnectClick}
            disabled={isConnecting}
            className="inline-flex items-center gap-2.5 px-6 py-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all cursor-pointer disabled:opacity-60"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isConnecting ? 'Connecting...' : 'Connect GitHub Account'}</span>
          </button>
        </div>
      )}

      {/* 3. Re-authentication Alert */}
      {isGitHubConnected && needsReauth && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">GitHub authorization expired</h3>
              <p className="text-xs text-amber-700 mt-0.5">Please reconnect your GitHub account to continue browsing repositories.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onConnectClick}
            className="px-4 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors cursor-pointer shrink-0"
          >
            Reconnect GitHub
          </button>
        </div>
      )}

      {/* 4. Active Connected View */}
      {isGitHubConnected && !needsReauth && (
        <div className="space-y-6">
          
          {/* Previously Saved / Selected Repositories in NEXORA */}
          {savedRepositories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Registered with NEXORA ({savedRepositories.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedRepositories.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => handleOpenDetails(saved)}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {saved.name}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5 pl-5.5">
                        {saved.fullName}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0">
                      View
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Header Section for GitHub Repositories */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Select a GitHub Repository
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {totalCount !== undefined
                  ? `${totalCount} repositories found`
                  : 'Choose a repository from your GitHub account'}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search repositories..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200/80 rounded-full text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={refetchGitHub}
                className="inline-flex items-center gap-1 font-bold underline hover:text-red-950"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Nexora State */}
          {isLoadingGitHub && (
            <NexoraLoader
              variant="card"
              size="md"
              message="Fetching GitHub Repositories..."
              subMessage="Querying GitHub API and synchronizing repository list"
            />
          )}

          {/* Empty Search / No Repositories */}
          {!isLoadingGitHub && gitHubRepos.length === 0 && !error && (
            <div className="bg-white rounded-[2rem] border border-slate-200/80 p-10 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {searchQuery ? `No repositories match "${searchQuery}"` : 'No repositories found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery 
                  ? 'Try searching with a different term or keyword.' 
                  : 'Check your GitHub account permissions or create a repository.'}
              </p>
            </div>
          )}

          {/* Repositories Grid */}
          {!isLoadingGitHub && gitHubRepos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gitHubRepos.map((repo) => (
                <RepositoryCard
                  key={repo.id}
                  repo={repo}
                  isSelected={selectedRepo?.id === repo.id}
                  onSelect={(r) => setSelectedRepo(r)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoadingGitHub && gitHubRepos.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page <= 1 || isLoadingGitHub}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-semibold text-slate-500">
                Page {page}
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasMore || isLoadingGitHub}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sticky / Bottom Selection Bar */}
          {selectedRepo && (
            <div className="sticky bottom-6 z-30 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-3 duration-200 border border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400">
                    Selected Repository
                  </p>
                  <p className="text-sm font-bold text-white truncate font-mono">
                    {selectedRepo.fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedRepo(null)}
                  className="w-1/2 sm:w-auto px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isSaving}
                  className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold text-slate-950 bg-white hover:bg-slate-100 active:scale-[0.98] rounded-full shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
