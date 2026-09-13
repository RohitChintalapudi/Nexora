import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut, Check, Sliders } from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Settings & Profile
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Manage your developer credentials, token verification, and workspace configuration.
        </p>
      </div>

      {/* Account Details Section */}
      <section className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-red-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PT'}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Platform Account</h2>
            <p className="text-xs font-medium text-slate-400">Personal details and authentication bindings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Display Name
            </label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Platform Team'}
              className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 select-all focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || 'user@nexora.dev'}
              className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 select-all focus:outline-none font-mono"
            />
          </div>
        </div>
      </section>

      {/* Workspace Environment Section */}
      <section className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Workspace Environment</h2>
            <p className="text-xs font-medium text-slate-400">Security signature and runtime milestone</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Authentication Token</p>
              <p className="text-[11px] font-medium text-slate-400">JWT signature validated with Neon PostgreSQL</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Active</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Current Milestone</p>
              <p className="text-[11px] font-medium text-slate-400">White & Blue Developer Workspace Architecture</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              NEXORA M1
            </span>
          </div>
        </div>
      </section>

      {/* Session Termination Card */}
      <section className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Logout</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Safely terminate active token and return to home</p>
        </div>
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-full transition-all cursor-pointer shrink-0 shadow-xs"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
          <span>Logout of NEXORA</span>
        </button>
      </section>

      {/* Logout Confirmation Popup Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
};
