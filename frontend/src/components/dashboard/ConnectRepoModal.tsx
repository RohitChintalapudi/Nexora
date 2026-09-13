import React, { useEffect } from 'react';
import { X, GitBranch, Terminal, ArrowRight, Sparkles } from 'lucide-react';

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md transition-all duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-repo-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <GitBranch className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="connect-repo-title" className="text-base font-extrabold text-slate-900">
                Connect Repository
              </h3>
              <p className="text-xs font-semibold text-blue-600">
                Milestone M1 · Ready for M2 Ingestion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-5">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900 mb-1">
                  Ready for Milestone M2 Ingestion
                </p>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Your developer workspace is primed. Complete GitHub OAuth integration, AST parsing pipelines, and repository indexing will be activated in Milestone M2.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Repository URL / Identifier
            </label>
            <div className="relative flex items-center">
              <Terminal className="w-4 h-4 absolute left-4 text-slate-400" />
              <input
                type="text"
                readOnly
                value="github.com/organization/repository"
                className="w-full pl-11 pr-4 py-3 text-xs font-mono font-bold bg-slate-100/80 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed select-none focus:outline-none"
              />
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              GitHub repository linking and AST permission sync will connect in the next milestone.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <span>Got it</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
