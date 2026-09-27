import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { NavbarAuthProgress } from './NavbarAuthProgress';
import { EASE_OUT, SPRING_LAYOUT } from '@/lib/ease';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout, navigateTo, isLoading, authAction } = useAuth();

  const isAuthBusy = isLoading && !!authAction;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isOver20 = window.scrollY > 20;
          setScrolled((prev) => (prev !== isOver20 ? isOver20 : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Product', href: '#product' },
    { name: 'Intelligence', href: '#intelligence' },
    { name: 'Collaboration', href: '#collaboration' },
  ];

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigateTo('signup');
    } else {
      const el = document.getElementById('product');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      className="fixed top-5 sm:top-7 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      {/* Apple-Style Dynamic Island Capsule with Pure Black Background */}
      <motion.div
        layout
        transition={SPRING_LAYOUT}
        className={`pointer-events-auto relative rounded-full bg-[#000000] border border-white/[0.16] shadow-[0_16px_50px_rgba(0,0,0,0.85),_inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl will-change-transform ${
          scrolled ? 'shadow-[0_20px_60px_rgba(0,0,0,0.92)]' : ''
        }`}
      >
        <motion.div
          animate={{ scale: scrolled ? 0.98 : 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="relative flex items-center justify-center px-5 sm:px-7 py-3 sm:py-3.5 min-h-[58px] sm:min-h-[64px]"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isAuthBusy ? (
              <NavbarAuthProgress key="auth-progress" action={authAction} />
            ) : (
              <motion.div
                key="nav-default"
                initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="flex w-full items-center justify-between gap-4 sm:gap-8"
              >
                {/* Left: Brand Logo */}
                <a href="#" className="flex items-center group pl-1 pr-1 sm:pr-2">
                  <Logo theme="dark" size={30} />
                </a>

                {/* Center: Navigation Links with Solid Blue Capsule on Hover */}
                <nav
                  className="hidden md:flex items-center gap-1.5 sm:gap-2 relative"
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {navItems.map((item) => {
                    const isHovered = hoveredItem === item.name;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        className="relative px-4 py-2 rounded-full text-sm lg:text-[15px] font-medium tracking-wide text-neutral-300 hover:text-white transition-colors duration-200 z-10 select-none flex items-center justify-center"
                      >
                        {/* Solid blue oval on hover */}
                        {isHovered && (
                          <motion.div
                            layoutId="dynamic-island-hover-oval"
                            className="absolute inset-0 rounded-full bg-blue-600 shadow-md shadow-blue-600/30 pointer-events-none"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative z-10">{item.name}</span>
                      </a>
                    );
                  })}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 sm:gap-4">
                  {!isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigateTo('signin')}
                        onMouseEnter={() => setHoveredItem('signin')}
                        onMouseLeave={() => setHoveredItem(null)}
                        className="relative hidden sm:flex items-center justify-center px-4 py-2 rounded-full text-sm lg:text-[15px] font-medium text-neutral-300 hover:text-white transition-colors z-10 select-none cursor-pointer"
                      >
                        {hoveredItem === 'signin' && (
                          <motion.div
                            layoutId="dynamic-island-hover-oval"
                            className="absolute inset-0 rounded-full bg-blue-600 shadow-md shadow-blue-600/30 pointer-events-none"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">Sign in</span>
                      </button>

                      <InteractiveHoverButton
                        text="Get started"
                        onClick={handleGetStarted}
                        className="w-36 sm:w-42 h-[42px] sm:h-[46px] py-2 px-4 text-sm sm:text-[15px] font-semibold border-white/20 bg-white/10 text-white hover:bg-blue-600 hover:border-blue-600 shadow-sm"
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => navigateTo('dashboard')}
                        className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </button>

                      <div className="relative" ref={userMenuRef}>
                        <button
                          type="button"
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white text-sm font-medium transition-all cursor-pointer"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                            {user ? getUserInitials(user.name) : 'U'}
                          </div>
                          <span className="hidden sm:inline max-w-[110px] truncate text-neutral-200">
                            {user?.name.split(' ')[0]}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* User Dropdown Menu */}
                        <AnimatePresence>
                          {userMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-[#0D0D10]/95 border border-white/[0.12] p-2.5 shadow-2xl backdrop-blur-2xl z-50 flex flex-col gap-1"
                            >
                              <div className="px-3 py-2.5 border-b border-white/[0.08]">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setUserMenuOpen(false);
                                  navigateTo('dashboard');
                                }}
                                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-200 hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                              >
                                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                                <span>Open Dashboard</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setUserMenuOpen(false);
                                  logout();
                                }}
                                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left mt-1"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Mobile menu toggle */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.08] text-white border border-white/[0.1] hover:bg-blue-600 hover:border-blue-600 transition-colors cursor-pointer text-sm"
                    aria-label="Toggle navigation menu"
                  >
                    <span>{mobileMenuOpen ? '✕' : '☰'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Indeterminate sweep rail — only while authenticating */}
        <AnimatePresence>
          {isAuthBusy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute inset-x-6 bottom-2.5 h-[2px] overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                animate={{ x: ['-120%', '360%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-20 inset-x-4 max-w-sm mx-auto p-5 rounded-3xl bg-[#000000]/95 border border-white/[0.14] shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col gap-2.5 md:hidden z-50 text-center"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-2xl text-base font-medium text-neutral-300 hover:text-white hover:bg-blue-600 transition-all"
              >
                {item.name}
              </a>
            ))}
            <div className="h-[1px] bg-white/[0.08] my-1" />
            
            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('signin');
                  }}
                  className="py-2.5 px-4 rounded-2xl text-sm text-neutral-300 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <div className="pt-2 flex justify-center">
                  <InteractiveHoverButton
                    text="Get started"
                    className="w-full py-2.5 text-sm font-medium border-white/20 bg-white/10 text-white hover:bg-blue-600 hover:border-blue-600"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('signup');
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <div className="py-2 px-3 bg-white/[0.05] rounded-xl text-left">
                  <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="py-2 px-4 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
