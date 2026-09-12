import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, X, Loader2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, login, register, isLoading } = useAuth();

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
            <div className="flex flex-col items-center text-center mb-6">
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

            {/* Tab Switcher */}
            <div className="flex p-1 bg-white/[0.06] border border-white/[0.08] rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('login');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'login'
                    ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('register');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'register'
                    ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans text-center"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authModalTab === 'register' ? 'At least 6 characters' : '••••••••'}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                    <span>Processing...</span>
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
            <div className="mt-5 text-center text-xs text-neutral-400 font-sans">
              {authModalTab === 'register' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      openAuthModal('login');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      openAuthModal('register');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
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
