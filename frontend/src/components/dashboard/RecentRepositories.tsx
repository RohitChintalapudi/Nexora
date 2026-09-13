import React from 'react';
import { RepositoryEmptyState } from './RepositoryEmptyState';

interface RecentRepositoriesProps {
  onConnectClick: () => void;
  repositories?: Array<any>;
}

export const RecentRepositories: React.FC<RecentRepositoriesProps> = ({
  onConnectClick,
  repositories = []
}) => {
  const hasRepositories = repositories.length > 0;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Recent Repositories
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Indexed codebases and active architecture graphs
          </p>
        </div>
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
          {repositories.length} {repositories.length === 1 ? 'Repository' : 'Repositories'}
        </span>
      </div>

      {/* Repositories State */}
      {!hasRepositories ? (
        <RepositoryEmptyState onConnectClick={onConnectClick} />
      ) : (
        <div className="border border-slate-200/80 rounded-[2rem] divide-y divide-slate-100 bg-white shadow-xs">
          {repositories.map((repo, idx) => (
            <div key={repo.id || idx} className="p-5 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{repo.name}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
