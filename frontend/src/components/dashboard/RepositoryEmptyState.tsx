import React from 'react';
import { GitBranch, Plus, Sparkles, Layers, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface RepositoryEmptyStateProps {
  onConnectClick: () => void;
}

export const RepositoryEmptyState: React.FC<RepositoryEmptyStateProps> = ({ onConnectClick }) => {
  return (
    <div className="w-full relative overflow-hidden bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-12 md:p-14 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
      
      {/* Decorative ambient blue glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Blue Icon Pill */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/10">
          <GitBranch className="w-7 h-7 stroke-[2.5]" />
        </div>
      </div>

      {/* Heading & Subtitle */}
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
        No repositories connected yet
      </h3>
      <p className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed mb-8">
        Connect your Git codebase to automatically index AST hierarchy graphs, map service architectures, and inspect change impact across downstream dependencies.
      </p>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onConnectClick}
        className="group relative inline-flex items-center gap-2.5 px-6 py-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
        <span>Connect Repository</span>
      </button>

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
