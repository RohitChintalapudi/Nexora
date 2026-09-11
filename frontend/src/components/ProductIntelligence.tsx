import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <div id="product" className="relative bg-[#F7F7F5] content-layer">
      
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <motion.div
            variants={textVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
              01 — UNDERSTAND
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-5">
              AI-powered codebase intelligence.
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Ask questions about your project and get answers grounded in your actual code. NEXORA understands files, functions, services, APIs, and their relationships across your repository.
            </p>
            
            <ul className="space-y-3 font-sans text-xs sm:text-sm text-neutral-600">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Repository-aware intelligence</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Contextual code understanding</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Dependency-aware answers</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7"
          >
            <div className="code-panel rounded-3xl border border-black/[0.045] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden font-sans text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.035] px-6 py-3.5 bg-neutral-50/50">
                <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">NEXORA INTELLIGENCE</span>
                <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ANALYZED
                </span>
              </div>
              
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">USER</div>
                  <div className="text-neutral-800 font-semibold bg-neutral-50 border border-neutral-100/50 rounded-xl py-2 px-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.005)] inline-block self-start">
                    Where is authentication handled?
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">NEXORA</div>
                  <div className="text-neutral-600 bg-white border border-neutral-100 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                    <div className="font-semibold text-neutral-800 mb-3">Authentication flow detected</div>
                    <div className="font-mono text-[10px] sm:text-xs space-y-2 text-neutral-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded bg-neutral-150" />
                        <span>AuthController.ts</span>
                      </div>
                      <div className="pl-5 text-neutral-200">↓</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded bg-blue-500 shadow-sm shadow-blue-500/20" />
                        <span className="font-semibold text-neutral-800">AuthService.ts</span>
                      </div>
                      <div className="pl-5 text-neutral-200">↓</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded bg-neutral-150" />
                        <span>JWTMiddleware.ts</span>
                      </div>
                      <div className="pl-5 text-neutral-200">↓</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded bg-neutral-150" />
                        <span>UserRepository.ts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/[0.035] px-6 py-3 bg-neutral-50/50 flex items-center justify-between text-[10px] text-neutral-400">
                <span>12 related files</span>
                <span className="text-blue-500 font-semibold hover:underline cursor-pointer flex items-center gap-0.5">Open context →</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

      <section className="relative py-12 md:py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <motion.div
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7 order-last lg:order-first"
          >
            <div className="code-panel rounded-3xl border border-black/[0.045] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden font-sans text-xs relative flex flex-col min-h-[300px]">
              <div className="h-11 flex items-center justify-between border-b border-black/[0.035] px-6 bg-neutral-50/50 select-none">
                <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ARCHITECTURE MAP</span>
                {hoveredNode ? (
                  <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 max-w-[200px] truncate">
                    {nodes.find(n => n.id === hoveredNode)?.info}
                  </span>
                ) : (
                  <span className="text-[9px] text-neutral-400 border border-transparent py-0.5 px-2">
                    Hover nodes to explore connections
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-6 select-none relative min-h-[200px]">
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
                        stroke={highlighted ? '#2563EB' : 'rgba(17, 17, 17, 0.08)'}
                        strokeWidth={highlighted ? 1.8 : 1.1}
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
                            r={15}
                            fill="rgba(37, 99, 235, 0.06)"
                            className="transition-all duration-300"
                          />
                        )}
                        
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isHovered ? 8 : 6.5}
                          fill={highlighted ? '#2563EB' : '#FFFFFF'}
                          stroke={highlighted ? '#2563EB' : 'rgba(17, 17, 17, 0.22)'}
                          strokeWidth="1.8"
                          opacity={dimmed ? 0.4 : 1}
                          className="transition-all duration-300"
                        />

                        <text
                          x={node.x}
                          y={node.y - 12}
                          textAnchor="middle"
                          opacity={dimmed ? 0.4 : 1}
                          className={`text-[8px] font-sans font-bold transition-colors duration-300 ${
                            highlighted ? 'fill-blue-600 font-extrabold' : 'fill-neutral-800'
                          }`}
                        >
                          {node.label}
                        </text>
                        <text
                          x={node.x}
                          y={node.y + 19}
                          textAnchor="middle"
                          opacity={dimmed ? 0.3 : 1}
                          className="text-[7.5px] font-mono fill-neutral-400"
                        >
                          {node.type}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="border-t border-black/[0.035] px-6 py-3 bg-neutral-50/50 flex items-center justify-between text-[10px] text-neutral-400 select-none">
                <span>18 dependencies mapped</span>
                <span className="text-neutral-400 font-semibold">Live Interactive Map</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={textVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-5 order-first lg:order-last"
          >
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
              02 — VISUALIZE
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-5">
              See how everything connects.
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Explore relationships between components, APIs, services, databases, functions, and dependencies through interactive architecture maps.
            </p>
            
            <ul className="space-y-3 font-sans text-xs sm:text-sm text-neutral-600">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Interactive dependency maps</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Architecture visualization</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Connected system boundaries</span>
              </li>
            </ul>
          </motion.div>

        </div>
      </section>

      <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

      <section className="relative py-12 md:py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <motion.div
            variants={textVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
              03 — PREDICT
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-5">
              Understand impact before you change code.
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              NEXORA traces dependency paths to help you understand what could be affected before making changes to critical parts of your software.
            </p>
            
            <ul className="space-y-3 font-sans text-xs sm:text-sm text-neutral-600">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Change impact analysis</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Dependency tracing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
                <span>Potential risk detection</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7"
          >
            <div className="code-panel rounded-3xl border border-black/[0.045] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden font-sans text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.035] px-6 py-3.5 bg-neutral-50/50">
                <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">CHANGE IMPACT ANALYSIS</span>
                <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-600 tracking-wide select-none">
                  ⚠ Potential impact detected
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Changed</div>
                  <div className="font-mono text-neutral-800 font-semibold bg-neutral-50 border border-neutral-100/50 rounded-lg py-2 px-3 inline-block self-start shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                    AuthService.ts
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Potential impact</div>
                  <div className="grid grid-cols-2 gap-2.5 text-neutral-700 font-sans font-medium">
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded bg-neutral-50/50 border border-neutral-100/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>12 files</span>
                    </div>
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded bg-neutral-50/50 border border-neutral-100/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                      <span>4 API routes</span>
                    </div>
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded bg-neutral-50/50 border border-neutral-100/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                      <span>3 services</span>
                    </div>
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded bg-neutral-50/50 border border-neutral-100/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                      <span>2 frontend components</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dependency path</div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-1.5 font-mono text-[10px] text-neutral-600 bg-neutral-50/30 border border-neutral-100/30 rounded-xl p-3.5">
                    <div className="flex-1 w-full sm:w-auto py-1 px-2.5 text-center rounded border border-red-200/50 bg-red-50/30 text-red-600 font-semibold shadow-sm">
                      AuthService
                    </div>
                    <span className="text-neutral-300 text-xs rotate-90 sm:rotate-0">→</span>
                    <div className="flex-1 w-full sm:w-auto py-1 px-2.5 text-center rounded border border-neutral-200/50 bg-white text-neutral-700 shadow-sm">
                      AuthController
                    </div>
                    <span className="text-neutral-300 text-xs rotate-90 sm:rotate-0">→</span>
                    <div className="flex-1 w-full sm:w-auto py-1 px-2.5 text-center rounded border border-neutral-200/50 bg-white text-neutral-700 shadow-sm">
                      API Gateway
                    </div>
                    <span className="text-neutral-300 text-xs rotate-90 sm:rotate-0">→</span>
                    <div className="flex-1 w-full sm:w-auto py-1 px-2.5 text-center rounded border border-neutral-200/50 bg-white text-neutral-500 shadow-sm">
                      Dashboard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};
export default ProductIntelligence;
