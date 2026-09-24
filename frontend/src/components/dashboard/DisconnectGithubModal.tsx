import React from 'react';
import {
  CenterMorphModal,
  CenterMorphModalClose,
  CenterMorphModalContent,
} from '@/components/motion/center-morph-modal';
import { Unlink, X, AlertCircle } from 'lucide-react';

interface DisconnectGithubModalProps {
  isOpen: boolean;
  username: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const DisconnectGithubModal: React.FC<DisconnectGithubModalProps> = ({
  isOpen,
  username,
  onClose,
  onConfirm,
  isProcessing = false
}) => {
  return (
    <CenterMorphModal
      open={isOpen}
      onOpenChange={(next) => !next && onClose()}
    >
      <CenterMorphModalContent
        ariaLabel="Disconnect GitHub"
        showCloseButton={false}
        dismissible={!isProcessing}
        className="max-w-md rounded-[2rem]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <Unlink className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="disconnect-github-modal-title" className="text-base font-extrabold text-slate-900">
                Disconnect GitHub
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                Repository Authorization
              </p>
            </div>
          </div>
          <CenterMorphModalClose>
            <button
              type="button"
              disabled={isProcessing}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </CenterMorphModalClose>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Are you sure you want to disconnect GitHub account <span className="font-bold text-slate-900">@{username || 'user'}</span>? Your NEXORA account will remain intact, but repository authorization will be revoked.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <CenterMorphModalClose>
            <button
              type="button"
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </CenterMorphModalClose>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-full shadow-md shadow-red-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Unlink className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isProcessing ? 'Disconnecting...' : 'Disconnect GitHub'}</span>
          </button>
        </div>
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
};