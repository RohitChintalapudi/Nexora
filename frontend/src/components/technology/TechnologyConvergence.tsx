import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import { TextReveal } from '../motion/text-reveal';

interface TechNodeData {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'API' | 'Infra' | 'Language';
  role: string;
  icon: string;
  initAngle: number;
  initRadius: number;
  finalAngle: number;
  finalRadius: number;
  swirlDeg: number;
  tier: 1 | 2;
  petalIndex: number;
}

// 20 Nodes positioned into a stunning 2-tier Symmetrical 10-Petal Flower Mandala around NEXORA
const TECH_NODES: TechNodeData[] = [
  // Tier 1: Inner 10-Petal Flower Blossom (angles 0°, 36°, 72°, 108°, 144°, 180°, 216°, 252°, 288°, 324°)
  { id: 'react', name: 'React', category: 'Frontend', role: 'Component Virtual DOM', icon: 'react', initAngle: 45, initRadius: 400, finalAngle: 0, finalRadius: 118, swirlDeg: 65, tier: 1, petalIndex: 0 },
  { id: 'express', name: 'Express', category: 'Backend', role: 'HTTP Middleware Pipeline', icon: 'express', initAngle: 30, initRadius: 420, finalAngle: 36, finalRadius: 130, swirlDeg: -70, tier: 1, petalIndex: 1 },
  { id: 'vue', name: 'Vue', category: 'Frontend', role: 'Reactivity & Component Trees', icon: 'vue', initAngle: 80, initRadius: 430, finalAngle: 72, finalRadius: 118, swirlDeg: 75, tier: 1, petalIndex: 2 },
  { id: 'javascript', name: 'JavaScript', category: 'Language', role: 'Dynamic Client Logic', icon: 'javascript', initAngle: 110, initRadius: 440, finalAngle: 108, finalRadius: 130, swirlDeg: -65, tier: 1, petalIndex: 3 },
  { id: 'python', name: 'Python', category: 'Language', role: 'Backend Async Logic', icon: 'python', initAngle: 135, initRadius: 400, finalAngle: 144, finalRadius: 118, swirlDeg: 70, tier: 1, petalIndex: 4 },
  { id: 'typescript', name: 'TypeScript', category: 'Language', role: 'Static Typing & Interfaces', icon: 'typescript', initAngle: 165, initRadius: 390, finalAngle: 180, finalRadius: 130, swirlDeg: -60, tier: 1, petalIndex: 5 },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', role: 'Relational Schema & Queries', icon: 'postgresql', initAngle: 220, initRadius: 390, finalAngle: 216, finalRadius: 118, swirlDeg: 65, tier: 1, petalIndex: 6 },
  { id: 'redis', name: 'Redis', category: 'Database', role: 'In-Memory Cache & Queues', icon: 'redis', initAngle: 245, initRadius: 380, finalAngle: 252, finalRadius: 130, swirlDeg: -70, tier: 1, petalIndex: 7 },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', role: 'App Router & Server Actions', icon: 'nextjs', initAngle: 320, initRadius: 400, finalAngle: 288, finalRadius: 118, swirlDeg: 65, tier: 1, petalIndex: 8 },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', role: 'Utility Style System', icon: 'tailwind', initAngle: 20, initRadius: 410, finalAngle: 324, finalRadius: 130, swirlDeg: -65, tier: 1, petalIndex: 9 },

  // Tier 2: Outer Interleaving 10-Petal Flower Crown (angles 18°, 54°, 90°, 126°, 162°, 198°, 234°, 270°, 306°, 342°)
  { id: 'docker', name: 'Docker', category: 'Infra', role: 'Containerized Services', icon: 'docker', initAngle: 350, initRadius: 450, finalAngle: 18, finalRadius: 178, swirlDeg: -60, tier: 2, petalIndex: 10 },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', role: 'Async REST Endpoints', icon: 'fastapi', initAngle: 145, initRadius: 460, finalAngle: 54, finalRadius: 166, swirlDeg: 75, tier: 2, petalIndex: 11 },
  { id: 'svelte', name: 'Svelte', category: 'Frontend', role: 'Compiled Reactive Components', icon: 'svelte', initAngle: 300, initRadius: 440, finalAngle: 90, finalRadius: 178, swirlDeg: -70, tier: 2, petalIndex: 12 },
  { id: 'rest', name: 'REST', category: 'API', role: 'HTTP Controller Routes', icon: 'rest', initAngle: 10, initRadius: 460, finalAngle: 126, finalRadius: 166, swirlDeg: 80, tier: 2, petalIndex: 13 },
  { id: 'java', name: 'Java', category: 'Language', role: 'Enterprise Application Services', icon: 'java', initAngle: 175, initRadius: 460, finalAngle: 162, finalRadius: 178, swirlDeg: -65, tier: 2, petalIndex: 14 },
  { id: 'github', name: 'GitHub', category: 'Infra', role: 'VCS & Repository Source', icon: 'github', initAngle: 195, initRadius: 430, finalAngle: 198, finalRadius: 166, swirlDeg: 65, tier: 2, petalIndex: 15 },
  { id: 'golang', name: 'Go', category: 'Language', role: 'Concurrent Microservices', icon: 'golang', initAngle: 210, initRadius: 450, finalAngle: 234, finalRadius: 178, swirlDeg: -70, tier: 2, petalIndex: 16 },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', role: 'Document Collections', icon: 'mongodb', initAngle: 235, initRadius: 440, finalAngle: 270, finalRadius: 166, swirlDeg: 65, tier: 2, petalIndex: 17 },
  { id: 'rust', name: 'Rust', category: 'Language', role: 'Memory-Safe Systems Logic', icon: 'rust', initAngle: 325, initRadius: 450, finalAngle: 306, finalRadius: 178, swirlDeg: -75, tier: 2, petalIndex: 18 },
  { id: 'graphql', name: 'GraphQL', category: 'API', role: 'Typed Resolvers & Schema', icon: 'graphql', initAngle: 335, initRadius: 440, finalAngle: 342, finalRadius: 166, swirlDeg: 70, tier: 2, petalIndex: 19 }
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
        setScaleFactor(0.44);
        setIsMobile(true);
      } else if (width < 1024) {
        setScaleFactor(0.68);
        setIsMobile(false);
      } else if (minDimension < 780) {
        setScaleFactor(0.8);
        setIsMobile(false);
      } else {
        setScaleFactor(0.95);
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
  const nexoraScale = useTransform(smoothProgress, [0, 0.35, 0.85, 1], [0.75, 0.95, 1.25, 1.35]);
  const nexoraShadow = useTransform(
    smoothProgress, 
    [0, 0.5, 1], 
    [
      '0 4px 16px rgba(0,0,0,0.12)',
      '0 12px 32px rgba(37,99,235,0.18)',
      '0 24px 64px rgba(37,99,235,0.3)'
    ]
  );

  // Flower Rosette & Mandala Blooming Opacity
  const flowerBloomOpacity = useTransform(smoothProgress, [0.45, 0.75, 1], [0, 0.85, 0.95]);
  const swirlLinesOpacity = useTransform(smoothProgress, [0.05, 0.35, 0.7, 0.9], [0.15, 0.45, 0.35, 0.1]);

  // Post-convergence statement reveal
  const statementOpacity = useTransform(smoothProgress, [0.68, 0.86, 1], [0, 0.95, 1]);
  const statementY = useTransform(smoothProgress, [0.68, 0.86, 1], [25, 0, 0]);

  // Nodes elevation in final flower state
  const nodesDimming = useTransform(smoothProgress, [0.72, 0.95], [1, 0.96]);

  const visibleNodes = isMobile ? TECH_NODES.filter(n => n.tier === 1) : TECH_NODES;

  return (
    <section 
      ref={containerRef} 
      className="relative h-[280vh] bg-[#F7F7F5] text-neutral-900 border-t border-black/[0.035] content-layer"
      id="systems"
    >
      {/* Sticky Viewport Stage with generous top padding to prevent header collisions */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between items-center px-4 sm:px-6 select-none pt-12 sm:pt-16 md:pt-20 pb-4 sm:pb-8">
        
        {/* Clean Subtle Technical Grid Background on White/Off-white */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_60%)]" />
        </div>

        {/* Header Title Section: Significant bottom margin to separate from the icon constellation */}
        <motion.div 
          style={{ opacity: headerOpacity, y: headerY }}
          className="text-center max-w-2xl mx-auto mt-2 sm:mt-4 mb-10 sm:mb-16 md:mb-20 px-2 z-30 pointer-events-none relative"
        >
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Ecosystem Intelligence
          </span>
          <TextReveal
            as="h2"
            text="Built to understand the technologies behind your system."
            delay={0.05}
            stagger={0.045}
            blur={6}
            yOffset="20%"
            className="text-2xl sm:text-3xl md:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.15] mb-3"
          />
          <TextReveal
            as="p"
            text="From frontend components to backend services, APIs, databases, and dependencies — NEXORA connects the pieces into a clearer picture of your codebase."
            delay={0.25}
            stagger={0.02}
            blur={5}
            yOffset="15%"
            className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto"
          />
        </motion.div>

        {/* Central Convergence Stage Container (Lowered with top buffer) */}
        <div className="relative w-full flex-1 flex items-center justify-center mt-6 sm:mt-10 md:mt-14 mb-4">
          
          {/* SVG Flower Petal Rosette & Orbital Guides Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="blueSwirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.15" />
              </linearGradient>

              <linearGradient id="flowerPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Central Flower Petals & Swirl Curves centered on stage */}
            <g className="origin-center" style={{ transform: 'translate(50%, 50%)' }}>
              
              {/* Converging Spiral Trajectories */}
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
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="url(#blueSwirlGrad)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      style={{ opacity: shouldReduceMotion ? 0.25 : swirlLinesOpacity }}
                    />
                  </g>
                );
              })}

              {/* ------------------------------------------------------------ */}
              {/* GEOMETRIC FLOWER PETAL ROSETTE MANDALA (REVEALS ON SETTLING) */}
              {/* ------------------------------------------------------------ */}
              {visibleNodes.map((node, i) => {
                const angleRad = (node.finalAngle * Math.PI) / 180;
                const r = node.finalRadius * scaleFactor;
                const tipX = r * Math.cos(angleRad);
                const tipY = r * Math.sin(angleRad);

                // Adjacent petal connection
                const nextNode = visibleNodes[(i + 1) % visibleNodes.length];
                const nextAngleRad = (nextNode.finalAngle * Math.PI) / 180;
                const nextR = nextNode.finalRadius * scaleFactor;
                const nextTipX = nextR * Math.cos(nextAngleRad);
                const nextTipY = nextR * Math.sin(nextAngleRad);

                // Symmetrical Flower Petal Curve from Nexora center through node and out to neighbor
                const petalPath = `M 0 0 Q ${tipX * 1.15} ${tipY * 1.15} ${nextTipX * 0.5} ${nextTipY * 0.5} Z`;

                return (
                  <g key={`flower-petal-${node.id}`}>
                    {/* Petal Outline */}
                    <motion.path
                      d={petalPath}
                      fill="none"
                      stroke="url(#flowerPetalGrad)"
                      strokeWidth="1.2"
                      style={{ opacity: shouldReduceMotion ? 0.6 : flowerBloomOpacity }}
                    />

                    {/* Radial Ray Connecting Petal Tip to Center Emblem */}
                    <motion.line
                      x1={tipX}
                      y1={tipY}
                      x2={0}
                      y2={0}
                      stroke="rgba(59, 130, 246, 0.2)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      style={{ opacity: shouldReduceMotion ? 0.4 : flowerBloomOpacity }}
                    />
                  </g>
                );
              })}

              {/* Central Rosette Core Rings */}
              <motion.circle 
                cx="0" cy="0" r={120 * scaleFactor} 
                fill="none" 
                stroke="rgba(37,99,235,0.22)" 
                strokeWidth="1.2" 
                strokeDasharray="4 4"
                style={{ opacity: shouldReduceMotion ? 0.7 : flowerBloomOpacity }}
              />
              {!isMobile && (
                <motion.circle 
                  cx="0" cy="0" r={172 * scaleFactor} 
                  fill="none" 
                  stroke="rgba(37,99,235,0.15)" 
                  strokeWidth="1" 
                  strokeDasharray="6 6"
                  style={{ opacity: shouldReduceMotion ? 0.5 : flowerBloomOpacity }}
                />
              )}
            </g>
          </svg>

          {/* Technology Nodes Constellation - Settling into Flower Petal Positions */}
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

          {/* Central NEXORA Emblem: Flower Core */}
          <div className="relative z-30 flex flex-col items-center justify-center">
            <motion.div
              style={{ 
                scale: shouldReduceMotion ? 1.25 : nexoraScale,
                boxShadow: nexoraShadow
              }}
              className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-black border-2 border-white/25 flex flex-col items-center justify-center cursor-default transition-all duration-300"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
                <svg
                  width="40"
                  height="40"
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

              <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-widest text-white uppercase -mt-0.5">
                NEXORA
              </span>
            </motion.div>
          </div>

        </div>

        {/* Phase 5 — Revealed Statement at Convergence Completion */}
        <motion.div
          style={{ opacity: shouldReduceMotion ? 1 : statementOpacity, y: shouldReduceMotion ? 0 : statementY }}
          className="pb-6 sm:pb-8 z-20 text-center max-w-xl mx-auto pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] mb-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-mono font-medium text-neutral-800">Unified Architecture Graph</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-sans font-normal text-neutral-900 tracking-tight">
            From technologies to understanding.
          </h3>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-sans">
            One interconnected mental model for your entire stack.
          </p>
        </motion.div>

        {/* Scroll Instruction indicator at start */}
        {!shouldReduceMotion && (
          <motion.div 
            style={{ opacity: useTransform(smoothProgress, [0, 0.12], [1, 0]) }}
            className="absolute bottom-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 pointer-events-none"
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
  
  // Calculate intermediate positions with smooth curved spiral trajectory into solid flower stopping
  const x = useTransform(progress, (p: number) => {
    if (shouldReduceMotion) {
      const rad = (node.finalAngle * Math.PI) / 180;
      return finalR * Math.cos(rad);
    }
    // Normalized transition progress (0.05 -> 0.82)
    const t = Math.min(1, Math.max(0, (p - 0.05) / 0.77));
    // Smooth easeInOut cubic interpolation for solid clean landing
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    // Radius contraction from dispersed to tight flower petal orbit
    const currentR = initR + (finalR - initR) * easeT;
    
    // Curved orbital swirl angle: dies out completely as t approaches 1 for perfect symmetry
    const currentSwirl = node.swirlDeg * Math.sin(t * Math.PI) * (1 - easeT * 0.4);
    const currentAngle = node.initAngle + (node.finalAngle - node.initAngle) * easeT + currentSwirl;
    const rad = (currentAngle * Math.PI) / 180;
    
    return currentR * Math.cos(rad);
  });

  const y = useTransform(progress, (p: number) => {
    if (shouldReduceMotion) {
      const rad = (node.finalAngle * Math.PI) / 180;
      return finalR * Math.sin(rad);
    }
    const t = Math.min(1, Math.max(0, (p - 0.05) / 0.77));
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    const currentR = initR + (finalR - initR) * easeT;
    const currentSwirl = node.swirlDeg * Math.sin(t * Math.PI) * (1 - easeT * 0.4);
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
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border bg-white border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center">
        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
          {IconComponent && <IconComponent size={28} />}
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* SVG ICON DEFINITIONS                                                       */
/* -------------------------------------------------------------------------- */
const TechIcons: Record<string, React.FC<{ size?: number }>> = {
  react: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="-11.5 -10.23174 23 20.46348">
      <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
      <g stroke="#61dafb" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2"/>
        <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
        <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
      </g>
    </svg>
  ),
  python: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <path fill="#387eb8" d="M54.5 5.5c-24.8 0-23.2 10.7-23.2 10.7l.1 11.1h23.7v3.4H21.5S5.5 28.9 5.5 54.3c0 25.3 13.9 24.5 13.9 24.5h8.3v-11.6s-.5-13.9 13.7-13.9h23.5s13.1.2 13.1-12.7V18.7S81.2 5.5 54.5 5.5zm-13.2 7.4a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z"/>
      <path fill="#ffe052" d="M55.5 104.5c24.8 0 23.2-10.7 23.2-10.7l-.1-11.1H54.9v-3.4h33.6s16 1.8 16-23.6c0-25.3-13.9-24.5-13.9-24.5h-8.3v11.6s.5 13.9-13.7 13.9H45.6s-13.1-.2-13.1 12.7v21.9s-1.7 13.2 23 13.2zm13.2-7.4a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6z"/>
    </svg>
  ),
  postgresql: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path fill="#336791" d="M128 16C66.1 16 16 66.1 16 128s50.1 112 112 112 112-50.1 112-112S189.9 16 128 16zm-3.8 45.4c6.2 0 12.2 1.4 17.5 4.1 14.6 7.3 22.8 23.5 20.8 39.8-.7 5.7-3 11-6.6 15.3l-1.3 1.5 1.8 1c4.5 2.5 8.1 6.2 10.4 10.7 3.5 6.9 4 14.9 1.4 22.2-2.8 7.8-8.7 13.9-16.3 17.1-3.6 1.5-7.5 2.3-11.4 2.3h-3.2v25.2h-17.7V61.4h8.4zm-4.3 15.3h-4.1v38.8h4.1c4.9 0 9.4-1.8 12.8-5.1 3.5-3.3 5.4-7.9 5.4-12.7 0-4.9-1.9-9.5-5.4-12.8-3.4-3.4-7.9-5.2-12.8-5.2zm2.1 54.1h-6.2v43.2h6.2c5.6 0 10.7-2.1 14.5-5.9 3.9-3.8 6.1-9 6.1-14.6 0-5.6-2.2-10.8-6.1-14.6-3.8-5.4-8.9-8.1-14.5-8.1z"/>
    </svg>
  ),
  nextjs: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 180 180" fill="none">
      <circle cx="90" cy="90" r="90" fill="black"/>
      <path d="M149.508 157.508L69.14 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.508Z" fill="white"/>
      <rect x="115" y="54" width="12" height="72" fill="white"/>
    </svg>
  ),
  typescript: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path fill="#3178C6" d="M0 0h128v128H0z"/>
      <path fill="#FFF" d="M70.8 107.5c3.8 2.2 8.4 3.5 13.5 3.5 12.7 0 20.3-6.6 20.3-17.2 0-10.2-6.5-15.1-18.4-20.3-8.3-3.6-11.4-6.4-11.4-11.7 0-5.1 4.2-9 11.2-9 4.6 0 8.3 1.2 11 2.8l3.1-10.6c-3.1-1.7-7.8-2.9-13.4-2.9-12.9 0-19.9 7.3-19.9 16.7 0 9.7 6.4 14.8 17.1 19.4 8.7 3.8 12.6 6.7 12.6 12.5 0 5.8-4.9 9.8-12.3 9.8-5.8 0-10.3-1.6-13.9-3.8l-3.5 10.8zM24.7 53.6h17v56.6h12.5V53.6h17V43H24.7v10.6z"/>
    </svg>
  ),
  tailwind: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#38BDF8" d="M24 9.6c-4.8 0-7.8 2.4-9 7.2 1.8-2.4 4.2-3.3 7.2-2.7 1.7.3 2.9 1.6 4.3 3 2.2 2.3 4.7 4.9 10.3 4.9 4.8 0 7.8-2.4 9-7.2-1.8 2.4-4.2 3.3-7.2 2.7-1.7-.3-2.9-1.6-4.3-3-2.2-2.3-4.7-4.9-10.3-4.9zM12 21.6c-4.8 0-7.8 2.4-9 7.2 1.8-2.4 4.2-3.3 7.2-2.7 1.7.3 2.9 1.6 4.3 3 2.2 2.3 4.7 4.9 10.3 4.9 4.8 0 7.8-2.4 9-7.2-1.8 2.4-4.2 3.3-7.2 2.7-1.7-.3-2.9-1.6-4.3-3-2.2-2.3-4.7-4.9-10.3-4.9z"/>
    </svg>
  ),
  redis: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path fill="#D82C20" d="M228.6 62.9l-92.4-48.4c-4.8-2.5-10.6-2.5-15.4 0L28.4 62.9C23.6 65.4 20.6 70.4 20.6 75.8v104.4c0 5.4 3 10.4 7.8 12.9l92.4 48.4c2.4 1.3 5.1 1.9 7.7 1.9s5.3-.6 7.7-1.9l92.4-48.4c4.8-2.5 7.8-7.5 7.8-12.9V75.8c0-5.4-3-10.4-7.8-12.9z"/>
      <path fill="#FFF" d="M128 64c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm0 104c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z"/>
    </svg>
  ),
  graphql: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <path fill="#E10098" d="M57.468 302.007l-13.97-24.197L200 86.877l156.502 190.933-13.97 24.197L200 135.271z"/>
      <path fill="#E10098" d="M39.98 274.08l160.02 92.39v27.94L20 285.25z"/>
      <path fill="#E10098" d="M360.02 274.08l20 11.17-180.02 109.16v-27.94z"/>
      <circle cx="200" cy="86.877" r="28" fill="#E10098"/>
      <circle cx="43.498" cy="277.81" r="28" fill="#E10098"/>
      <circle cx="356.502" cy="277.81" r="28" fill="#E10098"/>
      <circle cx="200" cy="370.2" r="28" fill="#E10098"/>
    </svg>
  ),
  docker: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path fill="#2496ED" d="M248 112c-4.4-2.8-12.7-3.9-20.8-2.6-1.5-11.8-9.4-22.3-21.2-28.4l-6.2-3.2-3.9 5.8c-7.3 10.8-8.2 24.3-2.9 36-3.8 2-8.3 3.6-13.5 4.7H6c-3.3 0-6 2.7-6 6 0 23.6 8.7 46 24.5 63 16.9 18.2 39.8 28.7 64.5 29.7 54.3 2.1 106.3-23.7 132-65.7 18.2-29.6 19.9-32.9 37-45.5zM72 74h22v22H72zm-28 0h22v22H44zm56 0h22v22h-22zm-56 28h22v22H44zm28 0h22v22H72zm28 0h22v22h-22zm28 0h22v22h-22zm-28-56h22v22h-22zm28 0h22v22h-22z"/>
    </svg>
  ),
  github: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 98 96">
      <path fill="#24292e" fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.36 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.215-1.63c4.125 0 8.25.571 12.215 1.63 9.3-6.356 13.425-5.052 13.425-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
    </svg>
  ),
  fastapi: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="128" fill="#009688"/>
      <path fill="#FFF" d="M117.8 200.7l-4.1-39.7 24.2-1.7 4.1 39.7-24.2 1.7zm18.3-55.8L121.8 45.4l50.5-3.6 14.3 99.5-50.5 3.6zM83.7 94.6l50.4-3.6-5.8 41.5-50.5 3.6 5.9-41.5z"/>
    </svg>
  ),
  express: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <rect width="256" height="256" rx="32" fill="#000"/>
      <text x="128" y="152" fill="#FFF" fontSize="82" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ex</text>
    </svg>
  ),
  golang: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path fill="#00ADD8" d="M72.2 144.5c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm111.6 0c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zM240 108.5c-6.8 0-12.8 3.5-16.3 8.8-9.8-13.8-25.8-22.8-44-22.8-5.3 0-10.4.8-15.2 2.2-7.8-14.7-23.4-24.7-41.3-24.7-18.4 0-34.4 10.6-42.1 26-6.1-2.2-12.6-3.5-19.5-3.5-22.9 0-42.3 14.2-50.1 34.3-4.1-1.9-8.7-3-13.5-3-17.7 0-32 14.3-32 32s14.3 32 32 32c7.6 0 14.6-2.6 20.2-7 10.6 15.3 28.3 25.3 48.4 25.3 12.3 0 23.6-3.8 32.9-10.3 8.9 9.8 21.8 16 36.1 16 16.5 0 31-8.3 39.7-21 7 3.3 14.9 5.2 23.2 5.2 26.5 0 48.5-18.4 54.3-43 6.2-.9 11.2-5.7 12.2-11.9 1.5-9.3-5-17.6-15-18.6z"/>
    </svg>
  ),
  rust: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 106 106">
      <path fill="#000" d="M53 6.5C27.4 6.5 6.5 27.4 6.5 53S27.4 99.5 53 99.5 99.5 78.6 99.5 53 78.6 6.5 53 6.5zm-5.4 64.9H35.5V34.6h18.2c8.8 0 14.7 4.9 14.7 13.1 0 5.6-3.1 10-8.2 11.9l9.3 11.8H56.7L48.4 59.8h-.8v11.6zm0-20.7h5.8c4.6 0 7.4-2.4 7.4-6.3s-2.8-6.3-7.4-6.3h-5.8v12.6z"/>
    </svg>
  ),
  mongodb: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path fill="#47A248" d="M131.6 8.3c-2.4-3.5-7.3-3.4-9.6.1C107.5 29.8 48 119.9 56.4 179.8c6.6 47.4 46.5 73.1 68.7 75.9 2.1.3 4.3.2 6.4-.3 22.8-5.3 63.6-32.9 68.1-80.1 5.9-62.7-52.9-147-68-167z"/>
      <path fill="#FFF" d="M127.3 18.4c-1.5 2-46.7 66.5-44.1 127.5 2.1 48 31.9 76.5 44.1 82.5V18.4z"/>
    </svg>
  ),
  vue: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 261.76 226.69">
      <path fill="#41B883" d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"/>
      <path fill="#34495E" d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z"/>
    </svg>
  ),
  javascript: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 630 630">
      <rect width="630" height="630" fill="#F7DF1E"/>
      <path d="m423.2 492.19c12.69 20.72 29.2 35.95 58.4 35.95 24.53 0 40.2-12.26 40.2-29.2 0-20.3-16.1-27.49-43.1-39.3l-14.8-6.35c-42.72-18.2-71.1-41-71.1-89.2 0-44.4 33.83-78.2 86.7-78.2 37.64 0 64.7 13.1 84.2 47.4l-46.1 29.6c-10.15-18.2-21.1-25.4-38.1-25.4-17.34 0-28.33 11-28.33 25.4 0 17.76 11 24.95 36.4 35.95l14.8 6.34c50.3 21.57 78.7 43.56 78.7 92.6 0 53.3-41.87 82.5-98.1 82.5-54.98 0-90.5-26.2-106.8-60.5zm-209.98 5.5c-11.83 6.77-24.95 10.15-40.6 10.15-41.44 0-68.5-22.84-68.5-66.8v-193.74h56.66v189.5c0 19.46 7.6 28.34 22.84 28.34 10.15 0 17.76-3.38 23.68-6.77z"/>
    </svg>
  ),
  rest: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <rect width="256" height="256" rx="32" fill="#2563EB"/>
      <text x="128" y="152" fill="#FFF" fontSize="64" fontWeight="bold" fontFamily="monospace" textAnchor="middle">REST</text>
    </svg>
  ),
  java: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path fill="#EA2D2E" d="M98.6 177.5s-14.2 1.8-6.1 9.8c9.9 9.8 28.1 9.5 44.4 5.9 14.6-3.2 29.6-11.2 29.6-11.2s-7.1 4.7-19.4 8.7c-17.7 5.7-38.3 5.4-49.9-2.7-8.4-5.9 1.4-10.5 1.4-10.5zm-5.7-32.9s-14.8 3.5-7.7 12.3c8.8 10.9 23.3 11.7 41.5 8.7 19.3-3.2 38.6-14.4 38.6-14.4s-8.7 5.7-23.7 10.3c-20.9 6.4-44.5 6.3-54.7-3.9-7.9-7.9 6-13 6-13zm52.2-46.7c7.4 8.6 3.6 16.3-3.8 24.3-8.8 9.5-17.6 14.6-17.6 14.6s4.4-3.5 10.6-9.2c7.2-6.6 10.2-12.2 4.4-18.4-6.8-7.3-15.6-12.7-15.6-21.7 0-9.8 8.1-17.1 11.2-25.2-10.7 7.7-18.6 19.4-13.6 30.2 4.5 9.7 17.5 18 24.4 25.4z"/>
    </svg>
  ),
  svelte: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 109.3 129.9">
      <path fill="#FF3E00" d="M97.9 21.6C86.7 6.9 67.4-1.2 48.9.2 30.4 1.7 14.4 12.6 6.8 29.5-.7 46.4-.9 66.5 6.1 83.5c3.5 8.5 9.2 16 16.5 21.7 1.4 1.1 3 1.9 4.7 2.4l34.4 11.5c11.6 3.9 24.2 3.1 35.1-2.2 10.9-5.4 19.2-14.9 23.1-26.4 3.9-11.6 3.1-24.2-2.2-35.1l-6.8-13.8c-1.2-2.4-1.7-5-1.5-7.7.3-2.6 1.4-5.1 3.1-7.1 3.4-3.9 8.6-5.8 13.8-5 5.1.8 9.6 4.1 11.8 8.9l5.8 12.8c4.3 9.4 4.8 20.1 1.4 29.9-3.4 9.7-10.6 17.6-19.9 22.1-9.4 4.5-20.1 4.9-29.9 1.4l-34.4-11.5c-4.4-1.5-8.5-3.8-12.1-6.8-7.2-6-12.3-14.1-14.5-23.2-2.2-9.1-1.2-18.7 2.8-27.2 4-8.5 10.8-15.4 19.3-19.5 8.5-4 18.2-4.9 27.2-2.8l6.8 1.5c4.7 1.1 9.6.2 13.7-2.4s6.9-6.8 7.7-11.6c.9-4.8-.7-9.7-4.3-13.1z"/>
    </svg>
  )
};

export default TechnologyConvergence;
