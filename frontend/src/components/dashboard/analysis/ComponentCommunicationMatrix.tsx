import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeftRight,
  Search,
  Sparkles,
  Zap,
  Layers,
  FileCode,
  Compass,
  GitFork,
  Network,
  Grid3X3,
  LayoutList,
  FolderTree,
  Table as TableIcon,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Code2,
  Filter,
  Shield,
  Box,
  Database,
  Eye,
  Flame
} from 'lucide-react';
import type { ArchitectureRelationship } from '../../../types/analysis';

interface ComponentCommunicationMatrixProps {
  relationships?: ArchitectureRelationship[];
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void;
}

type ViewMode = 'cards' | 'grouped' | 'matrix' | 'table';

interface ComponentMetadata {
  name: string;
  dir: string;
  category: string;
  categoryLabel: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}

/**
 * Defensive string converter
 */
const safeStr = (val: any, fallback = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (typeof val.name === 'string') return val.name;
    if (typeof val.path === 'string') return val.path;
    if (typeof val.title === 'string') return val.title;
    if (typeof val.file === 'string') return val.file;
    try {
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  return String(val);
};

const isFilePath = (val: any): boolean => {
  if (typeof val !== 'string') return false;
  return val.includes('/') || val.includes('\\') || /\.[a-zA-Z0-9]{1,8}$/.test(val);
};

/**
 * Parse component path into rich metadata (basename, directory, architectural category, styling)
 */
const parseComponentInfo = (rawPath: string): ComponentMetadata => {
  const p = safeStr(rawPath, 'Unknown Component');
  const normalized = p.replace(/\\/g, '/');
  const segments = normalized.split('/');
  const basename = segments[segments.length - 1] || normalized;
  const dir = segments.length > 1 ? segments.slice(0, -1).join('/') + '/' : '';
  const lower = normalized.toLowerCase();

  if (lower.includes('controller') || lower.includes('.controller.')) {
    return {
      name: basename,
      dir,
      category: 'controller',
      categoryLabel: 'Controller',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200/80',
      icon: Box
    };
  }
  if (lower.includes('service') || lower.includes('.service.')) {
    return {
      name: basename,
      dir,
      category: 'service',
      categoryLabel: 'Service',
      color: 'text-purple-700',
      bg: 'bg-purple-50/80',
      border: 'border-purple-200/80',
      icon: Sparkles
    };
  }
  if (lower.includes('route') || lower.includes('router') || lower.includes('/routes/') || lower.includes('.route.')) {
    return {
      name: basename,
      dir,
      category: 'route',
      categoryLabel: 'Router',
      color: 'text-sky-700',
      bg: 'bg-sky-50/80',
      border: 'border-sky-200/80',
      icon: Compass
    };
  }
  if (lower.includes('middleware') || lower.includes('auth') || lower.includes('guard')) {
    return {
      name: basename,
      dir,
      category: 'middleware',
      categoryLabel: 'Middleware',
      color: 'text-amber-700',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      icon: Shield
    };
  }
  if (lower.includes('model') || lower.includes('schema') || lower.includes('entity') || lower.includes('db') || lower.includes('database')) {
    return {
      name: basename,
      dir,
      category: 'model',
      categoryLabel: 'Data Model',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
      icon: Database
    };
  }
  if (lower.endsWith('.tsx') || lower.endsWith('.jsx') || lower.endsWith('.vue') || lower.includes('component')) {
    return {
      name: basename,
      dir,
      category: 'view',
      categoryLabel: 'UI Component',
      color: 'text-blue-700',
      bg: 'bg-blue-50/80',
      border: 'border-blue-200/80',
      icon: Layers
    };
  }

  return {
    name: basename,
    dir,
    category: 'module',
    categoryLabel: 'Module',
    color: 'text-slate-700',
    bg: 'bg-slate-100/90',
    border: 'border-slate-200',
    icon: FileCode
  };
};

/**
 * Visual styling and metadata for relationship types
 */
const getRelationshipConfig = (type: string) => {
  const norm = safeStr(type, 'DEPENDS_ON').toUpperCase();

  switch (norm) {
    case 'IMPORTS':
      return {
        label: 'IMPORTS',
        verb: 'imports symbols from',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        lineColor: 'border-blue-300 text-blue-600',
        dotColor: 'bg-blue-500',
        icon: FileCode
      };
    case 'CALLS':
      return {
        label: 'CALLS',
        verb: 'invokes / calls',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        lineColor: 'border-purple-300 text-purple-600',
        dotColor: 'bg-purple-500',
        icon: Zap
      };
    case 'ROUTES_TO':
      return {
        label: 'ROUTES_TO',
        verb: 'dispatches request to',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        lineColor: 'border-emerald-300 text-emerald-600',
        dotColor: 'bg-emerald-500',
        icon: Compass
      };
    case 'EXTENDS':
      return {
        label: 'EXTENDS',
        verb: 'inherits class from',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        lineColor: 'border-amber-300 text-amber-600',
        dotColor: 'bg-amber-500',
        icon: GitFork
      };
    case 'IMPLEMENTS':
      return {
        label: 'IMPLEMENTS',
        verb: 'implements interface of',
        badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
        lineColor: 'border-teal-300 text-teal-600',
        dotColor: 'bg-teal-500',
        icon: Layers
      };
    case 'DEPENDS_ON':
    default:
      return {
        label: norm,
        verb: 'depends on',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
        lineColor: 'border-slate-300 text-slate-600',
        dotColor: 'bg-slate-500',
        icon: Network
      };
  }
};

/**
 * Clean and format raw evidence strings
 */
const formatEvidence = (rawEv: any): string => {
  const s = safeStr(rawEv).trim();
  if (!s) return '';
  return s
    .replace(/sourceFileId\s+\d+\s+imports\s+/gi, 'Imports ')
    .replace(/targetFileId\s+\d+\s*/gi, '')
    .replace(/\(IMPORTS relationship\)\.?/gi, '')
    .replace(/\(ROUTES_TO relationship\)\.?/gi, '')
    .replace(/\(EXTENDS relationship\)\.?/gi, '')
    .trim();
};

export const ComponentCommunicationMatrix: React.FC<ComponentCommunicationMatrixProps> = ({
  relationships = [],
  onOpenFileModal
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [focusedComponent, setFocusedComponent] = useState<string | null>(null);
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Normalize raw relationship items
  const normalizedRelationships = useMemo(() => {
    if (!Array.isArray(relationships)) return [];
    return relationships
      .filter(rel => rel && typeof rel === 'object')
      .map((rel, idx) => {
        const from = safeStr(rel.from);
        const to = safeStr(rel.to);
        const type = safeStr(rel.type, 'DEPENDS_ON');
        const evidence = formatEvidence(rel.evidence);
        return {
          id: `rel-${idx}-${from}-${to}`,
          from,
          to,
          type,
          evidence,
          fromMeta: parseComponentInfo(from),
          toMeta: parseComponentInfo(to),
          config: getRelationshipConfig(type)
        };
      })
      .filter(rel => rel.from && rel.to);
  }, [relationships]);

  // Unique relationship types present with counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: normalizedRelationships.length };
    normalizedRelationships.forEach(rel => {
      const t = rel.type || 'DEPENDS_ON';
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [normalizedRelationships]);

  // Unique components list
  const uniqueComponents = useMemo(() => {
    const set = new Set<string>();
    normalizedRelationships.forEach(rel => {
      set.add(rel.from);
      set.add(rel.to);
    });
    return Array.from(set).sort();
  }, [normalizedRelationships]);

  // Component Degree & Hotspot metrics
  const componentMetrics = useMemo(() => {
    const outDegrees: Record<string, number> = {};
    const inDegrees: Record<string, number> = {};
    
    normalizedRelationships.forEach(rel => {
      outDegrees[rel.from] = (outDegrees[rel.from] || 0) + 1;
      inDegrees[rel.to] = (inDegrees[rel.to] || 0) + 1;
    });

    let topHotspot = { name: '', count: 0 };
    uniqueComponents.forEach(comp => {
      const total = (outDegrees[comp] || 0) + (inDegrees[comp] || 0);
      if (total > topHotspot.count) {
        topHotspot = { name: comp, count: total };
      }
    });

    return { outDegrees, inDegrees, topHotspot };
  }, [normalizedRelationships, uniqueComponents]);

  // Filtered relationships based on search, type filter, and focused component
  const filteredRelationships = useMemo(() => {
    let list = normalizedRelationships;

    if (selectedTypeFilter !== 'ALL') {
      list = list.filter(rel => rel.type === selectedTypeFilter);
    }

    if (focusedComponent) {
      list = list.filter(rel => rel.from === focusedComponent || rel.to === focusedComponent);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        rel =>
          rel.from.toLowerCase().includes(q) ||
          rel.to.toLowerCase().includes(q) ||
          rel.type.toLowerCase().includes(q) ||
          rel.evidence.toLowerCase().includes(q)
      );
    }

    return list;
  }, [normalizedRelationships, selectedTypeFilter, focusedComponent, searchQuery]);

  // Grouped by Source Component
  const groupedBySource = useMemo(() => {
    const map = new Map<string, typeof filteredRelationships>();
    filteredRelationships.forEach(rel => {
      if (!map.has(rel.from)) {
        map.set(rel.from, []);
      }
      map.get(rel.from)!.push(rel);
    });
    return Array.from(map.entries()).map(([from, rels]) => ({
      from,
      fromMeta: parseComponentInfo(from),
      targets: rels
    }));
  }, [filteredRelationships]);

  // 2D Matrix Grid dimensions
  const matrixSources = useMemo(() => {
    const set = new Set<string>();
    filteredRelationships.forEach(rel => set.add(rel.from));
    return Array.from(set).slice(0, 16); // cap at 16 for clean grid density
  }, [filteredRelationships]);

  const matrixTargets = useMemo(() => {
    const set = new Set<string>();
    filteredRelationships.forEach(rel => set.add(rel.to));
    return Array.from(set).slice(0, 16);
  }, [filteredRelationships]);

  const matrixMap = useMemo(() => {
    const map = new Map<string, (typeof filteredRelationships)[0]>();
    filteredRelationships.forEach(rel => {
      map.set(`${rel.from}:::${rel.to}`, rel);
    });
    return map;
  }, [filteredRelationships]);

  // Actions
  const toggleEvidence = (id: string) => {
    setExpandedEvidenceIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInspect = useCallback(
    (path: string) => {
      if (onOpenFileModal && isFilePath(path)) {
        onOpenFileModal(path);
      }
    },
    [onOpenFileModal]
  );

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedTypeFilter('ALL');
    setFocusedComponent(null);
  };

  if (normalizedRelationships.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-slate-50/80 border border-dashed border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <Network className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Component Interactions Recorded</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Deterministic relationship analysis did not detect cross-file imports or calls in this codebase snapshot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── 1. TOP METRICS & INSIGHTS BAR ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Connections */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/5 via-blue-500/10 to-transparent border border-blue-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Links</span>
            <Network className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {normalizedRelationships.length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Verified Call Graph Edges</div>
        </div>

        {/* Metric 2: Unique Components */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-indigo-500/10 to-transparent border border-indigo-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Components</span>
            <Box className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {uniqueComponents.length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Participating files & modules</div>
        </div>

        {/* Metric 3: Most Connected Hotspot */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-transparent border border-amber-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Core Hub</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 truncate" title={componentMetrics.topHotspot.name}>
            {parseComponentInfo(componentMetrics.topHotspot.name).name || 'None'}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            {componentMetrics.topHotspot.count} total connections
          </div>
        </div>

        {/* Metric 4: Coupling Density */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-transparent border border-emerald-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Fan-out</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {uniqueComponents.length > 0
              ? (normalizedRelationships.length / uniqueComponents.length).toFixed(1)
              : '1.0'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Links per component</div>
        </div>
      </div>

      {/* ─── 2. SEARCH, FILTERS & VIEW MODE CONTROLS ──────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search components, endpoints, imports, evidence..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Interactive Flow Cards"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Flow Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Group by Source Caller"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Caller Hubs</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="2D Cross Heatmap Matrix"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>2D Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Structured Data Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Relationship Type Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {Object.entries(typeCounts).map(([type, count]) => {
            const isSelected = selectedTypeFilter === type;
            const config = getRelationshipConfig(type);

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedTypeFilter(type)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
                }`}
              >
                {type !== 'ALL' && <config.icon className="w-3 h-3" />}
                <span>{type}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Focus Filter Indicator (if any component is isolated) */}
        {focusedComponent && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-600">Focusing on Component:</span>
              <span className="font-mono font-bold text-blue-800 truncate">{focusedComponent}</span>
            </div>
            <button
              type="button"
              onClick={() => setFocusedComponent(null)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-blue-700 hover:bg-blue-100 rounded-md cursor-pointer transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Focus</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 3. VIEW MODE RENDERERS ───────────────────────────────────────────── */}
      {filteredRelationships.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
          <p className="text-xs font-medium text-slate-600">
            No component relationships matched your search & filter criteria.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           VIEW 1: INTERACTIVE FLOW CARDS
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 gap-3.5">
          {filteredRelationships.map(rel => {
            const isExpanded = !!expandedEvidenceIds[rel.id];
            const FromIcon = rel.fromMeta.icon;
            const ToIcon = rel.toMeta.icon;
            const RelIcon = rel.config.icon;

            return (
              <div
                key={rel.id}
                className="group p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300/80 transition-all duration-200 space-y-3"
              >
                {/* Flow Visual Line: Source -> Pipeline -> Target */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* SOURCE NODE */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl ${rel.fromMeta.bg} ${rel.fromMeta.color} border ${rel.fromMeta.border} flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      <FromIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleInspect(rel.from)}
                          className="font-mono text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline text-left truncate max-w-full cursor-pointer"
                          title={`Inspect ${rel.from}`}
                        >
                          {rel.fromMeta.name}
                        </button>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${rel.fromMeta.bg} ${rel.fromMeta.color} border ${rel.fromMeta.border}`}
                        >
                          {rel.fromMeta.categoryLabel}
                        </span>
                      </div>
                      {rel.fromMeta.dir && (
                        <p className="text-[10px] font-mono text-slate-400 truncate" title={rel.from}>
                          {rel.fromMeta.dir}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DIRECTIONAL PIPELINE BADGE */}
                  <div className="flex items-center justify-center gap-2 shrink-0 py-1 lg:py-0 px-2 bg-slate-50/80 lg:bg-transparent rounded-xl">
                    <div className="hidden lg:block w-6 h-px bg-slate-200" />
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${rel.config.badgeBg} shadow-2xs`}
                    >
                      <RelIcon className="w-3.5 h-3.5" />
                      <span>{rel.config.label}</span>
                    </div>
                    <div className="hidden lg:flex items-center">
                      <div className="w-6 h-px bg-slate-200" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 -ml-1" />
                    </div>
                  </div>

                  {/* TARGET NODE */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-start lg:justify-end">
                    <div className="min-w-0 flex-1 text-left lg:text-right order-2 lg:order-1">
                      <div className="flex items-center gap-1.5 flex-wrap justify-start lg:justify-end">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${rel.toMeta.bg} ${rel.toMeta.color} border ${rel.toMeta.border}`}
                        >
                          {rel.toMeta.categoryLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInspect(rel.to)}
                          className="font-mono text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline truncate max-w-full cursor-pointer"
                          title={`Inspect ${rel.to}`}
                        >
                          {rel.toMeta.name}
                        </button>
                      </div>
                      {rel.toMeta.dir && (
                        <p className="text-[10px] font-mono text-slate-400 truncate" title={rel.to}>
                          {rel.toMeta.dir}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-9 h-9 rounded-xl ${rel.toMeta.bg} ${rel.toMeta.color} border ${rel.toMeta.border} flex items-center justify-center shrink-0 shadow-2xs order-1 lg:order-2`}
                    >
                      <ToIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Footer Toolbar: Trace Focus, Quick Actions & Evidence Drawer Toggle */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFocusedComponent(focusedComponent === rel.from ? null : rel.from)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        focusedComponent === rel.from
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                      title={`Trace all links involving ${rel.fromMeta.name}`}
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>Trace Source</span>
                    </button>

                    {isFilePath(rel.from) && (
                      <button
                        type="button"
                        onClick={() => handleInspect(rel.from)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70 cursor-pointer"
                        title="Open Source File"
                      >
                        <Code2 className="w-3 h-3 text-slate-400" />
                        <span>Source Code</span>
                      </button>
                    )}

                    {isFilePath(rel.to) && (
                      <button
                        type="button"
                        onClick={() => handleInspect(rel.to)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70 cursor-pointer"
                        title="Open Target File"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Target Code</span>
                      </button>
                    )}
                  </div>

                  {rel.evidence && (
                    <button
                      type="button"
                      onClick={() => toggleEvidence(rel.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 cursor-pointer transition-all"
                    >
                      <span>AST Evidence</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* EXPANDABLE EVIDENCE SNIPPET */}
                {isExpanded && rel.evidence && (
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>VERIFIED SYNTAX & IMPORT REFERENCE</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(rel.evidence, rel.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedKey === rel.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {rel.evidence}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grouped' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           VIEW 2: GROUPED BY SOURCE CALLER HUBS
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="space-y-4">
          {groupedBySource.map(group => {
            const FromIcon = group.fromMeta.icon;

            return (
              <div
                key={group.from}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5"
              >
                {/* Hub Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${group.fromMeta.bg} ${group.fromMeta.color} border ${group.fromMeta.border} flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      <FromIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleInspect(group.from)}
                          className="font-mono text-sm font-extrabold text-slate-900 hover:text-blue-600 hover:underline truncate cursor-pointer"
                        >
                          {group.fromMeta.name}
                        </button>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${group.fromMeta.bg} ${group.fromMeta.color} border ${group.fromMeta.border}`}
                        >
                          {group.fromMeta.categoryLabel}
                        </span>
                      </div>
                      {group.fromMeta.dir && (
                        <p className="text-xs font-mono text-slate-400 truncate">{group.fromMeta.dir}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {group.targets.length} {group.targets.length === 1 ? 'Outbound Call' : 'Outbound Calls'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFocusedComponent(focusedComponent === group.from ? null : group.from)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        focusedComponent === group.from
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Isolate this hub"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-targets grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {group.targets.map(target => {
                    const ToIcon = target.toMeta.icon;
                    const RelIcon = target.config.icon;

                    return (
                      <div
                        key={target.id}
                        className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-blue-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${target.config.badgeBg}`}
                            >
                              <RelIcon className="w-3 h-3" />
                              <span>{target.config.label}</span>
                            </span>
                          </div>
                          {target.evidence && (
                            <button
                              type="button"
                              onClick={() => toggleEvidence(target.id)}
                              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              {expandedEvidenceIds[target.id] ? 'Hide Evidence' : 'View Code Evidence'}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg ${target.toMeta.bg} ${target.toMeta.color} border ${target.toMeta.border} flex items-center justify-center shrink-0`}
                          >
                            <ToIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleInspect(target.to)}
                              className="font-mono text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline truncate block w-full text-left cursor-pointer"
                            >
                              {target.toMeta.name}
                            </button>
                            {target.toMeta.dir && (
                              <p className="text-[10px] font-mono text-slate-400 truncate">{target.toMeta.dir}</p>
                            )}
                          </div>
                        </div>

                        {/* Collapsible evidence */}
                        {expandedEvidenceIds[target.id] && target.evidence && (
                          <div className="p-2.5 rounded-lg bg-slate-950 text-slate-100 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                            <span className="text-emerald-400">{target.evidence}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'matrix' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           VIEW 3: INTERACTIVE 2D CROSS MATRIX HEATMAP
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Inter-Component Dependency Matrix (Caller vs Callee)
              </h4>
              <p className="text-[11px] text-slate-500">
                Rows represent caller sources; columns represent target callees. Click any cell to inspect relationship.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Imports
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Calls
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Routes
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left font-bold text-slate-400 uppercase text-[10px] bg-slate-50 rounded-tl-xl border border-slate-200">
                    Caller \ Target
                  </th>
                  {matrixTargets.map(target => {
                    const meta = parseComponentInfo(target);
                    return (
                      <th
                        key={target}
                        className="p-2 font-mono text-[10px] text-slate-700 bg-slate-50 border border-slate-200 min-w-[100px] max-w-[130px] truncate text-center"
                        title={target}
                      >
                        {meta.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {matrixSources.map(source => {
                  const sMeta = parseComponentInfo(source);
                  return (
                    <tr key={source} className="hover:bg-slate-50/60 transition-colors">
                      <td
                        className="p-2 font-mono text-[11px] font-bold text-slate-800 border border-slate-200 bg-slate-50/40 max-w-[160px] truncate"
                        title={source}
                      >
                        <button
                          type="button"
                          onClick={() => handleInspect(source)}
                          className="hover:text-blue-600 hover:underline text-left cursor-pointer block truncate"
                        >
                          {sMeta.name}
                        </button>
                      </td>
                      {matrixTargets.map(target => {
                        const cellRel = matrixMap.get(`${source}:::${target}`);

                        if (!cellRel) {
                          return (
                            <td
                              key={target}
                              className="p-2 text-center border border-slate-100 text-slate-300 font-mono text-[10px]"
                            >
                              -
                            </td>
                          );
                        }

                        const RelIcon = cellRel.config.icon;

                        return (
                          <td
                            key={target}
                            className="p-1 text-center border border-slate-200 bg-blue-50/30 hover:bg-blue-100/60 transition-all cursor-pointer"
                            onClick={() => {
                              if (cellRel.evidence) toggleEvidence(cellRel.id);
                            }}
                            title={`${source} -> ${target} (${cellRel.type})`}
                          >
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-extrabold border ${cellRel.config.badgeBg}`}
                            >
                              <RelIcon className="w-2.5 h-2.5" />
                              <span>{cellRel.type}</span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {matrixSources.length >= 16 && (
            <p className="text-[10px] text-slate-400 font-mono text-center">
              (Matrix view capped to top 16 active components. Use search or Flow Cards view to inspect all {normalizedRelationships.length} relationships.)
            </p>
          )}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           VIEW 4: STRUCTURED COMMUNICATION TABLE
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Source Caller
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Target Callee
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Evidence & AST Snippet
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRelationships.map(rel => {
                  const RelIcon = rel.config.icon;

                  return (
                    <tr key={rel.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Source */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <button
                          type="button"
                          onClick={() => handleInspect(rel.from)}
                          className="font-mono font-bold text-slate-900 hover:text-blue-600 hover:underline block truncate text-left cursor-pointer"
                          title={rel.from}
                        >
                          {rel.fromMeta.name}
                        </button>
                        {rel.fromMeta.dir && (
                          <span className="text-[10px] font-mono text-slate-400 truncate block">{rel.fromMeta.dir}</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${rel.config.badgeBg}`}
                        >
                          <RelIcon className="w-3 h-3" />
                          <span>{rel.type}</span>
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <button
                          type="button"
                          onClick={() => handleInspect(rel.to)}
                          className="font-mono font-bold text-slate-900 hover:text-blue-600 hover:underline block truncate text-left cursor-pointer"
                          title={rel.to}
                        >
                          {rel.toMeta.name}
                        </button>
                        {rel.toMeta.dir && (
                          <span className="text-[10px] font-mono text-slate-400 truncate block">{rel.toMeta.dir}</span>
                        )}
                      </td>

                      {/* Evidence */}
                      <td className="px-4 py-3 max-w-xs truncate">
                        {rel.evidence ? (
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate block">
                            {rel.evidence}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Implicit import / call graph</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFocusedComponent(focusedComponent === rel.from ? null : rel.from)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                            title="Trace Component"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                          {isFilePath(rel.from) && (
                            <button
                              type="button"
                              onClick={() => handleInspect(rel.from)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                              title="Inspect Source Code"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
