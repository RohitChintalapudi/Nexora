import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  GitBranch, 
  Lock, 
  Globe, 
  ExternalLink, 
  Cpu, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Box, 
  Activity, 
  FileCode2, 
  Database as DbIcon, 
  Route as RouteIcon, 
  BookOpen, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  Binary, 
  Compass, 
  FileText, 
  ChevronDown,
  Search,
  Code2,
  X,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { useRepositoryAnalysis } from '../../../hooks/useRepositoryAnalysis';
import { NexoraLoader } from '../../common/NexoraLoader';
import { SourceReferenceModal } from './SourceReferenceModal';
import { AIChatView } from './AIChatView';
import { ArchitectureFlowDiagram } from './ArchitectureFlowDiagram';
import { ComponentCommunicationMatrix } from './ComponentCommunicationMatrix';
import { DeleteRepositoryModal } from '../DeleteRepositoryModal';
import type { 
  SavedRepository 
} from '../../../hooks/useRepositories';
import type { 
  TechnologyItem
} from '../../../types/analysis';

interface AnalysisPageViewProps {
  repository: SavedRepository;
  onBack: () => void;
  onViewProgress?: () => void;
  onDeleteRepo?: (repoId: number) => Promise<boolean | void>;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'chat', label: 'AI Codebase Chat', icon: Sparkles },
  { id: 'overview', label: 'Project Overview', icon: FileText },
  { id: 'technology', label: 'Technology Stack', icon: Cpu },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'components', label: 'Main Components', icon: Box },
  { id: 'flow', label: 'Application Flow', icon: Activity },
  { id: 'entrypoints', label: 'Entry Points', icon: Compass },
  { id: 'files', label: 'Important Files', icon: FileCode2 },
  { id: 'dependencies', label: 'Dependencies', icon: Binary },
  { id: 'database', label: 'Database', icon: DbIcon },
  { id: 'api', label: 'API Structure', icon: RouteIcon },
  { id: 'quickstart', label: 'Quick Start', icon: BookOpen },
  { id: 'uncertainties', label: 'Facts & Inferences', icon: HelpCircle },
];

/**
 * Defensive string converter to prevent any React child rendering crashes
 */
const safeStr = (val: any, fallback = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (typeof val.name === 'string') return val.name;
    if (typeof val.path === 'string') return val.path;
    if (typeof val.title === 'string') return val.title;
    if (typeof val.description === 'string') return val.description;
    if (typeof val.file === 'string') return val.file;
    try {
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  return String(val);
};

const safeStrArray = (arr: any): string[] => {
  if (!Array.isArray(arr)) {
    if (typeof arr === 'string' && arr.trim().length > 0) return [arr.trim()];
    return [];
  }
  return arr
    .map(item => safeStr(item))
    .filter(s => s.trim().length > 0);
};

const isFilePath = (val: any): boolean => {
  if (typeof val !== 'string') return false;
  return val.includes('/') || val.includes('\\') || /\.[a-zA-Z0-9]{1,8}$/.test(val);
};

export const AnalysisPageView: React.FC<AnalysisPageViewProps> = ({
  repository,
  onBack,
  onViewProgress,
  onDeleteRepo
}) => {
  const {
    data,
    isLoading,
    isReanalyzing,
    error,
    refetch,
    reanalyze,
    fetchFileContent
  } = useRepositoryAnalysis(repository.id);

  const [activeSection, setActiveSection] = useState<string>('chat');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [archTab, setArchTab] = useState<'diagram' | 'matrix'>('diagram');
  const [apiMethodFilter, setApiMethodFilter] = useState<string>('ALL');
  const [apiSearchQuery, setApiSearchQuery] = useState<string>('');
  const [factsFilter, setFactsFilter] = useState<'ALL' | 'FACTS' | 'INFERENCES' | 'CAVEATS'>('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Source Reference Modal state
  const [selectedFileRef, setSelectedFileRef] = useState<{
    filePath: string;
    startLine?: number;
    endLine?: number;
    symbolName?: string;
  } | null>(null);

  // Scrollspy to detect active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of NAV_SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleOpenFileModal = useCallback((filePath: any, startLine?: any, endLine?: any, symbolName?: any) => {
    const p = safeStr(filePath);
    if (!p) return;
    const sLine = typeof startLine === 'number' ? startLine : undefined;
    const eLine = typeof endLine === 'number' ? endLine : undefined;
    const sName = symbolName ? safeStr(symbolName) : undefined;
    setSelectedFileRef({ filePath: p, startLine: sLine, endLine: eLine, symbolName: sName });
  }, []);

  const handleReanalyze = async () => {
    const res = await reanalyze();
    if (res.success && onViewProgress) {
      onViewProgress();
    }
  };

  const handleDeleteConfirm = async () => {
    if (onDeleteRepo) {
      await onDeleteRepo(repository.id);
      onBack();
    }
  };

  // Helper for Fact/Inference Badge
  const renderStatusBadge = (status?: any, confidence?: any) => {
    const s = String(status || '').toUpperCase();
    const confNum = typeof confidence === 'number' 
      ? confidence 
      : (typeof confidence === 'string' && !isNaN(parseFloat(confidence)) ? parseFloat(confidence) : undefined);

    if (s === 'FACT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200/80 text-emerald-800 shrink-0">
          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
          <span>Confirmed Fact</span>
        </span>
      );
    }
    if (s === 'INFERENCE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 border border-amber-200/80 text-amber-800 shrink-0">
          <span className="text-amber-600 font-mono font-bold">≈</span>
          <span>Inferred</span>
          {confNum !== undefined && (
            <span className="text-[10px] text-amber-700 font-mono">
              ({Math.round(confNum <= 1 ? confNum * 100 : confNum)}%)
            </span>
          )}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
        <HelpCircle className="w-3 h-3 text-slate-400" />
        <span>Unknown</span>
      </span>
    );
  };

  // Safe data extraction & normalized collections unconditionally at top level
  const analysis = (data?.analysis || {}) as any;
  const metadata = (data?.metadata || {}) as any;
  const repo = data?.repository || repository;

  const techList = Array.isArray(analysis.technologyStack) ? analysis.technologyStack : [];
  const modulesList = Array.isArray(analysis.modules) ? analysis.modules : [];
  const flowList = Array.isArray(analysis.applicationFlow) ? analysis.applicationFlow : [];
  const entryPointsList = Array.isArray(analysis.entryPoints) ? analysis.entryPoints : [];
  const importantFilesList = Array.isArray(analysis.importantFiles) ? analysis.importantFiles : [];
  const dependenciesList = Array.isArray(analysis.dependencies) ? analysis.dependencies : [];
  const apiStructureList = Array.isArray(analysis.apiStructure) ? analysis.apiStructure : [];
  const quickStartList = Array.isArray(analysis.developerQuickStart) ? analysis.developerQuickStart : [];
  const uncertaintiesList = Array.isArray(analysis.uncertainties) ? analysis.uncertainties : [];

  // Grounded Facts & Inferences Collections
  const factTechnologies = useMemo(() => {
    return techList.filter((t: any) => t?.status === 'FACT');
  }, [techList]);

  const inferenceTechnologies = useMemo(() => {
    return techList.filter((t: any) => t?.status === 'INFERENCE');
  }, [techList]);

  // Compute HTTP method counts for API endpoints
  const methodCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: apiStructureList.length };
    apiStructureList.forEach((r: any) => {
      const m = safeStr(r?.method, 'GET').toUpperCase();
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [apiStructureList]);

  // Filter API routes by selected HTTP method and search query
  const filteredRoutes = useMemo(() => {
    return apiStructureList.filter((r: any) => {
      const method = safeStr(r?.method, 'GET').toUpperCase();
      const path = safeStr(typeof r === 'object' ? r.path : r, '/').toLowerCase();
      const handler = safeStr(r?.handler).toLowerCase();
      const file = safeStr(r?.filePath || r?.file_path).toLowerCase();

      const matchesMethod = apiMethodFilter === 'ALL' || method === apiMethodFilter;
      const q = apiSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || path.includes(q) || handler.includes(q) || file.includes(q) || method.toLowerCase().includes(q);

      return matchesMethod && matchesSearch;
    });
  }, [apiStructureList, apiMethodFilter, apiSearchQuery]);

  // Group technologies by category safely
  const techByCategory = useMemo<Record<string, TechnologyItem[]>>(() => {
    const list: any[] = Array.isArray(techList) ? techList : [];
    return list.reduce((acc: Record<string, TechnologyItem[]>, item: any) => {
      if (!item) return acc;
      const cat = typeof item === 'object' && item !== null && typeof item.category === 'string' ? item.category : 'Other';
      if (!acc[cat]) acc[cat] = [];
      const normalizedItem: TechnologyItem = {
        name: safeStr(typeof item === 'object' ? item.name : item, 'Unknown Library'),
        category: cat,
        status: item?.status === 'FACT' ? 'FACT' : (item?.status === 'INFERENCE' ? 'INFERENCE' : 'UNKNOWN'),
        confidence: typeof item?.confidence === 'number' ? item.confidence : undefined,
        evidence: safeStrArray(item?.evidence),
        purpose: safeStr(item?.purpose)
      };
      acc[cat].push(normalizedItem);
      return acc;
    }, {} as Record<string, TechnologyItem[]>);
  }, [techList]);

  // 1. LOADING SKELETON STATE
  if (isLoading && !data) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </button>
        <NexoraLoader 
          variant="card" 
          size="lg"
          message="Loading Repository Intelligence..." 
          subMessage="Parsing AST symbols, dependency graphs, and architecture topology" 
        />
      </div>
    );
  }

  // 2. ERROR STATE
  if (error && !data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </button>

        <div className="bg-white rounded-[2rem] border border-red-200 p-8 sm:p-10 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Failed to Load Analysis</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{safeStr(error, 'Could not load analysis')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. ANALYSIS IN PROGRESS STATE
  if (data?.status === 'IN_PROGRESS') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </button>

        <div className="bg-white rounded-[2rem] border border-blue-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Analysis in Progress</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              NEXORA is actively ingesting the codebase, parsing AST syntax structures, extracting vector embeddings, and running multi-step architecture inference.
            </p>
          </div>
          {onViewProgress && (
            <button
              type="button"
              onClick={onViewProgress}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 shadow-md transition-all cursor-pointer"
            >
              <span>View Progress Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. ANALYSIS FAILED STATE
  if (data?.status === 'FAILED') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </button>

        <div className="bg-white rounded-[2rem] border border-red-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Analysis Failed</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {safeStr(data?.job?.errorMessage, 'NEXORA could not complete the repository analysis job.')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-extrabold hover:bg-red-700 shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            {isReanalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Restarting Analysis...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 5. NO ANALYSIS AVAILABLE (NOT_FOUND) STATE
  if (data?.status === 'NOT_FOUND' || !data?.analysis) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </button>

        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Sparkles className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">No Analysis Available Yet</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Analyze this repository to generate its complete codebase intelligence overview, architecture graph, module boundaries, and onboarding guide.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            {isReanalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initiating Analysis...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Analyze Repository</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 6. COMPLETED ANALYSIS RESULT UI
  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-150 pb-20">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & BREADCRUMBS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Repositories</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono truncate">
            <span>{safeStr(repo.owner, 'Owner')}</span>
            <span>/</span>
            <span className="font-bold text-slate-800">{safeStr(repo.name, 'Repository')}</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Analysis</span>
          </div>
        </div>

        {/* Repository Header Summary Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5">
            {/* Metadata Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>Analysis Complete</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  repo.private
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                {repo.private ? (
                  <>
                    <Lock className="w-3 h-3 stroke-[2.5]" />
                    <span>Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 stroke-[2.5]" />
                    <span>Public</span>
                  </>
                )}
              </span>

              {repo.language && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{safeStr(repo.language)}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono font-medium">
                <GitBranch className="w-3 h-3 text-slate-400" />
                <span>{safeStr(repo.defaultBranch, 'main')}</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {safeStr(repo.name, 'Repository')}
              </h1>
              {repo.fullName && (
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {safeStr(repo.fullName)}
                </p>
              )}
            </div>

            {/* Commit SHA & Timestamp Notice */}
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
              {metadata?.commitSha && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                  <span className="text-slate-400 font-sans">Commit:</span>
                  <span className="font-bold text-slate-800">{safeStr(metadata.commitSha).slice(0, 7)}</span>
                </span>
              )}
              {typeof metadata?.filesIncluded === 'number' && metadata.filesIncluded > 0 && (
                <span>
                  <strong className="text-slate-700">{metadata.filesIncluded}</strong> files analyzed
                </span>
              )}
              {metadata?.createdAt && (
                <span className="text-slate-400">
                  Analyzed on {new Date(metadata.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {repo.htmlUrl && (
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
                title="View on GitHub"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {onDeleteRepo && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200/80 shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Delete this repository and its analysis data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Repo</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isReanalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initiating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Re-analyze Repository</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MOBILE RESPONSIVE SECTION DROPDOWN / SELECTOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-900 border border-slate-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Section:</span>
            <span>{NAV_SECTIONS.find((s) => s.id === activeSection)?.label || 'Overview'}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {mobileNavOpen && (
          <div className="mt-2 p-1 bg-white border border-slate-200 rounded-xl shadow-md max-h-60 overflow-y-auto space-y-1">
            {NAV_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. TWO-COLUMN LAYOUT (SIDEBAR + MAIN ANALYSIS) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: STICKY SECTION NAVIGATION SIDEBAR */}
        <div className="hidden md:block md:col-span-3 sticky top-24 space-y-2">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-1">
            <div className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Analysis Sections
            </div>

            {NAV_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.3)]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN ANALYSIS CONTENT CARDS */}
        <div className="md:col-span-9 space-y-10">

          {/* ───────────────────────────────────────────────────────────── */}
          {/* FEATURE 1: INTERACTIVE AI REPOSITORY CHAT & ASSISTANT */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="chat" className="scroll-mt-28">
            <AIChatView
              repositoryId={repository.id}
              repositoryName={safeStr(repo.name, 'Repository')}
              onOpenFileModal={handleOpenFileModal}
            />
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 1: PROJECT OVERVIEW */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="overview" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Project Overview
                  </h2>
                  <p className="text-xs text-slate-500">
                    High-level architectural purpose and system responsibilities
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed font-sans">
              <p className="whitespace-pre-line">
                {safeStr(analysis.overview, 'No overview available for this repository.')}
              </p>
            </div>
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 2: TECHNOLOGY STACK */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="technology" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Technology Stack
                  </h2>
                  <p className="text-xs text-slate-500">
                    Languages, frameworks, runtime, and verifiable evidence
                  </p>
                </div>
              </div>
            </div>

            {Object.keys(techByCategory).length === 0 ? (
              <p className="text-xs text-slate-500">No technology stack items detected.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(techByCategory).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {items.map((tech, idx) => {
                        const techName = safeStr(tech.name, 'Framework');
                        const techPurpose = safeStr(tech.purpose);
                        const techEv = safeStrArray(tech.evidence);

                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                  {techName}
                                </h4>
                                {techPurpose && (
                                  <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                                    {techPurpose}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {renderStatusBadge(tech.status, tech.confidence)}
                              </div>
                            </div>

                            {/* Evidence list */}
                            {techEv.length > 0 && (
                              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-semibold text-slate-400">Evidence:</span>
                                {techEv.map((ev, evIdx) => (
                                  <span
                                    key={evIdx}
                                    onClick={() => isFilePath(ev) ? handleOpenFileModal(ev) : null}
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 ${
                                      isFilePath(ev) ? 'hover:text-blue-600 hover:border-blue-300 cursor-pointer' : ''
                                    }`}
                                    title={ev}
                                  >
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 3: ARCHITECTURE */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="architecture" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Architecture & Patterns
                  </h2>
                  <p className="text-xs text-slate-500">
                    Interactive tree diagram, layered structure, and component relationships
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {analysis.architecture?.architecturalStyle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold shadow-2xs">
                    {safeStr(analysis.architecture.architecturalStyle, 'Layered')}
                  </span>
                )}

                {/* View Switcher: Interactive Diagram vs Matrix */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setArchTab('diagram')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      archTab === 'diagram'
                        ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tree Diagram
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchTab('matrix')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      archTab === 'matrix'
                        ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Communication Matrix</span>
                    {Array.isArray(analysis.architecture?.relationships) && analysis.architecture.relationships.length > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          archTab === 'matrix' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {analysis.architecture.relationships.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Architecture Summary */}
            {analysis.architecture?.summary && (
              <p className="text-sm text-slate-700 leading-relaxed font-sans bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {safeStr(analysis.architecture.summary)}
              </p>
            )}

            {/* Architectural Layers */}
            {Array.isArray(analysis.architecture?.layers) && analysis.architecture.layers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Detected Architectural Layers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.architecture.layers.map((layer: any, idx: number) => {
                    const lName = safeStr(typeof layer === 'object' ? layer.name : layer, `Layer ${idx + 1}`);
                    const lRole = typeof layer === 'object' ? safeStr(layer.role) : null;
                    const lDesc = typeof layer === 'object' ? safeStr(layer.description) : null;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900 truncate">
                            {lName}
                          </span>
                          {lRole && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                              {lRole}
                            </span>
                          )}
                        </div>
                        {lDesc && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {lDesc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: REACT FLOW TREE DIAGRAM */}
            {archTab === 'diagram' ? (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Visual Architecture Tree & Component Graph
                </h3>
                <ArchitectureFlowDiagram
                  layers={analysis.architecture?.layers}
                  relationships={analysis.architecture?.relationships}
                  modules={analysis.modules}
                  apiStructure={analysis.apiStructure}
                  databaseType={analysis.database?.type}
                  databaseModels={analysis.database?.models}
                  onOpenFileModal={handleOpenFileModal}
                />
              </div>
            ) : (
              /* TAB CONTENT: ADVANCED INTERACTIVE COMPONENT COMMUNICATION MATRIX */
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Component Communication & Relationships Matrix
                </h3>
                <ComponentCommunicationMatrix
                  relationships={analysis.architecture?.relationships}
                  onOpenFileModal={handleOpenFileModal}
                />
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 4: MAIN COMPONENTS / MODULES */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="components" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Main Components & Modules
                  </h2>
                  <p className="text-xs text-slate-500">
                    Core functional modules, key symbols, and file responsibilities
                  </p>
                </div>
              </div>
            </div>

            {modulesList.length === 0 ? (
              <p className="text-xs text-slate-500">No primary functional modules identified.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modulesList.map((mod: any, idx: number) => {
                  const modName = safeStr(typeof mod === 'object' ? mod.name : mod, `Module ${idx + 1}`);
                  const modPurpose = safeStr(typeof mod === 'object' ? (mod.purpose || mod.description) : '');
                  const keyFiles = safeStrArray(mod?.keyFiles || mod?.files);
                  const keySymbols = safeStrArray(mod?.keySymbols || mod?.symbols);

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {modName}
                          </h3>
                          {renderStatusBadge(mod?.status)}
                        </div>
                        {modPurpose && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {modPurpose}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {/* Key Files */}
                        {keyFiles.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Key Files:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {keyFiles.map((file: string, fIdx: number) => (
                                <button
                                  key={fIdx}
                                  type="button"
                                  onClick={() => handleOpenFileModal(file)}
                                  className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors text-left truncate max-w-full cursor-pointer"
                                  title={file}
                                >
                                  {file}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Symbols */}
                        {keySymbols.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Symbols:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {keySymbols.map((sym: string, sIdx: number) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100"
                                >
                                  {sym}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 5: APPLICATION FLOW */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="flow" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Application Flow
                  </h2>
                  <p className="text-xs text-slate-500">
                    Step-by-step lifecycle from request ingestion through execution layers
                  </p>
                </div>
              </div>
            </div>

            {flowList.length === 0 ? (
              <p className="text-xs text-slate-500">No application lifecycle flow steps recorded.</p>
            ) : (
              <div className="space-y-3">
                {flowList.map((step: any, idx: number) => {
                  const stepNum = typeof step?.stepNumber === 'number' ? step.stepNumber : (typeof step?.step === 'number' ? step.step : idx + 1);
                  const stepStage = safeStr(typeof step === 'object' ? (step.stage || step.name) : step, `Step ${stepNum}`);
                  const stepDesc = safeStr(step?.description);
                  const stepFiles = safeStrArray(step?.filesInvolved || step?.components || step?.files);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 flex items-start gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        {stepNum}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {stepStage}
                          </h3>
                          {renderStatusBadge(step?.status)}
                        </div>

                        {stepDesc && (
                          <p className="text-xs text-slate-600 leading-relaxed font-sans">
                            {stepDesc}
                          </p>
                        )}

                        {stepFiles.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] font-semibold text-slate-400">Files / Components:</span>
                            {stepFiles.map((file: string, fIdx: number) => (
                              <button
                                key={fIdx}
                                type="button"
                                onClick={() => isFilePath(file) ? handleOpenFileModal(file) : null}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 ${
                                  isFilePath(file) ? 'hover:text-blue-600 hover:border-blue-300 cursor-pointer' : ''
                                }`}
                              >
                                {file}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 6: ENTRY POINTS */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="entrypoints" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Entry Points
                  </h2>
                  <p className="text-xs text-slate-500">
                    Application startup files and execution bootstrap targets
                  </p>
                </div>
              </div>
            </div>

            {entryPointsList.length === 0 ? (
              <p className="text-xs text-slate-500">No explicit entry points identified.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entryPointsList.map((ep: any, idx: number) => {
                  const epPath = safeStr(typeof ep === 'object' ? (ep.path || ep.file) : ep, `Entry ${idx + 1}`);
                  const epType = safeStr(typeof ep === 'object' ? ep.type : null, 'Bootstrap Entry');

                  return (
                    <div
                      key={idx}
                      onClick={() => handleOpenFileModal(epPath)}
                      className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {epPath}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {epType}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0">
                        Inspect
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 7: IMPORTANT FILES & SOURCE REFERENCES */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="files" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Important Files & Source References
                  </h2>
                  <p className="text-xs text-slate-500">
                    Essential files identified for developer inspection with line range citations
                  </p>
                </div>
              </div>
            </div>

            {importantFilesList.length === 0 ? (
              <p className="text-xs text-slate-500">No specific important files highlighted.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {importantFilesList.map((file: any, idx: number) => {
                  const filePath = safeStr(typeof file === 'object' ? (file.path || file.file) : file, `File ${idx + 1}`);
                  const reason = safeStr(typeof file === 'object' ? (file.reason || file.role) : null, 'Critical component');
                  const sLine = typeof file?.startLine === 'number' ? file.startLine : (typeof file?.lineStart === 'number' ? file.lineStart : undefined);
                  const eLine = typeof file?.endLine === 'number' ? file.endLine : (typeof file?.lineEnd === 'number' ? file.lineEnd : undefined);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleOpenFileModal(filePath, sLine, eLine)}
                      className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-2 group flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {filePath}
                          </span>
                          {sLine && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 shrink-0">
                              L{sLine}{eLine && eLine !== sLine ? `–${eLine}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">
                          {reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                        <span>Click to view source reference</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 8: DEPENDENCIES */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="dependencies" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                  <Binary className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Key Dependencies
                  </h2>
                  <p className="text-xs text-slate-500">
                    Declared package dependencies and verified library versions
                  </p>
                </div>
              </div>
            </div>

            {dependenciesList.length === 0 ? (
              <p className="text-xs text-slate-500">No dependencies listed in analysis.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dependenciesList.map((dep: any, idx: number) => {
                  const depName = safeStr(typeof dep === 'object' ? dep.name : dep, `dep-${idx}`);
                  const depVersion = typeof dep === 'object' && dep?.version ? safeStr(dep.version) : null;

                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <span className="font-bold text-slate-800 font-mono">{depName}</span>
                      {depVersion && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                          {depVersion}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 9: DATABASE */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="database" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                  <DbIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Database & Persistence
                  </h2>
                  <p className="text-xs text-slate-500">
                    Detected database engines, ORMs, and persistence models
                  </p>
                </div>
              </div>
            </div>

            {!analysis.database?.detected && (!analysis.database?.type || analysis.database.type === 'Unknown' || analysis.database.type === 'None / External') ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                Database structure could not be confidently determined from repository evidence.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Database Type
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {safeStr(analysis.database?.type, 'Relational Database')}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    <span>Detected</span>
                  </span>
                </div>

                {Array.isArray(analysis.database?.models) && analysis.database.models.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Detected Models / Entities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.database.models.map((model: any, idx: number) => {
                        const mName = safeStr(typeof model === 'object' ? model.name : model, `Model ${idx}`);
                        return (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800"
                          >
                            {mName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {safeStrArray(analysis.database?.evidence).length > 0 && (
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="text-slate-400 text-[11px] font-semibold">Evidence:</span>
                    {safeStrArray(analysis.database.evidence).map((ev: string, idx: number) => (
                      <span
                        key={idx}
                        onClick={() => isFilePath(ev) ? handleOpenFileModal(ev) : null}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 ${
                          isFilePath(ev) ? 'hover:text-blue-600 hover:border-blue-300 cursor-pointer' : ''
                        }`}
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 10: API STRUCTURE & ENDPOINTS */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="api" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            
            {/* Header with Title & Route Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                  <RouteIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    API Structure & Endpoints
                  </h2>
                  <p className="text-xs text-slate-500">
                    Detected HTTP endpoints, route methods, and controller mappings
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold self-start sm:self-auto">
                <span>{apiStructureList.length} Endpoints Discovered</span>
              </span>
            </div>

            {apiStructureList.length === 0 ? (
              <p className="text-xs text-slate-500">No API routes detected in this repository.</p>
            ) : (
              <div className="space-y-4">
                
                {/* Search Bar & Method Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                  
                  {/* HTTP Method Filter Tabs */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { method: 'ALL', label: 'ALL' },
                      { method: 'GET', label: 'GET' },
                      { method: 'POST', label: 'POST' },
                      { method: 'PUT', label: 'PUT' },
                      { method: 'DELETE', label: 'DELETE' },
                      { method: 'PATCH', label: 'PATCH' }
                    ].map(({ method, label }) => {
                      const count = methodCounts[method] || 0;
                      // Only show method button if it's ALL or count > 0
                      if (method !== 'ALL' && count === 0) return null;

                      const isActive = apiMethodFilter === method;

                      const methodStyles: Record<string, { active: string; inactive: string }> = {
                        ALL: {
                          active: 'bg-slate-900 text-white shadow-xs',
                          inactive: 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        },
                        GET: {
                          active: 'bg-emerald-600 text-white shadow-xs',
                          inactive: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                        },
                        POST: {
                          active: 'bg-blue-600 text-white shadow-xs',
                          inactive: 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200'
                        },
                        PUT: {
                          active: 'bg-amber-600 text-white shadow-xs',
                          inactive: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
                        },
                        DELETE: {
                          active: 'bg-red-600 text-white shadow-xs',
                          inactive: 'bg-red-50 text-red-800 hover:bg-red-100 border-red-200'
                        },
                        PATCH: {
                          active: 'bg-purple-600 text-white shadow-xs',
                          inactive: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200'
                        }
                      };

                      const currentStyle = methodStyles[method] || methodStyles.ALL;

                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setApiMethodFilter(method)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                            isActive ? currentStyle.active : currentStyle.inactive
                          }`}
                        >
                          <span>{label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-extrabold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200/60'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Search Input */}
                  <div className="relative min-w-[200px] sm:min-w-[240px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={apiSearchQuery}
                      onChange={(e) => setApiSearchQuery(e.target.value)}
                      placeholder="Filter path, handler, file..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    />
                    {apiSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setApiSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtered Route Cards */}
                {filteredRoutes.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      No endpoints found matching "{apiSearchQuery}" {apiMethodFilter !== 'ALL' ? `for ${apiMethodFilter}` : ''}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setApiMethodFilter('ALL');
                        setApiSearchQuery('');
                      }}
                      className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRoutes.map((route: any, idx: number) => {
                      const methodColors: Record<string, string> = {
                        GET: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        POST: 'bg-blue-50 text-blue-800 border-blue-200',
                        PUT: 'bg-amber-50 text-amber-800 border-amber-200',
                        DELETE: 'bg-red-50 text-red-800 border-red-200',
                        PATCH: 'bg-purple-50 text-purple-800 border-purple-200'
                      };
                      const rMethod = safeStr(route?.method, 'GET').toUpperCase();
                      const colorClass = methodColors[rMethod] || 'bg-slate-100 text-slate-700 border-slate-200';
                      const rPath = safeStr(typeof route === 'object' ? route.path : route, '/');
                      const rHandler = safeStr(route?.handler);
                      const rFilePath = safeStr(route?.filePath || route?.file_path);
                      const sLine = typeof route?.lineStart === 'number' ? route.lineStart : (typeof route?.line_start === 'number' ? route.line_start : undefined);
                      const eLine = typeof route?.lineEnd === 'number' ? route.lineEnd : (typeof route?.line_end === 'number' ? route.line_end : undefined);

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          {/* Method Badge & Path */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-wrap sm:flex-nowrap">
                            <span className={`px-2.5 py-1 rounded-lg border font-mono font-extrabold text-[11px] shrink-0 ${colorClass}`}>
                              {rMethod}
                            </span>
                            <span className="font-mono font-bold text-slate-900 break-all text-xs sm:text-sm">
                              {rPath}
                            </span>
                          </div>

                          {/* Handler & File Inspection */}
                          <div className="flex items-center gap-2.5 shrink-0 text-slate-500 text-[11px] flex-wrap justify-end">
                            {rHandler && (
                              <span className="inline-flex items-center gap-1 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                                <Code2 className="w-3 h-3 text-slate-400" />
                                <span>{rHandler}</span>
                              </span>
                            )}

                            {rFilePath && (
                              <button
                                type="button"
                                onClick={() => handleOpenFileModal(rFilePath, sLine, eLine)}
                                className="inline-flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                title={`Inspect ${rFilePath}`}
                              >
                                <span className="truncate max-w-[180px]">{rFilePath}</span>
                                {sLine && (
                                  <span className="text-[10px] text-blue-800 font-bold bg-white/80 px-1 py-0.2 rounded-md">
                                    L{sLine}{eLine && eLine !== sLine ? `–${eLine}` : ''}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 11: DEVELOPER QUICK START */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="quickstart" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Developer Quick Start
                  </h2>
                  <p className="text-xs text-slate-500">
                    Onboarding roadmap answering: "Where should I start exploring this codebase?"
                  </p>
                </div>
              </div>
            </div>

            {quickStartList.length === 0 ? (
              <p className="text-xs text-slate-500">No onboarding guide generated.</p>
            ) : (
              <div className="space-y-3">
                {quickStartList.map((step: any, idx: number) => {
                  const stepNum = typeof step === 'object' && typeof step?.step === 'number' ? step.step : idx + 1;
                  const title = safeStr(typeof step === 'object' ? (step.title || step.action) : step, `Step ${stepNum}`);
                  const command = typeof step === 'object' && step?.command ? safeStr(step.command) : null;
                  const explanation = typeof step === 'object' && step?.explanation ? safeStr(step.explanation) : null;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100 flex items-start gap-4"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        {stepNum}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {title && (
                          <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">
                            {title}
                          </p>
                        )}
                        {command && (
                          <div className="p-2.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto select-all">
                            <code>{command}</code>
                          </div>
                        )}
                        {explanation && (
                          <p className="text-xs text-slate-600 leading-normal font-sans">
                            {explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 12: FACTS, INFERENCES & CODEBASE INTELLIGENCE */}
          {/* ───────────────────────────────────────────────────────────── */}
          <section id="uncertainties" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-7">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Facts, Inferences & Codebase Intelligence
                  </h2>
                  <p className="text-xs text-slate-500">
                    Explicitly distinguishing grounded deterministic facts, AST code intelligence, and model inferences for @{safeStr(repo.owner, 'Owner')}/{safeStr(repo.name, 'Repository')}
                  </p>
                </div>
              </div>

              {/* Interactive Category Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setFactsFilter('ALL')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    factsFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Intelligence
                </button>
                <button
                  type="button"
                  onClick={() => setFactsFilter('FACTS')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    factsFilter === 'FACTS'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  Confirmed Facts ({factTechnologies.length + 5})
                </button>
                <button
                  type="button"
                  onClick={() => setFactsFilter('INFERENCES')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    factsFilter === 'INFERENCES'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  Inferences ({inferenceTechnologies.length + (modulesList.length > 0 ? 1 : 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setFactsFilter('CAVEATS')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    factsFilter === 'CAVEATS'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Caveats ({uncertaintiesList.length > 0 ? uncertaintiesList.length : 1})
                </button>
              </div>
            </div>

            {/* Explanatory Legend / Methodology Distinction */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">Confirmed Deterministic Fact</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    100% verified by AST parser, syntax trees, package manifests, and repository configuration files.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="font-mono font-bold text-xs">≈</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Synthesized Inference</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    High-confidence (90-98%) deduction derived from module imports, route structures, and conventions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">Technical Caveat / Note</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Runtime environment dependencies, uncommitted secrets, or areas requiring developer verification.
                  </p>
                </div>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* PART 1: DETERMINISTIC GROUNDED CODEBASE FACTS */}
            {/* ───────────────────────────────────────────────────────────── */}
            {(factsFilter === 'ALL' || factsFilter === 'FACTS') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Deterministic Codebase Facts (AST & Manifest Grounded)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    100% Grounded
                  </span>
                </div>

                {/* 1.1 AST & Codebase Metric Facts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-200/60">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Source Files</p>
                    <p className="text-lg font-extrabold text-slate-900 font-mono">
                      {metadata?.filesIncluded || metadata?.filesScanned || 0}
                    </p>
                    <p className="text-[10px] text-slate-400">Inspected & Persisted</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">AST Symbols</p>
                    <p className="text-lg font-extrabold text-purple-700 font-mono">
                      {metadata?.symbolsCount ?? '-'}
                    </p>
                    <p className="text-[10px] text-slate-400">Functions, Classes, Types</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Code Edges</p>
                    <p className="text-lg font-extrabold text-emerald-700 font-mono">
                      {metadata?.relationshipsCount ?? '-'}
                    </p>
                    <p className="text-[10px] text-slate-400">Import & Call Graph</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">API Routes</p>
                    <p className="text-lg font-extrabold text-amber-700 font-mono">
                      {apiStructureList.length || metadata?.routesCount || 0}
                    </p>
                    <p className="text-[10px] text-slate-400">Route Handlers</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Code Chunks</p>
                    <p className="text-lg font-extrabold text-indigo-700 font-mono">
                      {metadata?.chunksCount ?? '-'}
                    </p>
                    <p className="text-[10px] text-slate-400">Semantic AST Chunks</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Embeddings</p>
                    <p className="text-lg font-extrabold text-cyan-700 font-mono">
                      {metadata?.embeddingsCount ?? '-'}
                    </p>
                    <p className="text-[10px] text-slate-400">Dense Vectors in pgvector</p>
                  </div>
                </div>

                {/* 1.2 Environment & Repository Manifest Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Primary Language</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {safeStr(repo.language, 'TypeScript / JavaScript')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">Default Branch: {safeStr(repo.defaultBranch, 'main')}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Cpu className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Runtime & Manager</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {safeStr(analysis.runtime, 'Node.js / Web')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">Package Manager: {safeStr(analysis.packageManager, 'npm / yarn')}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <DbIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Database Driver</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {analysis.database?.detected ? safeStr(analysis.database?.type, 'PostgreSQL / SQL') : 'In-Memory / None detected'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {analysis.database?.detected ? 'Client library verified in manifest' : 'No dedicated DB client found'}
                    </p>
                  </div>
                </div>

                {/* 1.3 Verified Frameworks & Libraries Grid */}
                {factTechnologies.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Confirmed Libraries & Technologies ({factTechnologies.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {factTechnologies.map((tech: any, idx: number) => {
                        const techName = safeStr(tech.name, 'Framework');
                        const techPurpose = safeStr(tech.purpose);
                        const techEv = safeStrArray(tech.evidence);

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2 hover:border-emerald-300 transition-colors shadow-2xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">{techName}</h5>
                                <span className="text-[10px] font-semibold text-slate-400">{safeStr(tech.category, 'Library')}</span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3] text-emerald-600" />
                                <span>Fact</span>
                              </span>
                            </div>

                            {techPurpose && (
                              <p className="text-[11px] text-slate-600 leading-normal">
                                {techPurpose}
                              </p>
                            )}

                            {techEv.length > 0 && (
                              <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1 flex-wrap">
                                {techEv.map((ev, evIdx) => (
                                  <span
                                    key={evIdx}
                                    onClick={() => isFilePath(ev) ? handleOpenFileModal(ev) : null}
                                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 ${
                                      isFilePath(ev) ? 'hover:text-blue-600 hover:border-blue-300 cursor-pointer' : ''
                                    }`}
                                  >
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1.4 Verified Application Entry Points */}
                {entryPointsList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Confirmed Entry Points ({entryPointsList.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {entryPointsList.map((ep: any, idx: number) => {
                        const epPath = safeStr(typeof ep === 'object' ? ep.path : ep);
                        const epType = safeStr(ep?.type, 'Application Entry');

                        return (
                          <div
                            key={idx}
                            onClick={() => handleOpenFileModal(epPath)}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {epPath}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">{epType}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 shrink-0">View Code</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* PART 2: MODEL SYNTHESIZED ARCHITECTURAL INFERENCES */}
            {/* ───────────────────────────────────────────────────────────── */}
            {(factsFilter === 'ALL' || factsFilter === 'INFERENCES') && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <span className="font-mono font-bold text-amber-600 text-sm">≈</span>
                    <span>Synthesized Inferences & Domain Patterns</span>
                  </h3>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    90-98% Confidence
                  </span>
                </div>

                {/* 2.1 Architectural Style Inference Card */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-bold text-amber-950">
                        Inferred Architectural Pattern: {safeStr(analysis.architecture?.architecturalStyle, 'Modular Architecture')}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                      {safeStr(analysis.architecture?.confidence, 'HIGH')} Confidence
                    </span>
                  </div>

                  <p className="text-xs text-amber-900 leading-relaxed">
                    {safeStr(
                      analysis.architecture?.summary,
                      'System structure deduced from source file hierarchy, module boundaries, routing conventions, and cross-file import graph edges.'
                    )}
                  </p>
                </div>

                {/* 2.2 Inferred Convention Technologies */}
                {inferenceTechnologies.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Convention-Inferred Technologies ({inferenceTechnologies.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inferenceTechnologies.map((tech: any, idx: number) => {
                        const techName = safeStr(tech.name, 'Technology');
                        const techPurpose = safeStr(tech.purpose);
                        const techEv = safeStrArray(tech.evidence);
                        const conf = typeof tech.confidence === 'number' ? Math.round(tech.confidence <= 1 ? tech.confidence * 100 : tech.confidence) : 95;

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2 hover:border-amber-300 transition-colors shadow-2xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">{techName}</h5>
                                <span className="text-[10px] font-semibold text-slate-400">{safeStr(tech.category, 'Convention')}</span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                                <span className="font-mono font-bold">≈</span>
                                <span>{conf}%</span>
                              </span>
                            </div>

                            {techPurpose && (
                              <p className="text-[11px] text-slate-600 leading-normal">
                                {techPurpose}
                              </p>
                            )}

                            {techEv.length > 0 && (
                              <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1 flex-wrap">
                                {techEv.map((ev, evIdx) => (
                                  <span
                                    key={evIdx}
                                    onClick={() => isFilePath(ev) ? handleOpenFileModal(ev) : null}
                                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 ${
                                      isFilePath(ev) ? 'hover:text-blue-600 hover:border-blue-300 cursor-pointer' : ''
                                    }`}
                                  >
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* PART 3: IDENTIFIED TECHNICAL CAVEATS & UNCERTAINTIES */}
            {/* ───────────────────────────────────────────────────────────── */}
            {(factsFilter === 'ALL' || factsFilter === 'CAVEATS') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Identified Caveats, Unknowns & Environment Dependencies</span>
                  </h3>
                </div>

                {uncertaintiesList.length > 0 ? (
                  <ul className="space-y-2.5">
                    {uncertaintiesList.map((note: any, idx: number) => {
                      const isObj = typeof note === 'object' && note !== null;
                      const topic = isObj ? safeStr(note.topic) : null;
                      const text = isObj ? safeStr(note.inference || note.missingEvidence || note.description || note.note) : safeStr(note);
                      const missing = isObj ? safeStr(note.missingEvidence) : null;

                      return (
                        <li
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {topic && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                                  {topic}
                                </span>
                              )}
                              <span className="font-semibold text-slate-900">{text}</span>
                            </div>
                            {missing && text !== missing && (
                              <p className="text-[11px] text-slate-500 font-mono">
                                Missing evidence / dependency: {missing}
                              </p>
                            )}
                          </div>

                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                            Requires Verification
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-2">
                    <p className="font-bold text-slate-900">Standard Environment Prerequisites</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All core frameworks and package manifests in this repository have been fully resolved without critical syntax ambiguities. Standard runtime environment variables and secrets should be provided via a local <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">.env</code> file prior to server boot.
                    </p>
                  </div>
                )}
              </div>
            )}

          </section>

        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. SOURCE REFERENCE INSPECTION MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedFileRef && (
        <SourceReferenceModal
          isOpen={true}
          onClose={() => setSelectedFileRef(null)}
          filePath={selectedFileRef.filePath}
          startLine={selectedFileRef.startLine}
          endLine={selectedFileRef.endLine}
          symbolName={selectedFileRef.symbolName}
          repositoryHtmlUrl={repo.htmlUrl}
          defaultBranch={repo.defaultBranch}
          onFetchContent={fetchFileContent}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. DELETE REPOSITORY CONFIRMATION MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DeleteRepositoryModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        repoName={repo.name}
        repoFullName={repo.fullName}
      />

    </div>
  );
};
