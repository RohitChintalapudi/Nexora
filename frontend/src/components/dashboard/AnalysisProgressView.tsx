import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  GitBranch, 
  Lock, 
  Globe, 
  Check, 
  Circle, 
  Cpu, 
  FileCode2, 
  Filter, 
  Database, 
  CheckCheck, 
  Code2, 
  Network, 
  Route as RouteIcon, 
  Layers, 
  Box,
  Binary,
  Search,
  Zap,
  Bot,
  Workflow,
  FileText,
  Activity,
  ArrowRight,
  Clock,
  Timer,
  Hourglass,
  Gauge
} from 'lucide-react';
import type { SavedRepository } from '../../hooks/useRepositories';
import type { AnalysisJob, AnalysisStage } from '../../hooks/useAnalysisJob';

interface AnalysisProgressViewProps {
  repository: SavedRepository;
  job: AnalysisJob | null;
  isStarting?: boolean;
  onBackToDetails: () => void;
  onRetry: () => void;
  onViewAnalysis?: () => void;
}

interface StageStep {
  id: string;
  stageKey: AnalysisStage;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STAGES: StageStep[] = [
  {
    id: 'stage-1',
    stageKey: 'INITIALIZING',
    title: 'Initializing Analysis Pipeline',
    description: 'Validating GitHub OAuth authorization and creating isolated temporary workspace',
    icon: Sparkles
  },
  {
    id: 'stage-2',
    stageKey: 'FETCHING_REPOSITORY',
    title: 'Fetching & Extracting Archive',
    description: 'Retrieving repository zipball stream from GitHub with Zip-Slip protection',
    icon: GitBranch
  },
  {
    id: 'stage-3',
    stageKey: 'SCANNING_FILES',
    title: 'Scanning File Hierarchy',
    description: 'Recursively walking directories and inspecting file boundaries',
    icon: FileCode2
  },
  {
    id: 'stage-4',
    stageKey: 'FILTERING_FILES',
    title: 'Applying Ignore & Binary Filters',
    description: 'Filtering .gitignore rules, node_modules, build outputs, and binary assets',
    icon: Filter
  },
  {
    id: 'stage-5',
    stageKey: 'PERSISTING_FILES',
    title: 'Persisting Repository Files',
    description: 'Storing bounded source file records and language metadata in database',
    icon: Database
  },
  {
    id: 'stage-6',
    stageKey: 'PARSING_FILES',
    title: 'AST Syntax Tree Parsing',
    description: 'Parsing TypeScript, JavaScript, Python, and system languages into normalized ASTs',
    icon: Code2
  },
  {
    id: 'stage-7',
    stageKey: 'EXTRACTING_SYMBOLS',
    title: 'Deterministic Symbol Extraction',
    description: 'Extracting functions, classes, methods, React components, types, interfaces, and enums',
    icon: Box
  },
  {
    id: 'stage-8',
    stageKey: 'EXTRACTING_IMPORTS',
    title: 'Import & Module Resolution',
    description: 'Resolving relative imports, tsconfig path aliases (@/*), and module dependencies',
    icon: Layers
  },
  {
    id: 'stage-9',
    stageKey: 'DETECTING_ROUTES',
    title: 'API & Convention Route Detection',
    description: 'Identifying Express, FastAPI, Flask, and Next.js App/Pages route handlers',
    icon: RouteIcon
  },
  {
    id: 'stage-10',
    stageKey: 'BUILDING_RELATIONSHIPS',
    title: 'Building Relationship Graph',
    description: 'Mapping deterministic IMPORTS, EXTENDS, IMPLEMENTS, and ROUTES_TO edges',
    icon: Network
  },
  {
    id: 'stage-11',
    stageKey: 'EXTRACTING_PROJECT_METADATA',
    title: 'Project & Architectural Classification',
    description: 'Detecting frameworks, database indicators, entry points, and classifying architectural roles',
    icon: Cpu
  },
  {
    id: 'stage-12',
    stageKey: 'CHUNKING_FILES',
    title: 'Semantic Code Chunking',
    description: 'AST symbol-guided, markdown heading, and configuration chunking with SHA-256 deduplication',
    icon: Binary
  },
  {
    id: 'stage-13',
    stageKey: 'GENERATING_EMBEDDINGS',
    title: 'Generating Vector Embeddings',
    description: 'Batch-producing 384-dimensional dense vector embeddings with Xenova/all-MiniLM-L6-v2',
    icon: Zap
  },
  {
    id: 'stage-14',
    stageKey: 'STORING_EMBEDDINGS',
    title: 'pgvector & HNSW Cosine Indexing',
    description: 'Persisting vectors in PostgreSQL code_chunks with HNSW fast similarity index',
    icon: Search
  },
  {
    id: 'stage-15',
    stageKey: 'LOADING_CODEBASE_CONTEXT',
    title: 'Loading Codebase Intelligence',
    description: 'Loading deterministic AST symbols, routes, relationships, and metadata facts',
    icon: Bot
  },
  {
    id: 'stage-16',
    stageKey: 'ANALYZING_TECHNOLOGIES',
    title: 'Analyzing Technology Stack',
    description: 'Inferring frameworks, runtimes, package manager, and databases with evidence grounding',
    icon: Cpu
  },
  {
    id: 'stage-17',
    stageKey: 'ANALYZING_ARCHITECTURE',
    title: 'Analyzing Architecture & Patterns',
    description: 'Explaining architectural style, system layers, and component relationships',
    icon: Workflow
  },
  {
    id: 'stage-18',
    stageKey: 'ANALYZING_MODULES',
    title: 'Analyzing Functional Domains',
    description: 'Identifying key modules, domains, symbols, and core file responsibilities',
    icon: Box
  },
  {
    id: 'stage-19',
    stageKey: 'ANALYZING_APPLICATION_FLOW',
    title: 'Tracing Application Lifecycle',
    description: 'Mapping request execution flow from entry points through system layers',
    icon: Activity
  },
  {
    id: 'stage-20',
    stageKey: 'GENERATING_SUMMARY',
    title: 'Generating Developer Quickstart',
    description: 'Synthesizing executive overview, important files, and onboarding guide with Groq LLM',
    icon: FileText
  },
  {
    id: 'stage-21',
    stageKey: 'PERSISTING_ANALYSIS',
    title: 'Persisting Analysis to PostgreSQL',
    description: 'Saving structured, validated analysis record in repository_analyses table',
    icon: Database
  },
  {
    id: 'stage-22',
    stageKey: 'COMPLETED',
    title: 'Full Repository Intelligence Ready',
    description: 'Codebase intelligence graph, vector search, and AI analysis completed successfully',
    icon: CheckCheck
  }
];

const STAGE_ORDER: Record<AnalysisStage, number> = {
  QUEUED: 0,
  INITIALIZING: 1,
  FETCHING_REPOSITORY: 2,
  SCANNING_FILES: 3,
  FILTERING_FILES: 4,
  PERSISTING_FILES: 5,
  PARSING_FILES: 6,
  EXTRACTING_SYMBOLS: 7,
  EXTRACTING_IMPORTS: 8,
  EXTRACTING_EXPORTS: 8,
  DETECTING_ROUTES: 9,
  BUILDING_RELATIONSHIPS: 10,
  EXTRACTING_PROJECT_METADATA: 11,
  INTELLIGENCE_COMPLETE: 11,
  CHUNKING_FILES: 12,
  GENERATING_EMBEDDINGS: 13,
  STORING_EMBEDDINGS: 14,
  INDEXING_COMPLETE: 14,
  LOADING_CODEBASE_CONTEXT: 15,
  RETRIEVING_CONTEXT: 15,
  ANALYZING_TECHNOLOGIES: 16,
  ANALYZING_ARCHITECTURE: 17,
  ANALYZING_MODULES: 18,
  ANALYZING_APPLICATION_FLOW: 19,
  GENERATING_SUMMARY: 20,
  PERSISTING_ANALYSIS: 21,
  COMPLETED: 22,
  FAILED: -1
};

// Empirical baseline execution weights (in seconds) for each pipeline stage (tuned for accelerated pipeline)
const STAGE_WEIGHTS: Record<AnalysisStage, number> = {
  QUEUED: 1,
  INITIALIZING: 1,
  FETCHING_REPOSITORY: 3,
  SCANNING_FILES: 1,
  FILTERING_FILES: 1,
  PERSISTING_FILES: 1,
  PARSING_FILES: 2,
  EXTRACTING_SYMBOLS: 1,
  EXTRACTING_IMPORTS: 1,
  EXTRACTING_EXPORTS: 1,
  DETECTING_ROUTES: 1,
  BUILDING_RELATIONSHIPS: 1,
  EXTRACTING_PROJECT_METADATA: 1,
  INTELLIGENCE_COMPLETE: 1,
  CHUNKING_FILES: 1,
  GENERATING_EMBEDDINGS: 5, // Accelerated batch vector generation
  STORING_EMBEDDINGS: 1,
  INDEXING_COMPLETE: 1,
  LOADING_CODEBASE_CONTEXT: 1,
  RETRIEVING_CONTEXT: 2,
  ANALYZING_TECHNOLOGIES: 2,
  ANALYZING_ARCHITECTURE: 2,
  ANALYZING_MODULES: 2,
  ANALYZING_APPLICATION_FLOW: 2,
  GENERATING_SUMMARY: 3,
  PERSISTING_ANALYSIS: 1,
  COMPLETED: 0,
  FAILED: 0
};

const TOTAL_BASELINE_WEIGHT = STAGES.slice(0, 21).reduce((sum, s) => sum + (STAGE_WEIGHTS[s.stageKey] || 3), 0);

// Helper to format seconds to mm:ss format
function formatMinutesSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Helper to format remaining time nicely (e.g. "~35s", "~1m 10s", "Finishing touches...")
function formatRemainingTime(seconds: number): string {
  if (seconds <= 2) return 'Finishing touches...';
  if (seconds < 60) return `~${seconds}s remaining`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `~${m}m ${s}s remaining` : `~${m}m remaining`;
}

// Helper to format full duration nicely (e.g. "47 seconds", "1m 12s")
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m} minutes`;
}

export const AnalysisProgressView: React.FC<AnalysisProgressViewProps> = ({
  repository,
  job,
  isStarting = false,
  onBackToDetails,
  onRetry,
  onViewAnalysis
}) => {
  const currentStage = job?.currentStage || (isStarting ? 'QUEUED' : 'QUEUED');
  const isFailed = job?.status === 'FAILED';
  const isCompleted = job?.status === 'COMPLETED';
  const isRunning = !isFailed && !isCompleted;

  const currentStageIndex = STAGE_ORDER[currentStage] !== undefined 
    ? STAGE_ORDER[currentStage] 
    : 0;

  // Local clock for live 1-second interval ticking
  const [now, setNow] = useState<number>(Date.now());
  const initialMountTimeRef = useRef<number>(Date.now());
  const stageStartTimeRef = useRef<{ stage: AnalysisStage; timestamp: number }>({
    stage: currentStage,
    timestamp: Date.now()
  });

  // Track stage transitions for sub-stage time estimation
  useEffect(() => {
    if (stageStartTimeRef.current.stage !== currentStage) {
      stageStartTimeRef.current = {
        stage: currentStage,
        timestamp: Date.now()
      };
    }
  }, [currentStage]);

  // 1-second interval timer while running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Calculate elapsed time in seconds
  const startTimestamp = job?.startedAt 
    ? new Date(job.startedAt).getTime() 
    : (job?.createdAt ? new Date(job.createdAt).getTime() : initialMountTimeRef.current);

  const completionTimestamp = job?.completedAt ? new Date(job.completedAt).getTime() : null;

  const elapsedSeconds = isCompleted && completionTimestamp
    ? Math.max(1, Math.round((completionTimestamp - startTimestamp) / 1000))
    : Math.max(0, Math.floor((now - startTimestamp) / 1000));

  // Time spent in the current stage
  const stageElapsedSeconds = Math.max(0, Math.floor((now - stageStartTimeRef.current.timestamp) / 1000));

  // Sum of baseline weights of already completed stages
  let completedWeight = 0;
  for (let i = 0; i < STAGES.length - 1; i++) {
    const stepIndex = i + 1;
    if (currentStageIndex > stepIndex) {
      completedWeight += STAGE_WEIGHTS[STAGES[i].stageKey] || 3;
    }
  }

  // Current stage baseline weight and sub-stage progress fraction
  const currentStageWeight = STAGE_WEIGHTS[currentStage] || 3;
  const currentStageSubWeight = Math.min(
    currentStageWeight * 0.85, 
    stageElapsedSeconds * 0.9
  );

  // Total progress weight so far
  const totalProgressWeightSoFar = Math.min(
    TOTAL_BASELINE_WEIGHT,
    completedWeight + currentStageSubWeight
  );

  // Dynamic Progress Percentage (0% to 100%)
  let progressPercentage = 0;
  if (isCompleted) {
    progressPercentage = 100;
  } else if (isFailed) {
    progressPercentage = Math.round((completedWeight / TOTAL_BASELINE_WEIGHT) * 100);
  } else if (currentStageIndex === 0) {
    progressPercentage = 3;
  } else {
    progressPercentage = Math.min(
      98,
      Math.max(4, Math.round((totalProgressWeightSoFar / TOTAL_BASELINE_WEIGHT) * 100))
    );
  }

  // Adaptive Estimation Velocity (Observed progress rate)
  const remainingWeight = Math.max(0, TOTAL_BASELINE_WEIGHT - totalProgressWeightSoFar);
  
  let speedFactor = 1.0;
  if (elapsedSeconds > 4 && totalProgressWeightSoFar > 4) {
    speedFactor = totalProgressWeightSoFar / elapsedSeconds;
    // Bound speed factor between 0.4x and 2.5x to prevent erratic estimates
    speedFactor = Math.min(2.5, Math.max(0.4, speedFactor));
  }

  // Estimated Remaining Seconds
  const estimatedRemainingSeconds = isCompleted
    ? 0
    : isFailed
      ? 0
      : Math.max(2, Math.round(remainingWeight / speedFactor));

  // Active step details
  const activeStep = STAGES.find(s => s.stageKey === currentStage) || STAGES[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Navigation */}
      <button
        type="button"
        onClick={onBackToDetails}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Repository</span>
      </button>

      {/* Main Status & Progress Container */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-7">
        
        {/* Header: Repository Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  repository.private
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                {repository.private ? (
                  <>
                    <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Public</span>
                  </>
                )}
              </span>

              {repository.language && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{repository.language}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {repository.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {repository.fullName}
            </p>
          </div>

          {/* Dynamic Job Status Badge */}
          <div className="shrink-0">
            {isCompleted ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Intelligence Ready</span>
              </span>
            ) : isFailed ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-bold shadow-2xs">
                <AlertCircle className="w-4 h-4 text-red-600 stroke-[2.5]" />
                <span>Analysis Failed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin stroke-[2.5]" />
                <span>Analyzing Codebase...</span>
              </span>
            )}
          </div>
        </div>

        {/* Real-time Dynamic Progress & Estimated Timer Dashboard */}
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white p-5 space-y-4 shadow-2xs">
          
          {/* Top Timer Metrics Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Left: Current Step & Percentage */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <span>{progressPercentage}%</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {isCompleted 
                      ? 'Analysis Completed Successfully' 
                      : isFailed 
                        ? 'Analysis Interrupted' 
                        : `Step ${Math.min(22, Math.max(1, currentStageIndex))} of 22: ${activeStep.title}`}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {isCompleted 
                    ? 'All symbols, graph relationships, vector embeddings & AI models ready.'
                    : activeStep.description}
                </p>
              </div>
            </div>

            {/* Right: Live Elapsed & Estimated Timer Cards */}
            <div className="flex items-center gap-2.5 sm:self-center shrink-0">
              
              {/* Elapsed Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    Elapsed
                  </span>
                  <span className="text-xs font-mono font-extrabold text-slate-900">
                    {formatMinutesSeconds(elapsedSeconds)}
                  </span>
                </div>
              </div>

              {/* Estimated Time Remaining (or Total Time if completed) */}
              {isCompleted ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
                  <Timer className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 leading-none">
                      Total Time
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-950">
                      {formatDuration(elapsedSeconds)}
                    </span>
                  </div>
                </div>
              ) : isRunning ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 shadow-2xs">
                  <Hourglass className="w-3.5 h-3.5 text-blue-600 animate-spin stroke-[2.5]" style={{ animationDuration: '3s' }} />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 leading-none">
                      Est. Remaining
                    </span>
                    <span className="text-xs font-mono font-extrabold text-blue-950">
                      {formatRemainingTime(estimatedRemainingSeconds)}
                    </span>
                  </div>
                </div>
              ) : null}

            </div>
          </div>

          {/* Animated Gradient Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 relative">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isFailed
                      ? 'bg-red-500'
                      : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Shimmer highlight animation while running */}
                {isRunning && (
                  <div 
                    className="absolute inset-0 bg-white/25 rounded-full animate-pulse"
                  />
                )}
              </div>
            </div>

            {/* Sub-label showing adaptive status */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-slate-400" />
                <span>
                  {isRunning 
                    ? `Adaptive timer tuned for ${repository.language || 'source'} codebase`
                    : isCompleted 
                      ? `Full pipeline finished in ${formatDuration(elapsedSeconds)}`
                      : 'Analysis stopped'}
                </span>
              </span>
              <span className="font-semibold text-slate-600">
                {progressPercentage}%
              </span>
            </div>
          </div>

        </div>

        {/* Real-time Ingestion, Intelligence & Embedding Statistics */}
        {job && (job.filesScanned || 0) > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileCode2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 truncate">Source Files</p>
                <p className="text-sm font-extrabold text-slate-900">{job.filesIncluded || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Box className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 truncate">Symbols</p>
                <p className="text-sm font-extrabold text-purple-700">{job.symbolsCount ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 truncate">Relationships</p>
                <p className="text-sm font-extrabold text-emerald-700">{job.relationshipsCount ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RouteIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 truncate">Routes</p>
                <p className="text-sm font-extrabold text-amber-700">{job.routesCount ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Binary className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 truncate">Code Chunks</p>
                <p className="text-sm font-extrabold text-indigo-700">{job.chunksCount ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 truncate">Embeddings</p>
                <p className="text-sm font-extrabold text-cyan-700">{job.embeddingsCount ?? '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stage-Based Progress Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pipeline Stages (22 Steps)
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              {isCompleted ? '22 / 22 Completed' : `${Math.min(22, Math.max(0, currentStageIndex - 1))} Completed`}
            </span>
          </div>

          <div className="space-y-3">
            {STAGES.map((step, index) => {
              const stepIndex = index + 1;
              const isStepDone = !isFailed && currentStageIndex >= stepIndex;
              const isStepActive = isRunning && (currentStageIndex === stepIndex - 1 || (currentStageIndex === 0 && index === 0));

              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    isStepDone
                      ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                      : isStepActive
                        ? 'bg-blue-50/40 border-blue-300 shadow-[0_4px_16px_rgba(37,99,235,0.06)] ring-1 ring-blue-400'
                        : isFailed && currentStageIndex === stepIndex - 1
                          ? 'bg-red-50/40 border-red-200'
                          : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                  }`}
                >
                  {/* Step Indicator Icon */}
                  <div className="mt-0.5 shrink-0">
                    {isStepDone ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : isStepActive ? (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                      </div>
                    ) : isFailed && currentStageIndex === stepIndex - 1 ? (
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                        <Circle className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${
                        isStepDone 
                          ? 'text-emerald-700' 
                          : isStepActive 
                            ? 'text-blue-700' 
                            : 'text-slate-400'
                      }`} />
                      <h3 className={`text-xs sm:text-sm font-bold ${
                        isStepDone 
                          ? 'text-emerald-950' 
                          : isStepActive 
                            ? 'text-blue-950 font-extrabold' 
                            : 'text-slate-600'
                      }`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className={`text-xs mt-0.5 ${
                      isStepDone 
                        ? 'text-emerald-800/80' 
                        : isStepActive 
                          ? 'text-blue-800' 
                          : 'text-slate-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Failure Banner & Retry Action */}
        {isFailed && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{job?.errorMessage || 'Analysis encountered an unexpected failure.'}</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={onBackToDetails}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-full transition-colors cursor-pointer"
              >
                Back to Repository
              </button>
            </div>
          </div>
        )}

        {/* Completion Milestone Card */}
        {isCompleted && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                <span>Analysis Complete in {formatDuration(elapsedSeconds)}</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Codebase Intelligence & Architecture Ready
              </h3>
              <p className="text-xs text-slate-600 max-w-lg">
                Structured repository analysis, architecture layers, technology facts, and onboarding quickstart are fully synthesized and ready for exploration.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onBackToDetails}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                Repo Details
              </button>

              {onViewAnalysis && (
                <button
                  type="button"
                  onClick={onViewAnalysis}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
