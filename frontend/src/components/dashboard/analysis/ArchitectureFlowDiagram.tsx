import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  MarkerType,
  Handle,
  Position,
  ReactFlowProvider,
  type Node,
  type Edge,
  type ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { 
  Layers, 
  Database, 
  Route as RouteIcon, 
  Shield, 
  Box, 
  Maximize2,
  Minimize2,
  Workflow,
  ArrowRight,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import type { 
  ArchitectureLayer, 
  ArchitectureRelationship, 
  ModuleItem, 
  RouteItem 
} from '../../../types/analysis';

interface ArchitectureFlowDiagramProps {
  layers?: ArchitectureLayer[];
  relationships?: ArchitectureRelationship[];
  modules?: ModuleItem[];
  apiStructure?: RouteItem[];
  databaseType?: string;
  databaseModels?: string[];
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void;
}

// Layer configuration for styling, colors, and badge indicators
export interface LayerConfig {
  key: string;
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  headerBg: string;
  activeBorder: string;
  icon: React.ElementType;
}

export const LAYER_CONFIGS: Record<string, LayerConfig> = {
  entry: {
    key: 'entry',
    label: 'Routes & Entry',
    color: '#0284c7', // sky-600
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-200',
    badgeText: 'text-sky-800',
    headerBg: 'bg-sky-500/10',
    activeBorder: 'border-sky-400 ring-2 ring-sky-300',
    icon: RouteIcon
  },
  middleware: {
    key: 'middleware',
    label: 'Middleware',
    color: '#d97706', // amber-600
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    headerBg: 'bg-amber-500/10',
    activeBorder: 'border-amber-400 ring-2 ring-amber-300',
    icon: Shield
  },
  controller: {
    key: 'controller',
    label: 'Controllers',
    color: '#4f46e5', // indigo-600
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-800',
    headerBg: 'bg-indigo-500/10',
    activeBorder: 'border-indigo-400 ring-2 ring-indigo-300',
    icon: Box
  },
  service: {
    key: 'service',
    label: 'Services & Libs',
    color: '#9333ea', // purple-600
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-800',
    headerBg: 'bg-purple-500/10',
    activeBorder: 'border-purple-400 ring-2 ring-purple-300',
    icon: Layers
  },
  model: {
    key: 'model',
    label: 'Database & Models',
    color: '#059669', // emerald-600
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-800',
    headerBg: 'bg-emerald-500/10',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-300',
    icon: Database
  }
};

/**
 * Classify a node into its architectural tier based on its filename or path
 */
function classifyNode(nameOrPath: string): keyof typeof LAYER_CONFIGS {
  const lower = nameOrPath.toLowerCase();
  if (
    lower.includes('route') || 
    lower.includes('router') || 
    lower.includes('entry') || 
    lower.includes('server') || 
    lower.includes('app.') || 
    lower.includes('main.') || 
    lower.includes('api/')
  ) {
    return 'entry';
  }
  if (
    lower.includes('middleware') || 
    lower.includes('guard') || 
    lower.includes('auth.mw') || 
    lower.includes('protect') || 
    lower.includes('interceptor')
  ) {
    return 'middleware';
  }
  if (lower.includes('controller') || lower.includes('handler') || lower.includes('resolver')) {
    return 'controller';
  }
  if (
    lower.includes('model') || 
    lower.includes('schema') || 
    lower.includes('entity') || 
    lower.includes('db') || 
    lower.includes('database') || 
    lower.includes('prisma') || 
    lower.includes('mongo') || 
    lower.includes('sql')
  ) {
    return 'model';
  }
  return 'service';
}

const NODE_WIDTH = 250;
const NODE_HEIGHT = 115;

/**
 * Custom React Flow Matrix Node Component
 */
const CustomArchitectureNode = ({ data }: { data: any }) => {
  const categoryKey = (data.category as keyof typeof LAYER_CONFIGS) || 'service';
  const cfg = LAYER_CONFIGS[categoryKey] || LAYER_CONFIGS.service;
  const Icon = cfg.icon;

  const rawLabel = String(data.label || '');
  const fileName = rawLabel.split('/').pop() || rawLabel;
  const dirPath = rawLabel.includes('/') 
    ? rawLabel.substring(0, rawLabel.lastIndexOf('/'))
    : '';

  const isHighlighted = data.isHighlighted;
  const isDimmed = data.isDimmed;
  const direction = data.direction || 'LR';

  return (
    <div 
      className={`relative group w-[250px] rounded-2xl bg-white border transition-all duration-200 text-xs overflow-hidden ${
        isHighlighted
          ? `${cfg.activeBorder} shadow-lg shadow-blue-500/15 scale-[1.02]`
          : isDimmed
            ? 'opacity-40 border-slate-200 shadow-2xs'
            : 'border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Target input handle (Left for LR, Top for TB) */}
      <Handle
        type="target"
        position={direction === 'LR' ? Position.Left : Position.Top}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-white shadow-xs"
      />

      {/* Header bar */}
      <div className={`px-3 py-1.5 flex items-center justify-between border-b border-slate-100 ${cfg.headerBg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder} truncate`}>
            {cfg.label}
          </span>
        </div>

        {data.onInspect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onInspect(data.label);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer shrink-0 ml-1"
            title="Inspect source file"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Body info */}
      <div className="p-3 space-y-1">
        {dirPath && (
          <p className="text-[10px] font-mono text-slate-400 truncate" title={dirPath}>
            {dirPath}/
          </p>
        )}
        <h4 className="font-mono font-bold text-slate-900 text-xs truncate" title={fileName}>
          {fileName}
        </h4>

        {data.role && (
          <p className="text-[11px] text-slate-600 font-sans leading-tight pt-0.5 line-clamp-2" title={data.role}>
            {data.role}
          </p>
        )}
      </div>

      {/* Source output handle (Right for LR, Bottom for TB) */}
      <Handle
        type="source"
        position={direction === 'LR' ? Position.Right : Position.Bottom}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-white shadow-xs"
      />
    </div>
  );
};

const nodeTypes = {
  customArchNode: CustomArchitectureNode
};

/**
 * Compute Dagre Hierarchical & Matrix Layout for Nodes and Edges
 */
function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) return { nodes: [], edges: [] };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 45,
    ranksep: direction === 'LR' ? 95 : 75,
    marginx: 40,
    marginy: 40
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 };
    return {
      ...node,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2
      },
      data: {
        ...node.data,
        direction
      }
    };
  });

  return { nodes: layoutedNodes, edges };
}

export const ArchitectureFlowDiagram: React.FC<ArchitectureFlowDiagramProps> = ({
  layers = [],
  relationships = [],
  modules = [],
  apiStructure = [],
  databaseType,
  databaseModels = [],
  onOpenFileModal
}) => {
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  // Stable callback ref to prevent memoization churn
  const onOpenFileModalRef = useRef(onOpenFileModal);
  onOpenFileModalRef.current = onOpenFileModal;

  const handleInspect = useCallback((filePath: string) => {
    if (onOpenFileModalRef.current) {
      onOpenFileModalRef.current(filePath);
    }
  }, []);

  // Build raw nodes and edges from repository architecture facts
  const { rawNodes, rawEdges } = useMemo(() => {
    const rawRels = Array.isArray(relationships) ? relationships : [];
    
    // Unique node identifier set and descriptive roles
    const uniqueNodeSet = new Set<string>();
    const nodeRoleMap = new Map<string, string>();
    
    rawRels.forEach(r => {
      if (r?.from) uniqueNodeSet.add(String(r.from).trim());
      if (r?.to) uniqueNodeSet.add(String(r.to).trim());
    });

    // Add key module files
    if (Array.isArray(modules)) {
      modules.forEach(m => {
        (m?.keyFiles || []).forEach(f => {
          const trimmed = String(f).trim();
          uniqueNodeSet.add(trimmed);
          if (m.purpose && !nodeRoleMap.has(trimmed)) {
            nodeRoleMap.set(trimmed, m.name || m.purpose);
          }
        });
      });
    }

    // Add API route files
    if (Array.isArray(apiStructure)) {
      apiStructure.slice(0, 12).forEach(r => {
        if (r?.filePath) {
          const trimmed = String(r.filePath).trim();
          uniqueNodeSet.add(trimmed);
          if (r.path && !nodeRoleMap.has(trimmed)) {
            nodeRoleMap.set(trimmed, `${r.method || 'GET'} ${r.path}`);
          }
        }
      });
    }

    // Add Database models
    if (Array.isArray(databaseModels)) {
      databaseModels.forEach(m => {
        const name = typeof m === 'object' && m !== null ? (m as any).name : String(m || '');
        if (name) {
          const modelKey = name.includes('/') ? name.trim() : `models/${name.trim()}`;
          uniqueNodeSet.add(modelKey);
          nodeRoleMap.set(modelKey, `${databaseType ? databaseType + ' ' : ''}Schema`);
        }
      });
    }

    // Associate architectural layers metadata if provided
    if (Array.isArray(layers)) {
      layers.forEach(l => {
        if (l?.name && l?.description) {
          nodeRoleMap.set(String(l.name).trim(), l.role || l.description);
        }
      });
    }

    // Fallback if no nodes discovered
    if (uniqueNodeSet.size === 0) {
      uniqueNodeSet.add('src/routes/api.js');
      uniqueNodeSet.add('src/controllers/main.controller.js');
      uniqueNodeSet.add('src/services/app.service.js');
      uniqueNodeSet.add('src/models/schema.js');
    }

    const nodeList = Array.from(uniqueNodeSet);

    // Build raw React Flow nodes
    const nodes: Node[] = nodeList.map((item) => {
      const cat = classifyNode(item);
      return {
        id: item,
        type: 'customArchNode',
        position: { x: 0, y: 0 },
        data: {
          label: item,
          category: cat,
          role: nodeRoleMap.get(item),
          onInspect: handleInspect
        }
      };
    });

    const nodeIds = new Set(nodes.map(n => n.id));

    // Generate edges from relationships
    const edges: Edge[] = [];
    const edgeKeySet = new Set<string>();

    rawRels.forEach((rel, idx) => {
      const from = rel?.from ? String(rel.from).trim() : '';
      const to = rel?.to ? String(rel.to).trim() : '';

      if (from && to && nodeIds.has(from) && nodeIds.has(to)) {
        const edgeKey = `${from}->${to}`;
        if (!edgeKeySet.has(edgeKey)) {
          edgeKeySet.add(edgeKey);

          const relType = (rel.type || 'DEPENDS_ON').toUpperCase();
          const isRoute = relType.includes('ROUTE');
          const isImport = relType.includes('IMPORT');

          edges.push({
            id: `edge-${idx}-${from}-${to}`,
            source: from,
            target: to,
            animated: isRoute || isImport,
            label: relType.replace(/_/g, ' '),
            style: {
              stroke: isRoute ? '#0284c7' : (isImport ? '#4f46e5' : '#9333ea'),
              strokeWidth: 2
            },
            labelStyle: {
              fontSize: 9,
              fontWeight: 700,
              fill: '#475569'
            },
            labelBgStyle: {
              fill: '#ffffff',
              fillOpacity: 0.95,
              rx: 6,
              ry: 6
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isRoute ? '#0284c7' : (isImport ? '#4f46e5' : '#9333ea'),
              width: 16,
              height: 16
            }
          });
        }
      }
    });

    // If no explicit edges exist, connect sequentially across categories
    if (edges.length === 0 && nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const src = nodes[i].id;
        const dst = nodes[i + 1].id;
        edges.push({
          id: `fallback-edge-${i}`,
          source: src,
          target: dst,
          animated: true,
          label: 'FLOWS_TO',
          style: { stroke: '#4f46e5', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' }
        });
      }
    }

    return { rawNodes: nodes, rawEdges: edges };
  }, [relationships, modules, apiStructure, databaseModels, databaseType, layers, handleInspect]);

  // Filter nodes & edges according to active layer filter
  const { filteredNodes, filteredEdges } = useMemo(() => {
    let activeNodes = rawNodes;
    if (selectedLayer !== 'ALL') {
      activeNodes = rawNodes.filter(n => n.data?.category === selectedLayer);
    }

    const activeNodeIdSet = new Set(activeNodes.map(n => n.id));
    const activeEdges = rawEdges.filter(e => activeNodeIdSet.has(e.source) && activeNodeIdSet.has(e.target));

    return { filteredNodes: activeNodes, filteredEdges: activeEdges };
  }, [rawNodes, rawEdges, selectedLayer]);

  // Apply Dagre matrix auto-layout
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const { nodes: lNodes, edges: lEdges } = getLayoutedElements(
      filteredNodes,
      filteredEdges,
      layoutDirection
    );

    // Apply interactive flow highlighting if a node is selected
    if (selectedNodeId) {
      const connectedEdges = new Set<string>();
      const connectedNodeIds = new Set<string>([selectedNodeId]);

      lEdges.forEach(e => {
        if (e.source === selectedNodeId || e.target === selectedNodeId) {
          connectedEdges.add(e.id);
          connectedNodeIds.add(e.source);
          connectedNodeIds.add(e.target);
        }
      });

      const highlightedNodes = lNodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: n.id === selectedNodeId || connectedNodeIds.has(n.id),
          isDimmed: !connectedNodeIds.has(n.id)
        }
      }));

      const highlightedEdges = lEdges.map(e => ({
        ...e,
        animated: connectedEdges.has(e.id),
        style: {
          ...e.style,
          stroke: connectedEdges.has(e.id) ? '#2563eb' : '#cbd5e1',
          strokeWidth: connectedEdges.has(e.id) ? 3 : 1.5,
          opacity: connectedEdges.has(e.id) ? 1 : 0.25
        }
      }));

      return { layoutedNodes: highlightedNodes, layoutedEdges: highlightedEdges };
    }

    return { layoutedNodes: lNodes, layoutedEdges: lEdges };
  }, [filteredNodes, filteredEdges, layoutDirection, selectedNodeId]);

  // Handle node selection
  const handleNodeClick = useCallback((_event: any, node: Node) => {
    setSelectedNodeId(prev => (prev === node.id ? null : node.id));
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
    instance.fitView({ padding: 0.2 });
  }, []);

  const handleDirectionChange = useCallback((dir: 'LR' | 'TB') => {
    setLayoutDirection(dir);
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, []);

  const handleLayerChange = useCallback((layer: string) => {
    setSelectedLayer(layer);
    setSelectedNodeId(null);
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, []);

  return (
    <div className={`rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-slate-900/5 overflow-hidden transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-4 z-50 bg-white shadow-2xl flex flex-col' 
        : 'relative'
    }`}>
      
      {/* Top Banner Toolbar */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Title & Node / Edge Metrics */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
            <Workflow className="w-4 h-4 text-blue-600" />
            <span>Interactive Matrix Architecture Flow</span>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            {layoutedNodes.length} Nodes • {layoutedEdges.length} Connections
          </span>
          {selectedNodeId && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Flow Highlighted</span>
            </span>
          )}
        </div>

        {/* Right: Controls (Direction, Filter & Fullscreen) */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Layer Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => handleLayerChange('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedLayer === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Layers
            </button>
            {Object.values(LAYER_CONFIGS).map(cfg => {
              const isActive = selectedLayer === cfg.key;
              return (
                <button
                  key={cfg.key}
                  type="button"
                  onClick={() => handleLayerChange(cfg.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span>{cfg.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Direction Toggle: LR vs TB */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => handleDirectionChange('LR')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                layoutDirection === 'LR'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Horizontal Matrix Flow (Left to Right)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Matrix (LR)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('TB')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                layoutDirection === 'TB'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vertical Tree Flow (Top to Bottom)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Tree (TB)</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* React Flow Canvas Container */}
      <div className={`w-full bg-slate-50/90 relative ${isFullscreen ? 'flex-1 h-full' : 'h-[500px] sm:h-[600px]'}`}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={layoutedNodes}
            edges={layoutedEdges}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onInit={handleInit}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={1.8}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#94a3b8" />
            <Controls 
              showInteractive={false}
              className="!bg-white !border !border-slate-200 !rounded-2xl !shadow-md !p-1" 
            />
            <MiniMap
              nodeColor={(n: any) => {
                const cat = n.data?.category as keyof typeof LAYER_CONFIGS;
                return LAYER_CONFIGS[cat]?.color || '#64748b';
              }}
              maskColor="rgba(241, 245, 249, 0.75)"
              className="!bg-white !border !border-slate-200 !rounded-2xl !shadow-md !overflow-hidden hidden sm:block"
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Bottom Contextual Helper Bar */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">💡 Interactive Flow:</span>
          <span>Click any node to trace its connected dependencies. Drag canvas to pan • Scroll to zoom.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Powered by React Flow + Dagre Matrix Layout</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureFlowDiagram;
