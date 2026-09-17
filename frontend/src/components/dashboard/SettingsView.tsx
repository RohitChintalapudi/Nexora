import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  LogOut, 
  Check, 
  Sliders, 
  Unlink, 
  Plus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { DisconnectGithubModal } from './DisconnectGithubModal';

interface SettingsViewProps {
  isGitHubConnected?: boolean;
  githubUsername?: string | null;
  onConnectGitHub?: () => void;
  onDisconnectGitHub?: () => void;
  isConnecting?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isGitHubConnected = false,
  githubUsername = null,
  onConnectGitHub,
  onDisconnectGitHub,
  isConnecting = false
}) => {
  const { user, logout, changePassword } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Check if user is eligible for password change (email & password auth, not pure OAuth)
  const isPasswordEligible = Boolean(
    user?.hasPassword === true || 
    (user?.authProvider === 'email' && user?.hasPassword !== false) ||
    (!user?.authProvider && user?.hasPassword !== false)
  );

  const handleOpenDisconnect = () => {
    if (onDisconnectGitHub) {
      onDisconnectGitHub();
    } else {
      setIsDisconnectModalOpen(true);
    }
  };

  const handleConfirmInternalDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const token = localStorage.getItem('nexora_token');
      if (token) {
        await fetch('http://localhost:5000/api/github/disconnect', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err);
    } finally {
      setIsDisconnecting(false);
      setIsDisconnectModalOpen(false);
      window.location.reload();
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword, confirmPassword);
      if (result.success) {
        setPasswordSuccess(result.message || 'Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
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
          Manage your developer credentials, GitHub repository authorization, and workspace security.
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

      {/* Security & Password Management Section */}
      <section className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Security & Credentials</h2>
            <p className="text-xs font-medium text-slate-400">
              {isPasswordEligible
                ? 'Update your email and password authentication credentials'
                : 'OAuth federated identity and authentication security'}
            </p>
          </div>
        </div>

        {!isPasswordEligible ? (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    Federated OAuth Authentication Active
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {user?.authProvider === 'google'
                      ? 'Google OAuth'
                      : user?.authProvider === 'github'
                        ? 'GitHub OAuth'
                        : 'OAuth Identity'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  You signed in using {user?.authProvider === 'google' ? 'Google' : user?.authProvider === 'github' ? 'GitHub' : 'OAuth'} authentication. Your account does not require a local password; security and credential updates are managed directly through your OAuth provider.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            {/* Feedback Notifications */}
            {passwordSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-4 pr-10 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-4 pr-10 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    className="w-full pl-4 pr-10 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-400">
                Password must be at least 6 characters and different from your current password.
              </p>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* GitHub Authorization Section */}
      <section className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">GitHub Connection</h2>
              <p className="text-xs font-medium text-slate-400">OAuth authorization for repository access & AST mapping</p>
            </div>
          </div>

          <div>
            {isGitHubConnected ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Connected (@{githubUsername})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Not Connected
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
          <div>
            <p className="text-xs font-bold text-slate-900">
              {isGitHubConnected ? `Connected Account: @${githubUsername}` : 'Connect GitHub Account'}
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              {isGitHubConnected
                ? 'Authorized with scopes: repo, read:user, user:email'
                : 'Grant repository permissions for codebase exploration and automated analysis'}
            </p>
          </div>

          <div>
            {isGitHubConnected ? (
              <button
                type="button"
                onClick={handleOpenDisconnect}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect GitHub</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onConnectGitHub}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Connect GitHub</span>
              </button>
            )}
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
            <p className="text-xs font-medium text-slate-400">Security signature and runtime platform version</p>
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
              <p className="text-xs font-extrabold text-slate-900">Platform Version</p>
              <p className="text-[11px] font-medium text-slate-400">Version 1 (V1) — Codebase Intelligence & AI Architecture Platform</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
              Version 1 (V1)
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

      {/* Disconnect GitHub Confirmation Modal */}
      <DisconnectGithubModal
        isOpen={isDisconnectModalOpen}
        username={githubUsername}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleConfirmInternalDisconnect}
        isProcessing={isDisconnecting}
      />
    </div>
  );
};
