import React from 'react';
import { motion } from 'framer-motion';

export interface LogoProps {
  className?: string;
  size?: number;
  theme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  const pathVariants = {
    initial: { pathLength: 1, opacity: 0.9, stroke: isDark ? '#FFFFFF' : '#000000' },
    hover: { 
      pathLength: 1, 
      opacity: 1, 
      stroke: isDark ? '#FFFFFF' : '#000000',
      transition: { duration: 0.25, ease: 'easeInOut' as const } 
    }
  };

  const nodeVariants = {
    initial: { scale: 1, fill: isDark ? '#FFFFFF' : '#000000' },
    hover: { 
      scale: 1.15, 
      fill: isDark ? '#FFFFFF' : '#000000',
      transition: { duration: 0.25, ease: 'easeOut' as const }
    }
  };

  return (
    <motion.div 
      className={`flex items-center gap-2.5 font-sans font-medium text-lg tracking-wider ${isDark ? 'text-white' : 'text-neutral-900'} cursor-pointer select-none ${className}`}
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      initial="initial"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Connection pathways forming a stylized N-network */}
        <motion.path
          d="M 11 30 L 11 10 L 29 30 L 29 10"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
        />

        {/* Nodes */}
        {/* Top Left Node */}
        <motion.circle cx="11" cy="10" r="3.5" variants={nodeVariants} />
        {/* Bottom Left Node */}
        <motion.circle cx="11" cy="30" r="3.5" variants={nodeVariants} />
        {/* Center Node */}
        <motion.circle cx="20" cy="20" r="3.5" variants={nodeVariants} />
        {/* Top Right Node */}
        <motion.circle cx="29" cy="10" r="3.5" variants={nodeVariants} />
        {/* Bottom Right Node */}
        <motion.circle cx="29" cy="30" r="3.5" variants={nodeVariants} />
      </svg>
      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'} font-sans tracking-tight text-xl`}>
        NEXORA
      </span>
    </motion.div>
  );
};
