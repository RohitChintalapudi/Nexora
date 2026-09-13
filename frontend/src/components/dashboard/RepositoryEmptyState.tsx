import React from 'react';
import { GitBranch, Sparkles, Layers, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface RepositoryEmptyStateProps {
  onConnectClick: () => void;
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  isConnecting?: boolean;
}

export const RepositoryEmptyState: React.FC<RepositoryEmptyStateProps> = ({
  onConnectClick,
  isGitHubConnected = false,
  githubUsername = null,
  isConnecting = false,
}) => {
  return (
    <div className="w-full relative overflow-hidden bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-12 md:p-14 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
      
      {/* Decorative ambient glow */}
      <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 ${isGitHubConnected ? 'bg-emerald-500/5' : 'bg-blue-500/5'} rounded-full blur-3xl pointer-events-none`} />

      {/* Icon Badge */}
      <div className="relative mb-6">
        {isGitHubConnected ? (
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/10">
            <GitBranch className="w-7 h-7 stroke-[2.5]" />
          </div>
        )}
      </div>

      {/* Heading & Subtitle */}
      {isGitHubConnected ? (
        <>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
            GitHub Connected as @{githubUsername}
          </h3>
          <p className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed mb-8">
            Your repository authorization is stored securely on the server. Milestone M3 will use this connection to index your repositories, extract AST symbols, and map service topologies.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Authorization Active · Ready for M3 Ingestion</span>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
            Connect GitHub to Authorize Repositories
          </h3>
          <p className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed mb-8">
            Authorize NEXORA with your GitHub account to access your repositories, map architecture boundaries, and forecast change impact across downstream dependencies.
          </p>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onConnectClick}
            disabled={isConnecting}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{isConnecting ? 'Redirecting to GitHub...' : 'Connect GitHub'}</span>
          </button>
        </>
      )}

      {/* 3 Highlight Cards */}
      <div className="w-full max-w-3xl mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        
        {/* Card 1 */}
        <div className="group p-5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-blue-200 shadow-xs hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
            AST Indexing
          </h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Parses complete syntax trees across functions, types, and exported modules.
          </p>
        </div>

        {/* Card 2 */}
        <div className="group p-5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-blue-200 shadow-xs hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
            System Topology
          </h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Generates real-time interactive maps of microservices, databases, and APIs.
          </p>
        </div>

        {/* Card 3 */}
        <div className="group p-5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-blue-200 shadow-xs hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
            Impact Forecasts
          </h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Tracks caller cascades to prevent breaking changes before deployment.
          </p>
        </div>
      </div>
    </div>
  );
};
