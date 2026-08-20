import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MiniNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
}

interface MiniEdge {
  from: string;
  to: string;
}

export const ProductIntelligence: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // SVG Coordinates for Section 2 Interactive Graph
  const viewWidth = 400;
  const viewHeight = 180;

  const miniNodes: MiniNode[] = [
    { id: 'gateway', label: 'API Gateway', type: 'Router', x: 200, y: 25 },
    { id: 'auth', label: 'Auth Service', type: 'JWT', x: 90, y: 75 },
    { id: 'orders', label: 'Orders Engine', type: 'Service', x: 310, y: 75 },
    { id: 'usersDb', label: 'Users DB', type: 'Postgres', x: 90, y: 135 },
    { id: 'ordersDb', label: 'Orders DB', type: 'Postgres', x: 310, y: 135 }
  ];

  const miniEdges: MiniEdge[] = [
    { from: 'gateway', to: 'auth' },
    { from: 'gateway', to: 'orders' },
    { from: 'auth', to: 'orders' },
    { from: 'auth', to: 'usersDb' },
    { from: 'orders', to: 'ordersDb' },
    { from: 'usersDb', to: 'ordersDb' }
  ];

  const miniConnections: Record<string, string[]> = {
    gateway: ['auth', 'orders'],
    auth: ['gateway', 'orders', 'usersDb'],
    orders: ['gateway', 'auth', 'ordersDb'],
    usersDb: ['auth', 'ordersDb'],
    ordersDb: ['orders', 'usersDb']
  };

  const isHighlighted = (nodeId: string) => {
    if (!hoveredNode) return false;
    return nodeId === hoveredNode || miniConnections[hoveredNode]?.includes(nodeId);
  };

  const isEdgeHighlighted = (from: string, to: string) => {
    if (!hoveredNode) return false;
    return (from === hoveredNode && miniConnections[hoveredNode]?.includes(to)) ||
           (to === hoveredNode && miniConnections[hoveredNode]?.includes(from));
  };

  // Entrance variants
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
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* SECTION 01 — UNDERSTAND (Text Left, Card Right) */}
      <section className="relative py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
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
            
            {/* Capability Points */}
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

          {/* Right Card Column */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7"
          >
            <div className="code-panel p-6 sm:p-8 rounded-3xl border border-black/[0.045] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
              {/* Question */}
              <div className="flex items-start gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans mt-1">USER:</span>
                <div className="text-xs sm:text-sm font-sans font-medium text-neutral-800 bg-neutral-50 border border-neutral-100/50 rounded-xl py-2.5 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                  Where is authentication handled?
                </div>
              </div>
              {/* Response */}
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-sans mt-1">NEXORA:</span>
                <div className="flex-1 text-xs sm:text-sm font-sans text-neutral-600 bg-white border border-neutral-100 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  <div className="font-semibold text-neutral-800 mb-3">Authentication is handled through:</div>
                  <div className="font-mono text-[10px] sm:text-xs space-y-2 text-neutral-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-neutral-200" />
                      <span>AuthController.ts <span className="text-neutral-400 font-sans text-[10px]">(endpoints router)</span></span>
                    </div>
                    <div className="pl-5 text-neutral-300">↓</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-blue-500 shadow-sm shadow-blue-500/20" />
                      <span className="font-semibold text-neutral-800">AuthService.ts <span className="text-neutral-400 font-sans text-[10px]">(auth logic validation)</span></span>
                    </div>
                    <div className="pl-5 text-neutral-300">↓</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-neutral-200" />
                      <span>JWTMiddleware.ts <span className="text-neutral-400 font-sans text-[10px]">(token decrypt checks)</span></span>
                    </div>
                    <div className="pl-5 text-neutral-300">↓</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-neutral-200" />
                      <span>UserRepository.ts <span className="text-neutral-400 font-sans text-[10px]">(db read/write models)</span></span>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                    <span>5 related files analyzed</span>
                    <span className="text-blue-500 font-semibold hover:underline cursor-pointer">Open context model</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Spacing Separator Line */}
      <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

      {/* ──────────────────────────────────────────────────────── */}
      {/* SECTION 02 — VISUALIZE (Card Left, Text Right) */}
      <section className="relative py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Card Column (First on desktop, Second on mobile) */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7 order-last lg:order-first"
          >
            <div className="code-panel p-6 sm:p-8 rounded-3xl border border-black/[0.045] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.015)] flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
              <svg className="w-full max-w-[340px] h-[190px] overflow-visible" viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
                {/* Edge mappings */}
                {miniEdges.map((edge, idx) => {
                  const fromNode = miniNodes.find(n => n.id === edge.from);
                  const toNode = miniNodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const highlighted = isEdgeHighlighted(edge.from, edge.to);

                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={highlighted ? '#2563EB' : 'rgba(17, 17, 17, 0.08)'}
                      strokeWidth={highlighted ? 1.5 : 1}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Node mappings */}
                {miniNodes.map((node) => {
                  const highlighted = isHighlighted(node.id);
                  const isHovered = hoveredNode === node.id;

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer select-none"
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Glow backing */}
                      {highlighted && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={13}
                          fill="rgba(37, 99, 235, 0.08)"
                          className="transition-all duration-300"
                        />
                      )}
                      
                      {/* Core circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHovered ? 7.5 : 6}
                        fill={highlighted ? '#2563EB' : '#FFFFFF'}
                        stroke={highlighted ? '#2563EB' : 'rgba(17, 17, 17, 0.28)'}
                        strokeWidth="1.8"
                        className="transition-all duration-300"
                      />

                      {/* Text details label */}
                      <text
                        x={node.x}
                        y={node.y - 12}
                        textAnchor="middle"
                        className={`text-[8.5px] font-sans font-semibold transition-colors duration-300 ${
                          highlighted ? 'fill-blue-600 font-bold' : 'fill-neutral-800'
                        }`}
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 18}
                        textAnchor="middle"
                        className="text-[7.5px] font-sans fill-neutral-400"
                      >
                        {node.type}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <span className="absolute bottom-3 text-[10px] font-sans text-neutral-400 select-none">
                Hover any service node to trace direct dependency flows
              </span>
            </div>
          </motion.div>

          {/* Right Text Column (Second on desktop, First on mobile) */}
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
            
            {/* Capability Points */}
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

      {/* Spacing Separator Line */}
      <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

      {/* ──────────────────────────────────────────────────────── */}
      {/* SECTION 03 — PREDICT (Text Left, Card Right) */}
      <section className="relative py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
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
            
            {/* Capability Points */}
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

          {/* Right Card Column */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7"
          >
            <div className="code-panel p-6 sm:p-8 rounded-3xl border border-black/[0.045] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-black/[0.035] pb-3.5 mb-4">
                <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">Impact Sandbox</span>
                <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-600 tracking-wide select-none">
                  Potential impact detected
                </span>
              </div>

              {/* Target File details */}
              <div className="text-xs sm:text-sm font-sans mb-4 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400">Target modified file: </span>
                  <span className="font-mono text-neutral-800 font-semibold bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100/50">AuthService.ts</span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6 font-sans">
                <div className="p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-100/30">
                  <div className="text-red-600 font-bold text-sm sm:text-base">12</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wide">Files</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-100/30">
                  <div className="text-neutral-900 font-bold text-sm sm:text-base">4</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wide">API Routes</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-100/30">
                  <div className="text-neutral-900 font-bold text-sm sm:text-base">3</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wide">Components</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-100/30">
                  <div className="text-neutral-900 font-bold text-sm sm:text-base">2</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wide">Services</div>
                </div>
              </div>

              {/* Affected Chain */}
              <div className="bg-neutral-50/50 border border-neutral-100/30 rounded-xl p-4">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-3 select-none">
                  Propagation Path
                </span>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-1.5 font-mono text-[10px] select-none text-neutral-600">
                  <div className="flex-1 w-full sm:w-auto py-1.5 px-3 text-center rounded border border-red-200/50 bg-red-50/30 text-red-600 font-semibold shadow-sm">
                    AuthService
                  </div>
                  <span className="text-neutral-300 text-xs rotate-90 sm:rotate-0">→</span>
                  <div className="flex-1 w-full sm:w-auto py-1.5 px-3 text-center rounded border border-neutral-200/50 bg-white text-neutral-700 shadow-sm">
                    AuthController
                  </div>
                  <span className="text-neutral-300 text-xs rotate-90 sm:rotate-0">→</span>
                  <div className="flex-1 w-full sm:w-auto py-1.5 px-3 text-center rounded border border-neutral-200/50 bg-white text-neutral-700 shadow-sm">
                    API Gateway
                  </div>
                  <span className="text-neutral-300 text-xs rotate-90 sm:rotate-0">→</span>
                  <div className="flex-1 w-full sm:w-auto py-1.5 px-3 text-center rounded border border-neutral-200/50 bg-white text-neutral-500 shadow-sm">
                    User Dashboard
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
