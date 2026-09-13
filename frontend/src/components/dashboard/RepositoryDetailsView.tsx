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
  Cpu
} from 'lucide-react';
import type { SavedRepository } from '../../hooks/useRepositories';

interface RepositoryDetailsViewProps {
  repository: SavedRepository;
  onBackToSelection: () => void;
}

export const RepositoryDetailsView: React.FC<RepositoryDetailsViewProps> = ({
  repository,
  onBackToSelection
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
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
              <span className="text-xs font-semibold text-slate-500">Connected To Nexora</span>
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

      {/* Next Step Action Card (Milestone M4 Preview) */}
      <div className="bg-gradient-to-br from-blue-50/50 via-white to-slate-50/80 rounded-[2rem] border border-blue-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Next Milestone (M4)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Ready for Codebase Analysis
          </h2>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Repository metadata has been verified and registered with NEXORA. In Milestone M4, the pipeline will clone, parse AST hierarchies, and generate architecture graphs.
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

          {/* Analyze Repository (M4 Placeholder) */}
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white/80 bg-blue-600/70 cursor-not-allowed rounded-full shadow-2xs text-center"
            title="Codebase analysis will be implemented in Milestone M4"
          >
            <Cpu className="w-4 h-4" />
            <span>Analyze Repository (M4)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
