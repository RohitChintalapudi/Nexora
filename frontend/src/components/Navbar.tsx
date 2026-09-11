import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Product', href: '#product' },
    { name: 'Intelligence', href: '#intelligence' },
    { name: 'Collaboration', href: '#collaboration' },
    { name: 'Architecture', href: '#architecture' },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      className="fixed top-4 sm:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      {/* Apple-Style Dynamic Island Capsule with Pure Black Background */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className={`pointer-events-auto relative flex items-center justify-between gap-3 sm:gap-6 px-3.5 sm:px-5 py-2 rounded-full bg-[#000000] border border-white/[0.14] shadow-[0_12px_44px_rgba(0,0,0,0.75),_inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl transition-all duration-300 ${
          scrolled ? 'scale-[0.98] shadow-[0_16px_50px_rgba(0,0,0,0.85)]' : ''
        }`}
      >
        {/* Left: Brand Logo */}
        <a href="#" className="flex items-center group pl-1">
          <Logo theme="dark" size={24} />
        </a>

        {/* Center: Navigation Links with Glass-Like Oval Design in Blue on Hover */}
        <nav
          className="hidden md:flex items-center gap-1 relative"
          onMouseLeave={() => setHoveredItem(null)}
        >
          {navItems.map((item) => {
            const isHovered = hoveredItem === item.name;
            return (
              <a
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                className="relative px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors duration-200 z-10 select-none flex items-center justify-center"
              >
                {/* Glass-like oval in blue */}
                {isHovered && (
                  <motion.div
                    layoutId="dynamic-island-hover-oval"
                    className="absolute inset-0 rounded-full bg-blue-600/30 border border-blue-400/60 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.5),_inset_0_1px_2px_rgba(255,255,255,0.45)] pointer-events-none"
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
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#signin"
            onMouseEnter={() => setHoveredItem('signin')}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative hidden sm:flex items-center justify-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-neutral-300 hover:text-white transition-colors z-10 select-none"
          >
            {hoveredItem === 'signin' && (
              <motion.div
                layoutId="dynamic-island-hover-oval"
                className="absolute inset-0 rounded-full bg-blue-600/30 border border-blue-400/60 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.5),_inset_0_1px_2px_rgba(255,255,255,0.45)] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Sign in</span>
          </a>

          <motion.a
            href="#getstarted"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_24px_rgba(37,99,235,0.55),_inset_0_1px_2px_rgba(255,255,255,0.35)] border border-blue-400/40 select-none overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Get started
              <span className="text-xs transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          </motion.a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.08] text-white border border-white/[0.1] hover:bg-white/[0.15] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="text-xs">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-16 inset-x-4 max-w-sm mx-auto p-4 rounded-3xl bg-[#000000]/95 border border-white/[0.14] shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col gap-2 md:hidden z-50 text-center"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-2xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-blue-600/20 hover:border hover:border-blue-500/30 transition-all"
              >
                {item.name}
              </a>
            ))}
            <div className="h-[1px] bg-white/[0.08] my-1" />
            <a
              href="#signin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Sign in
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
