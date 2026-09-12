import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ToolItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
  meta: string;
  pathD: string;
  speed: number;
}

export const ProblemSection: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isCoreHovered, setIsCoreHovered] = useState(false);

  // Exact 6 original tools, emojis & metadata from before
  const tools: ToolItem[] = [
    {
      id: 'code',
      name: 'CODE',
      icon: '💻',
      desc: 'Repositories',
      meta: '142 files indexed',
      pathD: 'M 180 110 Q 295 160 345 220',
      speed: 2.8
    },
    {
      id: 'documentation',
      name: 'DOCUMENTATION',
      icon: '📄',
      desc: 'Wiki & Readmes',
      meta: '18 sources connected',
      pathD: 'M 160 250 Q 280 250 335 250',
      speed: 3.2
    },
    {
      id: 'architecture',
      name: 'ARCHITECTURE',
      icon: '📐',
      desc: 'System Maps',
      meta: '12 services detected',
      pathD: 'M 180 390 Q 295 340 345 280',
      speed: 3.0
    },
    {
      id: 'issues',
      name: 'ISSUES',
      icon: '🎫',
      desc: 'Tickets & Tasks',
      meta: '24 active issues',
      pathD: 'M 620 110 Q 505 160 455 220',
      speed: 2.9
    },
    {
      id: 'ai',
      name: 'AI',
      icon: '🤖',
      desc: 'Contextual Intelligence',
      meta: 'Repository-aware answers',
      pathD: 'M 640 250 Q 520 250 465 250',
      speed: 3.1
    },
    {
      id: 'logs',
      name: 'LOGS',
      icon: '📝',
      desc: 'Trace Outputs',
      meta: '3 environments monitored',
      pathD: 'M 620 390 Q 505 340 455 280',
      speed: 3.3
    }
  ];

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setIsCoreHovered(false);
  };

  return (
    <section className="relative py-12 md:py-18 bg-[#F7F7F5] border-t border-black/[0.035] content-layer overflow-hidden" id="problem">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-3">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-5">
            Modern software is connected.<br />
            Your tools shouldn't be fragmented.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed font-sans">
            Developers constantly move between repositories, documentation, architecture diagrams, issue trackers, terminals, and AI tools just to understand how a system works. NEXORA brings that understanding into one intelligent workspace.
          </p>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP & TABLET: Living Intelligence Graph */}
        {/* ========================================================= */}
        <div
          onMouseLeave={handleMouseLeave}
          className="hidden md:flex relative max-w-5xl mx-auto h-[520px] items-center justify-center select-none"
        >
          {/* SVG Living Data Streams Canvas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 500">
            {/* Concentric Intelligence Orbit Rings around NEXORA Core */}
            <circle cx="400" cy="250" r="70" fill="none" stroke="rgba(37,99,235,0.15)" strokeWidth="1.2" strokeDasharray="3, 3" />
            <circle cx="400" cy="250" r="115" fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="1" strokeDasharray="4, 4" />
            <circle cx="400" cy="250" r="165" fill="none" stroke="rgba(37,99,235,0.05)" strokeWidth="1" strokeDasharray="5, 5" />

            {/* Clean Solid Blue Flowing Streams for ALL 6 Links */}
            {tools.map((tool, idx) => {
              const isDirectHovered = hoveredIdx === idx;
              const isHoveredState = isDirectHovered || isCoreHovered;
              const particleDuration = isHoveredState ? tool.speed * 0.6 : tool.speed;

              return (
                <g key={tool.id}>
                  {/* Crisp Base Track Line */}
                  <path
                    d={tool.pathD}
                    stroke={isHoveredState ? 'rgba(37,99,235,0.35)' : 'rgba(37,99,235,0.2)'}
                    strokeWidth={isHoveredState ? '2' : '1.5'}
                    strokeDasharray="4, 4"
                    fill="none"
                    className="transition-all duration-200"
                  />

                  {/* Clean Solid Blue Flowing Stream */}
                  <motion.path
                    d={tool.pathD}
                    stroke="#2563EB"
                    strokeWidth={isHoveredState ? '2.8' : '2.2'}
                    strokeDasharray="12, 16"
                    strokeLinecap="round"
                    fill="none"
                    animate={{ strokeDashoffset: [0, -56] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  />

                  {/* Leading Solid Blue Particle Dot 1 */}
                  <motion.circle
                    r={isHoveredState ? '4' : '3.5'}
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    className="transition-all duration-200"
                    style={{
                      offsetPath: `path("${tool.pathD}")`,
                    }}
                    animate={{
                      offsetDistance: ['0%', '100%'],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: particleDuration,
                      ease: 'easeInOut'
                    }}
                  />

                  {/* Trailing Solid Blue Particle Dot 2 */}
                  <motion.circle
                    r={isHoveredState ? '3' : '2.5'}
                    fill="#3B82F6"
                    className="transition-all duration-200"
                    style={{
                      offsetPath: `path("${tool.pathD}")`,
                    }}
                    animate={{
                      offsetDistance: ['0%', '100%'],
                      opacity: [0, 0.9, 0.9, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: particleDuration,
                      delay: particleDuration * 0.4,
                      ease: 'easeInOut'
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* ========================================================= */}
          {/* CENTRAL NEXORA INTELLIGENCE CORE */}
          {/* ========================================================= */}
          <motion.div
            animate={{
              scale: isCoreHovered ? 1.05 : hoveredIdx !== null ? 1.02 : [1, 1.015, 1],
              boxShadow: (isCoreHovered || hoveredIdx !== null)
                ? '0 16px 44px rgba(37, 99, 235, 0.14), 0 0 24px rgba(37, 99, 235, 0.1)'
                : '0 8px 32px rgba(37, 99, 235, 0.07)'
            }}
            transition={{
              scale: isCoreHovered ? { duration: 0.2 } : { repeat: Infinity, duration: 3.6, ease: 'easeInOut' },
              boxShadow: { duration: 0.3 }
            }}
            onMouseEnter={() => setIsCoreHovered(true)}
            onMouseLeave={() => setIsCoreHovered(false)}
            className="absolute z-20 w-36 h-36 rounded-full bg-white flex flex-col items-center justify-center border border-blue-500/25 text-center p-3 cursor-pointer shadow-sm select-none"
          >
            {/* Concentric ping aura */}
            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping opacity-25" style={{ animationDuration: '3.2s' }} />

            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-blue-600 mb-0.5">
              NEXORA
            </span>
            <span className="text-[8.5px] font-semibold text-neutral-400 font-sans leading-tight">
              One context. Every signal.
            </span>
          </motion.div>

          {/* ========================================================= */}
          {/* THE 6 ORIGINAL SURROUNDING CARDS */}
          {/* ========================================================= */}
          {tools.map((tool, idx) => {
            const isHovered = hoveredIdx === idx;
            const isActive = isHovered || isCoreHovered;

            // Absolute positioning anchors based on index (Left 3, Right 3)
            const isLeft = idx < 3;
            const yPositions = ['top-[8%]', 'top-[44%]', 'bottom-[8%]'];
            const yPosClass = yPositions[idx % 3];
            const xPosClass = isLeft 
              ? (idx === 1 ? 'left-[0%] sm:left-[2%] lg:left-[4%]' : 'left-[3%] sm:left-[6%] lg:left-[10%]')
              : (idx === 4 ? 'right-[0%] sm:right-[2%] lg:right-[4%]' : 'right-[3%] sm:right-[6%] lg:right-[10%]');

            return (
              <motion.div
                key={tool.id}
                className={`absolute ${yPosClass} ${xPosClass} z-10 flex items-center justify-center`}
              >
                <motion.div
                  animate={{
                    y: isActive ? -3 : 0,
                    scale: isActive ? 1.03 : 1,
                    borderColor: isActive ? 'rgba(37,99,235,0.35)' : 'rgba(0,0,0,0.045)',
                    boxShadow: isActive 
                      ? '0 10px 24px rgba(37,99,235,0.08), 0 2px 8px rgba(0,0,0,0.02)'
                      : '0 2px 8px rgba(0,0,0,0.015)'
                  }}
                  transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="w-36 sm:w-44 p-3.5 rounded-xl bg-white border cursor-pointer flex flex-col items-start gap-1.5 transition-colors duration-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl select-none">{tool.icon}</span>
                    <div className="text-neutral-800 font-bold text-[10px] tracking-wider font-sans leading-none">
                      {tool.name}
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="text-neutral-500 text-[10px] font-sans font-medium">
                      {tool.desc}
                    </div>
                    <div className="text-neutral-300 text-[8.5px] font-mono mt-0.5">
                      {tool.meta}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

        </div>

        {/* ========================================================= */}
        {/* MOBILE VIEW: Balanced 6-Card Flow */}
        {/* ========================================================= */}
        <div className="md:hidden flex flex-col gap-4 max-w-sm mx-auto select-none">
          
          {/* Top 3 Cards */}
          <div className="space-y-2.5">
            {tools.slice(0, 3).map((tool) => (
              <div
                key={tool.id}
                className="p-3.5 rounded-xl bg-white border border-black/[0.045] shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg select-none">{tool.icon}</span>
                  <div>
                    <div className="font-sans font-bold text-xs text-neutral-900">{tool.name}</div>
                    <div className="text-[10px] text-neutral-500 font-medium">{tool.desc}</div>
                    <div className="text-[8.5px] text-neutral-300 font-mono">{tool.meta}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-blue-600 bg-blue-50/70 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>

          {/* Central NEXORA Connector */}
          <div className="flex flex-col items-center justify-center my-1">
            <div className="h-5 w-[2px] bg-gradient-to-b from-blue-200 to-blue-500" />
            
            <div className="w-full p-3.5 rounded-xl bg-white border border-blue-500/25 text-center shadow-sm relative overflow-hidden">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                NEXORA
              </span>
              <span className="text-[9px] font-semibold text-neutral-400 font-sans leading-tight block">
                One context. Every signal.
              </span>
            </div>

            <div className="h-5 w-[2px] bg-gradient-to-b from-blue-500 to-blue-200" />
          </div>

          {/* Bottom 3 Cards */}
          <div className="space-y-2.5">
            {tools.slice(3, 6).map((tool) => (
              <div
                key={tool.id}
                className="p-3.5 rounded-xl bg-white border border-black/[0.045] shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg select-none">{tool.icon}</span>
                  <div>
                    <div className="font-sans font-bold text-xs text-neutral-900">{tool.name}</div>
                    <div className="text-[10px] text-neutral-500 font-medium">{tool.desc}</div>
                    <div className="text-[8.5px] text-neutral-300 font-mono">{tool.meta}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-blue-600 bg-blue-50/70 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
