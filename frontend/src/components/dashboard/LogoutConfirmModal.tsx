import React, { useEffect } from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shadow-xs">
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="logout-modal-title" className="text-base font-extrabold text-slate-900">
                Confirm Logout
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                Session Management
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Are you sure you want to log out of NEXORA? You will need to sign in again to access your connected codebases and architecture maps.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-full shadow-md shadow-red-500/25 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
