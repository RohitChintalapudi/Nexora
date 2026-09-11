import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FloatingInsightCard } from './FloatingInsightCard';
import { HaddybhaiyaShader } from './HaddybhaiyaShader';

export const Hero: React.FC = () => {
  const [gpuFailed, setGpuFailed] = useState(false);

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

  const cardVariants = (startX: number, startY: number) => ({
    initial: { x: startX, y: startY, opacity: 0 },
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: 0.6,
      },
    },
  });

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
        <motion.div
          variants={itemVariants}
          className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-md shadow-inner"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-neutral-300">
            Understand the system. Build the future.
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          style={{ 
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.45)'
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
          <motion.a
            href="#getstarted"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm font-sans tracking-wide transition-all text-center shadow-[0_0_28px_rgba(37,99,235,0.4)] hover:shadow-[0_0_36px_rgba(37,99,235,0.6)]"
          >
            Explore your codebase
          </motion.a>
          
          <motion.a
            href="#howitworks"
            whileHover={{ x: 3 }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.25] text-neutral-200 hover:text-white font-medium text-sm font-sans tracking-wide transition-all backdrop-blur-md text-center flex items-center justify-center gap-2"
          >
            See how it works <span className="text-base">→</span>
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        variants={cardVariants(-30, -20)}
        initial="initial"
        animate="animate"
        className="absolute top-[24%] left-[2%] xl:left-[4%] 2xl:left-[8%] z-30 hidden xl:block w-56"
      >
        <FloatingInsightCard depth={12} tiltMax={6}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              Repository Tree
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-medium text-neutral-400">Syncing</span>
            </div>
          </div>
          <div className="font-mono text-[11px] text-neutral-300 space-y-1.5 select-none">
            <div className="flex items-center gap-1 text-neutral-400">
              <span>📁</span> <span>src</span>
            </div>
            <div className="flex items-center gap-1 pl-4 text-neutral-400">
              <span>📁</span> <span>components</span>
            </div>
            <div className="flex items-center justify-between pl-4 py-0.5 px-1.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 font-medium">
              <div className="flex items-center gap-1">
                <span>📁</span> <span>services</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
            </div>
            <div className="flex items-center gap-1 pl-4 text-neutral-400">
              <span>📁</span> <span>api</span>
            </div>
            <div className="flex items-center gap-1 pl-4 text-neutral-400">
              <span>📁</span> <span>database</span>
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      <motion.div
        variants={cardVariants(30, -20)}
        initial="initial"
        animate="animate"
        className="absolute top-[22%] right-[2%] xl:right-[4%] 2xl:right-[8%] z-30 hidden xl:block w-64"
      >
        <FloatingInsightCard depth={18} tiltMax={8}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              Impact Sandbox
            </span>
            <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded bg-white/[0.08] text-neutral-300 border border-white/[0.1]">
              PREDICT
            </span>
          </div>

          <div className="mb-3">
            <div className="text-[9px] text-neutral-400 font-sans uppercase tracking-wider mb-1">Target Change</div>
            <div className="flex items-center gap-1.5 py-1 px-2 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-200 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>services/auth.ts</span>
              <span className="text-[9px] ml-auto text-neutral-400 font-sans">Modified</span>
            </div>
          </div>

          <div>
            <div className="text-[9px] text-neutral-400 font-sans uppercase tracking-wider mb-1.5">Downstream Risks</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between py-1 px-2 rounded bg-white/[0.04] border border-white/[0.06]">
                <span className="text-[10px] font-mono text-neutral-300">gateway/router.ts</span>
                <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded">
                  High Risk
                </span>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded bg-white/[0.04] border border-white/[0.06]">
                <span className="text-[10px] font-mono text-neutral-300">services/user.ts</span>
                <span className="text-[9px] font-sans font-medium px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  Med Risk
                </span>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded bg-white/[0.04] border border-white/[0.06]">
                <span className="text-[10px] font-mono text-neutral-400">tests/auth.test.ts</span>
                <span className="text-[9px] font-sans text-emerald-400 px-1 py-0.5">
                  Safe
                </span>
              </div>
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      <motion.div
        variants={cardVariants(-30, 20)}
        initial="initial"
        animate="animate"
        className="absolute bottom-[10%] left-[2%] xl:left-[3%] 2xl:left-[6%] z-30 hidden 2xl:block w-64"
      >
        <FloatingInsightCard depth={14} tiltMax={7}>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
            Dependency Flow
          </span>
          <div className="flex items-center gap-1.5 select-none">
            <div className="flex-1 py-1 px-2 text-center rounded bg-white/[0.05] border border-white/[0.08] text-[10px] text-neutral-300 font-mono font-medium shadow-sm">
              Auth
            </div>
            <span className="text-neutral-500 text-xs font-mono">→</span>
            <div className="flex-1 py-1 px-2 text-center rounded bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-400 font-mono font-medium shadow-sm">
              Gateway
            </div>
            <span className="text-neutral-500 text-xs font-mono">→</span>
            <div className="flex-1 py-1 px-2 text-center rounded bg-white/[0.05] border border-white/[0.08] text-[10px] text-neutral-300 font-mono font-medium shadow-sm">
              Service
            </div>
            <span className="text-neutral-500 text-xs font-mono">→</span>
            <div className="flex-1 py-1 px-2 text-center rounded bg-white/[0.05] border border-white/[0.08] text-[10px] text-neutral-400 font-mono font-medium shadow-sm">
              DB
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      <motion.div
        variants={cardVariants(30, 20)}
        initial="initial"
        animate="animate"
        className="absolute bottom-[14%] right-[2%] xl:right-[3%] 2xl:right-[8%] z-30 hidden 2xl:block w-60"
      >
        <FloatingInsightCard depth={10} tiltMax={5}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              AI Analysis
            </span>
          </div>
          <div className="text-xs font-sans text-white font-medium mb-1">
            Authentication flow mapped
          </div>
          <div className="text-[10px] font-sans text-neutral-400 leading-normal mb-3">
            Identified 12 related files across API Gateway and PostgreSQL connectors.
          </div>
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
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
