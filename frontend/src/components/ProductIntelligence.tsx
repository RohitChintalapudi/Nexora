import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
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
    <div id="product" className="relative bg-[#F7F7F5] content-layer pt-8 pb-12 md:pt-10 md:pb-16 border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header with tighter padding */}
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.14] mb-3">
            Three pillars of total software clarity.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-serif leading-relaxed max-w-2xl mx-auto font-light">
            NEXORA parses your codebase into an interconnected graph—allowing you to query internal mechanics, visualize complex systems, and forecast mutation blast radius.
          </p>
        </div>

        {/* Pillar 01 — UNDERSTAND */}
        <section className="relative py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            <div className="lg:col-span-5 flex flex-col justify-center space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.07] text-neutral-800 text-xs font-serif font-semibold tracking-wider uppercase w-fit">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>01 — UNDERSTAND</span>
              </div>

              <h3 className="text-2.5xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.18]">
                AI-powered codebase intelligence.
              </h3>
              
              <p className="text-neutral-600 font-serif text-sm sm:text-base leading-relaxed font-light">
                Ask questions about your project and receive answers grounded in your actual AST and execution graph. NEXORA understands services, functions, controllers, and their cross-system relationships.
              </p>
              
              <ul className="space-y-2.5 pt-1 font-serif text-sm sm:text-base text-neutral-800">
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
                <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-3.5 bg-neutral-50/70">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-neutral-500" />
                    <span className="font-serif text-xs font-semibold text-neutral-700 tracking-wide uppercase">NEXORA QUERY ENGINE</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                    <span>AST Grounded</span>
                  </span>
                </div>
                
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-serif">Prompt Query</div>
                    <div className="text-neutral-950 font-medium bg-neutral-50 border border-black/[0.06] rounded-xl py-2.5 px-4 shadow-2xs text-sm sm:text-base font-serif">
                      "Where is session authentication and token validation handled?"
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-serif">Synthesized Flow Path</div>
                    <div className="text-neutral-800 bg-white border border-black/[0.08] rounded-xl p-4 shadow-2xs space-y-2.5">
                      <div className="font-semibold text-neutral-950 text-sm sm:text-base font-serif flex items-center justify-between">
                        <span>4 connected execution layers detected</span>
                        <span className="text-xs text-neutral-500 font-normal">240ms resolution</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm space-y-2 text-neutral-700 bg-neutral-50/70 p-3 rounded-lg border border-black/[0.04]">
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

                <div className="border-t border-black/[0.06] px-6 py-3 bg-neutral-50/70 flex items-center justify-between text-xs sm:text-sm font-serif text-neutral-600">
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
        <section className="relative py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            <div className="lg:col-span-7 order-last lg:order-first">
              <div className="code-panel rounded-3xl border border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.03),_0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden font-sans text-xs relative flex flex-col min-h-[320px]">
                {/* Showcase Header */}
                <div className="h-11 flex items-center justify-between border-b border-black/[0.06] px-6 bg-neutral-50/70 select-none">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-600" />
                    <span className="font-serif text-xs font-semibold text-neutral-800 tracking-wide uppercase">LIVE ARCHITECTURE SHOWCASE</span>
                  </div>
                  {hoveredNode ? (
                    <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full px-3 py-0.5 max-w-[280px] truncate shadow-2xs">
                      {nodes.find(n => n.id === hoveredNode)?.info}
                    </span>
                  ) : (
                    <span className="text-xs font-serif text-neutral-500 py-0.5 px-2">
                      Hover services to trace live request flow
                    </span>
                  )}
                </div>

                {/* Architecture Flow Canvas */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-5 select-none relative min-h-[220px]">
                  <svg className="w-full max-w-[480px] h-[190px] overflow-visible" viewBox="0 0 480 190">
                    <defs>
                      <marker
                        id="flowArrow"
                        viewBox="0 0 6 6"
                        refX="5"
                        refY="3"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 6 3 L 0 6 z" fill="#2563EB" opacity="0.8" />
                      </marker>
                    </defs>

                    {/* Flow Pipelines */}
                    {edges.map((edge, idx) => {
                      const highlighted = isEdgeHighlighted(edge.from, edge.to);
                      const dimmed = hoveredNode !== null && !highlighted;

                      let pathD = '';
                      if (edge.from === 'gateway' && edge.to === 'auth') {
                        pathD = 'M 115 80 C 145 80, 145 42, 175 42';
                      } else if (edge.from === 'gateway' && edge.to === 'user') {
                        pathD = 'M 115 110 C 145 110, 145 148, 175 148';
                      } else if (edge.from === 'auth' && edge.to === 'user') {
                        pathD = 'M 245 74 L 245 116';
                      } else if (edge.from === 'auth' && edge.to === 'authDb') {
                        pathD = 'M 315 42 L 355 42';
                      } else if (edge.from === 'user' && edge.to === 'postgres') {
                        pathD = 'M 315 148 L 355 148';
                      } else if (edge.from === 'authDb' && edge.to === 'postgres') {
                        pathD = 'M 415 74 L 415 116';
                      }

                      if (!pathD) return null;

                      return (
                        <g key={idx}>
                          {/* Base Conduit Track */}
                          <path
                            d={pathD}
                            stroke={highlighted ? '#2563EB' : 'rgba(0,0,0,0.1)'}
                            strokeWidth={highlighted ? '2' : '1.5'}
                            strokeDasharray={highlighted ? 'none' : '4, 4'}
                            fill="none"
                            opacity={dimmed ? 0.25 : 1}
                            className="transition-all duration-300"
                          />

                          {/* Streaming Request Pulse */}
                          <motion.path
                            d={pathD}
                            stroke={highlighted ? '#2563EB' : 'rgba(37,99,235,0.45)'}
                            strokeWidth={highlighted ? '2.5' : '1.5'}
                            strokeDasharray="6, 10"
                            strokeLinecap="round"
                            fill="none"
                            opacity={dimmed ? 0.2 : 1}
                            animate={{ strokeDashoffset: [0, -32] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                          />

                          {/* Traveling Signal Dot */}
                          {(highlighted || !hoveredNode) && (
                            <motion.circle
                              r={highlighted ? '3.5' : '2.5'}
                              fill="#2563EB"
                              stroke="#FFFFFF"
                              strokeWidth="1"
                              style={{
                                offsetPath: `path("${pathD}")`
                              }}
                              animate={{
                                offsetDistance: ['0%', '100%'],
                                opacity: [0, 1, 1, 0]
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 2.2,
                                ease: 'easeInOut',
                                delay: idx * 0.35
                              }}
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Architecture Service Flow Nodes */}
                    {/* Stage 1: API Gateway (x: 5, y: 65, w: 110, h: 60) */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode('gateway')}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <rect
                        x="5"
                        y="65"
                        width="110"
                        height="60"
                        rx="10"
                        fill={isNodeHighlighted('gateway') ? '#FFFFFF' : '#FAFAFA'}
                        stroke={isNodeHighlighted('gateway') ? '#2563EB' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={isNodeHighlighted('gateway') ? '2' : '1'}
                        opacity={isNodeDimmed('gateway') ? 0.35 : 1}
                        className="transition-all duration-300 shadow-2xs"
                      />
                      <circle cx="20" cy="83" r="3" fill="#10B981" />
                      <text x="30" y="86" className="text-[10px] font-sans font-bold fill-neutral-900">API Gateway</text>
                      <text x="20" y="103" className="text-[8px] font-mono fill-neutral-500">Reverse Proxy</text>
                      <rect x="20" y="108" width="42" height="12" rx="3" fill="#EEF2FF" />
                      <text x="24" y="117" className="text-[7px] font-mono font-bold fill-blue-700">ROUTER</text>
                    </g>

                    {/* Stage 2 Top: Auth Service (x: 175, y: 12, w: 140, h: 62) */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode('auth')}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <rect
                        x="175"
                        y="12"
                        width="140"
                        height="62"
                        rx="10"
                        fill={isNodeHighlighted('auth') ? '#FFFFFF' : '#FAFAFA'}
                        stroke={isNodeHighlighted('auth') ? '#2563EB' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={isNodeHighlighted('auth') ? '2' : '1'}
                        opacity={isNodeDimmed('auth') ? 0.35 : 1}
                        className="transition-all duration-300 shadow-2xs"
                      />
                      <circle cx="190" cy="30" r="3" fill="#10B981" />
                      <text x="200" y="33" className="text-[10px] font-sans font-bold fill-neutral-900">Auth Service</text>
                      <text x="190" y="50" className="text-[8px] font-mono fill-neutral-500">JWT & Token Guard</text>
                      <rect x="190" y="55" width="46" height="12" rx="3" fill="#EEF2FF" />
                      <text x="194" y="64" className="text-[7px] font-mono font-bold fill-blue-700">SERVICE</text>
                      <text x="285" y="64" className="text-[7px] font-mono fill-neutral-400">12ms</text>
                    </g>

                    {/* Stage 2 Bottom: User Service (x: 175, y: 116, w: 140, h: 62) */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode('user')}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <rect
                        x="175"
                        y="116"
                        width="140"
                        height="62"
                        rx="10"
                        fill={isNodeHighlighted('user') ? '#FFFFFF' : '#FAFAFA'}
                        stroke={isNodeHighlighted('user') ? '#2563EB' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={isNodeHighlighted('user') ? '2' : '1'}
                        opacity={isNodeDimmed('user') ? 0.35 : 1}
                        className="transition-all duration-300 shadow-2xs"
                      />
                      <circle cx="190" cy="134" r="3" fill="#10B981" />
                      <text x="200" y="137" className="text-[10px] font-sans font-bold fill-neutral-900">User Service</text>
                      <text x="190" y="154" className="text-[8px] font-mono fill-neutral-500">Business Executor</text>
                      <rect x="190" y="159" width="46" height="12" rx="3" fill="#EEF2FF" />
                      <text x="194" y="168" className="text-[7px] font-mono font-bold fill-blue-700">SERVICE</text>
                      <text x="285" y="168" className="text-[7px] font-mono fill-neutral-400">18ms</text>
                    </g>

                    {/* Stage 3 Top: Auth DB / Redis (x: 355, y: 12, w: 120, h: 62) */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode('authDb')}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <rect
                        x="355"
                        y="12"
                        width="120"
                        height="62"
                        rx="10"
                        fill={isNodeHighlighted('authDb') ? '#FFFFFF' : '#FAFAFA'}
                        stroke={isNodeHighlighted('authDb') ? '#2563EB' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={isNodeHighlighted('authDb') ? '2' : '1'}
                        opacity={isNodeDimmed('authDb') ? 0.35 : 1}
                        className="transition-all duration-300 shadow-2xs"
                      />
                      <circle cx="370" cy="30" r="3" fill="#10B981" />
                      <text x="380" y="33" className="text-[10px] font-sans font-bold fill-neutral-900">Redis Cache</text>
                      <text x="370" y="50" className="text-[8px] font-mono fill-neutral-500">Token Blocklist</text>
                      <rect x="370" y="55" width="36" height="12" rx="3" fill="#FEF3C7" />
                      <text x="374" y="64" className="text-[7px] font-mono font-bold fill-amber-800">REDIS</text>
                      <text x="440" y="64" className="text-[7px] font-mono fill-neutral-400">0.8ms</text>
                    </g>

                    {/* Stage 3 Bottom: PostgreSQL (x: 355, y: 116, w: 120, h: 62) */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode('postgres')}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <rect
                        x="355"
                        y="116"
                        width="120"
                        height="62"
                        rx="10"
                        fill={isNodeHighlighted('postgres') ? '#FFFFFF' : '#FAFAFA'}
                        stroke={isNodeHighlighted('postgres') ? '#2563EB' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={isNodeHighlighted('postgres') ? '2' : '1'}
                        opacity={isNodeDimmed('postgres') ? 0.35 : 1}
                        className="transition-all duration-300 shadow-2xs"
                      />
                      <circle cx="370" cy="134" r="3" fill="#10B981" />
                      <text x="380" y="137" className="text-[10px] font-sans font-bold fill-neutral-900">PostgreSQL</text>
                      <text x="370" y="154" className="text-[8px] font-mono fill-neutral-500">Primary Replica</text>
                      <rect x="370" y="159" width="48" height="12" rx="3" fill="#F0FDF4" />
                      <text x="374" y="168" className="text-[7px] font-mono font-bold fill-emerald-800">DATABASE</text>
                      <text x="440" y="168" className="text-[7px] font-mono fill-neutral-400">24ms</text>
                    </g>
                  </svg>
                </div>

                {/* Footer Bar */}
                <div className="border-t border-black/[0.06] px-6 py-3 bg-neutral-50/70 flex items-center justify-between text-xs font-serif text-neutral-500 select-none">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Live request pipeline flow active</span>
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    End-to-End Tracing
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-first lg:order-last space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.07] text-neutral-800 text-xs font-serif font-semibold tracking-wider uppercase w-fit">
                <Network className="w-3.5 h-3.5 text-blue-600" />
                <span>02 — VISUALIZE</span>
              </div>

              <h3 className="text-2.5xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.18]">
                See how your architecture flows.
              </h3>
              
              <p className="text-neutral-600 font-serif text-sm sm:text-base leading-relaxed font-light">
                Explore request pathways, service boundaries, caching layers, and database transactions with live interactive architecture flows.
              </p>
              
              <ul className="space-y-2.5 pt-1 font-serif text-sm sm:text-base text-neutral-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Real-time request pipeline & data flow visualization</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Microservice & database connection mapping</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Automated service boundary & API route tracing</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.06]" />

        {/* Pillar 03 — PREDICT */}
        <section className="relative py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            <div className="lg:col-span-5 flex flex-col justify-center space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.07] text-neutral-800 text-xs font-serif font-semibold tracking-wider uppercase w-fit">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>03 — PREDICT</span>
              </div>

              <h3 className="text-2.5xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-950 leading-[1.18]">
                Understand impact before code changes.
              </h3>
              
              <p className="text-neutral-600 font-serif text-sm sm:text-base leading-relaxed font-light">
                NEXORA traces downstream blast radius across files, routes, services, and consumer contracts to forecast what will break before you merge.
              </p>
              
              <ul className="space-y-2.5 pt-1 font-serif text-sm sm:text-base text-neutral-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Automated PR mutation & blast-radius forecasting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Consumer contract & API breaking change warnings</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Proactive risk calculation before merging code</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="code-panel rounded-3xl border border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.03),_0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden font-sans text-xs relative flex flex-col">
                {/* Header */}
                <div className="h-11 flex items-center justify-between border-b border-black/[0.06] px-5 sm:px-6 bg-neutral-50/70 select-none">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span className="font-serif text-xs font-semibold text-neutral-800 tracking-wide uppercase">AST MUTATION RADAR</span>
                  </div>
                  <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 tracking-wide select-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Breaking Change Forecasted
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-3.5 select-none">
                  {/* Code Diff Inspection Box */}
                  <div className="rounded-xl border border-red-200/80 bg-red-50/30 overflow-hidden font-mono text-[11px] leading-relaxed">
                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-red-100/40 border-b border-red-200/60 text-neutral-700">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-semibold text-neutral-900">src/services/AuthService.ts:42</span>
                      </div>
                      <span className="text-[10px] text-red-700 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
                        MUTATION ORIGIN
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-3 space-y-1 bg-white">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <span className="w-5 text-right select-none text-[10px]">41</span>
                        <span className="text-neutral-600">export class AuthService {'{'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-700 bg-red-50/90 -mx-2.5 sm:-mx-3 px-2.5 sm:px-3 py-0.5 border-l-2 border-red-600 font-medium">
                        <span className="w-5 text-right select-none text-[10px] text-red-400">42 -</span>
                        <span>  async verifyToken(token: string) {'{'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/90 -mx-2.5 sm:-mx-3 px-2.5 sm:px-3 py-0.5 border-l-2 border-emerald-600 font-medium">
                        <span className="w-5 text-right select-none text-[10px] text-emerald-500">42 +</span>
                        <span>  async verifyToken(token: string, options: AuthOptions) {'{'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ripple Blast Propagation Cascade */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 font-serif uppercase tracking-wider">
                      <span>Cascading Downstream Breakages (3 Detected)</span>
                      <span className="text-red-600 font-mono font-semibold">100% Certainty</span>
                    </div>

                    <div className="space-y-2">
                      {/* Breakage 1: Controller */}
                      <div className="p-2.5 sm:p-3 rounded-xl border border-red-200 bg-white hover:border-red-300 transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-[10px]">
                            1
                          </div>
                          <div>
                            <div className="font-mono font-bold text-neutral-900 text-xs flex items-center gap-2">
                              <span>AuthController.ts:18</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold">
                                SIGNATURE MISMATCH
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                              Callsite <code className="font-mono text-red-700 bg-red-50 px-1 rounded">verifyToken(req.token)</code> is missing mandatory 2nd argument.
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 self-start sm:self-center">
                          Direct Failure
                        </span>
                      </div>

                      {/* Breakage 2: JWTMiddleware */}
                      <div className="p-2.5 sm:p-3 rounded-xl border border-red-200 bg-white hover:border-red-300 transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-[10px]">
                            2
                          </div>
                          <div>
                            <div className="font-mono font-bold text-neutral-900 text-xs flex items-center gap-2">
                              <span>JWTMiddleware.ts:29</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold">
                                AUTH GUARD BROKEN
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                              Session token validator missing required <code className="font-mono text-neutral-800 bg-neutral-100 px-1 rounded">jwtAudience</code> config.
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 self-start sm:self-center">
                          Security Gate
                        </span>
                      </div>

                      {/* Breakage 3: Endpoint */}
                      <div className="p-2.5 sm:p-3 rounded-xl border border-red-200 bg-white hover:border-red-300 transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-[10px]">
                            3
                          </div>
                          <div>
                            <div className="font-mono font-bold text-neutral-900 text-xs flex items-center gap-2">
                              <span>POST /api/v1/auth/login</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold">
                                500 SERVER CRASH
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                              Runtime exception thrown before token validation handshake completes.
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 self-start sm:self-center">
                          API Broken
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="border-t border-black/[0.06] px-5 sm:px-6 py-3 bg-neutral-50/70 flex items-center justify-between text-xs font-serif text-neutral-600 select-none">
                  <span className="flex items-center gap-1.5 text-neutral-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>12 downstream files & 4 routes impacted</span>
                  </span>
                  <span className="text-red-700 font-semibold font-mono text-[11px] flex items-center gap-1">
                    Severity: High (Risk 3)
                  </span>
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
