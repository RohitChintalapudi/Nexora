import React from 'react';
import { 
  FolderGit2, 
  GitBranch, 
  Lock, 
  Globe, 
  ExternalLink, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Cpu,
  Loader2,
  ArrowRight
} from 'lucide-react';
import type { SavedRepository } from '../../hooks/useRepositories';
import type { AnalysisJob } from '../../hooks/useAnalysisJob';

interface RepositoryDetailsViewProps {
  repository: SavedRepository;
  onBackToSelection: () => void;
  onStartAnalysis: () => void;
  isStartingAnalysis?: boolean;
  latestJob?: AnalysisJob | null;
  onViewAnalysisProgress?: () => void;
}

export const RepositoryDetailsView: React.FC<RepositoryDetailsViewProps> = ({
  repository,
  onBackToSelection,
  onStartAnalysis,
  isStartingAnalysis = false,
  latestJob = null,
  onViewAnalysisProgress
}) => {
  const isJobActive = latestJob && (latestJob.status === 'QUEUED' || latestJob.status === 'PROCESSING');
  const isJobCompleted = latestJob && latestJob.status === 'COMPLETED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Navigation / Breadcrumb */}
      <button
        type="button"
        onClick={onBackToSelection}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Repository List</span>
      </button>

      {/* Main Repository Summary Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            
            {/* Status Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>Selected & Connected</span>
              </div>

              {isJobCompleted && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                  <span>Analysis Ready</span>
                </div>
              )}

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  repository.private
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                {repository.private ? (
                  <>
                    <Lock className="w-3 h-3 stroke-[2.5]" />
                    <span>Private Repository</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 stroke-[2.5]" />
                    <span>Public Repository</span>
                  </>
                )}
              </span>

              {repository.language && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{repository.language}</span>
                </span>
              )}
            </div>

            {/* Title & Path */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {repository.name}
              </h1>
              <p className="text-sm font-mono font-medium text-slate-500 mt-0.5">
                {repository.fullName}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {repository.description || 'No description provided on GitHub.'}
            </p>
          </div>

          {/* External GitHub Action */}
          {repository.htmlUrl && (
            <a
              href={repository.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all cursor-pointer shrink-0 self-start shadow-2xs"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <GitBranch className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500">Default Branch</span>
            </div>
            <p className="text-sm font-bold font-mono text-slate-900">
              {repository.defaultBranch || 'main'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <FolderGit2 className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500">Owner</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              @{repository.owner}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500">Registered</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {new Date(repository.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Initiation Card */}
      <div className="bg-gradient-to-br from-blue-50/50 via-white to-slate-50/80 rounded-[2rem] border border-blue-200/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Codebase Intelligence</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isJobActive 
              ? 'Analysis Job in Progress'
              : isJobCompleted 
                ? 'Repository Analyzed' 
                : 'Ready for Codebase Analysis'}
          </h2>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            {isJobActive
              ? 'An asynchronous analysis job is currently processing this repository. Track stage progression in real-time.'
              : isJobCompleted
                ? 'This repository has been verified and processed by the analysis pipeline. You can re-run analysis at any time.'
                : 'Initiate the background analysis pipeline to scan repository structure, inspect module boundaries, and generate architecture graphs.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBackToSelection}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs text-center"
          >
            Choose Different Repo
          </button>

          {isJobActive ? (
            <button
              type="button"
              onClick={onViewAnalysisProgress}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all cursor-pointer text-center"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Track Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartAnalysis}
              disabled={isStartingAnalysis}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all cursor-pointer text-center disabled:opacity-60"
            >
              {isStartingAnalysis ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initiating...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>{isJobCompleted ? 'Re-analyze Repository' : 'Analyze Repository'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
