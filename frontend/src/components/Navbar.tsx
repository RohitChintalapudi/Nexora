import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Product', 'Intelligence', 'Collaboration', 'Architecture'];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#F7F7F5]/80 backdrop-blur-md border-black/[0.06] shadow-sm py-3.5'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left Section: Logo */}
        <Logo />

        {/* Center Section: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-neutral-500 hover:text-neutral-900 font-medium text-sm font-sans tracking-wide transition-colors relative py-1 group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Section: CTAs */}
        <div className="flex items-center gap-6">
          <a
            href="#signin"
            className="text-neutral-500 hover:text-neutral-900 font-medium text-sm font-sans transition-colors"
          >
            Sign in
          </a>
          <motion.a
            href="#getstarted"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-4.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm font-sans tracking-wide transition-colors shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20"
          >
            Get started
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
};
export default Navbar;
