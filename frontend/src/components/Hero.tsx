import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FloatingInsightCard } from './FloatingInsightCard';
import { HaddybhaiyaShader } from './HaddybhaiyaShader';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const [gpuFailed, setGpuFailed] = useState(false);
  const { navigateTo } = useAuth();

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    initial: { y: 24, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const cardFlyInVariants = (direction: 'left' | 'right' | 'bottom-left' | 'bottom-right', delay: number) => {
    let initialX = 0;
    let initialY = 0;
    let initialRotate = 0;

    if (direction === 'left') {
      initialX = -700;
      initialY = -80;
      initialRotate = -14;
    } else if (direction === 'right') {
      initialX = 700;
      initialY = -80;
      initialRotate = 14;
    } else if (direction === 'bottom-left') {
      initialX = -700;
      initialY = 160;
      initialRotate = -10;
    } else if (direction === 'bottom-right') {
      initialX = 700;
      initialY = 160;
      initialRotate = 10;
    }

    return {
      initial: {
        x: initialX,
        y: initialY,
        opacity: 0,
        rotate: initialRotate,
        scale: 0.8,
      },
      animate: {
        x: 0,
        y: 0,
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 85,
          damping: 15,
          mass: 0.9,
          delay: delay,
        },
      },
    };
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden px-6 bg-[#090909] text-white">
      
      {/* WebGPU Shader Background - Black background as in the shader code */}
      {!gpuFailed && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <HaddybhaiyaShader
            theme="dark"
            background={{ dark: "#090909", light: "#ffffff" }}
            className="w-full h-full object-cover"
            onError={() => setGpuFailed(true)}
          />
          {/* Subtle vignette / focus overlay */}
          <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_40%,_#090909_100%] opacity-70 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090909] to-transparent pointer-events-none" />
        </div>
      )}

      {/* Fallback glow if WebGPU is unavailable */}
      {gpuFailed && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#090909]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[250px] bg-indigo-500/20 blur-[90px] rounded-full" />
        </div>
      )}
      
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-20 max-w-3xl text-center flex flex-col items-center"
      >
        <motion.h1
          variants={itemVariants}
          style={{ 
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.6)'
          }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-white leading-[1.12] mb-6 max-w-3xl"
        >
          Understand your entire software.<br />
          Build the future.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-neutral-300 text-base sm:text-lg font-sans max-w-xl mb-10 leading-relaxed font-light"
        >
          NEXORA maps your software, understands its architecture, and helps you explore every connection with AI.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <motion.button
            type="button"
            onClick={() => navigateTo('signup')}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm font-sans tracking-wide transition-all text-center shadow-[0_0_28px_rgba(37,99,235,0.4)] hover:shadow-[0_0_36px_rgba(37,99,235,0.6)] cursor-pointer"
          >
            Explore your codebase
          </motion.button>
          
          <motion.a
            href="#howitworks"
            whileHover={{ x: 3 }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.25] text-neutral-200 hover:text-white font-medium text-sm font-sans tracking-wide transition-all backdrop-blur-md text-center flex items-center justify-center gap-2"
          >
            See how it works <span className="text-base">→</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* 1. Top-Left Card: Flying in from outside left */}
      <motion.div
        variants={cardFlyInVariants('left', 0.4)}
        initial="initial"
        animate="animate"
        className="absolute top-[20%] left-[2%] xl:left-[4%] 2xl:left-[6%] z-30 hidden lg:block w-64 xl:w-72 will-change-transform"
      >
        <FloatingInsightCard depth={12} tiltMax={6}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-3">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-300">
              Repository Tree
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-neutral-300">Syncing</span>
            </div>
          </div>
          <div className="font-mono text-xs sm:text-sm text-neutral-200 space-y-2 select-none">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span>📁</span> <span>src</span>
            </div>
            <div className="flex items-center gap-1.5 pl-4 text-neutral-400">
              <span>📁</span> <span>components</span>
            </div>
            <div className="flex items-center justify-between pl-4 py-1 px-2 rounded bg-blue-500/20 border border-blue-500/35 text-blue-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span>📁</span> <span>services</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
            </div>
            <div className="flex items-center gap-1.5 pl-4 text-neutral-400">
              <span>📁</span> <span>api</span>
            </div>
            <div className="flex items-center gap-1.5 pl-4 text-neutral-400">
              <span>📁</span> <span>database</span>
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      {/* 2. Top-Right Card: Flying in from outside right */}
      <motion.div
        variants={cardFlyInVariants('right', 0.5)}
        initial="initial"
        animate="animate"
        className="absolute top-[18%] right-[2%] xl:right-[4%] 2xl:right-[6%] z-30 hidden lg:block w-72 xl:w-80 will-change-transform"
      >
        <FloatingInsightCard depth={18} tiltMax={8}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-3.5">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-300">
              Impact Sandbox
            </span>
            <span className="text-xs font-serif font-semibold px-2 py-0.5 rounded bg-white/[0.1] text-neutral-200 border border-white/[0.12]">
              PREDICT
            </span>
          </div>

          <div className="mb-3.5">
            <div className="text-xs text-neutral-400 font-serif uppercase tracking-wider mb-1.5">Target Change</div>
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-100 font-mono text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>services/auth.ts</span>
              <span className="text-xs ml-auto text-neutral-400 font-serif">Modified</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-400 font-serif uppercase tracking-wider mb-1.5">Downstream Risks</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                <span className="text-xs sm:text-sm font-mono text-neutral-200">gateway/router.ts</span>
                <span className="text-xs font-serif font-bold px-2 py-0.5 bg-red-500/25 text-red-300 border border-red-500/40 rounded">
                  High Risk
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                <span className="text-xs sm:text-sm font-mono text-neutral-200">services/user.ts</span>
                <span className="text-xs font-serif font-medium px-2 py-0.5 bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded">
                  Med Risk
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                <span className="text-xs sm:text-sm font-mono text-neutral-300">tests/auth.test.ts</span>
                <span className="text-xs font-serif font-semibold text-emerald-400 px-1.5 py-0.5">
                  Safe
                </span>
              </div>
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      {/* 3. Bottom-Left Card: Flying in from outside bottom-left */}
      <motion.div
        variants={cardFlyInVariants('bottom-left', 0.6)}
        initial="initial"
        animate="animate"
        className="absolute bottom-[10%] left-[2%] xl:left-[4%] 2xl:left-[6%] z-30 hidden lg:block w-72 xl:w-80 will-change-transform"
      >
        <FloatingInsightCard depth={14} tiltMax={7}>
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-300 block mb-3">
            Dependency Flow
          </span>
          <div className="flex items-center gap-2 select-none">
            <div className="flex-1 py-1.5 px-2.5 text-center rounded-lg bg-white/[0.06] border border-white/[0.09] text-xs sm:text-sm text-neutral-200 font-mono font-medium shadow-sm">
              Auth
            </div>
            <span className="text-neutral-400 text-sm font-mono font-bold">→</span>
            <div className="flex-1 py-1.5 px-2.5 text-center rounded-lg bg-blue-500/25 border border-blue-500/40 text-xs sm:text-sm text-blue-300 font-mono font-semibold shadow-sm">
              Gateway
            </div>
            <span className="text-neutral-400 text-sm font-mono font-bold">→</span>
            <div className="flex-1 py-1.5 px-2.5 text-center rounded-lg bg-white/[0.06] border border-white/[0.09] text-xs sm:text-sm text-neutral-200 font-mono font-medium shadow-sm">
              Service
            </div>
            <span className="text-neutral-400 text-sm font-mono font-bold">→</span>
            <div className="flex-1 py-1.5 px-2.5 text-center rounded-lg bg-white/[0.06] border border-white/[0.09] text-xs sm:text-sm text-neutral-300 font-mono font-medium shadow-sm">
              DB
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      {/* 4. Bottom-Right Card: Flying in from outside bottom-right */}
      <motion.div
        variants={cardFlyInVariants('bottom-right', 0.7)}
        initial="initial"
        animate="animate"
        className="absolute bottom-[12%] right-[2%] xl:right-[4%] 2xl:right-[6%] z-30 hidden lg:block w-72 xl:w-80 will-change-transform"
      >
        <FloatingInsightCard depth={10} tiltMax={5}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-300">
              AI Analysis
            </span>
          </div>
          <div className="text-sm sm:text-base font-serif text-white font-semibold mb-1.5">
            Authentication flow mapped
          </div>
          <div className="text-xs sm:text-sm font-serif text-neutral-300 leading-relaxed mb-3.5">
            Identified 12 related files across API Gateway and PostgreSQL connectors.
          </div>
          <div className="w-full h-1.5 bg-white/[0.1] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]"
              initial={{ width: '0%' }}
              animate={{ width: '78%' }}
              transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
            />
          </div>
        </FloatingInsightCard>
      </motion.div>

    </section>
  );
};
export default Hero;
