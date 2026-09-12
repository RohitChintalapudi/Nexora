import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/Logo';
import { AuthSwitch } from '../components/ui/auth-switch';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Network,
  GitBranch,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onNavigateHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  onNavigateHome,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, register, isLoading, navigateTo } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    if (window.history.pushState) {
      window.history.pushState(null, '', newMode === 'signup' ? '/signup' : '/signin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
      }

      const res = await register(name, email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed');
      } else {
        navigateTo('dashboard');
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
        navigateTo('dashboard');
      }
    }
  };

  const handleBackHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
  return (
    <div className="auth-page h-screen w-full bg-[#F7F7F5] text-neutral-900 flex flex-col justify-between relative overflow-hidden font-serif selection:bg-black/10 selection:text-black">
      
      {/* Subtle soft gradient background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-neutral-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neutral-200/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar Navigation (Clean Apple Light) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={handleBackHome}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 border border-black/[0.08] text-sm font-medium text-neutral-800 hover:text-neutral-950 transition-all cursor-pointer group shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Nexora</span>
        </button>

        <a href="/" onClick={(e) => { e.preventDefault(); handleBackHome(); }} className="flex items-center">
          <Logo theme="light" size={26} />
        </a>

        <div className="w-28 hidden sm:block" />
      </header>

      {/* Main Split Grid Container (No Scrolling) */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 py-2 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Left Column: Clean Apple-style Showcase with Bigger Text & Spacing */}
          <div className="lg:col-span-6 hidden lg:flex flex-col justify-center space-y-5 pr-4">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.04] border border-black/[0.08] text-neutral-800 text-sm font-medium w-fit shadow-2xs">
              <Zap className="w-4 h-4 text-neutral-900" />
              <span>Next-Generation Code Intelligence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3.5xl sm:text-4xl xl:text-5xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.18]">
                Understand your entire software.
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-lg font-light">
                Map complex architectures, trace impact blast radius before pushing code, and explore every system connection.
              </p>
            </div>

            {/* Architecture Preview Box with Blinking Green Live Synced Badge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-3">
              <div className="flex items-center justify-between text-base text-neutral-600 border-b border-black/[0.06] pb-2.5">
                <span className="flex items-center gap-2.5 text-neutral-900 font-semibold text-base">
                  <Network className="w-4.5 h-4.5 text-neutral-800" />
                  System Graph Intelligence
                </span>
                
                {/* Blinking Green Live Synced Button/Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90 text-xs sm:text-sm font-medium shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                  <span>Live Synced</span>
                </span>
              </div>

              <div className="space-y-2.5 text-sm font-serif text-neutral-700">
                <div className="flex items-center gap-2.5">
                  <GitBranch className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span>auth-service.ts <span className="text-neutral-400">→</span> user-model.sql</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-700 flex-shrink-0" />
                  <span className="text-neutral-800 font-medium">0 breaking dependency mutations detected</span>
                </div>
              </div>
            </div>

            {/* Feature Bullets with increased line gap & size */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3 text-sm sm:text-base text-neutral-800 font-normal">
                <CheckCircle2 className="w-4.5 h-4.5 text-neutral-950 flex-shrink-0" />
                <span>Instant schema & database dependency forecasting</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-neutral-800 font-normal">
                <CheckCircle2 className="w-4.5 h-4.5 text-neutral-950 flex-shrink-0" />
                <span>Automated blast-radius calculation for pull requests</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-neutral-800 font-normal">
                <CheckCircle2 className="w-4.5 h-4.5 text-neutral-950 flex-shrink-0" />
                <span>Zero configuration PostgreSQL & GitHub synchronization</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Apple Light Form Card */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="w-full max-w-md bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06),_0_1px_3px_rgba(0,0,0,0.03)] relative"
            >
              
              {/* Header with smooth crossfade */}
              <div className="text-center mb-4 min-h-[52px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-950 tracking-tight">
                      {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
                      {mode === 'signup'
                        ? 'Join NEXORA and start exploring your software architecture'
                        : 'Enter your credentials to access your intelligence workspace'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Apple Light Mode Switcher */}
              <div className="mb-4">
                <AuthSwitch
                  mode={mode}
                  onModeChange={handleModeChange}
                />
              </div>

              {/* Social Login Buttons (Light Theme) */}
              <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                <button
                  type="button"
                  onClick={() => alert('Google authentication integration is ready in production.')}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-50 border border-black/[0.08] text-sm font-medium text-neutral-800 transition-all cursor-pointer shadow-sm active:scale-98"
                >
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
                </button>

                <button
                  type="button"
                  onClick={() => alert('GitHub authentication integration is ready in production.')}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-50 border border-black/[0.08] text-sm font-medium text-neutral-800 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Single-line Horizontal Divider */}
              <div className="relative flex items-center justify-center my-3.5 w-full">
                <div className="border-t border-black/[0.08] flex-1" />
                <span className="px-2.5 text-xs font-serif text-neutral-400 uppercase tracking-wider whitespace-nowrap flex-shrink-0 select-none">
                  or continue with email
                </span>
                <div className="border-t border-black/[0.08] flex-1" />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-serif text-center"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <AnimatePresence initial={false}>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 font-serif">
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
                          placeholder="Rohit"
                          required={mode === 'signup'}
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 border border-black/[0.1] rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-serif"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 font-serif">
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
                      placeholder="rohit@nexora.io"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 border border-black/[0.1] rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-serif"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700 font-serif">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <a
                        href="#forgot"
                        onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }}
                        className="text-xs text-neutral-500 hover:text-black transition-colors font-serif"
                      >
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/80 border border-black/[0.1] rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-serif"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Apple-Style Solid Black Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-neutral-950 hover:bg-black text-white font-semibold text-sm sm:text-base font-serif flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={mode}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          {mode === 'signup' ? 'Create Account' : 'Sign In'}
                        </motion.span>
                      </AnimatePresence>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.button>
              </form>

              {/* Bottom footer switcher */}
              <div className="mt-4 text-center text-xs sm:text-sm text-neutral-500 font-serif">
                {mode === 'signup' ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeChange('signin')}
                      className="text-neutral-950 hover:underline underline-offset-4 font-semibold transition-all cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeChange('signup')}
                      className="text-neutral-950 hover:underline underline-offset-4 font-semibold transition-all cursor-pointer"
                    >
                      Create Account
                    </button>
                  </span>
                )}
              </div>

            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer (Compact Apple Minimalist Light) */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-3 text-center text-xs font-serif text-neutral-400 flex-shrink-0">
        <span>© 2026 NEXORA • Secure Authentication via Neon PostgreSQL</span>
      </footer>

    </div>
  );
};

export default AuthPage;
