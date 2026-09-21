import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, ShieldAlert, Fingerprint, KeyRound } from 'lucide-react';
import { Logo } from '../Logo';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.35)] ring-1 ring-slate-900/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Top accent gradient */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-7">
              <div className="flex items-center gap-3">
                <Logo size={26} theme="light" className="shrink-0" />
                <span className="h-6 w-px bg-slate-200" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Secure Session
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
            </div>

            {/* Icon */}
            <div className="relative flex justify-center pt-8">
              <motion.span
                className="absolute w-20 h-20 rounded-full bg-rose-200/50"
                animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-red-500/30 flex items-center justify-center"
                initial={{ rotate: -8, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <LogOut className="w-7 h-7 text-white stroke-[2.2]" />
              </motion.div>
            </div>

            {/* Heading */}
            <div className="text-center mt-6 px-7">
              <h3 id="logout-modal-title" className="text-xl font-extrabold tracking-tight text-slate-900">
                Log out of NEXORA?
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Session Management
              </p>
            </div>

            {/* Body */}
            <div className="px-7 pt-5">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold leading-relaxed text-slate-700">
                  Are you sure you want to log out of <span className="font-extrabold text-slate-900">NEXORA</span>? You will need to sign in again to access your connected codebases and architecture maps.
                </p>
              </div>

              {/* Session details */}
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Fingerprint className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Active sessions will be terminated.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    You can sign back in anytime with your account.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 border-t border-slate-100 bg-slate-50/80 px-7 py-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClose();
                  onConfirm();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 rounded-full shadow-lg shadow-red-500/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                Log Out
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};