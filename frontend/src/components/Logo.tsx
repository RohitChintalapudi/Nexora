import React from 'react';

export interface LogoProps {
  className?: string;
  size?: number;
  theme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div 
      className={`flex items-center gap-2.5 font-sans font-medium text-lg tracking-wider ${isDark ? 'text-white' : 'text-neutral-900'} select-none transition-none ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible shrink-0"
      >
        {/* Connection pathways forming a stylized N-network */}
        <path
          d="M 11 30 L 11 10 L 29 30 L 29 10"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={isDark ? '#FFFFFF' : '#000000'}
          opacity="0.9"
        />

        {/* Nodes */}
        {/* Top Left Node */}
        <circle cx="11" cy="10" r="3.5" fill={isDark ? '#FFFFFF' : '#000000'} />
        {/* Bottom Left Node */}
        <circle cx="11" cy="30" r="3.5" fill={isDark ? '#FFFFFF' : '#000000'} />
        {/* Center Node */}
        <circle cx="20" cy="20" r="3.5" fill={isDark ? '#FFFFFF' : '#000000'} />
        {/* Top Right Node */}
        <circle cx="29" cy="10" r="3.5" fill={isDark ? '#FFFFFF' : '#000000'} />
        {/* Bottom Right Node */}
        <circle cx="29" cy="30" r="3.5" fill={isDark ? '#FFFFFF' : '#000000'} />
      </svg>
      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'} font-sans tracking-tight text-xl`}>
        NEXORA
      </span>
    </div>
  );
};

export default Logo;
