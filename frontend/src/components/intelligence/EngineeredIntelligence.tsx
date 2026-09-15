import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, AnimatePresence } from 'framer-motion';
import { 
  FileCode2, 
  Search, 
  GitBranch, 
  FileText, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Server, 
  ShieldCheck, 
  Sparkles,
  Cpu,
  Code2
} from 'lucide-react';

interface StageData {
  id: string;
  stepNum: string;
  title: string;
  headline: string;
  description: string;
  bullet: string;
}

const STAGES: StageData[] = [
  {
    id: 'code-intelligence',
    stepNum: '01',
    title: 'Code Intelligence',
    headline: 'First, understand the code.',
    description: 'NEXORA analyzes source structure to identify symbols, declarations, imports, exports, routes, and relationships across the entire repository.',
    bullet: 'Deterministic AST Symbol Parsing'
  },
  {
    id: 'semantic-search',
    stepNum: '02',
    title: 'Semantic Search',
    headline: 'Then, find the context that matters.',
    description: 'Meaningful code is transformed into searchable representations so relevant parts of the repository can be retrieved when they matter.',
    bullet: 'Vector Indexing & Semantic Retrieval'
  },
  {
    id: 'dependency-relationships',
    stepNum: '03',
    title: 'Dependency Relationships',
    headline: 'See how the pieces connect.',
    description: 'Imports, exports, routes, and other structural relationships reveal how files and modules depend on one another across execution paths.',
    bullet: 'Directed Inter-Module Graph'
  },
  {
    id: 'repository-context',
    stepNum: '04',
    title: 'Repository Context',
    headline: 'Ground every answer in the repository.',
    description: 'Relevant source snippets and deterministic codebase facts provide the verified context needed for accurate, evidence-backed answers.',
    bullet: 'Verified Evidence Grounding'
  },
  {
    id: 'architecture-mapping',
    stepNum: '05',
    title: 'Architecture Mapping',
    headline: 'Then turn structure into understanding.',
    description: 'NEXORA combines deterministic codebase facts with relevant repository context to produce a structured view of the application’s architecture and behavior.',
    bullet: 'Automated System Mental Model'
  }
];

export const EngineeredIntelligence: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0005
  });

  // Track active stage index (0 to 4) based on scroll progress
  useEffect(() => {
    return smoothProgress.on('change', (p) => {
      let index = 0;
      if (p >= 0.78) index = 4;
      else if (p >= 0.58) index = 3;
      else if (p >= 0.38) index = 2;
      else if (p >= 0.18) index = 1;
      else index = 0;
      setActiveStageIndex(index);
    });
  }, [smoothProgress]);

  const activeStage = STAGES[activeStageIndex];

  return (
    <section 
      ref={containerRef} 
      className="relative h-[340vh] bg-[#F7F7F5] text-neutral-900 border-t border-black/[0.035] content-layer" 
      id="foundation"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between items-center px-4 sm:px-6 md:px-12 py-6 sm:py-10 select-none">
        
        {/* Section Header */}
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center z-20 mb-2 sm:mb-4">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Engineered for Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-normal tracking-tight text-neutral-900">
            Built on the structure of your software.
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mx-auto mt-1">
            NEXORA doesn't treat a repository as a wall of text. It extracts structure, relationships, and context before generating an understanding of the system.
          </p>
        </div>

        {/* Main Grid: Left Dynamic System Visualizer + Right Narrative & Progress */}
        <div className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-center justify-center my-auto min-h-0">
          
          {/* Left Column: Interactive Reverse-Engineering Canvas (Sticky Display) */}
          <div className="lg:col-span-7 h-[380px] sm:h-[430px] md:h-[460px] w-full flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-[#0C0D12] border border-white/[0.09] shadow-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden text-white">
              
              {/* Top Pipeline Status Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="text-[11px] font-mono text-white/40 ml-2">nexora-reverse-engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-blue-400" />
                    <span>Stage {activeStage.stepNum}: {activeStage.title}</span>
                  </span>
                </div>
              </div>

              {/* Central Dynamic Transformation Arena */}
              <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2">
                <AnimatePresence mode="wait">
                  {activeStageIndex === 0 && (
                    <Stage01CodeIntelligence key="stage-01" />
                  )}
                  {activeStageIndex === 1 && (
                    <Stage02SemanticSearch key="stage-02" />
                  )}
                  {activeStageIndex === 2 && (
                    <Stage03DependencyRelationships key="stage-03" />
                  )}
                  {activeStageIndex === 3 && (
                    <Stage04RepositoryContext key="stage-04" />
                  )}
                  {activeStageIndex === 4 && (
                    <Stage05ArchitectureMapping key="stage-05" />
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Stage Progress Sublabel */}
              <div className="border-t border-white/[0.08] pt-2.5 flex items-center justify-between text-[11px] font-mono text-white/40 select-none">
                <span className="flex items-center gap-1.5 text-blue-400/90">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>{activeStage.bullet}</span>
                </span>
                <span>Deterministic Facts &rarr; Graph Synthesizer</span>
              </div>

            </div>
          </div>

          {/* Right Column: Explanatory Content & Step Navigation */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4 sm:gap-5">
            
            {/* Step Navigation Indicators (3 in Row 1, 2 in Row 2) */}
            <div className="flex flex-col gap-2.5 w-full select-none">
              
              {/* Row 1: First 3 Properties */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {STAGES.slice(0, 3).map((s, idx) => {
                  const isPassed = activeStageIndex > idx;
                  const isActive = activeStageIndex === idx;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveStageIndex(idx)}
                      className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[76px] sm:min-h-[82px] relative cursor-pointer group ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_16px_rgba(37,99,235,0.25)] ring-2 ring-blue-600/30'
                          : isPassed
                          ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300/90 hover:bg-emerald-50 shadow-xs'
                          : 'bg-white/90 border-black/[0.06] text-neutral-600 hover:border-black/20 hover:bg-white'
                      }`}
                    >
                      {/* Top Header: Step Number & Dedicated Status/Tick Badge */}
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-[10px] font-mono font-bold tracking-wider ${
                          isActive ? 'text-blue-100' : isPassed ? 'text-emerald-700' : 'text-neutral-400'
                        }`}>
                          STAGE {s.stepNum}
                        </span>

                        {/* Status / Complete Tick on Card */}
                        {isPassed ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                            ✓
                          </div>
                        ) : isActive ? (
                          <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span className="text-[8px] font-mono font-bold text-white uppercase tracking-wider">Live</span>
                          </div>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-neutral-300 group-hover:border-neutral-400 transition-colors" />
                        )}
                      </div>

                      {/* Bottom Title: Clean & Well-Structured */}
                      <span className={`text-xs sm:text-[13px] font-sans font-semibold leading-tight mt-auto ${
                        isActive ? 'text-white' : isPassed ? 'text-emerald-950' : 'text-neutral-800'
                      }`}>
                        {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Next 2 Properties */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {STAGES.slice(3, 5).map((s, idx) => {
                  const actualIdx = idx + 3;
                  const isPassed = activeStageIndex > actualIdx;
                  const isActive = activeStageIndex === actualIdx;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveStageIndex(actualIdx)}
                      className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[76px] sm:min-h-[82px] relative cursor-pointer group ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_16px_rgba(37,99,235,0.25)] ring-2 ring-blue-600/30'
                          : isPassed
                          ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300/90 hover:bg-emerald-50 shadow-xs'
                          : 'bg-white/90 border-black/[0.06] text-neutral-600 hover:border-black/20 hover:bg-white'
                      }`}
                    >
                      {/* Top Header: Step Number & Dedicated Status/Tick Badge */}
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-[10px] font-mono font-bold tracking-wider ${
                          isActive ? 'text-blue-100' : isPassed ? 'text-emerald-700' : 'text-neutral-400'
                        }`}>
                          STAGE {s.stepNum}
                        </span>

                        {/* Status / Complete Tick on Card */}
                        {isPassed ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                            ✓
                          </div>
                        ) : isActive ? (
                          <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span className="text-[8px] font-mono font-bold text-white uppercase tracking-wider">Live</span>
                          </div>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-neutral-300 group-hover:border-neutral-400 transition-colors" />
                        )}
                      </div>

                      {/* Bottom Title: Clean & Well-Structured */}
                      <span className={`text-xs sm:text-[13px] font-sans font-semibold leading-tight mt-auto ${
                        isActive ? 'text-white' : isPassed ? 'text-emerald-950' : 'text-neutral-800'
                      }`}>
                        {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Active Stage Narrative Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3.5"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
                  <span>Step {activeStage.stepNum}</span>
                  <span>&bull;</span>
                  <span>{activeStage.title}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-sans font-normal text-neutral-900 tracking-tight leading-snug">
                  {activeStage.headline}
                </h3>

                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-sans">
                  {activeStage.description}
                </p>

                <div className="mt-1 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Pipeline Phase</span>
                  </span>
                  <span>{activeStageIndex + 1} of 5</span>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

        </div>

        {/* Footer Payoff Banner */}
        <div className="z-20 text-center pb-2 select-none">
          <p className="text-xs font-mono text-neutral-400 tracking-wide uppercase">
            Progressive Code Transformation &bull; <span className="text-neutral-800 font-bold">From raw code to a mental model.</span>
          </p>
        </div>

      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* STAGE 01: Code Intelligence (Raw Files -> Scanner -> Extracted Tokens)     */
/* -------------------------------------------------------------------------- */
const Stage01CodeIntelligence: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col justify-center relative px-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        
        {/* Left: Source File Tree with Scanning Line */}
        <div className="p-3.5 rounded-xl bg-[#07080B] border border-white/[0.08] relative overflow-hidden font-mono text-xs text-neutral-300">
          {/* Animated Scanning Beam */}
          <motion.div 
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#3B82F6]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="text-[10px] text-white/40 uppercase font-bold mb-2 flex items-center gap-1.5">
            <FileCode2 className="w-3 h-3 text-blue-400" />
            <span>Parsing src/ directory</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="text-blue-300 font-medium">📁 src/auth/</div>
            <div className="pl-3 text-white/80">📄 auth.service.ts</div>
            <div className="pl-3 text-white/80">📄 auth.controller.ts</div>
            <div className="text-blue-300 font-medium mt-1">📁 src/api/</div>
            <div className="pl-3 text-white/80">📄 routes.ts</div>
            <div className="text-blue-300 font-medium mt-1">📁 src/db/</div>
            <div className="pl-3 text-white/80">📄 client.ts</div>
          </div>
        </div>

        {/* Right: Extracted AST Tokens Breakdown */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono text-white/40 uppercase font-bold px-1">
            Extracted Symbols &amp; Tokens
          </div>
          
          <div className="space-y-1.5 font-mono text-[11px]">
            <motion.div 
              initial={{ x: 10, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.1 }}
              className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-200 flex items-center justify-between"
            >
              <span>function login()</span>
              <span className="text-[9px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">Method</span>
            </motion.div>

            <motion.div 
              initial={{ x: 10, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 flex items-center justify-between"
            >
              <span>class UserService</span>
              <span className="text-[9px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300">Class</span>
            </motion.div>

            <motion.div 
              initial={{ x: 10, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-center justify-between"
            >
              <span>POST /auth/login</span>
              <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">Route</span>
            </motion.div>

            <motion.div 
              initial={{ x: 10, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.4 }}
              className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-center justify-between"
            >
              <span>import &#123; db &#125;</span>
              <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">Import</span>
            </motion.div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* STAGE 02: Semantic Search (Vector Cloud + Query Highlight)                 */
/* -------------------------------------------------------------------------- */
const Stage02SemanticSearch: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col justify-between py-2 px-2"
    >
      {/* Search Query Prompt Box */}
      <div className="p-3 rounded-xl bg-[#07080B] border border-blue-500/40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 text-xs font-mono text-white">
          <Search className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium">"Where is authentication handled?"</span>
        </div>
        <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
          Vector Cosine Search
        </span>
      </div>

      {/* Vector Embeddings Map Representation */}
      <div className="relative flex-1 my-3 rounded-xl bg-[#07080B]/60 border border-white/[0.06] p-3 flex items-center justify-around">
        
        {/* Irrelevant Subdued Nodes */}
        <div className="flex flex-col items-center opacity-25">
          <div className="w-3 h-3 rounded-full bg-neutral-600 mb-1" />
          <span className="text-[9px] font-mono text-neutral-400">invoice.job.ts</span>
        </div>

        {/* Highlighted Relevant Nodes Moving Toward Center */}
        <motion.div 
          animate={{ scale: [1, 1.06, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center p-2 rounded-xl bg-blue-950/80 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-blue-400 mb-1 flex items-center justify-center text-[8px] font-bold text-black">✓</div>
          <span className="text-[10px] font-mono font-bold text-blue-200">auth.service.ts</span>
          <span className="text-[8px] font-mono text-blue-400">Score 0.94</span>
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.06, 1] }} 
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          className="flex flex-col items-center p-2 rounded-xl bg-indigo-950/80 border border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-400 mb-1 flex items-center justify-center text-[8px] font-bold text-black">✓</div>
          <span className="text-[10px] font-mono font-bold text-indigo-200">auth.controller.ts</span>
          <span className="text-[8px] font-mono text-indigo-400">Score 0.91</span>
        </motion.div>

        <div className="flex flex-col items-center opacity-25">
          <div className="w-3 h-3 rounded-full bg-neutral-600 mb-1" />
          <span className="text-[9px] font-mono text-neutral-400">email.util.ts</span>
        </div>

        <motion.div 
          animate={{ scale: [1, 1.06, 1] }} 
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          className="flex flex-col items-center p-2 rounded-xl bg-emerald-950/80 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 mb-1 flex items-center justify-center text-[8px] font-bold text-black">✓</div>
          <span className="text-[10px] font-mono font-bold text-emerald-200">routes.ts</span>
          <span className="text-[8px] font-mono text-emerald-400">Score 0.88</span>
        </motion.div>

      </div>

      <div className="text-[10px] font-mono text-neutral-400 text-center">
        Identified 3 relevant context candidates across 142 total repository files.
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* STAGE 03: Dependency Relationships (Discovered Network Graph)               */
/* -------------------------------------------------------------------------- */
const Stage03DependencyRelationships: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col justify-center px-2"
    >
      <div className="text-[10px] font-mono text-white/40 uppercase font-bold mb-3 text-center">
        Tracing Execution &amp; Call Pathways
      </div>

      <div className="flex items-center justify-between relative px-2 sm:px-4">
        
        {/* Node 1: Route */}
        <div className="flex flex-col items-center z-10">
          <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-400 text-center shadow-md">
            <span className="text-[9px] font-mono uppercase text-blue-400 block font-bold">Route</span>
            <span className="text-xs font-mono text-white font-medium">routes.ts</span>
          </div>
          <span className="text-[9px] font-mono text-white/40 mt-1">/api/v2/login</span>
        </div>

        {/* Animated Connector Arrow 1 */}
        <div className="flex-1 flex flex-col items-center px-1">
          <svg className="w-full h-4" viewBox="0 0 60 12" fill="none">
            <line x1="0" y1="6" x2="60" y2="6" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
            <motion.circle cx="30" cy="6" r="2.5" fill="#60A5FA" animate={{ cx: [0, 60] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          </svg>
          <span className="text-[8px] font-mono text-blue-300">calls</span>
        </div>

        {/* Node 2: Controller */}
        <div className="flex flex-col items-center z-10">
          <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-400 text-center shadow-md">
            <span className="text-[9px] font-mono uppercase text-indigo-400 block font-bold">Controller</span>
            <span className="text-xs font-mono text-white font-medium">AuthController</span>
          </div>
          <span className="text-[9px] font-mono text-white/40 mt-1">handleLogin()</span>
        </div>

        {/* Animated Connector Arrow 2 */}
        <div className="flex-1 flex flex-col items-center px-1">
          <svg className="w-full h-4" viewBox="0 0 60 12" fill="none">
            <line x1="0" y1="6" x2="60" y2="6" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" />
            <motion.circle cx="30" cy="6" r="2.5" fill="#A5B4FC" animate={{ cx: [0, 60] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.3 }} />
          </svg>
          <span className="text-[8px] font-mono text-indigo-300">imports</span>
        </div>

        {/* Node 3: Service */}
        <div className="flex flex-col items-center z-10">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-400 text-center shadow-md">
            <span className="text-[9px] font-mono uppercase text-purple-400 block font-bold">Service</span>
            <span className="text-xs font-mono text-white font-medium">AuthService</span>
          </div>
          <span className="text-[9px] font-mono text-white/40 mt-1">validateJWT()</span>
        </div>

        {/* Animated Connector Arrow 3 */}
        <div className="flex-1 flex flex-col items-center px-1">
          <svg className="w-full h-4" viewBox="0 0 60 12" fill="none">
            <line x1="0" y1="6" x2="60" y2="6" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" />
            <motion.circle cx="30" cy="6" r="2.5" fill="#6EE7B7" animate={{ cx: [0, 60] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.6 }} />
          </svg>
          <span className="text-[8px] font-mono text-emerald-300">queries</span>
        </div>

        {/* Node 4: Database Model */}
        <div className="flex flex-col items-center z-10">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-400 text-center shadow-md">
            <span className="text-[9px] font-mono uppercase text-emerald-400 block font-bold">Database</span>
            <span className="text-xs font-mono text-white font-medium">PostgreSQL</span>
          </div>
          <span className="text-[9px] font-mono text-white/40 mt-1">users_schema</span>
        </div>

      </div>

      <div className="mt-4 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-neutral-300 text-center">
        Discovered 4-node deterministic invocation chain from HTTP ingress to SQL persistence.
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* STAGE 04: Repository Context (Grounded Evidence Window)                     */
/* -------------------------------------------------------------------------- */
const Stage04RepositoryContext: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col justify-center px-2 space-y-2.5"
    >
      <div className="flex items-center justify-between text-[10px] font-mono text-white/50 px-1">
        <span className="uppercase font-bold text-blue-400">Context Window &bull; Grounded Evidence</span>
        <span className="text-emerald-400">Verified AST Lines</span>
      </div>

      {/* Snippet 1: auth.service.ts */}
      <div className="p-3 rounded-xl bg-[#07080B] border border-white/[0.08] text-xs font-mono">
        <div className="flex items-center justify-between text-[10px] text-white/40 border-b border-white/[0.06] pb-1.5 mb-1.5">
          <span className="text-blue-300 font-semibold">src/services/auth.service.ts</span>
          <span>Lines L42–L50</span>
        </div>
        <pre className="text-[11px] text-neutral-300 leading-relaxed overflow-x-auto m-0">
          <code>{`export const validateUser = async (email, hash) => {
  const user = await db.users.findUnique({ where: { email } });
  return jwt.sign({ id: user.id }, SECRET);
};`}</code>
        </pre>
      </div>

      {/* Snippet 2: routes.ts */}
      <div className="p-3 rounded-xl bg-[#07080B] border border-white/[0.08] text-xs font-mono">
        <div className="flex items-center justify-between text-[10px] text-white/40 border-b border-white/[0.06] pb-1.5 mb-1.5">
          <span className="text-indigo-300 font-semibold">src/api/routes.ts</span>
          <span>Lines L18–L24</span>
        </div>
        <pre className="text-[11px] text-neutral-300 leading-relaxed overflow-x-auto m-0">
          <code>{`router.post("/login", AuthController.handleLogin);
router.use("/secure/*", JWTMiddleware.requireAuth);`}</code>
        </pre>
      </div>

      <div className="text-[10px] font-mono text-emerald-400 text-center flex items-center justify-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Evidence-backed grounding assembled for deterministic AI synthesis.</span>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* STAGE 05: Architectural Understanding (Reconstructed System Blocks)        */
/* -------------------------------------------------------------------------- */
const Stage05ArchitectureMapping: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col justify-between py-1 px-2"
    >
      {/* Top Application Crown */}
      <div className="text-center">
        <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-[11px] font-mono text-blue-300 font-bold uppercase tracking-wider shadow-md">
          Application Architecture Model
        </span>
      </div>

      {/* Structured Reconstructed Subsystem Blocks */}
      <div className="grid grid-cols-4 gap-2 my-2 items-center text-center">
        
        {/* Block 1: Frontend */}
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold text-white">Frontend</span>
          <span className="text-[9px] text-white/40">React &bull; Next</span>
        </div>

        {/* Block 2: API Gateway */}
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1">
            <Server className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold text-white">API Gateway</span>
          <span className="text-[9px] text-white/40">REST &bull; Routes</span>
        </div>

        {/* Block 3: Services */}
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold text-white">Services</span>
          <span className="text-[9px] text-white/40">Auth &bull; Billing</span>
        </div>

        {/* Block 4: Storage */}
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold text-white">Databases</span>
          <span className="text-[9px] text-white/40">Postgres &bull; Redis</span>
        </div>

      </div>

      {/* Discovered Architectural Dimensions Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[9px] text-white/60">
        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-blue-300">ARCHITECTURE</span>
        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-indigo-300">TECHNOLOGY STACK</span>
        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-purple-300">COMPONENTS</span>
        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-emerald-300">APPLICATION FLOW</span>
        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-amber-300">APIs</span>
        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-cyan-300">DEPENDENCIES</span>
      </div>

      <div className="text-[11px] font-sans text-center text-white/80 font-medium pt-1">
        From raw code to a structured mental model.
      </div>
    </motion.div>
  );
};

export default EngineeredIntelligence;
