import React from 'react';
import { Plus, SlidersHorizontal, CheckCircle2, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  onConnectClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onConnectClick }) => {

  return (
    <div className="w-full flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 pb-6">
      
      {/* Left: Headline & Subtitle */}
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
          We found your system
        </h1>
        <p className="text-sm font-medium text-slate-500 leading-relaxed">
          Everything below was mapped from your environment. Connect your repository to parse AST hierarchies and sandbox change impact.
        </p>
      </div>

      {/* Right: Badges & Action Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* Setup Complete Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Setup complete - 3 of 3</span>
        </div>

        {/* Timestamp Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Sep 9, 2026 · 09:41</span>
        </div>

        {/* Filter Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        {/* Primary CTA: Connect Repository */}
        <button
          type="button"
          onClick={onConnectClick}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all cursor-pointer focus:outline-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Connect Repository</span>
        </button>
      </div>
    </div>
  );
};
