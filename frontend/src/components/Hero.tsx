import React from 'react';
import { motion } from 'framer-motion';
import { FloatingInsightCard } from './FloatingInsightCard';

export const Hero: React.FC = () => {
  // Framer motion variants for stagger entries
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
        ease: [0.16, 1, 0.3, 1] as const, // premium cubic-bezier easeOut
      },
    },
  };

  const cardVariants = (startX: number, startY: number) => ({
    initial: { x: startX, y: startY, opacity: 0, scale: 0.95 },
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: 0.6,
      },
    },
  });

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-12 overflow-hidden px-6 content-layer">
      
      {/* Central Content */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-20 max-w-3xl text-center flex flex-col items-center"
      >
        {/* Eyebrow / Tagline */}
        <motion.div
          variants={itemVariants}
          className="mb-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.035] border border-black/[0.04] backdrop-blur-[2px]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-neutral-500">
            Understand the system. Build the future.
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.08] mb-6 max-w-2xl"
        >
          Understand your{' '}
          <span className="text-neutral-400 font-light">entire software</span>.
          <br />
          Build the future.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-neutral-500 text-base sm:text-lg font-sans max-w-xl mb-10 leading-relaxed"
        >
          NEXORA maps your software, understands its architecture, and helps you explore every connection with AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <motion.a
            href="#getstarted"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm font-sans tracking-wide transition-colors text-center shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25"
          >
            Explore your codebase
          </motion.a>
          
          <motion.a
            href="#howitworks"
            whileHover={{ x: 3 }}
            className="w-full sm:w-auto px-6 py-3 text-neutral-600 hover:text-neutral-950 font-medium text-sm font-sans tracking-wide transition-all text-center flex items-center justify-center gap-1.5"
          >
            See how it works <span className="text-base">→</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Floating UI Elements (Parallax & Tilt) */}
      
      {/* 1. Top Left: Repository Structure */}
      <motion.div
        variants={cardVariants(-30, -20)}
        initial="initial"
        animate="animate"
        className="absolute top-[12%] left-[2%] xl:left-[4%] 2xl:left-[8%] z-30 hidden xl:block w-56"
      >
        <FloatingInsightCard depth={12} tiltMax={6}>
          <div className="flex items-center justify-between border-b border-black/[0.04] pb-2 mb-2.5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              Repository Tree
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-medium text-neutral-400">Syncing</span>
            </div>
          </div>
          <div className="font-mono text-[11px] text-neutral-600 space-y-1.5 select-none">
            <div className="flex items-center gap-1 text-neutral-400">
              <span>📁</span> <span>src</span>
            </div>
            <div className="flex items-center gap-1 pl-4 text-neutral-500">
              <span>📁</span> <span>components</span>
            </div>
            <div className="flex items-center justify-between pl-4 py-0.5 px-1 rounded bg-blue-50/50 border border-blue-100/30 text-blue-600 font-medium">
              <div className="flex items-center gap-1">
                <span>📁</span> <span>services</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-blue-500" />
            </div>
            <div className="flex items-center gap-1 pl-4 text-neutral-500">
              <span>📁</span> <span>api</span>
            </div>
            <div className="flex items-center gap-1 pl-4 text-neutral-500">
              <span>📁</span> <span>database</span>
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      {/* 2. Top Right: Architecture Insight */}
      <motion.div
        variants={cardVariants(30, -20)}
        initial="initial"
        animate="animate"
        className="absolute top-[10%] right-[2%] xl:right-[4%] 2xl:right-[8%] z-30 hidden xl:block w-60"
      >
        <FloatingInsightCard depth={18} tiltMax={8}>
          <div className="flex items-center justify-between border-b border-black/[0.04] pb-2 mb-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              System Overview
            </span>
            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
              v1.4.0
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="p-1.5 rounded-lg bg-neutral-50 border border-neutral-100/50">
              <div className="text-neutral-900 font-semibold text-xs font-sans">12</div>
              <div className="text-[9px] text-neutral-400">Services</div>
            </div>
            <div className="p-1.5 rounded-lg bg-neutral-50 border border-neutral-100/50">
              <div className="text-neutral-900 font-semibold text-xs font-sans">48</div>
              <div className="text-[9px] text-neutral-400">Comps</div>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-50/20 border border-blue-500/10 text-blue-600">
              <div className="font-semibold text-xs font-sans">127</div>
              <div className="text-[9px] opacity-80">Deps</div>
            </div>
          </div>
          
          {/* Micro graphic representing a microservice map */}
          <div className="flex items-center justify-center gap-3 py-1.5 bg-neutral-50/50 rounded-lg border border-neutral-100/50">
            <span className="w-2 h-2 rounded bg-neutral-300" />
            <span className="w-4 border-t border-dashed border-neutral-300" />
            <span className="w-2.5 h-2.5 rounded bg-blue-500 shadow-sm shadow-blue-500/20 animate-pulse" />
            <span className="w-4 border-t border-dashed border-neutral-300" />
            <span className="w-2 h-2 rounded bg-neutral-300" />
          </div>
        </FloatingInsightCard>
      </motion.div>

      {/* 3. Bottom Left: Dependency Flow */}
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
            <div className="flex-1 py-1 px-2 text-center rounded bg-neutral-50 border border-neutral-200/50 text-[10px] text-neutral-600 font-mono font-medium shadow-sm">
              Auth
            </div>
            <span className="text-neutral-300 text-xs font-mono">→</span>
            <div className="flex-1 py-1 px-2 text-center rounded bg-blue-50 border border-blue-200/50 text-[10px] text-blue-600 font-mono font-medium shadow-sm">
              Gateway
            </div>
            <span className="text-neutral-300 text-xs font-mono">→</span>
            <div className="flex-1 py-1 px-2 text-center rounded bg-neutral-50 border border-neutral-200/50 text-[10px] text-neutral-600 font-mono font-medium shadow-sm">
              Service
            </div>
            <span className="text-neutral-300 text-xs font-mono">→</span>
            <div className="flex-1 py-1 px-2 text-center rounded bg-neutral-50 border border-neutral-200/50 text-[10px] text-neutral-400 font-mono font-medium shadow-sm">
              DB
            </div>
          </div>
        </FloatingInsightCard>
      </motion.div>

      {/* 4. Bottom Right: AI Insight */}
      <motion.div
        variants={cardVariants(30, 20)}
        initial="initial"
        animate="animate"
        className="absolute bottom-[14%] right-[2%] xl:right-[3%] 2xl:right-[8%] z-30 hidden 2xl:block w-60"
      >
        <FloatingInsightCard depth={10} tiltMax={5}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              AI Analysis
            </span>
          </div>
          <div className="text-xs font-sans text-neutral-800 font-medium mb-1">
            Authentication flow mapped
          </div>
          <div className="text-[10px] font-sans text-neutral-400 leading-normal mb-3">
            Identified 12 related files across API Gateway and PostgreSQL connectors.
          </div>
          {/* Pulsing visual AI bar */}
          <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
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
