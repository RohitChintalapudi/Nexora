import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ProductIntelligence: React.FC = () => {
  const [activeMiniNode, setActiveMiniNode] = useState<string | null>(null);

  return (
    <section className="relative py-24 md:py-32 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="product">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Column: Sticky Editorial Context */}
        <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-32 h-fit">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
              Intelligence Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.15] mb-5">
              Your software has a story.<br />
              NEXORA helps you understand it.
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              Engineered for complex architectures. Nexora connects to your repository, traces service boundaries, and maps dependency networks so your team stays aligned.
            </p>
            
            {/* Context Stats Block */}
            <div className="pt-8 border-t border-black/[0.06] space-y-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Codebase Intelligence
              </span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-sm font-sans font-medium text-neutral-800">Repository-aware indexer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-sm font-sans font-medium text-neutral-800">Architecture-aware vector mapper</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-sm font-sans font-medium text-neutral-800">Dependency-aware impact analyzer</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Staggered Feature Cards with Embedded Code Visuals */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Card 1: Understand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-black/[0.045] shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:border-black/[0.07] transition-all duration-300"
          >
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-3xl font-sans font-extralight text-neutral-300 group-hover:text-blue-500 transition-colors duration-300 select-none">
                01
              </span>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-blue-600">Understand</span>
            </div>
            
            <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-2">
              AI-powered codebase intelligence.
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Ask questions about your project and get answers grounded in your actual code. Nexora crawls and processes files semantically to provide complete code tracing.
            </p>

            {/* Visual: Mock Q&A Workspace Panel */}
            <div className="code-panel p-4 rounded-xl border border-black/[0.05] bg-neutral-50/50">
              {/* Question */}
              <div className="flex items-start gap-2.5 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans mt-0.5">User:</span>
                <div className="text-xs font-sans font-medium text-neutral-800 bg-white border border-neutral-100 rounded-lg py-1.5 px-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  Where is authentication handled?
                </div>
              </div>
              {/* Response */}
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-sans mt-0.5">Nexora:</span>
                <div className="flex-1 text-xs font-sans text-neutral-600 bg-white border border-neutral-100 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <div className="font-semibold text-neutral-800 mb-2">Authentication is handled through:</div>
                  <div className="font-mono text-[10px] space-y-1.5 text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      <span>AuthController.ts <span className="text-neutral-400 font-sans font-normal">(endpoints)</span></span>
                    </div>
                    <div className="pl-4 text-neutral-300 font-sans font-normal">↓</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="font-semibold text-neutral-800">AuthService.ts <span className="text-neutral-400 font-sans font-normal">(logic validation)</span></span>
                    </div>
                    <div className="pl-4 text-neutral-300 font-sans font-normal">↓</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      <span>JWTMiddleware.ts <span className="text-neutral-400 font-sans font-normal">(tokens check)</span></span>
                    </div>
                    <div className="pl-4 text-neutral-300 font-sans font-normal">↓</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      <span>UserRepository.ts <span className="text-neutral-400 font-sans font-normal">(database model)</span></span>
                    </div>
                  </div>
                  <div className="mt-3.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-400">
                    <span>5 related files analyzed</span>
                    <span className="text-blue-500 font-medium cursor-pointer hover:underline">Open context map</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Visualize */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-black/[0.045] shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:border-black/[0.07] transition-all duration-300"
          >
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-3xl font-sans font-extralight text-neutral-300 group-hover:text-blue-500 transition-colors duration-300 select-none">
                02
              </span>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-blue-600">Visualize</span>
            </div>
            
            <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-2">
              See how everything connects.
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Explore relationships between components, APIs, services, databases, functions, and dependencies through interactive maps.
            </p>

            {/* Visual: Miniature Interactive Dependency Graph */}
            <div className="code-panel p-4 rounded-xl border border-black/[0.05] bg-neutral-50/50 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
              <svg className="w-full max-w-[280px] h-[130px] overflow-visible" viewBox="0 0 280 130">
                {/* Connection lines */}
                <line x1="50" y1="65" x2="140" y2="35" stroke="rgba(17, 17, 17, 0.12)" strokeWidth="1" />
                <line x1="50" y1="65" x2="140" y2="95" stroke="rgba(17, 17, 17, 0.12)" strokeWidth="1" />
                <line x1="140" y1="35" x2="230" y2="65" stroke="rgba(17, 17, 17, 0.12)" strokeWidth="1" />
                <line x1="140" y1="95" x2="230" y2="65" stroke="rgba(17, 17, 17, 0.12)" strokeWidth="1" />
                
                {/* Active hover highlights */}
                {activeMiniNode === 'gateway' && (
                  <>
                    <line x1="50" y1="65" x2="140" y2="35" stroke="#2563EB" strokeWidth="1.5" />
                    <line x1="50" y1="65" x2="140" y2="95" stroke="#2563EB" strokeWidth="1.5" />
                  </>
                )}
                {activeMiniNode === 'db' && (
                  <>
                    <line x1="140" y1="35" x2="230" y2="65" stroke="#2563EB" strokeWidth="1.5" />
                    <line x1="140" y1="95" x2="230" y2="65" stroke="#2563EB" strokeWidth="1.5" />
                  </>
                )}

                {/* Nodes */}
                {/* Frontend */}
                <circle cx="50" cy="65" r="4.5" fill="#111111" />
                <text x="50" y="80" textAnchor="middle" className="text-[8px] font-sans font-medium fill-neutral-500">client</text>

                {/* Gateway API */}
                <g 
                  className="cursor-pointer" 
                  onMouseEnter={() => setActiveMiniNode('gateway')}
                  onMouseLeave={() => setActiveMiniNode(null)}
                >
                  <circle cx="140" cy="35" r="6" fill={activeMiniNode === 'gateway' ? '#2563EB' : '#FFFFFF'} stroke={activeMiniNode === 'gateway' ? '#2563EB' : 'rgba(17,17,17,0.3)'} strokeWidth="1.5" />
                  <text x="140" y="21" textAnchor="middle" className="text-[8px] font-sans font-semibold fill-neutral-800">api-gateway</text>
                </g>

                {/* Auth Engine */}
                <g 
                  className="cursor-pointer" 
                  onMouseEnter={() => setActiveMiniNode('auth')}
                  onMouseLeave={() => setActiveMiniNode(null)}
                >
                  <circle cx="140" cy="95" r="6" fill={activeMiniNode === 'auth' ? '#2563EB' : '#FFFFFF'} stroke={activeMiniNode === 'auth' ? '#2563EB' : 'rgba(17,17,17,0.3)'} strokeWidth="1.5" />
                  <text x="140" y="112" textAnchor="middle" className="text-[8px] font-sans font-semibold fill-neutral-800">auth-service</text>
                </g>

                {/* Database */}
                <g 
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMiniNode('db')}
                  onMouseLeave={() => setActiveMiniNode(null)}
                >
                  <circle cx="230" cy="65" r="4.5" fill={activeMiniNode === 'db' ? '#2563EB' : '#111111'} />
                  <text x="230" y="80" textAnchor="middle" className="text-[8px] font-sans font-medium fill-neutral-500">postgres-db</text>
                </g>
              </svg>
              <span className="absolute bottom-2 text-[9px] font-sans text-neutral-400">Hover nodes to reveal dependency chains</span>
            </div>
          </motion.div>

          {/* Card 3: Predict */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-black/[0.045] shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:border-black/[0.07] transition-all duration-300"
          >
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-3xl font-sans font-extralight text-neutral-300 group-hover:text-blue-500 transition-colors duration-300 select-none">
                03
              </span>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-blue-600">Predict</span>
            </div>
            
            <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-2">
              Understand impact before you change code.
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Nexora performs static analysis across dependency trees to discover which parts of software could be affected before making changes.
            </p>

            {/* Visual: Impact Analysis Preview Panel */}
            <div className="code-panel p-4 rounded-xl border border-black/[0.05] bg-neutral-50/50">
              <div className="flex items-center justify-between border-b border-black/[0.03] pb-2 mb-3">
                <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase">Impact Sandbox</span>
                <span className="text-[9px] text-red-500 bg-red-50/50 px-1.5 py-0.5 rounded border border-red-100 font-sans font-medium">Potential Risk</span>
              </div>
              <div className="font-sans text-xs mb-3 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400">Target File: </span>
                  <span className="font-mono text-neutral-800 font-semibold">AuthService.ts</span>
                </div>
                <span className="text-[10px] text-blue-600 font-medium">Analyze path</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-sans">
                <div className="p-2 rounded bg-white border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <div className="text-neutral-900 font-bold text-sm">12</div>
                  <div className="text-[9px] text-neutral-400">files affected</div>
                </div>
                <div className="p-2 rounded bg-white border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <div className="text-neutral-900 font-bold text-sm">4</div>
                  <div className="text-[9px] text-neutral-400">API routes</div>
                </div>
                <div className="p-2 rounded bg-white border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <div className="text-neutral-900 font-bold text-sm">3</div>
                  <div className="text-[9px] text-neutral-400">components</div>
                </div>
                <div className="p-2 rounded bg-white border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <div className="text-neutral-900 font-bold text-sm">2</div>
                  <div className="text-[9px] text-neutral-400">services</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
export default ProductIntelligence;
