import React from 'react';
import { motion } from 'framer-motion';

export const ProblemSection: React.FC = () => {
  const tools = [
    { name: 'Code', icon: '💻', desc: 'Repositories' },
    { name: 'Documentation', icon: '📄', desc: 'Wikis & Readmes' },
    { name: 'Architecture', icon: '📐', desc: 'Static Diagrams' },
    { name: 'Issues', icon: '🎫', desc: 'Tickets & Tasks' },
    { name: 'AI', icon: '🤖', desc: 'Generic Chatbots' },
    { name: 'Logs', icon: '📝', desc: 'Trace Outputs' },
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="problem">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
            Modern software is connected.<br />
            Your tools shouldn't be fragmented.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Developers constantly move between repositories, documentation, architecture diagrams, issue trackers, terminals, and AI tools just to understand how a system works. NEXORA brings that understanding into one intelligent workspace.
          </p>
        </div>

        {/* Visual Connectivity Hub */}
        <div className="relative max-w-4xl mx-auto h-[450px] md:h-[500px] flex items-center justify-center overflow-hidden">
          
          {/* SVG Animated Connector Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 500">
            {/* Top-Left to Center */}
            <motion.path d="M 180 120 Q 300 200 400 250" stroke="rgba(17, 17, 17, 0.08)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
            <motion.path d="M 180 120 Q 300 200 400 250" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="8, 25" strokeDashoffset="0" fill="none"
              animate={{ strokeDashoffset: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            />

            {/* Left to Center */}
            <motion.path d="M 130 250 Q 250 250 400 250" stroke="rgba(17, 17, 17, 0.08)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
            <motion.path d="M 130 250 Q 250 250 400 250" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="8, 25" strokeDashoffset="0" fill="none"
              animate={{ strokeDashoffset: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
            />

            {/* Bottom-Left to Center */}
            <motion.path d="M 180 380 Q 300 300 400 250" stroke="rgba(17, 17, 17, 0.08)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
            <motion.path d="M 180 380 Q 300 300 400 250" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="8, 25" strokeDashoffset="0" fill="none"
              animate={{ strokeDashoffset: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "linear" }}
            />

            {/* Top-Right to Center */}
            <motion.path d="M 620 120 Q 500 200 400 250" stroke="rgba(17, 17, 17, 0.08)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
            <motion.path d="M 620 120 Q 500 200 400 250" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="8, 25" strokeDashoffset="0" fill="none"
              animate={{ strokeDashoffset: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }}
            />

            {/* Right to Center */}
            <motion.path d="M 670 250 Q 550 250 400 250" stroke="rgba(17, 17, 17, 0.08)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
            <motion.path d="M 670 250 Q 550 250 400 250" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="8, 25" strokeDashoffset="0" fill="none"
              animate={{ strokeDashoffset: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />

            {/* Bottom-Right to Center */}
            <motion.path d="M 620 380 Q 500 300 400 250" stroke="rgba(17, 17, 17, 0.08)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
            <motion.path d="M 620 380 Q 500 300 400 250" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="8, 25" strokeDashoffset="0" fill="none"
              animate={{ strokeDashoffset: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "linear" }}
            />
          </svg>

          {/* Central Target Node: NEXORA */}
          <div className="absolute z-10 w-36 h-36 rounded-full bg-white flex flex-col items-center justify-center border border-blue-500/20 shadow-[0_8px_40px_rgba(37,99,235,0.06),_0_0_20px_rgba(37,99,235,0.03)] text-center p-3 select-none">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-blue-600 mb-0.5">
              NEXORA
            </span>
            <span className="text-[9px] font-medium text-neutral-400 font-sans leading-tight">
              One Connected Understanding
            </span>
            <div className="absolute inset-0 rounded-full border border-blue-500/25 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          </div>

          {/* Fragmented Tools Outer Shell */}
          {/* Card 1: Top Left */}
          <motion.div
            initial={{ opacity: 0, x: -35, y: -25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="absolute top-[8%] left-[2%] sm:left-[10%] xl:left-[15%] w-36 sm:w-40 p-3 sm:p-4 rounded-xl bg-white border border-black/[0.045] shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center gap-2.5"
          >
            <span className="text-xl sm:text-2xl">{tools[0].icon}</span>
            <div>
              <div className="text-neutral-800 font-medium text-xs sm:text-sm font-sans leading-tight">{tools[0].name}</div>
              <div className="text-neutral-400 text-[10px] font-sans mt-0.5">{tools[0].desc}</div>
            </div>
          </motion.div>

          {/* Card 2: Left */}
          <motion.div
            initial={{ opacity: 0, x: -45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute top-[45%] left-[0%] sm:left-[4%] xl:left-[8%] w-36 sm:w-40 p-3 sm:p-4 rounded-xl bg-white border border-black/[0.045] shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center gap-2.5"
          >
            <span className="text-xl sm:text-2xl">{tools[1].icon}</span>
            <div>
              <div className="text-neutral-800 font-medium text-xs sm:text-sm font-sans leading-tight">{tools[1].name}</div>
              <div className="text-neutral-400 text-[10px] font-sans mt-0.5">{tools[1].desc}</div>
            </div>
          </motion.div>

          {/* Card 3: Bottom Left */}
          <motion.div
            initial={{ opacity: 0, x: -35, y: 25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute bottom-[8%] left-[2%] sm:left-[10%] xl:left-[15%] w-36 sm:w-40 p-3 sm:p-4 rounded-xl bg-white border border-black/[0.045] shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center gap-2.5"
          >
            <span className="text-xl sm:text-2xl">{tools[2].icon}</span>
            <div>
              <div className="text-neutral-800 font-medium text-xs sm:text-sm font-sans leading-tight">{tools[2].name}</div>
              <div className="text-neutral-400 text-[10px] font-sans mt-0.5">{tools[2].desc}</div>
            </div>
          </motion.div>

          {/* Card 4: Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 35, y: -25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="absolute top-[8%] right-[2%] sm:right-[10%] xl:right-[15%] w-36 sm:w-40 p-3 sm:p-4 rounded-xl bg-white border border-black/[0.045] shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center gap-2.5"
          >
            <span className="text-xl sm:text-2xl">{tools[3].icon}</span>
            <div>
              <div className="text-neutral-800 font-medium text-xs sm:text-sm font-sans leading-tight">{tools[3].name}</div>
              <div className="text-neutral-400 text-[10px] font-sans mt-0.5">{tools[3].desc}</div>
            </div>
          </motion.div>

          {/* Card 5: Right */}
          <motion.div
            initial={{ opacity: 0, x: 45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="absolute top-[45%] right-[0%] sm:right-[4%] xl:right-[8%] w-36 sm:w-40 p-3 sm:p-4 rounded-xl bg-white border border-black/[0.045] shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center gap-2.5"
          >
            <span className="text-xl sm:text-2xl">{tools[4].icon}</span>
            <div>
              <div className="text-neutral-800 font-medium text-xs sm:text-sm font-sans leading-tight">{tools[4].name}</div>
              <div className="text-neutral-400 text-[10px] font-sans mt-0.5">{tools[4].desc}</div>
            </div>
          </motion.div>

          {/* Card 6: Bottom Right */}
          <motion.div
            initial={{ opacity: 0, x: 35, y: 25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="absolute bottom-[8%] right-[2%] sm:right-[10%] xl:right-[15%] w-36 sm:w-40 p-3 sm:p-4 rounded-xl bg-white border border-black/[0.045] shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center gap-2.5"
          >
            <span className="text-xl sm:text-2xl">{tools[5].icon}</span>
            <div>
              <div className="text-neutral-800 font-medium text-xs sm:text-sm font-sans leading-tight">{tools[5].name}</div>
              <div className="text-neutral-400 text-[10px] font-sans mt-0.5">{tools[5].desc}</div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
export default ProblemSection;
