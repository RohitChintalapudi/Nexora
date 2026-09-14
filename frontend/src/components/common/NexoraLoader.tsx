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
    <div className="flex flex-col items-center justify-center text-center space-y-5 select-none">
      
      {/* Animated Glowing Nexora Logo Glyphs */}
      <div className="relative flex items-center justify-center">
        {/* Soft Background Glow */}
        <motion.div
          className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Outer Rotating Dash Ring */}
        <motion.div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-blue-500/30 border-dashed"
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
              d="M 10 30 L 10 10 L 20 20 L 30 10 L 30 30"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{
                pathLength: [0.2, 1, 0.2],
                stroke: ['#3b82f6', '#1d4ed8', '#3b82f6']
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            <motion.path
              d="M 10 10 L 30 30"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="4, 4"
              animate={{
                opacity: [0.3, 0.9, 0.3]
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Glowing Nodes */}
            <motion.circle 
              cx="10" 
              cy="10" 
              r="3.5" 
              fill="#2563eb"
              animate={{ scale: [1, 1.3, 1], fill: ['#2563eb', '#60a5fa', '#2563eb'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.1 }}
            />
            <motion.circle 
              cx="10" 
              cy="30" 
              r="3.5" 
              fill="#2563eb"
              animate={{ scale: [1, 1.3, 1], fill: ['#2563eb', '#60a5fa', '#2563eb'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle 
              cx="20" 
              cy="20" 
              r="4.5" 
              fill="#1d4ed8"
              animate={{ scale: [1, 1.4, 1], fill: ['#1d4ed8', '#3b82f6', '#1d4ed8'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle 
              cx="30" 
              cy="10" 
              r="3.5" 
              fill="#2563eb"
              animate={{ scale: [1, 1.3, 1], fill: ['#2563eb', '#60a5fa', '#2563eb'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.7 }}
            />
            <motion.circle 
              cx="30" 
              cy="30" 
              r="3.5" 
              fill="#2563eb"
              animate={{ scale: [1, 1.3, 1], fill: ['#2563eb', '#60a5fa', '#2563eb'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
            />
          </svg>
        </div>
      </div>

      {/* Brand Name & Status Message */}
      <div className="space-y-1.5 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-1.5">
          <span className={`font-extrabold tracking-wider bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent ${textSize}`}>
            NEXORA
          </span>
          <span className="flex gap-1 items-center pl-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"
                animate={{
                  y: [-2, 2, -2],
                  opacity: [0.4, 1, 0.4]
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
          <p className="text-xs font-extrabold text-slate-800">
            {message}
          </p>
        )}

        {subMessage && (
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed font-sans">
            {subMessage}
          </p>
        )}
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-44 h-1 bg-slate-200/80 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
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
            stroke="#2563eb"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs font-bold text-slate-700">{message}</span>
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
