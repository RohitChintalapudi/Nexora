import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { TechIcons } from './TechIcons';
import { Sparkles, ArrowDown } from 'lucide-react';

interface TechNodeData {
  id: string;
  name: string;
  category: string;
  role: string;
  icon: keyof typeof TechIcons;
  initAngle: number;    // degrees (dispersed start)
  initRadius: number;   // px at desktop
  finalAngle: number;   // degrees in converged orbit
  finalRadius: number;  // px in tight orbit around Nexora
  swirlDeg: number;     // orbital swirl curve magnitude
  tier: 1 | 2;          // 1 = core tier, 2 = full ecosystem tier
}

const TECH_NODES: TechNodeData[] = [
  // Primary Core Tier (10 nodes)
  { id: 'react', name: 'React', category: 'Frontend', role: 'Component Architecture', icon: 'react', initAngle: 90, initRadius: 380, finalAngle: 90, finalRadius: 126, swirlDeg: 70, tier: 1 },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', role: 'Full-Stack SSR & Routing', icon: 'nextjs', initAngle: 45, initRadius: 440, finalAngle: 54, finalRadius: 160, swirlDeg: -80, tier: 1 },
  { id: 'typescript', name: 'TypeScript', category: 'Language', role: 'Static Types & AST', icon: 'typescript', initAngle: 135, initRadius: 400, finalAngle: 126, finalRadius: 126, swirlDeg: 75, tier: 1 },
  { id: 'nodejs', name: 'Node.js', category: 'Backend', role: 'Server Runtime & Event Loop', icon: 'nodejs', initAngle: 10, initRadius: 370, finalAngle: 18, finalRadius: 126, swirlDeg: -60, tier: 1 },
  { id: 'python', name: 'Python', category: 'Language', role: 'Core Logic & AST Analysis', icon: 'python', initAngle: 170, initRadius: 390, finalAngle: 162, finalRadius: 126, swirlDeg: 70, tier: 1 },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', role: 'Relational Schema & Models', icon: 'postgresql', initAngle: 270, initRadius: 380, finalAngle: 270, finalRadius: 126, swirlDeg: 70, tier: 1 },
  { id: 'redis', name: 'Redis', category: 'Database', role: 'In-Memory Cache & State', icon: 'redis', initAngle: 230, initRadius: 420, finalAngle: 234, finalRadius: 160, swirlDeg: -75, tier: 1 },
  { id: 'graphql', name: 'GraphQL', category: 'API', role: 'Typed Resolvers & Schema', icon: 'graphql', initAngle: 310, initRadius: 410, finalAngle: 306, finalRadius: 160, swirlDeg: 75, tier: 1 },
  { id: 'docker', name: 'Docker', category: 'Infra', role: 'Containerized Services', icon: 'docker', initAngle: 345, initRadius: 430, finalAngle: 342, finalRadius: 160, swirlDeg: -65, tier: 1 },
  { id: 'github', name: 'GitHub', category: 'Infra', role: 'VCS & Repository Source', icon: 'github', initAngle: 195, initRadius: 430, finalAngle: 198, finalRadius: 160, swirlDeg: 65, tier: 1 },

  // Secondary Extended Ecosystem Tier (10 nodes)
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', role: 'Async REST Endpoints', icon: 'fastapi', initAngle: 150, initRadius: 460, finalAngle: 144, finalRadius: 192, swirlDeg: -85, tier: 2 },
  { id: 'express', name: 'Express', category: 'Backend', role: 'HTTP Middleware Pipeline', icon: 'express', initAngle: 30, initRadius: 460, finalAngle: 36, finalRadius: 192, swirlDeg: 70, tier: 2 },
  { id: 'golang', name: 'Go', category: 'Language', role: 'Concurrent Microservices', icon: 'golang', initAngle: 215, initRadius: 450, finalAngle: 216, finalRadius: 192, swirlDeg: -75, tier: 2 },
  { id: 'rust', name: 'Rust', category: 'Language', role: 'Memory-Safe Systems Logic', icon: 'rust', initAngle: 330, initRadius: 450, finalAngle: 324, finalRadius: 192, swirlDeg: 70, tier: 2 },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', role: 'Document Collections', icon: 'mongodb', initAngle: 250, initRadius: 460, finalAngle: 252, finalRadius: 192, swirlDeg: -65, tier: 2 },
  { id: 'vue', name: 'Vue', category: 'Frontend', role: 'Reactivity & Component Trees', icon: 'vue', initAngle: 70, initRadius: 470, finalAngle: 72, finalRadius: 192, swirlDeg: 75, tier: 2 },
  { id: 'javascript', name: 'JavaScript', category: 'Language', role: 'Dynamic Client Logic', icon: 'javascript', initAngle: 110, initRadius: 470, finalAngle: 108, finalRadius: 192, swirlDeg: -70, tier: 2 },
  { id: 'rest', name: 'REST', category: 'API', role: 'HTTP Controller Routes', icon: 'rest', initAngle: 355, initRadius: 470, finalAngle: 0, finalRadius: 192, swirlDeg: 80, tier: 2 },
  { id: 'java', name: 'Java', category: 'Language', role: 'Enterprise Application Services', icon: 'java', initAngle: 180, initRadius: 470, finalAngle: 180, finalRadius: 172, swirlDeg: -55, tier: 2 },
  { id: 'svelte', name: 'Svelte', category: 'Frontend', role: 'Compiled Reactive Components', icon: 'svelte', initAngle: 290, initRadius: 470, finalAngle: 288, finalRadius: 192, swirlDeg: 65, tier: 2 }
];

export const TechnologyConvergence: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Responsive scale factor calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minDimension = Math.min(width, height);

      if (width < 640) {
        setScaleFactor(0.48);
        setIsMobile(true);
      } else if (width < 1024) {
        setScaleFactor(0.72);
        setIsMobile(false);
      } else if (minDimension < 780) {
        setScaleFactor(0.85);
        setIsMobile(false);
      } else {
        setScaleFactor(1);
        setIsMobile(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Physical spring interpolation for continuous responsive scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0005
  });

  // Header fade-out during swirl phase
  const headerOpacity = useTransform(smoothProgress, [0, 0.22, 0.42], [1, 0.7, 0]);
  const headerY = useTransform(smoothProgress, [0, 0.42], [0, -35]);

  // Center Nexora Circle transforms: starts smaller, enlarges to LARGE
  const nexoraScale = useTransform(smoothProgress, [0, 0.35, 0.85, 1], [0.7, 0.9, 1.25, 1.35]);
  const nexoraShadow = useTransform(
    smoothProgress, 
    [0, 0.5, 1], 
    [
      '0 4px 16px rgba(0,0,0,0.12)',
      '0 12px 32px rgba(0,0,0,0.22)',
      '0 24px 64px rgba(0,0,0,0.35)'
    ]
  );
  const ringsOpacity = useTransform(smoothProgress, [0, 0.2, 0.65, 1], [0.25, 0.45, 0.8, 0.95]);

  // Swirl lines light blue opacity
  const swirlLinesOpacity = useTransform(smoothProgress, [0.05, 0.25, 0.75, 1], [0.18, 0.42, 0.38, 0.22]);

  // Post-convergence statement reveal
  const statementOpacity = useTransform(smoothProgress, [0.68, 0.86, 1], [0, 0.95, 1]);
  const statementY = useTransform(smoothProgress, [0.68, 0.86, 1], [25, 0, 0]);

  // Nodes dimming in final state to elevate Nexora logo
  const nodesDimming = useTransform(smoothProgress, [0.72, 0.95], [1, 0.82]);

  const visibleNodes = isMobile ? TECH_NODES.filter(n => n.tier === 1) : TECH_NODES;

  return (
    <section 
      ref={containerRef} 
      className="relative h-[280vh] bg-[#F7F7F5] text-neutral-900 border-t border-black/[0.035] content-layer"
      id="systems"
    >
      {/* Sticky Viewport Stage pinned to screen while scrolling through container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between items-center px-4 sm:px-6 select-none">
        
        {/* Clean Subtle Technical Grid Background on White/Off-white */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_60%)]" />
        </div>

        {/* Section Header (Fades smoothly as user scrolls) */}
        <motion.div 
          style={{ opacity: shouldReduceMotion ? 1 : headerOpacity, y: shouldReduceMotion ? 0 : headerY }}
          className="pt-10 sm:pt-14 z-20 text-center max-w-2xl mx-auto pointer-events-none"
        >
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
            Ecosystem Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.15] mb-3">
            Built to understand the technologies behind your system.
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            From frontend components to backend services, APIs, databases, and dependencies — NEXORA connects the pieces into a clearer picture of your codebase.
          </p>
        </motion.div>

        {/* Central Convergence Stage Container */}
        <div className="relative w-full flex-1 flex items-center justify-center">
          
          {/* SVG Orbital Guides & Light Blue Swirl Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="blueSwirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Central Orbital Rings and Swirl Curves centered on stage */}
            <g className="origin-center" style={{ transform: 'translate(50%, 50%)' }}>
              
              {/* Light Blue Swirl Spiral Curves */}
              {visibleNodes.map((node) => {
                const startRad = (node.initAngle * Math.PI) / 180;
                const startX = (node.initRadius * scaleFactor) * Math.cos(startRad);
                const startY = (node.initRadius * scaleFactor) * Math.sin(startRad);

                const midAngle = (node.initAngle + node.finalAngle) / 2 + node.swirlDeg * 0.55;
                const midRad = (midAngle * Math.PI) / 180;
                const midR = ((node.initRadius + node.finalRadius) / 2) * scaleFactor;
                const midX = midR * Math.cos(midRad);
                const midY = midR * Math.sin(midRad);

                const endRad = (node.finalAngle * Math.PI) / 180;
                const endX = (node.finalRadius * scaleFactor) * Math.cos(endRad);
                const endY = (node.finalRadius * scaleFactor) * Math.sin(endRad);

                const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

                return (
                  <g key={`swirl-${node.id}`}>
                    {/* Curved light blue spiral trajectory */}
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="url(#blueSwirlGrad)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      style={{ opacity: shouldReduceMotion ? 0.25 : swirlLinesOpacity }}
                    />
                    {/* Radial feeder ray pointing into center Nexora emblem */}
                    <motion.line
                      x1={endX}
                      y1={endY}
                      x2={0}
                      y2={0}
                      stroke="rgba(37, 99, 235, 0.18)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      style={{ opacity: shouldReduceMotion ? 0.2 : swirlLinesOpacity }}
                    />
                  </g>
                );
              })}

              {/* Inner Orbit (Tier 1 core) */}
              <motion.circle 
                cx="0" cy="0" r={126 * scaleFactor} 
                fill="none" 
                stroke="rgba(37,99,235,0.22)" 
                strokeWidth="1.2" 
                strokeDasharray="4 4"
                style={{ opacity: shouldReduceMotion ? 0.7 : ringsOpacity }}
              />
              {/* Mid Orbit */}
              <motion.circle 
                cx="0" cy="0" r={160 * scaleFactor} 
                fill="none" 
                stroke="rgba(37,99,235,0.18)" 
                strokeWidth="1" 
                strokeDasharray="6 6"
                style={{ opacity: shouldReduceMotion ? 0.7 : ringsOpacity }}
              />
              {/* Outer Orbit (Tier 2 ecosystem) */}
              {!isMobile && (
                <motion.circle 
                  cx="0" cy="0" r={192 * scaleFactor} 
                  fill="none" 
                  stroke="rgba(37,99,235,0.12)" 
                  strokeWidth="1" 
                  strokeDasharray="8 8"
                  style={{ opacity: shouldReduceMotion ? 0.4 : ringsOpacity }}
                />
              )}
            </g>
          </svg>

          {/* Technology Nodes Constellation */}
          <div className="absolute inset-0 pointer-events-none">
            {visibleNodes.map((node) => (
              <TechNodeItem
                key={node.id}
                node={node}
                progress={smoothProgress}
                scaleFactor={scaleFactor}
                nodesDimming={shouldReduceMotion ? 1 : nodesDimming}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>

          {/* Central NEXORA Focal Point: Black Circle with Pure White Monogram (Enlarges to Large) */}
          <div className="relative z-30 flex flex-col items-center justify-center">
            
            <motion.div
              style={{ 
                scale: shouldReduceMotion ? 1.25 : nexoraScale,
                boxShadow: nexoraShadow
              }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black border-2 border-white/20 flex flex-col items-center justify-center cursor-default transition-all duration-300"
            >
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="overflow-visible"
                >
                  <path
                    d="M 11 30 L 11 10 L 29 30 L 29 10"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="#FFFFFF"
                  />
                  <circle cx="11" cy="10" r="3.6" fill="#FFFFFF" />
                  <circle cx="11" cy="30" r="3.6" fill="#FFFFFF" />
                  <circle cx="20" cy="20" r="3.6" fill="#FFFFFF" />
                  <circle cx="29" cy="10" r="3.6" fill="#FFFFFF" />
                  <circle cx="29" cy="30" r="3.6" fill="#FFFFFF" />
                </svg>
              </div>

              <span className="text-[10px] font-sans font-bold tracking-widest text-white uppercase -mt-0.5">
                NEXORA
              </span>
            </motion.div>
          </div>

        </div>

        {/* Phase 5 — Revealed Statement at Convergence Completion */}
        <motion.div
          style={{ opacity: shouldReduceMotion ? 1 : statementOpacity, y: shouldReduceMotion ? 0 : statementY }}
          className="pb-10 sm:pb-14 z-20 text-center max-w-xl mx-auto pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-mono font-medium text-neutral-800">Unified Architecture Graph</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-sans font-normal text-neutral-900 tracking-tight">
            From technologies to understanding.
          </h3>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-sans">
            One interconnected mental model for your entire stack.
          </p>
        </motion.div>

        {/* Scroll Instruction indicator at start */}
        {!shouldReduceMotion && (
          <motion.div 
            style={{ opacity: useTransform(smoothProgress, [0, 0.12], [1, 0]) }}
            className="absolute bottom-5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 pointer-events-none"
          >
            <span>Scroll to explore convergence</span>
            <ArrowDown className="w-3 h-3 animate-bounce text-neutral-500" />
          </motion.div>
        )}

      </div>
    </section>
  );
};

interface TechNodeItemProps {
  node: TechNodeData;
  progress: any;
  scaleFactor: number;
  nodesDimming: any;
  shouldReduceMotion: boolean | null;
}

const TechNodeItem: React.FC<TechNodeItemProps> = ({
  node,
  progress,
  scaleFactor,
  nodesDimming,
  shouldReduceMotion
}) => {
  const IconComponent = TechIcons[node.icon];

  const initR = node.initRadius * scaleFactor;
  const finalR = node.finalRadius * scaleFactor;
  
  // Calculate intermediate positions with smooth curved spiral trajectory
  const x = useTransform(progress, (p: number) => {
    if (shouldReduceMotion) {
      const rad = (node.finalAngle * Math.PI) / 180;
      return finalR * Math.cos(rad);
    }
    // Normalized transition progress (0.05 -> 0.85)
    const t = Math.min(1, Math.max(0, (p - 0.05) / 0.80));
    // Smooth easeInOut cubic interpolation
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    // Radius contraction from dispersed to tight orbit
    const currentR = initR + (finalR - initR) * easeT;
    
    // Curved orbital swirl angle: maximum curve midway through convergence
    const currentSwirl = node.swirlDeg * Math.sin(t * Math.PI);
    const currentAngle = node.initAngle + (node.finalAngle - node.initAngle) * easeT + currentSwirl;
    const rad = (currentAngle * Math.PI) / 180;
    
    return currentR * Math.cos(rad);
  });

  const y = useTransform(progress, (p: number) => {
    if (shouldReduceMotion) {
      const rad = (node.finalAngle * Math.PI) / 180;
      return finalR * Math.sin(rad);
    }
    const t = Math.min(1, Math.max(0, (p - 0.05) / 0.80));
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    const currentR = initR + (finalR - initR) * easeT;
    const currentSwirl = node.swirlDeg * Math.sin(t * Math.PI);
    const currentAngle = node.initAngle + (node.finalAngle - node.initAngle) * easeT + currentSwirl;
    const rad = (currentAngle * Math.PI) / 180;
    
    return currentR * Math.sin(rad);
  });

  const nodeScale = useTransform(progress, [0, 0.75, 1], [1, 0.96, 0.94]);

  return (
    <motion.div
      style={{
        x,
        y,
        scale: shouldReduceMotion ? 1 : nodeScale,
        opacity: nodesDimming
      }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
    >
      {/* Node Badge: Generously sized badge with large crisp SVG icon */}
      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border bg-white border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center">
        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
          {IconComponent && <IconComponent size={32} />}
        </div>
      </div>
    </motion.div>
  );
};

export default TechnologyConvergence;
