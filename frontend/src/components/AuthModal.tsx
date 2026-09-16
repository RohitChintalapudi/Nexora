import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, X, Loader2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, login, register, triggerGoogleSignIn, triggerGithubSignIn, isLoading, authAction, authStatusMessage } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authModalTab === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters');
        return;
      }

      const res = await register(name, email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed');
      } else {
        setName('');
        setEmail('');
        setPassword('');
      }
    } else {
      if (!email.trim()) {
        setErrorMessage('Please enter your email');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password');
        return;
      }

      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid email or password');
      } else {
        setEmail('');
        setPassword('');
      }
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full max-w-md bg-[#0D0D10]/95 border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85),_inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl z-10 overflow-hidden"
          >
            {/* Background ambient light */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close auth dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="mb-3">
                <Logo theme="dark" size={32} />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight">
                {authModalTab === 'register' ? 'Create your NEXORA account' : 'Welcome back to NEXORA'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-1">
                {authModalTab === 'register'
                  ? 'Start understanding and mapping your entire software'
                  : 'Enter your credentials to access your architecture workspace'}
              </p>
            </div>

            {/* Social OAuth Buttons */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => triggerGoogleSignIn()}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-neutral-100 text-xs sm:text-sm font-medium text-neutral-900 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading && authAction === 'google' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                        />
                      </svg>
                      <span>Google</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => triggerGithubSignIn()}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-xs sm:text-sm font-medium text-white transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading && authAction === 'github' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative flex items-center justify-center my-3.5 w-full">
                <div className="border-t border-white/[0.1] flex-1" />
                <span className="px-2.5 text-[11px] font-sans text-neutral-400 uppercase tracking-wider whitespace-nowrap flex-shrink-0 select-none">
                  or continue with email
                </span>
                <div className="border-t border-white/[0.1] flex-1" />
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-white/[0.06] border border-white/[0.08] rounded-xl mb-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('login');
                }}
                className={`flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
                  authModalTab === 'login'
                    ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('register');
                }}
                className={`flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
                  authModalTab === 'register'
                    ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Authentication In Progress Banner Inside Modal */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-3.5"
                >
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center gap-2.5 text-blue-300 text-xs font-sans shadow-inner">
                    <div className="relative flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 flex-shrink-0" />
                      <span className="absolute w-2 h-2 rounded-full bg-blue-400/50 animate-ping" />
                    </div>
                    <span className="font-medium tracking-wide">
                      {authStatusMessage || 'Authenticating in progress...'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {errorMessage && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans text-center"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalTab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-sans">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      disabled={isLoading}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-sans">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authModalTab === 'register' ? 'At least 6 characters' : '••••••••'}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-medium text-sm font-sans flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_0_32px_rgba(37,99,235,0.65)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{authStatusMessage || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{authModalTab === 'register' ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer switcher note */}
            <div className="mt-4 text-center text-xs text-neutral-400 font-sans">
              {authModalTab === 'register' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setErrorMessage(null);
                      openAuthModal('login');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setErrorMessage(null);
                      openAuthModal('register');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Create one
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
