import React from 'react';
import { GitBranch, Lock, Globe, Check, ExternalLink } from 'lucide-react';
import type { GitHubRepoItem } from '../../hooks/useRepositories';

interface RepositoryCardProps {
  repo: GitHubRepoItem;
  isSelected: boolean;
  onSelect: (repo: GitHubRepoItem) => void;
}

// Color map for popular programming languages
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-amber-400',
  Python: 'bg-emerald-500',
  Rust: 'bg-orange-600',
  Go: 'bg-cyan-500',
  Java: 'bg-red-500',
  'C++': 'bg-pink-500',
  C: 'bg-slate-600',
  Ruby: 'bg-red-600',
  PHP: 'bg-indigo-400',
  HTML: 'bg-orange-500',
  CSS: 'bg-blue-400',
  Vue: 'bg-emerald-400',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-500',
  Shell: 'bg-slate-700'
};

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  } catch {
    return 'recently';
  }
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repo,
  isSelected,
  onSelect
}) => {
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || 'bg-slate-400' : null;

  return (
    <div
      onClick={() => onSelect(repo)}
      className={`group relative text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-blue-50/30 border-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.08)] ring-1 ring-blue-600'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Top row: Name, visibility badge, external link */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {repo.name}
              </h3>

              {/* Private / Public Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight ${
                  repo.private
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                {repo.private ? (
                  <>
                    <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Public</span>
                  </>
                )}
              </span>
            </div>

            {/* Full repository path */}
            <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">
              {repo.fullName}
            </p>
          </div>

          {/* External GitHub Link Icon */}
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open in GitHub"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 font-medium line-clamp-2 my-2.5 leading-relaxed min-h-[32px]">
          {repo.description || 'No description provided.'}
        </p>
      </div>

      {/* Bottom row: Language, Branch, Updated time, and Select action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 flex-wrap">
          {/* Language indicator */}
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${langColor}`} />
              <span>{repo.language}</span>
            </div>
          )}

          {/* Default Branch */}
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-[11px]">{repo.defaultBranch}</span>
          </div>

          {/* Updated time */}
          <span className="text-slate-400 font-normal">
            Updated {formatRelativeTime(repo.updatedAt)}
          </span>
        </div>

        {/* Select indicator button */}
        <div
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isSelected
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/80'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Selected</span>
            </>
          ) : (
            <span>Select</span>
          )}
        </div>
      </div>
    </div>
  );
};
