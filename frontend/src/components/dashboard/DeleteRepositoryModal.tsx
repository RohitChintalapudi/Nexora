import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  repoName: string;
  repoFullName?: string;
}

export const DeleteRepositoryModal: React.FC<DeleteRepositoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  repoName,
  repoFullName
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Repository
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {repoFullName || repoName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-3 space-y-4">
          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 space-y-1 leading-relaxed">
              <p className="font-bold">
                Are you sure you want to remove <span className="font-mono underline">{repoName}</span>?
              </p>
              <p className="text-red-700/90 text-[11px]">
                This will purge all ingested source files, AST symbols, relationship graph edges, vector embeddings, and AI analysis reports from your Nexora dashboard.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            💡 You can re-import and re-analyze this repository at any time from your connected GitHub account.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-full transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-full shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete & Purge Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRepositoryModal;
