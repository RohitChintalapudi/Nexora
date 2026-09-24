import React from 'react';
import {
  CenterMorphModal,
  CenterMorphModalClose,
  CenterMorphModalContent,
} from '@/components/motion/center-morph-modal';
import { LogOut, X } from 'lucide-react';

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
  return (
    <CenterMorphModal open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <CenterMorphModalContent
        ariaLabel="Confirm Logout"
        showCloseButton={false}
        className="max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 id="logout-modal-title" className="text-lg font-bold text-slate-900">
            Confirm Logout
          </h3>
          <CenterMorphModalClose>
            <button
              type="button"
              aria-label="Close modal"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </CenterMorphModalClose>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-600">
                Session Management
              </span>
              <p className="mt-2 text-sm font-medium text-slate-600 leading-relaxed">
                Are you sure you want to log out of NEXORA? You will need to sign in again to access your connected codebases and architecture maps.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <CenterMorphModalClose>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </CenterMorphModalClose>
          <CenterMorphModalClose>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              Log Out
            </button>
          </CenterMorphModalClose>
        </div>
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
};