import React from 'react';

export const CollaborationSection: React.FC = () => {
  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="collaboration">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Context */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="max-w-md">
            {/* Status Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 border border-blue-100 text-[10px] font-sans font-bold uppercase tracking-wider text-blue-600">
              ⚡ COMING TO NEXORA
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.15] mb-5">
              Understand software together.
            </h2>
            
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-6">
              Explore complex system architectures, discuss structure decisions, and review code impacts side-by-side. NEXORA synchronizes your workspace in real-time so your team always shares the same codebase context.
            </p>

            <ul className="space-y-3 font-sans text-xs sm:text-sm text-neutral-600">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500" />
                <span>Real-time co-author architecture maps</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500" />
                <span>Live cursor flags and inline thread comments</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500" />
                <span>Shared context vector grounding for AI queries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Visual Mockup */}
        <div className="lg:col-span-7">
          <div className="code-panel p-5 sm:p-8 rounded-3xl border border-black/[0.045] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.015)] relative min-h-[300px] overflow-hidden select-none">
            
            {/* Avatars Header */}
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-4 mb-6">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Team Workspace</span>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">R</div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">S</div>
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">A</div>
                <div className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[8px] text-neutral-500 font-bold">+2</div>
              </div>
            </div>

            {/* Simulated Live Graph Canvas */}
            <div className="relative border border-dashed border-neutral-200 rounded-xl p-4 bg-neutral-50/50 min-h-[200px] flex items-center justify-center">
              
              <svg className="w-full max-w-[280px] h-[130px] overflow-visible" viewBox="0 0 280 130">
                <line x1="60" y1="65" x2="140" y2="35" stroke="rgba(17,17,17,0.08)" strokeWidth="1" />
                <line x1="60" y1="65" x2="140" y2="95" stroke="rgba(17,17,17,0.08)" strokeWidth="1" />
                
                {/* Node A (Sarah focus) */}
                <circle cx="60" cy="65" r="5" fill="#111111" />
                <text x="60" y="80" textAnchor="middle" className="text-[8px] font-sans font-medium fill-neutral-400">gateway</text>
                
                {/* Node B (Alex cursor hovering) */}
                <circle cx="140" cy="35" r="6" fill="#2563EB" />
                <text x="140" y="21" textAnchor="middle" className="text-[8px] font-sans font-semibold fill-neutral-800">auth-service</text>

                {/* Node C */}
                <circle cx="140" cy="95" r="5" fill="#111111" />
                <text x="140" y="112" textAnchor="middle" className="text-[8px] font-sans font-medium fill-neutral-400">user-service</text>
              </svg>

              {/* Cursor flag Alex */}
              <div className="absolute top-[22%] right-[32%] px-2 py-1 rounded bg-amber-500 text-white text-[8px] font-semibold font-sans flex items-center gap-1 shadow-sm select-none">
                <span>🖱️ Alex</span>
              </div>

              {/* Cursor flag Sarah */}
              <div className="absolute top-[48%] left-[12%] px-2 py-1 rounded bg-emerald-500 text-white text-[8px] font-semibold font-sans flex items-center gap-1 shadow-sm select-none">
                <span>🖱️ Sarah</span>
              </div>

              {/* Comment Popover (Sarah) */}
              <div className="absolute bottom-[8%] right-[10%] max-w-[180px] p-2.5 rounded-lg bg-white border border-neutral-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] text-[9px] font-sans">
                <div className="font-semibold text-neutral-800 flex items-center justify-between mb-1">
                  <span>Sarah Chen</span>
                  <span className="text-neutral-300 font-normal">2m ago</span>
                </div>
                <p className="text-neutral-500 leading-normal">
                  "Let's split User Service endpoints into a dedicated middleware package next sprint."
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
export default CollaborationSection;
