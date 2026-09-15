import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  FileText,
  Network,
  CheckCircle2,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  desc: string;
  meta: string;
  category: string;
  pathD: string;
  speed: number;
}

export const ProblemSection: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isCoreHovered, setIsCoreHovered] = useState(false);

  const tools: ToolItem[] = [
    {
      id: 'code',
      name: 'CODE',
      icon: <Code2 className="w-4 h-4 text-blue-600" />,
      desc: 'Repositories & Modules',
      meta: '142 files indexed',
      category: 'Source Tree',
      pathD: 'M 240 100 C 350 120, 390 200, 480 270',
      speed: 3.2
    },
    {
      id: 'documentation',
      name: 'DOCUMENTATION',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      desc: 'Wiki, Readmes & Specs',
      meta: '18 sources connected',
      category: 'Knowledge',
      pathD: 'M 240 270 C 330 270, 380 270, 480 270',
      speed: 3.6
    },
    {
      id: 'architecture',
      name: 'ARCHITECTURE',
      icon: <Network className="w-4 h-4 text-blue-600" />,
      desc: 'System & Service Maps',
      meta: '12 services detected',
      category: 'Topology',
      pathD: 'M 240 440 C 350 420, 390 340, 480 270',
      speed: 3.4
    },
    {
      id: 'issues',
      name: 'ISSUES',
      icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
      desc: 'Tickets & Active Tasks',
      meta: '24 active tickets',
      category: 'Workflow',
      pathD: 'M 720 100 C 610 120, 570 200, 480 270',
      speed: 3.3
    },
    {
      id: 'ai',
      name: 'AI INTELLIGENCE',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />,
      desc: 'Contextual Code QA',
      meta: 'Grounded semantic answers',
      category: 'Inference',
      pathD: 'M 720 270 C 630 270, 580 270, 480 270',
      speed: 3.5
    },
    {
      id: 'logs',
      name: 'TRACES & LOGS',
      icon: <Terminal className="w-4 h-4 text-blue-600" />,
      desc: 'Execution Handlers',
      meta: '3 environments monitored',
      category: 'Telemetry',
      pathD: 'M 720 440 C 610 420, 570 340, 480 270',
      speed: 3.7
    }
  ];

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setIsCoreHovered(false);
  };

  return (
    <section className="relative py-14 md:py-20 bg-[#F7F7F5] border-t border-black/[0.035] content-layer overflow-hidden" id="problem">
      {/* Background Subtle Tech Dot Matrix Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            The Unified Graph Problem
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-5">
            Modern software is connected.<br />
            Your tools shouldn't be fragmented.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Developers constantly switch between repositories, documentation wikis, architecture diagrams, issue trackers, and terminals just to understand how a single request flows. NEXORA unifies every signal into one live, queryable system graph.
          </p>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP & TABLET: Living Intelligence Graph */}
        {/* ========================================================= */}
        <div
          onMouseLeave={handleMouseLeave}
          className="hidden md:flex relative max-w-5xl mx-auto h-[560px] items-center justify-center select-none"
        >
          {/* SVG Living Data Streams Canvas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 960 540">
            <defs>
              {/* Radial gradient glow for center core */}
              <radialGradient id="coreAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </radialGradient>

              {/* Linear gradient for high-tech conduits */}
              <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Minimal Clean Concentric Rings around Core */}
            <circle cx="480" cy="270" r="95" fill="none" stroke="rgba(0, 0, 0, 0.06)" strokeWidth="1" strokeDasharray="4, 4" />
            <circle cx="480" cy="270" r="150" fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="1" strokeDasharray="5, 6" />
            <circle cx="480" cy="270" r="215" fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="1" strokeDasharray="6, 8" />

            {/* 6 Connected Energy Conduits */}
            {tools.map((tool, idx) => {
              const isDirectHovered = hoveredIdx === idx;
              const isHoveredState = isDirectHovered || isCoreHovered;
              const particleDuration = isHoveredState ? tool.speed * 0.5 : tool.speed;

              return (
                <g key={tool.id}>
                  {/* Outer Glow Path on Active Hover */}
                  {isHoveredState && (
                    <path
                      d={tool.pathD}
                      stroke="rgba(37,99,235,0.2)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}

                  {/* Crisp Base Track Line */}
                  <path
                    d={tool.pathD}
                    stroke={isHoveredState ? '#2563EB' : 'rgba(37,99,235,0.22)'}
                    strokeWidth={isHoveredState ? '2' : '1.5'}
                    strokeDasharray={isHoveredState ? 'none' : '4, 4'}
                    fill="none"
                    className="transition-all duration-300"
                  />

                  {/* Clean Flowing Stream Dash Animation */}
                  <motion.path
                    d={tool.pathD}
                    stroke={isHoveredState ? '#2563EB' : 'rgba(37,99,235,0.7)'}
                    strokeWidth={isHoveredState ? '2.8' : '2'}
                    strokeDasharray="14, 18"
                    strokeLinecap="round"
                    fill="none"
                    animate={{ strokeDashoffset: [0, -64] }}
                    transition={{ repeat: Infinity, duration: isHoveredState ? 0.9 : 1.4, ease: 'linear' }}
                  />

                  {/* Leading Photon Dot 1 */}
                  <motion.circle
                    r={isHoveredState ? '4.5' : '3.5'}
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
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

                  {/* Trailing Photon Dot 2 */}
                  <motion.circle
                    r={isHoveredState ? '3.5' : '2.5'}
                    fill="#60A5FA"
                    stroke="#FFFFFF"
                    strokeWidth="1"
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
                      delay: particleDuration * 0.45,
                      ease: 'easeInOut'
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* ========================================================= */}
          {/* CENTRAL NEXORA LOGO CORE */}
          {/* ========================================================= */}
          <motion.div
            animate={{
              scale: isCoreHovered ? 1.05 : hoveredIdx !== null ? 1.02 : 1,
              borderColor: (isCoreHovered || hoveredIdx !== null) ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)',
              boxShadow: (isCoreHovered || hoveredIdx !== null)
                ? '0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0,0,0,0.04)'
                : '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onMouseEnter={() => setIsCoreHovered(true)}
            onMouseLeave={() => setIsCoreHovered(false)}
            className="absolute z-20 w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white flex items-center justify-center border border-black/[0.08] cursor-pointer shadow-sm select-none"
          >
            {/* Big Black Nexora N Logo */}
            <svg
              width="72"
              height="72"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              <path
                d="M 11 30 L 11 10 L 29 30 L 29 10"
                stroke="#000000"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="11" cy="10" r="3.5" fill="#000000" />
              <circle cx="11" cy="30" r="3.5" fill="#000000" />
              <circle cx="20" cy="20" r="3" fill="#000000" />
              <circle cx="29" cy="10" r="3.5" fill="#000000" />
              <circle cx="29" cy="30" r="3.5" fill="#000000" />
            </svg>
          </motion.div>

          {/* ========================================================= */}
          {/* THE 6 SURROUNDING HIGH-TECH SIGNAL CARDS */}
          {/* ========================================================= */}
          {tools.map((tool, idx) => {
            const isHovered = hoveredIdx === idx;
            const isActive = isHovered || isCoreHovered;

            // Positioning layout
            const isLeft = idx < 3;
            const yPositions = ['top-[4%]', 'top-[41%]', 'bottom-[4%]'];
            const yPosClass = yPositions[idx % 3];
            const xPosClass = isLeft 
              ? (idx === 1 ? 'left-[0%] lg:left-[2%]' : 'left-[2%] lg:left-[5%]')
              : (idx === 4 ? 'right-[0%] lg:right-[2%]' : 'right-[2%] lg:right-[5%]');

            return (
              <motion.div
                key={tool.id}
                className={`absolute ${yPosClass} ${xPosClass} z-10 flex items-center justify-center`}
              >
                <motion.div
                  animate={{
                    y: isActive ? -4 : 0,
                    scale: isActive ? 1.03 : 1,
                    borderColor: isActive ? '#2563EB' : 'rgba(0,0,0,0.06)',
                    boxShadow: isActive 
                      ? '0 16px 36px rgba(37,99,235,0.12), 0 4px 12px rgba(37,99,235,0.06)'
                      : '0 4px 16px rgba(0,0,0,0.025), 0 1px 3px rgba(0,0,0,0.015)'
                  }}
                  transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="w-56 sm:w-60 p-4 rounded-2xl bg-white/95 backdrop-blur-md border cursor-pointer flex flex-col items-start gap-2.5 transition-all duration-300 group"
                >
                  {/* Card Header Row: Icon Badge + Category + Status Dot */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center shadow-2xs text-blue-600">
                        {tool.icon}
                      </div>
                      <div>
                        <div className="text-neutral-900 font-bold text-xs tracking-wider font-mono">
                          {tool.name}
                        </div>
                        <div className="text-[10px] font-mono text-blue-600 font-semibold">
                          {tool.category}
                        </div>
                      </div>
                    </div>

                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600 animate-ping' : 'bg-neutral-300'}`} />
                  </div>

                  {/* Card Body: Description */}
                  <div className="w-full">
                    <div className="text-neutral-700 text-xs sm:text-sm font-serif font-medium leading-snug">
                      {tool.desc}
                    </div>
                  </div>

                  {/* Card Footer: Metadata Tag */}
                  <div className="w-full pt-1.5 border-t border-black/[0.04] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100/80 px-2 py-0.5 rounded-md">
                      {tool.meta}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-neutral-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

        </div>

        {/* ========================================================= */}
        {/* MOBILE VIEW: Clean Vertical Connected Flow */}
        {/* ========================================================= */}
        <div className="md:hidden flex flex-col gap-4 max-w-sm mx-auto select-none">
          
          {/* Top 3 Cards */}
          <div className="space-y-3">
            {tools.slice(0, 3).map((tool) => (
              <div
                key={tool.id}
                className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center">
                      {tool.icon}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-neutral-900">{tool.name}</div>
                      <div className="text-[10px] text-blue-600 font-mono font-medium">{tool.category}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                    Connected
                  </span>
                </div>
                <div className="text-xs text-neutral-700 font-serif font-medium">{tool.desc}</div>
                <div className="text-[10px] text-neutral-500 font-mono bg-neutral-100/70 px-2 py-0.5 rounded-md self-start">
                  {tool.meta}
                </div>
              </div>
            ))}
          </div>

          {/* Central NEXORA Connector */}
          <div className="flex flex-col items-center justify-center my-3">
            <div className="h-6 w-[1.5px] bg-neutral-300" />
            
            <div className="w-20 h-20 rounded-full bg-white border border-black/[0.08] shadow-sm flex items-center justify-center select-none">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 11 30 L 11 10 L 29 30 L 29 10"
                  stroke="#000000"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="11" cy="10" r="3" fill="#000000" />
                <circle cx="11" cy="30" r="3" fill="#000000" />
                <circle cx="20" cy="20" r="2.5" fill="#000000" />
                <circle cx="29" cy="10" r="3" fill="#000000" />
                <circle cx="29" cy="30" r="3" fill="#000000" />
              </svg>
            </div>

            <div className="h-6 w-[1.5px] bg-neutral-300" />
          </div>

          {/* Bottom 3 Cards */}
          <div className="space-y-3">
            {tools.slice(3, 6).map((tool) => (
              <div
                key={tool.id}
                className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center">
                      {tool.icon}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-neutral-900">{tool.name}</div>
                      <div className="text-[10px] text-blue-600 font-mono font-medium">{tool.category}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                    Connected
                  </span>
                </div>
                <div className="text-xs text-neutral-700 font-serif font-medium">{tool.desc}</div>
                <div className="text-[10px] text-neutral-500 font-mono bg-neutral-100/70 px-2 py-0.5 rounded-md self-start">
                  {tool.meta}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
