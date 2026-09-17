import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  Shield, 
  CreditCard, 
  Database, 
  Server, 
  MessageSquare, 
  Radio, 
  MousePointer2, 
  GitBranch, 
  Check, 
  Zap,
  HardDrive
} from 'lucide-react';

export const CollaborationSection: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('auth');

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="collaboration">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Context & Feature Highlights */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="max-w-md">
            {/* Status Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 border border-blue-100 text-[10px] font-sans font-bold uppercase tracking-wider text-blue-600">
              <Zap className="w-3 h-3 text-blue-600" />
              <span>Team Intelligence</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.15] mb-4">
              Understand software together.
            </h2>
            
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-6">
              Explore complex system architectures, discuss structure decisions, and review code impacts side-by-side. NEXORA synchronizes your workspace in real-time so your entire engineering team shares the same codebase mental model.
            </p>

            <div className="space-y-3 font-sans text-xs sm:text-sm text-neutral-700">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 border border-black/[0.04]">
                <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 block text-xs sm:text-sm">Real-Time Architecture Sync</span>
                  <span className="text-neutral-500 text-xs">Visualize microservices, API routes, and database flows with live multiplayer presence.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 border border-black/[0.04]">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 block text-xs sm:text-sm">Context-Pinned Discussions</span>
                  <span className="text-neutral-500 text-xs">Attach review comments directly to services, schemas, and endpoints during architectural reviews.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 border border-black/[0.04]">
                <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 block text-xs sm:text-sm">Shared Vector Grounding</span>
                  <span className="text-neutral-500 text-xs">Ask AI questions collaboratively with team-wide shared context and verified AST code references.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intuitive Multiplayer System Architecture Canvas */}
        <div className="lg:col-span-7">
          <div className="code-panel-dark rounded-3xl border border-white/[0.08] bg-[#0c0d12] shadow-2xl p-4 sm:p-6 select-none relative overflow-hidden">
            
            {/* Top Bar: Workspace & Collaborators */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-3.5 mb-5 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-white/20 text-xs">|</span>
                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-white font-medium">nexora/backend-core</span>
                  <span className="text-[10px] text-white/40 bg-white/[0.06] px-1.5 py-0.5 rounded">main</span>
                </div>
              </div>

              {/* Active Collaborators */}
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-[#0c0d12] flex items-center justify-center text-[10px] text-white font-bold" title="Alex (Lead Architect)">
                    A
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-[#0c0d12] flex items-center justify-center text-[10px] text-white font-bold" title="Elena (Security)">
                    E
                  </div>
                  <div className="w-6 h-6 rounded-full bg-amber-600 border-2 border-[#0c0d12] flex items-center justify-center text-[10px] text-white font-bold" title="David (Backend)">
                    D
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Architecture Flow Canvas */}
            <div className="relative rounded-2xl bg-[#07080b] border border-white/[0.06] p-4 sm:p-5">
              
              {/* Architecture Stage Headers */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-[10px] font-mono uppercase tracking-wider text-white/40 text-center border-b border-white/[0.04] pb-2">
                <span>1. Inbound Entry</span>
                <span>2. Service Mesh</span>
                <span>3. Storage Layer</span>
              </div>

              {/* Architecture 3-Tier Grid Layout */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 items-center relative">
                
                {/* Column 1: API Gateway */}
                <div className="flex flex-col justify-center gap-3">
                  <div 
                    onClick={() => setActiveNode('gateway')}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activeNode === 'gateway'
                        ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1 rounded bg-blue-500/10 text-blue-400">
                        <Server className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">API Gateway</span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-400">Route: /api/v2/*</p>
                    <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-blue-300/80 bg-blue-950/60 px-1.5 py-0.5 rounded w-fit">
                      <span>Port :8080</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Microservices Tier */}
                <div className="flex flex-col gap-3">
                  {/* Auth Service Node */}
                  <div 
                    onClick={() => setActiveNode('auth')}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      activeNode === 'auth'
                        ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Auth Service</span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-400">JWT &amp; Session Guard</p>

                    {/* Multiplayer Cursor: Alex */}
                    <div className="absolute -top-3 -right-2 flex items-center gap-1 bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[9px] font-sans font-medium shadow-md">
                      <MousePointer2 className="w-2.5 h-2.5 fill-white" />
                      <span>Alex (Lead)</span>
                    </div>
                  </div>

                  {/* Payment Engine Node */}
                  <div 
                    onClick={() => setActiveNode('payment')}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      activeNode === 'payment'
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Payment Engine</span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-400">Stripe &amp; Webhooks</p>

                    {/* Multiplayer Cursor: Elena */}
                    <div className="absolute -bottom-2.5 -right-2 flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-md text-[9px] font-sans font-medium shadow-md">
                      <MousePointer2 className="w-2.5 h-2.5 fill-white" />
                      <span>Elena (Security)</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Storage & Cache Tier */}
                <div className="flex flex-col gap-3">
                  {/* PostgreSQL Cluster */}
                  <div 
                    onClick={() => setActiveNode('postgres')}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activeNode === 'postgres'
                        ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">PostgreSQL</span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-400">Orders &amp; Users DB</p>
                  </div>

                  {/* Redis Cache */}
                  <div 
                    onClick={() => setActiveNode('redis')}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      activeNode === 'redis'
                        ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                        <HardDrive className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Redis Cache</span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-400">Session &amp; Token Store</p>

                    {/* Multiplayer Cursor: David */}
                    <div className="absolute -bottom-2.5 -right-1 flex items-center gap-1 bg-amber-600 text-white px-1.5 py-0.5 rounded-md text-[9px] font-sans font-medium shadow-md">
                      <MousePointer2 className="w-2.5 h-2.5 fill-white" />
                      <span>David</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Collaborative Review Thread Card */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0 mt-0.5">
                  E
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-white">Elena Vasquez</span>
                    <span className="text-[10px] font-mono text-white/40">pinned to PaymentEngine</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug">
                    "Verified webhook HMAC verification. Token expiration buffer set to 15m for PCI audit."
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> Resolved
                </span>
              </div>

            </div>

            {/* Footer Workspace Info */}
            <div className="flex items-center justify-between pt-3.5 text-[11px] font-mono text-white/40">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>3 teammates live in graph canvas</span>
              </span>
              <span>Click any node to inspect telemetry</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default CollaborationSection;
