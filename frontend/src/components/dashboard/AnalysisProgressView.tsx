import React from 'react';
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
  CheckCheck
} from 'lucide-react';
import type { SavedRepository } from '../../hooks/useRepositories';
import type { AnalysisJob, AnalysisStage } from '../../hooks/useAnalysisJob';

interface AnalysisProgressViewProps {
  repository: SavedRepository;
  job: AnalysisJob | null;
  isStarting?: boolean;
  onBackToDetails: () => void;
  onRetry: () => void;
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
    title: 'Preparing Analysis Job',
    description: 'Validating repository authorization and initializing analysis pipeline',
    icon: Sparkles
  },
  {
    id: 'stage-2',
    stageKey: 'FETCHING_REPOSITORY',
    title: 'Fetching Repository Hierarchy',
    description: 'Retrieving repository file tree, branches, and commit metadata',
    icon: GitBranch
  },
  {
    id: 'stage-3',
    stageKey: 'SCANNING',
    title: 'Scanning Codebase Structure',
    description: 'Inspecting module boundaries, language composition, and source files',
    icon: FileCode2
  },
  {
    id: 'stage-4',
    stageKey: 'COMPLETED',
    title: 'Analysis Complete',
    description: 'Repository structure verified and indexed for NEXORA workspace',
    icon: CheckCheck
  }
];

const STAGE_ORDER: Record<AnalysisStage, number> = {
  QUEUED: 0,
  INITIALIZING: 1,
  FETCHING_REPOSITORY: 2,
  SCANNING: 3,
  COMPLETED: 4,
  FAILED: -1
};

export const AnalysisProgressView: React.FC<AnalysisProgressViewProps> = ({
  repository,
  job,
  isStarting = false,
  onBackToDetails,
  onRetry
}) => {
  const currentStage = job?.currentStage || (isStarting ? 'QUEUED' : 'QUEUED');
  const isFailed = job?.status === 'FAILED';
  const isCompleted = job?.status === 'COMPLETED';
  const isRunning = !isFailed && !isCompleted;

  const currentStageIndex = STAGE_ORDER[currentStage] !== undefined 
    ? STAGE_ORDER[currentStage] 
    : 0;

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
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-8">
        
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
                <span>Analysis Complete</span>
              </span>
            ) : isFailed ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-bold shadow-2xs">
                <AlertCircle className="w-4 h-4 text-red-600 stroke-[2.5]" />
                <span>Analysis Failed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin stroke-[2.5]" />
                <span>Processing Pipeline...</span>
              </span>
            )}
          </div>
        </div>

        {/* Stage-Based Progress Checklist */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Analysis Pipeline Progression
          </h2>

          <div className="space-y-3">
            {STAGES.map((step, index) => {
              const stepIndex = index + 1; // 1, 2, 3, 4
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
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Repository Analyzed Successfully
              </h3>
              <p className="text-xs text-slate-600 max-w-lg">
                Your repository has been analyzed and registered. In Milestone M10, detailed AST hierarchy visuals and architecture graphs will be rendered here.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onBackToDetails}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                Repository Details
              </button>

              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white/80 bg-blue-600/70 rounded-full cursor-not-allowed shadow-2xs"
                title="Detailed graph visualization will activate in Milestone M10"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>View Analysis (M10)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
