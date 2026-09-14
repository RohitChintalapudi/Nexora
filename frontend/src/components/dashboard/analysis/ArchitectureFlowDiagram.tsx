import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Layers, 
  Database, 
  Route as RouteIcon, 
  Shield, 
  Box, 
  Maximize2
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

// Layer configuration for styling and tier assignment
interface LayerConfig {
  label: string;
  color: string;
  bgBadge: string;
  borderBadge: string;
  textBadge: string;
  headerBg: string;
  icon: React.ElementType;
}

const LAYER_CONFIGS: Record<string, LayerConfig> = {
  entry: {
    label: 'Entry & Routes',
    color: '#0284c7', // sky-600
    bgBadge: 'bg-sky-50',
    borderBadge: 'border-sky-200',
    textBadge: 'text-sky-800',
    headerBg: 'bg-sky-500/10',
    icon: RouteIcon
  },
  middleware: {
    label: 'Middleware',
    color: '#d97706', // amber-600
    bgBadge: 'bg-amber-50',
    borderBadge: 'border-amber-200',
    textBadge: 'text-amber-800',
    headerBg: 'bg-amber-500/10',
    icon: Shield
  },
  controller: {
    label: 'Controllers',
    color: '#2563eb', // blue-600
    bgBadge: 'bg-blue-50',
    borderBadge: 'border-blue-200',
    textBadge: 'text-blue-800',
    headerBg: 'bg-blue-500/10',
    icon: Box
  },
  service: {
    label: 'Services & Lib',
    color: '#7c3aed', // purple-600
    bgBadge: 'bg-purple-50',
    borderBadge: 'border-purple-200',
    textBadge: 'text-purple-800',
    headerBg: 'bg-purple-500/10',
    icon: Layers
  },
  model: {
    label: 'Database & Models',
    color: '#059669', // emerald-600
    bgBadge: 'bg-emerald-50',
    borderBadge: 'border-emerald-200',
    textBadge: 'text-emerald-800',
    headerBg: 'bg-emerald-500/10',
    icon: Database
  }
};

/**
 * Determine category of a node from its path or name
 */
function classifyNode(nameOrPath: string): keyof typeof LAYER_CONFIGS {
  const lower = nameOrPath.toLowerCase();
  if (lower.includes('route') || lower.includes('router') || lower.includes('entry') || lower.includes('server') || lower.includes('app.') || lower.includes('main.')) {
    return 'entry';
  }
  if (lower.includes('middleware') || lower.includes('guard') || lower.includes('auth.mw') || lower.includes('protect')) {
    return 'middleware';
  }
  if (lower.includes('controller') || lower.includes('handler')) {
    return 'controller';
  }
  if (lower.includes('model') || lower.includes('schema') || lower.includes('entity') || lower.includes('db') || lower.includes('database') || lower.includes('prisma') || lower.includes('mongo')) {
    return 'model';
  }
  return 'service';
}

/**
 * Custom React Flow Node Component
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

  return (
    <div className="relative group min-w-[210px] max-w-[260px] rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-lg hover:border-blue-400 transition-all text-xs overflow-hidden">
      {/* Target input handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-white shadow-xs"
      />

      {/* Header bar */}
      <div className={`px-3 py-1.5 flex items-center justify-between border-b border-slate-100 ${cfg.headerBg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${cfg.bgBadge} ${cfg.textBadge} border ${cfg.borderBadge} truncate`}>
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
          <p className="text-[11px] text-slate-600 font-sans leading-tight pt-0.5 line-clamp-2">
            {data.role}
          </p>
        )}
      </div>

      {/* Source output handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-white shadow-xs"
      />
    </div>
  );
};

const nodeTypes = {
  customArchNode: CustomArchitectureNode
};

export const ArchitectureFlowDiagram: React.FC<ArchitectureFlowDiagramProps> = ({
  layers = [],
  relationships = [],
  modules = [],
  apiStructure = [],
  databaseType,
  databaseModels = [],
  onOpenFileModal
}) => {
  // Build nodes and edges from architecture relationships
  const { initialNodes, initialEdges } = useMemo(() => {
    const rawRels = Array.isArray(relationships) ? relationships : [];
    
    // Extract unique node names from relationships, modules, routes, and models
    const uniqueNodeSet = new Set<string>();
    const nodeRoleMap = new Map<string, string>();
    
    rawRels.forEach(r => {
      if (r.from) uniqueNodeSet.add(r.from.trim());
      if (r.to) uniqueNodeSet.add(r.to.trim());
    });

    // Add key module files
    modules.forEach(m => {
      (m.keyFiles || []).forEach(f => {
        const trimmed = f.trim();
        uniqueNodeSet.add(trimmed);
        if (m.purpose && !nodeRoleMap.has(trimmed)) {
          nodeRoleMap.set(trimmed, m.name || m.purpose);
        }
      });
    });

    // Add API route files
    apiStructure.slice(0, 10).forEach(r => {
      if (r.filePath) {
        const trimmed = r.filePath.trim();
        uniqueNodeSet.add(trimmed);
        if (r.path && !nodeRoleMap.has(trimmed)) {
          nodeRoleMap.set(trimmed, `${r.method || 'GET'} ${r.path}`);
        }
      }
    });

    // Add Database models if available
    databaseModels.forEach(m => {
      const name = typeof m === 'object' && m !== null ? (m as any).name : String(m);
      if (name) {
        const modelKey = name.includes('/') ? name.trim() : `models/${name.trim()}`;
        uniqueNodeSet.add(modelKey);
        nodeRoleMap.set(modelKey, `${databaseType ? databaseType + ' ' : ''}Schema`);
      }
    });

    // Associate architectural layers metadata if provided
    layers.forEach(l => {
      if (l.name && l.description) {
        // If layer corresponds to any node, enrich it
        nodeRoleMap.set(l.name, l.role || l.description);
      }
    });

    // Fallback if no nodes discovered
    if (uniqueNodeSet.size === 0) {
      uniqueNodeSet.add('src/routes/api.js');
      uniqueNodeSet.add('src/controllers/main.controller.js');
      uniqueNodeSet.add('src/services/app.service.js');
      uniqueNodeSet.add('src/models/schema.js');
    }

    const nodeList = Array.from(uniqueNodeSet);

    // Group nodes into 5 column tiers based on classification
    const tiers: Record<string, string[]> = {
      entry: [],
      middleware: [],
      controller: [],
      service: [],
      model: []
    };

    nodeList.forEach(name => {
      const cat = classifyNode(name);
      tiers[cat].push(name);
    });

    // Assign (X, Y) coordinates
    const tierOrder: (keyof typeof LAYER_CONFIGS)[] = ['entry', 'middleware', 'controller', 'service', 'model'];
    const nodes: Node[] = [];
    const nodeIds = new Set<string>();

    let activeColumnIndex = 0;

    tierOrder.forEach((tierKey) => {
      const items = tiers[tierKey];
      if (items.length === 0) return;

      const xPos = activeColumnIndex * 310 + 40;

      items.forEach((item, itemIdx) => {
        const yPos = itemIdx * 125 + 40;
        const id = item;

        nodes.push({
          id,
          type: 'customArchNode',
          position: { x: xPos, y: yPos },
          data: {
            label: item,
            category: tierKey,
            role: nodeRoleMap.get(item),
            onInspect: onOpenFileModal ? (path: string) => onOpenFileModal(path) : undefined
          }
        });
        nodeIds.add(id);
      });

      activeColumnIndex++;
    });

    // Generate edges from relationships
    const edges: Edge[] = [];
    const edgeKeySet = new Set<string>();

    rawRels.forEach((rel, idx) => {
      const from = rel.from?.trim();
      const to = rel.to?.trim();

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
              stroke: isRoute ? '#0284c7' : (isImport ? '#2563eb' : '#7c3aed'),
              strokeWidth: 2
            },
            labelStyle: {
              fontSize: 9,
              fontWeight: 700,
              fill: '#475569'
            },
            labelBgStyle: {
              fill: '#ffffff',
              fillOpacity: 0.9,
              rx: 6,
              ry: 6
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isRoute ? '#0284c7' : (isImport ? '#2563eb' : '#7c3aed'),
              width: 16,
              height: 16
            }
          });
        }
      }
    });

    // If no explicit edges exist, connect adjacent column items logically
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
          style: { stroke: '#2563eb', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' }
        });
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [relationships, modules, apiStructure, databaseModels, databaseType, layers, onOpenFileModal]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-slate-900/5 overflow-hidden">
      
      {/* Top Banner Toolbar */}
      <div className="px-5 py-3 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-extrabold text-slate-900">
            Interactive Architecture Tree
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {nodes.length} Nodes • {edges.length} Connections
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span className="text-[11px]">Routes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-[11px]">Middleware</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-[11px]">Controllers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span className="text-[11px]">Services</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[11px]">Database</span>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="h-[480px] sm:h-[560px] w-full bg-slate-50/80 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={1.8}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#94a3b8" />
          <Controls 
            showInteractive={false}
            className="!bg-white !border !border-slate-200 !rounded-2xl !shadow-md !p-1" 
          />
          <MiniMap
            nodeColor={(n: any) => {
              const cat = n.data?.category as keyof typeof LAYER_CONFIGS;
              return LAYER_CONFIGS[cat]?.color || '#64748b';
            }}
            maskColor="rgba(241, 245, 249, 0.7)"
            className="!bg-white !border !border-slate-200 !rounded-2xl !shadow-md !overflow-hidden hidden sm:block"
          />
        </ReactFlow>
      </div>

      <div className="p-3 bg-white border-t border-slate-200/70 text-center text-[11px] text-slate-500">
        💡 Drag canvas to pan • Scroll to zoom • Click <Maximize2 className="w-2.5 h-2.5 inline mx-0.5 text-slate-400" /> on any node to inspect its live code.
      </div>
    </div>
  );
};

export default ArchitectureFlowDiagram;

