import React from 'react';
import { motion } from 'framer-motion';

export interface NexoraLoaderProps {
  message?: string;
  subMessage?: string;
  variant?: 'fullscreen' | 'page' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export const NexoraLoader: React.FC<NexoraLoaderProps> = ({
  message = 'Loading NEXORA Intelligence...',
  subMessage = 'Synchronizing repository state and AST symbols',
  variant = 'page',
  size = 'md'
}) => {
  const sizeMap = {
    sm: { logoSize: 32, textSize: 'text-base', containerPadding: 'p-4' },
    md: { logoSize: 48, textSize: 'text-xl', containerPadding: 'p-8' },
    lg: { logoSize: 64, textSize: 'text-2xl', containerPadding: 'p-12' }
  };

  const { logoSize, textSize, containerPadding } = sizeMap[size];

  const content = (
    <div 
      className="flex flex-col items-center justify-center text-center space-y-5 select-none"
      style={{ fontFamily: "'Times New Roman', Times, 'Nimbus Roman No9 L', Georgia, serif" }}
    >
      
      {/* Animated Glowing Nexora Logo Glyphs */}
      <div className="relative flex items-center justify-center">
        {/* Soft Background Glow */}
        <motion.div
          className="absolute -inset-4 rounded-full bg-slate-900/10 blur-xl"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Outer Rotating Dash Ring */}
        <motion.div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-slate-900/25 border-dashed"
          animate={{ rotate: 360 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Center Animated Logo SVG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width={logoSize}
            height={logoSize}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            {/* Pulsing Inter-Node Pathways */}
            <motion.path
              d="M 11 30 L 11 10 L 29 30 L 29 10"
              stroke="#000000"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{
                pathLength: [0.2, 1, 0.2],
                stroke: ['#000000', '#334155', '#000000']
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Glowing Nodes */}
            <motion.circle 
              cx="11" 
              cy="10" 
              r="3.5" 
              fill="#000000"
              animate={{ scale: [1, 1.3, 1], fill: ['#000000', '#475569', '#000000'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.1 }}
            />
            <motion.circle 
              cx="11" 
              cy="30" 
              r="3.5" 
              fill="#000000"
              animate={{ scale: [1, 1.3, 1], fill: ['#000000', '#475569', '#000000'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle 
              cx="20" 
              cy="20" 
              r="4.5" 
              fill="#0f172a"
              animate={{ scale: [1, 1.4, 1], fill: ['#0f172a', '#334155', '#0f172a'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle 
              cx="30" 
              cy="10" 
              r="3.5" 
              fill="#000000"
              animate={{ scale: [1, 1.3, 1], fill: ['#000000', '#475569', '#000000'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.7 }}
            />
            <motion.circle 
              cx="30" 
              cy="30" 
              r="3.5" 
              fill="#000000"
              animate={{ scale: [1, 1.3, 1], fill: ['#000000', '#475569', '#000000'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
            />
          </svg>
        </div>
      </div>

      {/* Brand Name & Status Message */}
      <div className="space-y-1.5 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-1.5">
          <span 
            className={`font-black tracking-[0.22em] text-black dark:text-black ${textSize}`}
            style={{ fontFamily: "'Times New Roman', Times, 'Nimbus Roman No9 L', Georgia, serif" }}
          >
            NEXORA
          </span>
          <span className="flex gap-1 items-center pl-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block"
                animate={{
                  y: [-2, 2, -2],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </span>
        </div>

        {message && (
          <p 
            className="text-xs font-bold text-slate-800"
            style={{ fontFamily: "'Times New Roman', Times, 'Nimbus Roman No9 L', Georgia, serif" }}
          >
            {message}
          </p>
        )}

        {subMessage && (
          <p 
            className="text-[11px] font-medium text-slate-500 leading-relaxed"
            style={{ fontFamily: "'Times New Roman', Times, 'Nimbus Roman No9 L', Georgia, serif" }}
          >
            {subMessage}
          </p>
        )}
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-44 h-1 bg-slate-200/80 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-900 via-black to-slate-800 rounded-full"
          animate={{
            left: ['-50%', '100%'],
            width: ['40%', '60%']
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F1F5F9]/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150">
        <div className="bg-white/90 p-8 sm:p-12 rounded-[2.5rem] border border-slate-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.06)]">
          {content}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] ${containerPadding} flex items-center justify-center animate-in fade-in duration-150`}>
        {content}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 py-2 px-3">
        <svg
          width={18}
          height={18}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
        >
          <path
            d="M 10 30 L 10 10 L 20 20 L 30 10 L 30 30"
            stroke="#000000"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
        <span 
          className="text-xs font-bold text-slate-900"
          style={{ fontFamily: "'Times New Roman', Times, 'Nimbus Roman No9 L', Georgia, serif" }}
        >
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className={`min-h-[360px] w-full flex items-center justify-center ${containerPadding} animate-in fade-in duration-150`}>
      {content}
    </div>
  );
};

export default NexoraLoader;
