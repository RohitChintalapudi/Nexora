import React from 'react';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  Clock, 
  ArrowUpRight, 
  Workflow, 
  Database, 
  Send,
  GitBranch,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RecentRepositoriesProps {
  onConnectClick: () => void;
  repositories?: Array<any>;
}

export const RecentRepositories: React.FC<RecentRepositoriesProps> = ({
  onConnectClick,
  repositories = []
}) => {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Nizam';

  const agents = [
    {
      id: 'research_agent',
      name: 'research_agent',
      role: 'Specialist · 188 calls',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: Search,
    },
    {
      id: 'supervisor',
      name: 'supervisor',
      role: 'Router · 412 calls',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      icon: Workflow,
      hasBlock: true,
      blockText: 'Delegating',
      blockStatus: 'Healthy',
      blockColor: 'bg-purple-600 text-white shadow-md shadow-purple-500/25',
    },
    {
      id: 'data_agent',
      name: 'data_agent',
      role: 'Specialist · 204 calls',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      icon: Database,
    },
    {
      id: 'validator_agent',
      name: 'validator_agent',
      role: 'Validator · 196 calls',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      icon: ShieldCheck,
      hasBlockGreen: true,
      blockGreenText: 'Validating',
      blockGreenStatus: 'Healthy',
      hasBlockBlue: true,
      blockBlueText: 'Validating',
      blockBlueStatus: 'Pending',
    },
    {
      id: 'responder',
      name: 'responder',
      role: 'Composer · 404 calls',
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      icon: Send,
    }
  ];

  const timeSlots = [
    { time: '09:41', sub: '00' },
    { time: '09:41', sub: '15' },
    { time: '09:41', sub: '30' },
    { time: '09:41', sub: '45' },
    { time: '09:42', sub: '00' },
    { time: '09:42', sub: '15' },
    { time: '09:42', sub: '30' },
    { time: '09:42', sub: '45' },
    { time: '09:43', sub: '00', active: true },
    { time: '09:43', sub: '15' },
    { time: '09:43', sub: '30' },
    { time: '09:43', sub: '45' },
    { time: '09:44', sub: '00' },
    { time: '09:44', sub: '15' },
  ];

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. MAIN TIMELINE & TOPOLOGY CANVAS CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 overflow-hidden">
        
        {/* Timeline Header Row */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-100 items-end">
          
          {/* Left Column Label */}
          <div className="col-span-12 md:col-span-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agents & Services
            </span>
          </div>

          {/* Right Column Time Slices */}
          <div className="hidden md:flex col-span-9 items-center justify-between overflow-x-auto select-none px-2">
            {timeSlots.map((slot, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center text-[10px] font-mono leading-tight px-1.5 py-1 rounded-lg ${
                  slot.active 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25' 
                    : 'text-slate-400'
                }`}
              >
                <span>{slot.time}</span>
                <span className="opacity-75">{slot.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Rows */}
        <div className="divide-y divide-slate-100/80 mt-2 relative">
          
          {/* Dashed vertical timeline line at active time slot */}
          <div className="hidden md:block absolute top-0 bottom-0 left-[68%] w-[1.5px] border-r-2 border-dashed border-blue-500/40 pointer-events-none z-10" />

          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.id} className="py-3.5 grid grid-cols-12 gap-4 items-center">
                
                {/* Agent Card (Left) */}
                <div className="col-span-12 md:col-span-3 flex items-center gap-3 p-2 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${agent.color}`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate font-mono">
                      {agent.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                      {agent.role}
                    </p>
                  </div>
                </div>

                {/* Timeline Slots Canvas (Right) */}
                <div className="col-span-12 md:col-span-9 flex items-center gap-2 overflow-x-auto py-1">
                  
                  {/* Supervisor Row Activity */}
                  {agent.hasBlock && (
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-[28%] hidden sm:block" />
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-500/25 shrink-0">
                        <Workflow className="w-3.5 h-3.5" />
                        <span>{agent.blockText}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
                          • {agent.blockStatus}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Validator Row Activity */}
                  {agent.hasBlockGreen && (
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-[18%] hidden sm:block" />
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{agent.blockGreenText}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
                          • {agent.blockGreenStatus}
                        </span>
                      </div>
                      <div className="w-[20%] hidden sm:block" />
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{agent.blockBlueText}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
                          • {agent.blockBlueStatus}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Empty Slots Filler */}
                  {!agent.hasBlock && !agent.hasBlockGreen && (
                    <div className="flex items-center gap-2 opacity-25 w-full">
                      <div className="h-8 flex-1 rounded-xl bg-slate-100/80 border border-slate-200/40" />
                      <div className="h-8 flex-1 rounded-xl bg-slate-100/80 border border-slate-200/40" />
                      <div className="h-8 flex-1 rounded-xl bg-slate-100/80 border border-slate-200/40" />
                      <div className="h-8 flex-1 rounded-xl bg-slate-100/80 border border-slate-200/40" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Trigger */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/60 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 sm:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {repositories.length} Git Repositories Indexed
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                Connect your repository to populate live AST caller hierarchy and AST service maps.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onConnectClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200/80 hover:border-blue-600 rounded-full transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Connect Repository</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM 3-CARD GRID (MATCHING THE SCREENSHOT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* CARD 1: NEXT STEPS (Yellow Accent Card from Screenshot) */}
        <div className="md:col-span-4 bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Next steps
            </h3>
            <button
              type="button"
              onClick={onConnectClick}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Warm Yellow Highlight Card */}
          <div className="p-5 rounded-2xl bg-amber-400 text-slate-950 flex flex-col justify-between shadow-md shadow-amber-400/20 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold">
                  Name your workflows
                </h4>
                <p className="text-xs font-medium text-slate-900/80 mt-1 leading-snug">
                  Runtime IDs are hard to read in an incident.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-white text-[10px] font-bold shrink-0">
                • Do first
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-950/10 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1">
                <Workflow className="w-3.5 h-3.5" />
                2 workflows
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~2 min
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: DETECTED (Middle Card with mini sub-cards) */}
        <div className="md:col-span-4 bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Detected
            </h3>
            <button
              type="button"
              onClick={onConnectClick}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Bot className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900">6 agents</p>
                <p className="text-[10px] font-medium text-slate-400">Ready to map</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                <Workflow className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900">2 workflows</p>
                <p className="text-[10px] font-medium text-slate-400">Configured</p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: AI ASSISTANT (Right Card with 3D Glossy Blue Orb) */}
        <div className="md:col-span-4 bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 flex flex-col items-center text-center justify-between space-y-4">
          
          {/* 3D Glossy Blue Orb Sphere */}
          <div className="relative pt-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-sky-300 shadow-[0_12px_28px_rgba(37,99,235,0.45),_inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center animate-soft-pulse">
              <Sparkles className="w-7 h-7 text-white drop-shadow-md" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Welcome, {displayName}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              What can I help with today?
            </p>
          </div>

          {/* Quick Prompts Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
            <button
              type="button"
              onClick={onConnectClick}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
            >
              Trace AST hierarchy
            </button>
            <button
              type="button"
              onClick={onConnectClick}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
            >
              Explore dependencies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
