import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Layers, 
  CheckCircle2, 
  Database, 
  Server, 
  Cpu,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Code2,
  Network,
  FileCheck,
  X,
  ArrowRight
} from 'lucide-react';
import { TextReveal } from '../motion/text-reveal';
import { cn } from '@/lib/utils';

interface StageData {
  id: string;
  stepNum: string;
  stepNumber: number;
  title: string;
  headline: string;
  subtitle: string;
  description: string;
  bullet: string;
  accentColor: string;
  badgeColor: string;
  glowColor: string;
  details: {
    capabilities: string[];
    technicalOutput: string;
    sampleCode?: string;
  };
}

const STAGES: StageData[] = [
  {
    id: 'code-intelligence',
    stepNum: '01',
    stepNumber: 1,
    title: 'Code Intelligence',
    headline: 'First, understand the code.',
    subtitle: 'Deterministic AST Symbol Parsing',
    description: 'NEXORA analyzes source structure to identify symbols, declarations, imports, exports, routes, and relationships across the entire repository.',
    bullet: 'Deterministic AST Symbol Parsing',
    accentColor: 'from-blue-500 to-cyan-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    details: {
      capabilities: [
        'Full AST Parsing for TypeScript, Python, Go, Rust, Java, C++',
        'Deterministic Symbol Extractor: Classes, Methods, Types, Functions',
        'Declaration & Interface Resolution across module boundaries',
        'Route, Controller & Middleware Signature Detection'
      ],
      technicalOutput: 'Extracted 4,820 symbols and 384 routes with 100% deterministic accuracy.',
      sampleCode: `// AST Symbol Extraction Pipeline
interface SymbolMap {
  id: "src/auth/auth.service.ts#validateUser";
  type: "FunctionDeclaration";
  visibility: "export";
  dependencies: ["@/db/client", "jsonwebtoken"];
}`
    }
  },
  {
    id: 'semantic-search',
    stepNum: '02',
    stepNumber: 2,
    title: 'Semantic Search',
    headline: 'Then, find the context that matters.',
    subtitle: 'Vector Indexing & Semantic Retrieval',
    description: 'Meaningful code is transformed into searchable representations so relevant parts of the repository can be retrieved when they matter.',
    bullet: 'Vector Indexing & Semantic Retrieval',
    accentColor: 'from-indigo-500 to-violet-400',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    details: {
      capabilities: [
        'Dense 1536-dimensional Code & Docstring Embedding generation',
        'Hybrid Sparse-Dense Retrieval with Cosine Re-ranking',
        'Intent Classification: Architecture, Bug, Feature, Data Flow',
        'Context-aware chunking preserving syntax boundary integrity'
      ],
      technicalOutput: 'Top 3 candidates retrieved in 18ms with 0.94 cosine similarity.',
      sampleCode: `// Hybrid Cosine Vector Query
const query = "Where is authentication handled and verified?";
const results = await vectorIndex.query({
  vector: embed(query),
  filter: { astType: ["controller", "service"] },
  topK: 5
});`
    }
  },
  {
    id: 'dependency-relationships',
    stepNum: '03',
    stepNumber: 3,
    title: 'Dependency Relationships',
    headline: 'See how the pieces connect.',
    subtitle: 'Directed Inter-Module Graph',
    description: 'Imports, exports, routes, and other structural relationships reveal how files and modules depend on one another across execution paths.',
    bullet: 'Directed Inter-Module Graph',
    accentColor: 'from-purple-500 to-fuchsia-400',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    details: {
      capabilities: [
        'End-to-end Call Graph generation from HTTP ingress to DB',
        'Cyclic Dependency & Dead Code Path Detection',
        'Module Coupling & Cohesion Analysis',
        'Cross-service RPC & REST endpoint contract linking'
      ],
      technicalOutput: 'Assembled 4-node deterministic invocation chain with 0 circular loops.',
      sampleCode: `// Directed Dependency Graph
Router("/api/v2/login")
  └── AuthController.handleLogin()
        └── AuthService.validateJWT()
              └── PostgreSQL.users_schema.findUnique()`
    }
  },
  {
    id: 'repository-context',
    stepNum: '04',
    stepNumber: 4,
    title: 'Repository Context',
    headline: 'Ground every answer in the repository.',
    subtitle: 'Verified Evidence Grounding',
    description: 'Relevant source snippets and deterministic codebase facts provide the verified context needed for accurate, evidence-backed answers.',
    bullet: 'Verified Evidence Grounding',
    accentColor: 'from-amber-500 to-orange-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    details: {
      capabilities: [
        'Exact line-range AST citation grounding (L42–L50)',
        'Zero-Hallucination verification against live repo index',
        'Config, Environment & Schema Fact Validation',
        'Dynamic Context Window token budget optimizer'
      ],
      technicalOutput: '100% verified citation coverage with verified AST code anchors.',
      sampleCode: `// Grounded Evidence Verification
export const validateUser = async (email: string, hash: string) => {
  // [CITED: src/services/auth.service.ts L42-L50]
  const user = await db.users.findUnique({ where: { email } });
  return jwt.sign({ id: user.id }, SECRET);
};`
    }
  },
  {
    id: 'architecture-mapping',
    stepNum: '05',
    stepNumber: 5,
    title: 'Architecture Mapping',
    headline: 'Then turn structure into understanding.',
    subtitle: 'Automated System Mental Model',
    description: 'NEXORA combines deterministic codebase facts with relevant repository context to produce a structured view of the application’s architecture and behavior.',
    bullet: 'Automated System Mental Model',
    accentColor: 'from-emerald-500 to-teal-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    details: {
      capabilities: [
        'Automated System Architecture synthesis & visual topology',
        'Framework & Library Ecosystem classification',
        'Data Flow & Ingress/Egress lifecycle modeling',
        'Living, interactive system documentation updated per commit'
      ],
      technicalOutput: 'Generated 6-dimensional architecture map across frontend, API, and DB.',
      sampleCode: `// Synthesized System Mental Model
SystemArchitecture: {
  layers: ["Frontend (Next.js)", "API Gateway (Fastify)", "Domain Core", "PostgreSQL"],
  dataFlow: "Client -> Ingress -> Middleware -> Controller -> Service -> Storage",
  securityBoundary: "JWT HS256 with RBAC Guard"
}`
    }
  }
];

export const EngineeredIntelligence: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [selectedStageForModal, setSelectedStageForModal] = useState<StageData | null>(null);

  const totalStages = STAGES.length;

  const handleNext = useCallback(() => {
    setActiveStageIndex((prev) => (prev + 1) % totalStages);
  }, [totalStages]);

  const handlePrev = useCallback(() => {
    setActiveStageIndex((prev) => (prev - 1 + totalStages) % totalStages);
  }, [totalStages]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const activeStage = STAGES[activeStageIndex];

  // Proportional, compact 3D curved arc positioning
  const getCardTransform = (index: number) => {
    let diff = index - activeStageIndex;
    
    // Normalize difference for cyclic carousel representation
    if (diff > 2) diff -= totalStages;
    if (diff < -2) diff += totalStages;

    switch (diff) {
      case 0:
        return {
          x: 0,
          y: -26,
          rotate: 0,
          scale: 1.05,
          zIndex: 40,
          opacity: 1,
          filter: 'brightness(1.05) saturate(1.05)',
          boxShadow: `0 20px 45px -12px rgba(15, 23, 42, 0.4), 0 0 32px ${activeStage.glowColor}`,
          pointerEvents: 'auto' as const,
        };
      case -1:
        return {
          x: -140,
          y: -2,
          rotate: -13,
          scale: 0.9,
          zIndex: 30,
          opacity: 0.88,
          filter: 'brightness(0.78) saturate(0.9)',
          boxShadow: '0 12px 28px -8px rgba(15, 23, 42, 0.3)',
          pointerEvents: 'auto' as const,
        };
      case 1:
        return {
          x: 140,
          y: -2,
          rotate: 13,
          scale: 0.9,
          zIndex: 30,
          opacity: 0.88,
          filter: 'brightness(0.78) saturate(0.9)',
          boxShadow: '0 12px 28px -8px rgba(15, 23, 42, 0.3)',
          pointerEvents: 'auto' as const,
        };
      case -2:
        return {
          x: -250,
          y: 26,
          rotate: -24,
          scale: 0.76,
          zIndex: 20,
          opacity: 0.58,
          filter: 'brightness(0.55) saturate(0.8)',
          boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.22)',
          pointerEvents: 'auto' as const,
        };
      case 2:
        return {
          x: 250,
          y: 26,
          rotate: 24,
          scale: 0.76,
          zIndex: 20,
          opacity: 0.58,
          filter: 'brightness(0.55) saturate(0.8)',
          boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.22)',
          pointerEvents: 'auto' as const,
        };
      default:
        return {
          x: diff > 0 ? 360 : -360,
          y: 60,
          rotate: diff > 0 ? 30 : -30,
          scale: 0.6,
          zIndex: 10,
          opacity: 0,
          filter: 'brightness(0.3)',
          boxShadow: 'none',
          pointerEvents: 'none' as const,
        };
    }
  };

  return (
    <section 
      className="relative w-full bg-[#F7F7F5] text-neutral-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 overflow-hidden select-none border-t border-black/[0.04]" 
      id="foundation"
    >
      {/* Ambient Blue & Indigo Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-500/8 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[480px] h-[240px] bg-indigo-500/6 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center relative z-10">
        
        {/* Section Header (Compact & Balanced) */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <TextReveal
            as="h2"
            text="Built on the structure of your software."
            delay={0.05}
            stagger={0.045}
            blur={6}
            yOffset="20%"
            className="text-2xl sm:text-3xl md:text-4xl font-sans font-medium tracking-tight text-neutral-900"
          />
          
          <TextReveal
            as="p"
            text="NEXORA doesn't treat a repository as a wall of text. It extracts structure, relationships, and context before generating an understanding of the system."
            delay={0.25}
            stagger={0.02}
            blur={5}
            yOffset="15%"
            className="text-neutral-600 text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed"
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3D CURVED ARC / FAN CAROUSEL DECK (COMPACT PROPORTIONAL SIZE)      */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative w-full h-[270px] sm:h-[300px] md:h-[320px] flex items-center justify-center my-2">
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
            
            {STAGES.map((stage, idx) => {
              const transform = getCardTransform(idx);
              const isActive = idx === activeStageIndex;

              return (
                <motion.div
                  key={stage.id}
                  onClick={() => setActiveStageIndex(idx)}
                  animate={{
                    x: transform.x,
                    y: transform.y,
                    rotate: transform.rotate,
                    scale: transform.scale,
                    opacity: transform.opacity,
                    zIndex: transform.zIndex,
                    filter: transform.filter,
                    boxShadow: transform.boxShadow,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 24,
                    mass: 0.8
                  }}
                  className={cn(
                    "absolute w-[190px] sm:w-[220px] md:w-[245px] h-[235px] sm:h-[265px] md:h-[285px] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer transition-colors duration-300",
                    "bg-black border text-white shadow-2xl",
                    isActive 
                      ? "border-white/40 ring-1 ring-white/20" 
                      : "border-white/10 hover:border-white/25"
                  )}
                  style={{
                    transformOrigin: '50% 120%',
                    pointerEvents: transform.pointerEvents,
                  }}
                >
                  {/* Card Background Visual Graphic */}
                  <div className="absolute inset-0 z-0 opacity-90 pointer-events-none bg-black">
                    <CardVisualArtwork stageIndex={idx} />
                  </div>

                  {/* Card Top Pill Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={cn(
                      "text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md bg-black/60",
                      stage.badgeColor
                    )}>
                      STAGE {stage.stepNum}
                    </span>
                    
                    {isActive ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 text-white text-[9px] font-mono border border-white/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-white/40">
                        {idx + 1}/5
                      </span>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="relative z-10 mt-auto bg-black/90 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/10">
                    <div className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-wide truncate">
                      {stage.title}
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 truncate mt-0.5">
                      {stage.subtitle}
                    </div>
                  </div>

                  {/* Subtle Glass Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-white/[0.05] to-transparent pointer-events-none" />
                </motion.div>
              );
            })}

          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* INFORMATION & FLANKING ARROW NAVIGATION (COMPACT & BALANCED)       */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mt-4 sm:mt-6 w-full max-w-2xl px-3">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous stage"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-neutral-50 active:scale-95 border border-neutral-200/90 flex items-center justify-center text-neutral-800 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_14px_rgba(37,99,235,0.15)] hover:border-blue-300 cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700" />
          </button>

          {/* Center Title, Subtitle, Description */}
          <div className="flex flex-col items-center text-center flex-1 max-w-md min-h-[95px] sm:min-h-[85px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                {/* Large Title */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold text-neutral-900 tracking-tight">
                  {activeStage.title}
                </h3>
                
                {/* Subtitle with Pin Icon */}
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-blue-600 mt-1 font-mono font-medium">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  <span>Stage {activeStage.stepNum} &bull; {activeStage.bullet}</span>
                </div>

                {/* Narrative Summary */}
                <p className="text-neutral-600 text-xs mt-1.5 leading-relaxed max-w-sm">
                  {activeStage.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next stage"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-neutral-50 active:scale-95 border border-neutral-200/90 flex items-center justify-center text-neutral-800 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_14px_rgba(37,99,235,0.15)] hover:border-blue-300 cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700" />
          </button>

        </div>

        {/* ------------------------------------------------------------------ */}
        {/* EXPLORE PILL BUTTON & STAGE PROGRESS INDICATORS                    */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-4 flex flex-col items-center gap-3.5">
          {/* Explore Button */}
          <button
            type="button"
            onClick={() => setSelectedStageForModal(activeStage)}
            className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 font-medium text-xs transition-all shadow-[0_3px_14px_rgba(37,99,235,0.22)] cursor-pointer flex items-center gap-1.5 font-sans tracking-wide hover:shadow-[0_4px_18px_rgba(37,99,235,0.32)]"
          >
            <span>Explore Stage {activeStage.stepNum}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Slide Dots Progress Indicator */}
          <div className="flex items-center gap-1.5">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                aria-label={`Go to stage ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  activeStageIndex === idx 
                    ? "w-6 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" 
                    : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                )}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DETAILED INSPECTION MODAL (TRIGGERED BY EXPLORE BUTTON)            */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {selectedStageForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-text">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStageForModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedStageForModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2.5 mb-2">
                <span className={cn("text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border", selectedStageForModal.badgeColor)}>
                  STAGE {selectedStageForModal.stepNum}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {selectedStageForModal.bullet}
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-white font-sans mt-1">
                {selectedStageForModal.title}
              </h3>
              <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
                {selectedStageForModal.description}
              </p>

              {/* Capabilities List */}
              <div className="my-5 space-y-2">
                <span className="text-xs font-mono uppercase font-bold text-neutral-400 tracking-wider">
                  Transformation Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedStageForModal.details.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs text-neutral-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Snippet / Output */}
              {selectedStageForModal.details.sampleCode && (
                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase font-bold text-neutral-400 tracking-wider">
                    Pipeline Execution Sample
                  </span>
                  <div className="p-3.5 rounded-xl bg-[#07080B] border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto">
                    <pre className="m-0 leading-relaxed">
                      <code>{selectedStageForModal.details.sampleCode}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedStageForModal.details.technicalOutput}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStageForModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* COMPACT CARD ARTWORK RENDERERS FOR EACH OF THE 5 STAGES                    */
/* -------------------------------------------------------------------------- */
const CardVisualArtwork: React.FC<{ stageIndex: number }> = ({ stageIndex }) => {
  switch (stageIndex) {
    case 0:
      return <Stage01Artwork />;
    case 1:
      return <Stage02Artwork />;
    case 2:
      return <Stage03Artwork />;
    case 3:
      return <Stage04Artwork />;
    case 4:
      return <Stage05Artwork />;
    default:
      return null;
  }
};

/* Stage 01: Code Intelligence Graphic */
const Stage01Artwork: React.FC = () => {
  return (
    <div className="w-full h-full p-3 flex flex-col justify-center relative font-mono overflow-hidden">
      {/* Laser Scanning Line */}
      <motion.div 
        className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#3B82F6] z-10"
        animate={{ top: ['15%', '85%', '15%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="p-2.5 rounded-lg bg-[#090A0E]/90 border border-blue-500/20 text-[9px] space-y-0.5 text-neutral-300">
        <div className="flex items-center gap-1 text-blue-400 font-bold border-b border-white/[0.08] pb-0.5 mb-1">
          <Code2 className="w-3 h-3" />
          <span>src/auth/service.ts</span>
        </div>
        <div className="text-white/90"><span className="text-blue-400">export class</span> <span className="text-amber-300">AuthService</span> &#123;</div>
        <div className="pl-2 text-white/80"><span className="text-purple-400">async</span> <span className="text-indigo-300">login</span>() &#123;</div>
        <div className="pl-3.5 text-white/70">const u = <span className="text-blue-400">await</span> db.find();</div>
        <div className="pl-3.5 text-white/70">return jwt.sign(&#123; u &#125;);</div>
        <div className="pl-2 text-white/80">&#125;</div>
        <div className="text-white/90">&#125;</div>
      </div>

      {/* Floating Extracted AST badges */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        <span className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-[8px] text-blue-300">
          fn login()
        </span>
        <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-[8px] text-indigo-300">
          class AuthService
        </span>
      </div>
    </div>
  );
};

/* Stage 02: Semantic Search Graphic */
const Stage02Artwork: React.FC = () => {
  return (
    <div className="w-full h-full p-3 flex flex-col justify-center relative font-mono overflow-hidden">
      {/* Search Input Simulation */}
      <div className="p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/40 text-[9px] text-indigo-200 flex items-center gap-1 mb-1.5 shadow-md">
        <Search className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
        <span className="truncate">"where is JWT verified?"</span>
      </div>

      {/* Vector Clusters */}
      <div className="space-y-1 text-[9px]">
        <motion.div 
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="p-1.5 rounded-md bg-[#090A0E]/90 border border-indigo-400/40 text-indigo-200 flex items-center justify-between"
        >
          <span className="truncate">auth.service.ts</span>
          <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/20 px-1 rounded">0.94</span>
        </motion.div>

        <motion.div 
          animate={{ x: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
          className="p-1.5 rounded-md bg-[#090A0E]/90 border border-violet-400/40 text-violet-200 flex items-center justify-between"
        >
          <span className="truncate">jwt.guard.ts</span>
          <span className="text-[8px] font-bold text-violet-400 bg-violet-500/20 px-1 rounded">0.91</span>
        </motion.div>
      </div>

      <div className="text-[8px] text-indigo-300 text-center mt-1.5 font-mono">
        Cosine Re-ranking &bull; 1536-dim
      </div>
    </div>
  );
};

/* Stage 03: Dependency Relationships Graphic */
const Stage03Artwork: React.FC = () => {
  return (
    <div className="w-full h-full p-3 flex flex-col justify-center relative font-mono overflow-hidden">
      <div className="flex items-center justify-between text-[8px] text-purple-300 uppercase font-bold mb-1.5">
        <span className="flex items-center gap-1">
          <Network className="w-2.5 h-2.5 text-purple-400" />
          <span>Call Chain</span>
        </span>
        <span className="text-white/40">Directed</span>
      </div>

      <div className="space-y-0.5 text-[8.5px]">
        <div className="p-1 rounded bg-blue-950/70 border border-blue-500/40 text-blue-200 text-center">
          POST /api/v2/login
        </div>
        <div className="flex justify-center text-purple-400 text-[8px]">&darr;</div>
        <div className="p-1 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-center">
          AuthController.login()
        </div>
        <div className="flex justify-center text-purple-400 text-[8px]">&darr;</div>
        <div className="p-1 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-center">
          PostgreSQL (users_table)
        </div>
      </div>
    </div>
  );
};

/* Stage 04: Repository Context Graphic */
const Stage04Artwork: React.FC = () => {
  return (
    <div className="w-full h-full p-3 flex flex-col justify-center relative font-mono overflow-hidden">
      <div className="flex items-center justify-between text-[8px] text-amber-300 uppercase font-bold mb-1.5">
        <span className="flex items-center gap-1">
          <FileCheck className="w-2.5 h-2.5 text-amber-400" />
          <span>Evidence Grounding</span>
        </span>
        <span className="text-emerald-400 font-semibold">Verified</span>
      </div>

      <div className="p-2 rounded-lg bg-[#090A0E]/90 border border-amber-500/30 text-[8.5px] text-neutral-300 space-y-0.5">
        <div className="flex items-center justify-between text-[8px] text-white/50 border-b border-white/10 pb-0.5">
          <span className="text-amber-300 font-bold">auth.service.ts</span>
          <span>L42–L50</span>
        </div>
        <div className="text-emerald-300 text-[8px] font-medium">✓ AST Anchor Resolved</div>
        <div className="text-white/80 pl-1 border-l border-amber-400/40 truncate">
          const user = await db.users.findUnique();
        </div>
      </div>

      <div className="mt-1.5 p-1 rounded bg-emerald-950/50 border border-emerald-500/30 text-[8px] text-emerald-300 text-center flex items-center justify-center gap-1">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>100% Deterministic Fact</span>
      </div>
    </div>
  );
};

/* Stage 05: Architecture Mapping Graphic */
const Stage05Artwork: React.FC = () => {
  return (
    <div className="w-full h-full p-3 flex flex-col justify-center relative font-mono overflow-hidden">
      <div className="text-center mb-1.5">
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[8px] text-emerald-300 font-bold uppercase tracking-wider">
          System Architecture Map
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[8px]">
        <div className="p-1.5 rounded-md bg-[#090A0E]/90 border border-blue-500/30 text-center flex flex-col items-center">
          <Layers className="w-3 h-3 text-blue-400 mb-0.5" />
          <span className="font-bold text-white">Frontend</span>
          <span className="text-white/40 text-[7px]">Next.js</span>
        </div>

        <div className="p-1.5 rounded-md bg-[#090A0E]/90 border border-indigo-500/30 text-center flex flex-col items-center">
          <Server className="w-3 h-3 text-indigo-400 mb-0.5" />
          <span className="font-bold text-white">Gateway</span>
          <span className="text-white/40 text-[7px]">Fastify</span>
        </div>

        <div className="p-1.5 rounded-md bg-[#090A0E]/90 border border-purple-500/30 text-center flex flex-col items-center">
          <Cpu className="w-3 h-3 text-purple-400 mb-0.5" />
          <span className="font-bold text-white">Services</span>
          <span className="text-white/40 text-[7px]">Auth</span>
        </div>

        <div className="p-1.5 rounded-md bg-[#090A0E]/90 border border-emerald-500/30 text-center flex flex-col items-center">
          <Database className="w-3 h-3 text-emerald-400 mb-0.5" />
          <span className="font-bold text-white">Storage</span>
          <span className="text-white/40 text-[7px]">Postgres</span>
        </div>
      </div>

      <div className="text-[8px] text-neutral-400 text-center mt-1.5 font-mono">
        Mental Model Synthesizer
      </div>
    </div>
  );
};

export default EngineeredIntelligence;
