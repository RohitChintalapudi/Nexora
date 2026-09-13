import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
  onConnectClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onConnectClick }) => {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-8 mb-8 border-b border-slate-200/80">
      
      {/* Left: Headline & Subtitle */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Code Intelligence Workspace</span>
          <span className="w-1 h-1 rounded-full bg-blue-400" />
          <span className="font-mono text-[11px] text-blue-600 font-semibold">M1 Active</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Welcome, {displayName}
        </h1>
        <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
          Index your codebases, trace AST hierarchies, and simulate pull request blast radius across connected systems.
        </p>
      </div>

      {/* Right: Primary Action CTA */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onConnectClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all cursor-pointer focus:outline-none shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Connect Repository</span>
        </button>
      </div>
    </div>
  );
};
