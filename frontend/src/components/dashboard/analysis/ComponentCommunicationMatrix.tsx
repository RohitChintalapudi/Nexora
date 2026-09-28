import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowRight,
  Search,
  Zap,
  Layers,
  FileCode,
  Compass,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Code2,
  Box,
  Shield,
  Database
} from 'lucide-react';
import type { ArchitectureRelationship } from '../../../types/analysis';

interface ComponentCommunicationMatrixProps {
  relationships?: ArchitectureRelationship[];
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void;
}

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

const parseComponentInfo = (rawPath: string) => {
  const p = safeStr(rawPath, 'Unknown');
  const normalized = p.replace(/\\/g, '/');
  const segments = normalized.split('/');
  const basename = segments[segments.length - 1] || normalized;
  const dir = segments.length > 1 ? segments.slice(0, -1).join('/') + '/' : '';
  const lower = normalized.toLowerCase();

  let category = 'module';
  let icon = FileCode;
  let color = 'text-slate-700 bg-slate-100 border-slate-200';

  if (lower.includes('controller')) {
    category = 'Controller';
    icon = Box;
    color = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  } else if (lower.includes('service')) {
    category = 'Service';
    icon = Zap;
    color = 'text-purple-700 bg-purple-50 border-purple-200';
  } else if (lower.includes('route') || lower.includes('router')) {
    category = 'Router';
    icon = Compass;
    color = 'text-sky-700 bg-sky-50 border-sky-200';
  } else if (lower.includes('middleware') || lower.includes('auth') || lower.includes('guard')) {
    category = 'Middleware';
    icon = Shield;
    color = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (lower.includes('model') || lower.includes('schema') || lower.includes('db')) {
    category = 'Model';
    icon = Database;
    color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (lower.endsWith('.tsx') || lower.endsWith('.jsx') || lower.includes('component')) {
    category = 'UI Component';
    icon = Layers;
    color = 'text-blue-700 bg-blue-50 border-blue-200';
  }

  return { name: basename, fullPath: p, dir, category, icon, color };
};

const getRelBadge = (type: string) => {
  const norm = safeStr(type, 'DEPENDS_ON').toUpperCase();
  switch (norm) {
    case 'IMPORTS':
      return { label: 'imports', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'CALLS':
      return { label: 'calls', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'ROUTES_TO':
      return { label: 'routes to', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'EXTENDS':
      return { label: 'extends', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'IMPLEMENTS':
      return { label: 'implements', badge: 'bg-teal-50 text-teal-700 border-teal-200' };
    default:
      return { label: norm.toLowerCase().replace(/_/g, ' '), badge: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Normalize relationships
  const normalized = useMemo(() => {
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
          relBadge: getRelBadge(type)
        };
      })
      .filter(rel => rel.from && rel.to);
  }, [relationships]);

  // Unique types with count
  const typeOptions = useMemo(() => {
    const counts: Record<string, number> = { ALL: normalized.length };
    normalized.forEach(r => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts);
  }, [normalized]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = normalized;
    if (selectedType !== 'ALL') {
      list = list.filter(r => r.type === selectedType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        r =>
          r.from.toLowerCase().includes(q) ||
          r.to.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.evidence.toLowerCase().includes(q)
      );
    }
    return list;
  }, [normalized, selectedType, searchQuery]);

  const displayedList = showAll ? filtered : filtered.slice(0, 10);

  const handleInspect = useCallback(
    (path: string) => {
      if (onOpenFileModal && isFilePath(path)) {
        onOpenFileModal(path);
      }
    },
    [onOpenFileModal]
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (normalized.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
        No component relationships recorded in this analysis.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search and Type Filter Bar - Small, Clean, Single Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {typeOptions.map(([type, count]) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All' : type.toLowerCase()}
                <span className={`ml-1 text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Relationships List */}
      {filtered.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
          No relationships matched "{searchQuery}".
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
          {displayedList.map(rel => {
            const isExpanded = expandedId === rel.id;
            const FromIcon = rel.fromMeta.icon;
            const ToIcon = rel.toMeta.icon;

            return (
              <div key={rel.id} className="p-2.5 sm:p-3 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  {/* From -> Relation -> To */}
                  <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                    {/* Source File */}
                    <button
                      type="button"
                      onClick={() => handleInspect(rel.from)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left font-mono font-medium truncate max-w-[200px] sm:max-w-[240px] transition-all cursor-pointer ${
                        isFilePath(rel.from)
                          ? 'bg-white hover:border-blue-300 hover:text-blue-600 text-slate-900 border-slate-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      title={rel.from}
                    >
                      <FromIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{rel.fromMeta.name}</span>
                    </button>

                    {/* Relationship Pill */}
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 shrink-0">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className={`px-2 py-0.5 rounded-full border ${rel.relBadge.badge}`}>
                        {rel.relBadge.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>

                    {/* Target File */}
                    <button
                      type="button"
                      onClick={() => handleInspect(rel.to)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left font-mono font-medium truncate max-w-[200px] sm:max-w-[240px] transition-all cursor-pointer ${
                        isFilePath(rel.to)
                          ? 'bg-white hover:border-blue-300 hover:text-blue-600 text-slate-900 border-slate-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      title={rel.to}
                    >
                      <ToIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{rel.toMeta.name}</span>
                    </button>
                  </div>

                  {/* Evidence Drawer Toggle */}
                  {rel.evidence && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : rel.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50/60 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide' : 'Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Collapsible Evidence Preview */}
                {isExpanded && rel.evidence && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source Evidence:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(rel.evidence, rel.id)}
                        className="flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        {copiedId === rel.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {rel.evidence}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show More / Show Less Button */}
      {filtered.length > 10 && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            {showAll ? 'Show less' : `Show all ${filtered.length} connections`}
          </button>
        </div>
      )}
    </div>
  );
};
