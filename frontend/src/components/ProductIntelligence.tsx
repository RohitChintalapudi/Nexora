import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Network,
  ShieldAlert,
  CheckCircle2,
  GitBranch,
  Search,
  Layers,
  ArrowRight,
  Activity,
  FileCode2,
} from 'lucide-react';

interface NodeItem {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  info: string;
}

interface EdgeItem {
  from: string;
  to: string;
}

export const ProductIntelligence: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const viewWidth = 340;
  const viewHeight = 175;

  const nodes: NodeItem[] = [
    { id: 'gateway', label: 'API Gateway', type: 'ROUTER', x: 170, y: 25, info: 'Handles route rate limiting & client proxy checks' },
    { id: 'auth', label: 'Auth Service', type: 'API', x: 75, y: 75, info: 'Validates token signatures & user credentials' },
    { id: 'user', label: 'User Service', type: 'SERVICE', x: 265, y: 75, info: 'Core business service database executor' },
    { id: 'authDb', label: 'Auth DB', type: 'REDIS', x: 75, y: 135, info: 'Redis cache storing active token blocklists' },
    { id: 'postgres', label: 'PostgreSQL', type: 'DATABASE', x: 265, y: 135, info: 'Primary user data stores relational replica' }
  ];

  const edges: EdgeItem[] = [
    { from: 'gateway', to: 'auth' },
    { from: 'gateway', to: 'user' },
    { from: 'auth', to: 'user' },
    { from: 'auth', to: 'authDb' },
    { from: 'user', to: 'postgres' },
    { from: 'authDb', to: 'postgres' }
  ];

  const connectedMap: Record<string, string[]> = {
    gateway: ['auth', 'user'],
    auth: ['gateway', 'user', 'authDb'],
    user: ['gateway', 'auth', 'postgres'],
    authDb: ['auth', 'postgres'],
    postgres: ['user', 'authDb']
  };

  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNode) return false;
    return nodeId === hoveredNode || connectedMap[hoveredNode]?.includes(nodeId);
  };

  const isNodeDimmed = (nodeId: string) => {
    if (!hoveredNode) return false;
    return nodeId !== hoveredNode && !connectedMap[hoveredNode]?.includes(nodeId);
  };

  const isEdgeHighlighted = (from: string, to: string) => {
    if (!hoveredNode) return false;
    return (from === hoveredNode && connectedMap[hoveredNode]?.includes(to)) ||
           (to === hoveredNode && connectedMap[hoveredNode]?.includes(from));
  };

  return (
    <div id="product" className="relative bg-[#F7F7F5] content-layer py-16 md:py-24 border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Modern Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-serif font-medium shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Core Intelligence Architecture</span>
          </div>
          <h2 className="text-3.5xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.14] mb-4">
            Three pillars of total software clarity.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-serif leading-relaxed max-w-2xl mx-auto font-light">
            NEXORA parses your codebase into an interconnected graph—allowing you to query internal mechanics, visualize complex systems, and forecast mutation blast radius.
          </p>
        </div>

        {/* Pillar 01 — UNDERSTAND */}
        <section className="relative py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.07] text-neutral-800 text-xs font-serif font-semibold tracking-wider uppercase w-fit">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>01 — UNDERSTAND</span>
              </div>

              <h3 className="text-2.5xl sm:text-3.5xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.18]">
                AI-powered codebase intelligence.
              </h3>
              
              <p className="text-neutral-600 font-serif text-sm sm:text-base leading-relaxed font-light">
                Ask questions about your project and receive answers grounded in your actual AST and execution graph. NEXORA understands services, functions, controllers, and their cross-system relationships.
              </p>
              
              <ul className="space-y-3 pt-2 font-serif text-sm sm:text-base text-neutral-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Repository-wide semantic query resolution</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Contextual code understanding across microservices</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Zero-hallucination grounded source references</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="code-panel rounded-3xl border border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.03),_0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden font-serif">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4 bg-neutral-50/70">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-neutral-500" />
                    <span className="font-serif text-xs font-semibold text-neutral-700 tracking-wide uppercase">NEXORA QUERY ENGINE</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                    <span>AST Grounded</span>
                  </span>
                </div>
                
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-serif">Prompt Query</div>
                    <div className="text-neutral-950 font-medium bg-neutral-50 border border-black/[0.06] rounded-xl py-3 px-4.5 shadow-2xs text-sm sm:text-base font-serif">
                      "Where is session authentication and token validation handled?"
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-serif">Synthesized Flow Path</div>
                    <div className="text-neutral-800 bg-white border border-black/[0.08] rounded-xl p-5 shadow-2xs space-y-3">
                      <div className="font-semibold text-neutral-950 text-sm sm:text-base font-serif flex items-center justify-between">
                        <span>4 connected execution layers detected</span>
                        <span className="text-xs text-neutral-500 font-normal">240ms resolution</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm space-y-2.5 text-neutral-700 bg-neutral-50/70 p-3.5 rounded-lg border border-black/[0.04]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-neutral-400" />
                          <span className="font-medium text-neutral-800">AuthController.ts</span>
                          <span className="text-neutral-400 text-xs">/api/v1/login</span>
                        </div>
                        <div className="pl-4 text-neutral-300">↓</div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.6)]" />
                          <span className="font-semibold text-blue-700">AuthService.ts</span>
                          <span className="text-blue-600/70 text-xs">verifyCredentialToken()</span>
                        </div>
                        <div className="pl-4 text-neutral-300">↓</div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-neutral-400" />
                          <span className="font-medium text-neutral-800">JWTMiddleware.ts</span>
                          <span className="text-neutral-400 text-xs">RS256 Signature Verification</span>
                        </div>
                        <div className="pl-4 text-neutral-300">↓</div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-neutral-400" />
                          <span className="font-medium text-neutral-800">UserRepository.sql</span>
                          <span className="text-neutral-400 text-xs">findByEmail()</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/[0.06] px-6 py-3.5 bg-neutral-50/70 flex items-center justify-between text-xs sm:text-sm font-serif text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-neutral-500" />
                    <span>12 connected repository files mapped</span>
                  </span>
                  <span className="text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1">
                    Inspect Graph <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.06]" />

        {/* Pillar 02 — VISUALIZE */}
        <section className="relative py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            <div className="lg:col-span-7 order-last lg:order-first">
              <div className="code-panel rounded-3xl border border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.03),_0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden font-sans text-xs relative flex flex-col min-h-[320px]">
                <div className="h-12 flex items-center justify-between border-b border-black/[0.06] px-6 bg-neutral-50/70 select-none">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-600" />
                    <span className="font-serif text-xs font-semibold text-neutral-800 tracking-wide uppercase">LIVE TOPOLOGY MAP</span>
                  </div>
                  {hoveredNode ? (
                    <span className="text-xs font-serif font-medium text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full px-3 py-0.5 max-w-[240px] truncate shadow-2xs">
                      {nodes.find(n => n.id === hoveredNode)?.info}
                    </span>
                  ) : (
                    <span className="text-xs font-serif text-neutral-500 py-0.5 px-2">
                      Hover nodes to trace dependency links
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center p-6 select-none relative min-h-[220px]">
                  <svg className="w-full max-w-[340px] h-[175px] overflow-visible" viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
                    {edges.map((edge, idx) => {
                      const fromNode = nodes.find(n => n.id === edge.from);
                      const toNode = nodes.find(n => n.id === edge.to);
                      if (!fromNode || !toNode) return null;

                      const highlighted = isEdgeHighlighted(edge.from, edge.to);
                      const dimmed = hoveredNode !== null && !highlighted;

                      return (
                        <line
                          key={idx}
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={highlighted ? '#2563EB' : 'rgba(17, 17, 17, 0.12)'}
                          strokeWidth={highlighted ? 2.2 : 1.2}
                          strokeDasharray={dimmed ? '3, 3' : undefined}
                          opacity={dimmed ? 0.35 : 1}
                          className="transition-all duration-300"
                        />
                      );
                    })}

                    {nodes.map((node) => {
                      const highlighted = isNodeHighlighted(node.id);
                      const dimmed = isNodeDimmed(node.id);
                      const isHovered = hoveredNode === node.id;

                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          {highlighted && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={16}
                              fill="rgba(37, 99, 235, 0.08)"
                              className="transition-all duration-300"
                            />
                          )}
                          
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isHovered ? 8.5 : 7}
                            fill={highlighted ? '#2563EB' : '#FFFFFF'}
                            stroke={highlighted ? '#2563EB' : 'rgba(17, 17, 17, 0.3)'}
                            strokeWidth="2"
                            opacity={dimmed ? 0.4 : 1}
                            className="transition-all duration-300 shadow-sm"
                          />

                          <text
                            x={node.x}
                            y={node.y - 13}
                            textAnchor="middle"
                            opacity={dimmed ? 0.4 : 1}
                            className={`text-[8.5px] font-serif transition-colors duration-300 ${
                              highlighted ? 'fill-blue-700 font-bold' : 'fill-neutral-900 font-semibold'
                            }`}
                          >
                            {node.label}
                          </text>
                          <text
                            x={node.x}
                            y={node.y + 20}
                            textAnchor="middle"
                            opacity={dimmed ? 0.3 : 1}
                            className="text-[7.5px] font-mono fill-neutral-400 font-medium"
                          >
                            {node.type}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="border-t border-black/[0.06] px-6 py-3.5 bg-neutral-50/70 flex items-center justify-between text-xs font-serif text-neutral-500 select-none">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-neutral-500" />
                    <span>18 active micro-dependencies mapped</span>
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live Interactive Mode
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-first lg:order-last space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.07] text-neutral-800 text-xs font-serif font-semibold tracking-wider uppercase w-fit">
                <Network className="w-3.5 h-3.5 text-blue-600" />
                <span>02 — VISUALIZE</span>
              </div>

              <h3 className="text-2.5xl sm:text-3.5xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.18]">
                See how everything connects.
              </h3>
              
              <p className="text-neutral-600 font-serif text-sm sm:text-base leading-relaxed font-light">
                Explore relationships between databases, microservices, APIs, routes, and asynchronous handlers with deep interactive topology maps.
              </p>
              
              <ul className="space-y-3 pt-2 font-serif text-sm sm:text-base text-neutral-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Interactive dependency graph navigation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Microservice & data pipeline architectural modeling</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Automated service boundary boundary identification</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.06]" />

        {/* Pillar 03 — PREDICT */}
        <section className="relative py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.07] text-neutral-800 text-xs font-serif font-semibold tracking-wider uppercase w-fit">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>03 — PREDICT</span>
              </div>

              <h3 className="text-2.5xl sm:text-3.5xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.18]">
                Understand impact before code changes.
              </h3>
              
              <p className="text-neutral-600 font-serif text-sm sm:text-base leading-relaxed font-light">
                NEXORA traces downstream blast radius to forecast what will break before committing code. Spot dangerous schema mutations and broken consumer contracts instantly.
              </p>
              
              <ul className="space-y-3 pt-2 font-serif text-sm sm:text-base text-neutral-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Automated PR mutation & blast-radius forecasting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Consumer contract breaking change warnings</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Proactive risk calculation before merging</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="code-panel rounded-3xl border border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.03),_0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden font-serif text-sm">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4 bg-neutral-50/70">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span className="font-serif text-xs font-semibold text-neutral-800 tracking-wide uppercase">MUTATION BLAST RADIUS</span>
                  </div>
                  <span className="text-xs font-serif font-semibold px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 tracking-wide select-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Potential Breaking Change
                  </span>
                </div>

                <div className="p-6 sm:p-7 space-y-5">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-serif">Modified Target File</div>
                    <div className="font-mono text-neutral-950 font-semibold bg-neutral-50 border border-black/[0.06] rounded-xl py-2.5 px-4 inline-flex items-center gap-2 shadow-2xs text-sm sm:text-base">
                      <GitBranch className="w-4 h-4 text-neutral-600" />
                      <span>AuthService.ts</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-serif">Downstream Affected Surface</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-neutral-900 font-serif font-medium text-xs sm:text-sm">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/60 border border-red-100 text-red-700">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>12 files</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-black/[0.06]">
                        <span className="w-2 h-2 rounded-full bg-neutral-500" />
                        <span>4 API routes</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-black/[0.06]">
                        <span className="w-2 h-2 rounded-full bg-neutral-500" />
                        <span>3 services</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-black/[0.06]">
                        <span className="w-2 h-2 rounded-full bg-neutral-500" />
                        <span>2 UI views</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-serif">Critical Dependency Chain</div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-neutral-800 bg-neutral-50/70 border border-black/[0.06] rounded-xl p-3.5">
                      <div className="flex-1 w-full sm:w-auto py-2 px-3 text-center rounded-lg border border-red-200 bg-red-50 text-red-700 font-semibold shadow-2xs">
                        AuthService
                      </div>
                      <span className="text-neutral-300 text-sm rotate-90 sm:rotate-0">→</span>
                      <div className="flex-1 w-full sm:w-auto py-2 px-3 text-center rounded-lg border border-black/[0.08] bg-white text-neutral-900 shadow-2xs">
                        AuthController
                      </div>
                      <span className="text-neutral-300 text-sm rotate-90 sm:rotate-0">→</span>
                      <div className="flex-1 w-full sm:w-auto py-2 px-3 text-center rounded-lg border border-black/[0.08] bg-white text-neutral-900 shadow-2xs">
                        API Gateway
                      </div>
                      <span className="text-neutral-300 text-sm rotate-90 sm:rotate-0">→</span>
                      <div className="flex-1 w-full sm:w-auto py-2 px-3 text-center rounded-lg border border-black/[0.08] bg-white text-neutral-700 shadow-2xs">
                        Dashboard
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/[0.06] px-6 py-3.5 bg-neutral-50/70 flex items-center justify-between text-xs sm:text-sm font-serif text-neutral-600">
                  <span>Impact Score: High (Severity Level 3)</span>
                  <span className="text-neutral-950 font-semibold">0 Unhandled Exceptions</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default ProductIntelligence;
