import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
  onConnectClick: () => void;
  onChooseRepoClick?: () => void;
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  isConnecting?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onConnectClick,
  onChooseRepoClick,
  isGitHubConnected = false,
  githubUsername = null,
  isConnecting = false,
}) => {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-8 mb-8 border-b border-slate-200/80">
      
      {/* Left: Headline & Subtitle */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Welcome, {displayName}
        </h1>
        <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
          {isGitHubConnected
            ? `Your GitHub account (@${githubUsername}) is securely authorized. NEXORA is ready to index your repository architecture and dependencies.`
            : 'Connect your GitHub account to authorize repository ingestion, parse AST hierarchies, and simulate change impact.'}
        </p>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {isGitHubConnected ? (
          <>
            {/* Choose Repository Action */}
            {onChooseRepoClick && (
              <button
                type="button"
                onClick={onChooseRepoClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
              >
                <span>Choose Repository</span>
              </button>
            )}
          </>
        ) : (
          /* Connect GitHub Button */
          <button
            type="button"
            onClick={onConnectClick}
            disabled={isConnecting}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all cursor-pointer focus:outline-none shrink-0 disabled:opacity-60"
          >
            {/* GitHub Octocat SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{isConnecting ? 'Redirecting...' : 'Connect GitHub'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
