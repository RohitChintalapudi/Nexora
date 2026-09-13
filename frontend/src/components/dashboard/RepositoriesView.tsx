import React, { useState } from 'react';
import { Search, Plus, FolderGit2 } from 'lucide-react';
import { RepositoryEmptyState } from './RepositoryEmptyState';

interface RepositoriesViewProps {
  onConnectClick: () => void;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({ onConnectClick }) => {
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
            Manage connected GitHub codebases, active branches, and AST indexing sync triggers.
          </p>
        </div>

        <button
          type="button"
          onClick={onConnectClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Connect Repository</span>
        </button>
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
      <RepositoryEmptyState onConnectClick={onConnectClick} />
    </div>
  );
};
