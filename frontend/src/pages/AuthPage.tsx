import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mascot } from 'page-mascot';
import { Logo } from '../components/Logo';
import { AuthSwitch } from '../components/ui/auth-switch';
import { useAuth } from '../context/AuthContext';
import { TextShimmer } from '../components/motion/text-shimmer';
import { TextReveal } from '../components/motion/text-reveal';
import { PasswordStrengthIndicator } from '../components/ui/PasswordStrengthIndicator';
import { validateEmail } from '../lib/auth-validation';
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

  const { login, register, triggerGoogleSignIn, triggerGithubSignIn, isLoading, authStatusMessage, navigateTo } = useAuth();

  const isEmailValid = email.trim().length > 0 && validateEmail(email).isValid;

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, []);

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

    const emailCheck = validateEmail(email);

    if (mode === 'signup') {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage('Please enter your full name (at least 2 characters)');
        return;
      }
      if (!emailCheck.isValid) {
        setErrorMessage(emailCheck.error || 'Please enter a valid email address');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter a password for your account');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
      }

      const res = await register(name.trim(), email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed');
      } else {
        navigateTo('dashboard');
      }
    } else {
      if (!email.trim()) {
        setErrorMessage('Please enter your email address');
        return;
      }
      if (!emailCheck.isValid) {
        setErrorMessage(emailCheck.error || 'Please enter a valid email address');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password');
        return;
      }

      const res = await login(email.trim(), password);
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
    <div className="auth-page h-screen w-full bg-[#FAFAFA] text-black flex flex-col justify-between relative overflow-hidden font-sans selection:bg-black selection:text-white">
      
      {/* Precision Monochrome Architectural Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle Ambient Radial Light */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-black/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-black/[0.025] rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar Navigation (Sleek Monochrome) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={handleBackHome}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-neutral-50 border border-black/15 text-xs font-mono font-bold tracking-wider uppercase text-black transition-all cursor-pointer group shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)] hover:border-black/40 active:scale-[0.98]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Nexora</span>
        </button>

        <a href="/" onClick={(e) => { e.preventDefault(); handleBackHome(); }} className="flex items-center">
          <Logo theme="light" size={26} />
        </a>

        {/* Right side alignment spacer */}
        <div className="w-36 hidden sm:block" />
      </header>

      {/* Main Showcase Grid */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 py-2 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Minimal Showcase with Animated Text & Stable Layout */}
          <div className="lg:col-span-6 hidden lg:flex flex-col justify-center space-y-6 pr-6">
            
            {/* Top: Animated Typography */}
            <div className="space-y-3">
              <TextReveal
                as="h1"
                text={["Understand your", "entire software."]}
                className="text-4xl sm:text-4.5xl xl:text-5xl font-serif font-normal tracking-tight text-black leading-[1.14]"
                delay={0.1}
                stagger={0.06}
                blur={8}
              />
              
              <TextReveal
                as="p"
                text="Map complex architectures, trace blast radius across dependencies, and explore system connections in real time."
                className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md font-light"
                delay={0.35}
                stagger={0.02}
                blur={4}
              />
            </div>

            {/* Center: Museum-grade Mascot Pedestal Stage */}
            <div>
              <div className="relative rounded-3xl bg-white border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 flex flex-col items-center justify-center overflow-hidden group">
                
                {/* Precision Corner Crosshairs (+) */}
                <span className="absolute top-3 left-3 text-[10px] font-mono text-neutral-300 select-none">+</span>
                <span className="absolute top-3 right-3 text-[10px] font-mono text-neutral-300 select-none">+</span>
                <span className="absolute bottom-3 left-3 text-[10px] font-mono text-neutral-300 select-none">+</span>
                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-neutral-300 select-none">+</span>

                {/* Subtle Radial Glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 rounded-full bg-neutral-100/60 border border-black/[0.04]" />
                </div>

                {/* The Mascot */}
                <div className="relative z-10 py-1 transition-transform duration-300 group-hover:scale-105">
                  <Mascot
                    directions="/mascots/cap-directions.webp"
                    reactions="/mascots/cap-reactions.webp"
                    size={210}
                    label="Cap the Nexora Mascot"
                  />
                </div>

                {/* Real-time Indicator Pill */}
                <div className="relative z-10 mt-2 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] text-neutral-800 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                  <span>Click to play</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High-End Black & White Auth Card */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="w-full max-w-md bg-white border border-black/10 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05),_0_1px_2px_rgba(0,0,0,0.03)] relative"
            >
              
              {/* Header */}
              <div className="text-center mb-4 min-h-[52px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <h2 className="text-2xl sm:text-3xl font-serif font-normal text-black tracking-tight">
                      {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
                      {mode === 'signup'
                        ? 'Join Nexora and start exploring your software architecture'
                        : 'Enter your credentials to access your intelligence workspace'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* High-Contrast Mode Switcher */}
              <div className="mb-4">
                <AuthSwitch
                  mode={mode}
                  onModeChange={handleModeChange}
                />
              </div>

              {/* Social Login Buttons (Official Brand Colors) */}
              <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => triggerGoogleSignIn()}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-50 border border-black/10 text-xs sm:text-sm font-mono font-medium text-neutral-900 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
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
                  disabled={isLoading}
                  onClick={() => triggerGithubSignIn()}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-50 border border-black/10 text-xs sm:text-sm font-mono font-medium text-neutral-900 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                >
                  <svg className="w-4 h-4 fill-[#24292F]" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Single-line Divider */}
              <div className="relative flex items-center justify-center my-3.5 w-full">
                <div className="border-t border-black/10 flex-1" />
                <span className="px-3 text-[10px] font-mono text-neutral-400 uppercase tracking-widest whitespace-nowrap select-none">
                  or continue with email
                </span>
                <div className="border-t border-black/10 flex-1" />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-2.5 rounded-xl bg-black/[0.04] border border-black/15 text-black text-xs font-mono text-center"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <AnimatePresence initial={false}>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 mb-1">
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
                          placeholder="Rohit"
                          required={mode === 'signup'}
                          className="w-full pl-10 pr-4 py-2 bg-neutral-50/80 border border-black/10 rounded-xl text-sm text-black placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700">
                      Email Address
                    </label>
                    {email.trim().length > 0 && isEmailValid && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid email
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled={isLoading}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rohit@nexora.io"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-neutral-50/80 border border-black/10 rounded-xl text-sm text-black placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <a
                        href="#forgot"
                        onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }}
                        className="text-[11px] text-neutral-500 hover:text-black transition-colors font-mono uppercase tracking-wider"
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
                      disabled={isLoading}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Create a strong password' : '••••••••'}
                      required
                      className="w-full pl-10 pr-10 py-2 bg-neutral-50/80 border border-black/10 rounded-xl text-sm text-black placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Category 4-Dots Indicator */}
                  {mode === 'signup' && (
                    <PasswordStrengthIndicator
                      password={password}
                      theme="light"
                    />
                  )}
                </div>

                {/* Solid Obsidian Black Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.01 } : undefined}
                  whileTap={!isLoading ? { scale: 0.98 } : undefined}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm font-mono flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                >
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
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </motion.button>
              </form>

              {/* Bottom footer switcher */}
              <div className="mt-3.5 text-center text-xs text-neutral-500 font-mono">
                {mode === 'signup' ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleModeChange('signin')}
                      className="text-black hover:underline underline-offset-4 font-semibold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleModeChange('signup')}
                      className="text-black hover:underline underline-offset-4 font-semibold transition-all cursor-pointer disabled:opacity-50"
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

      {/* Floating Bottom Authentication Progress Bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black text-white border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl pointer-events-none select-none"
          >
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-white">
              <TextShimmer
                duration={2}
                baseColor="rgba(255, 255, 255, 0.4)"
                highlightColor="#ffffff"
                className="font-mono"
              >
                {authStatusMessage || 'Authenticating...'}
              </TextShimmer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer (Monochrome Minimalist) */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-3 text-center text-[11px] font-mono tracking-wider uppercase text-neutral-400 flex-shrink-0">
        <span>© 2026 NEXORA SYSTEMS INC. • SECURE MONOCHROME ARCHITECTURE ENGINE</span>
      </footer>

    </div>
  );
};

export default AuthPage;
