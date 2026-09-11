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
    initial: { pathLength: 0.8, opacity: 0.7, stroke: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(17, 17, 17, 0.4)' },
    hover: { 
      pathLength: 1, 
      opacity: 1, 
      stroke: '#3B82F6',
      transition: { duration: 0.4, ease: 'easeInOut' as const } 
    }
  };

  const nodeVariants = {
    initial: { scale: 1, fill: isDark ? '#FFFFFF' : '#111111' },
    hover: { 
      scale: 1.25, 
      fill: '#3B82F6',
      transition: { duration: 0.3, ease: 'easeOut' as const }
    }
  };

  return (
    <motion.div 
      className={`flex items-center gap-2.5 font-sans font-medium text-lg tracking-wider ${isDark ? 'text-white' : 'text-neutral-900'} cursor-pointer select-none ${className}`}
      whileHover="hover"
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
          d="M 10 30 L 10 10 L 20 20 L 30 10 L 30 30"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
        />
        
        <motion.path
          d="M 10 10 L 30 30"
          strokeWidth="1.5"
          strokeDasharray="4, 4"
          variants={{
            initial: { opacity: 0.3, stroke: '#71717A' },
            hover: { opacity: 0.8, stroke: '#3B82F6', transition: { duration: 0.4 } }
          }}
        />

        {/* Nodes */}
        {/* Top Left Node */}
        <motion.circle cx="10" cy="10" r="3.5" variants={nodeVariants} />
        {/* Bottom Left Node */}
        <motion.circle cx="10" cy="30" r="3.5" variants={nodeVariants} />
        {/* Center Node */}
        <motion.circle cx="20" cy="20" r="4.5" variants={nodeVariants} />
        {/* Top Right Node */}
        <motion.circle cx="30" cy="10" r="3.5" variants={nodeVariants} />
        {/* Bottom Right Node */}
        <motion.circle cx="30" cy="30" r="3.5" variants={nodeVariants} />
      </svg>
      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'} font-sans tracking-tight text-xl`}>
        NEXORA
      </span>
    </motion.div>
  );
};
