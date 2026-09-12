import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  Network,
  ShieldCheck,
  Search,
  LogOut,
  ChevronDown,
  Layers,
  Terminal,
  Database,
  Cpu,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  FolderGit2,
  Sparkles,
  Home,
  MessageSquare,
  Send,
  Code2,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout, navigateTo } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'sandbox' | 'chat' | 'repos'>('overview');
  const [selectedRepo, setSelectedRepo] = useState('nexora/monorepo-core');
  const [isRepoMenuOpen, setIsRepoMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedGraphNode, setSelectedGraphNode] = useState<string | null>('auth');
  const [simulatedFile, setSimulatedFile] = useState('src/services/auth-service.ts');
  const [isSimulating, setIsSimulating] = useState(false);

  // Chat tab state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; code?: string; files?: string[] }>>([
    {
      role: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'Developer'}! I have indexed all 4 repositories in your **${selectedRepo}** workspace. You can ask me anything about architecture flows, breaking dependencies, or database schema bindings.`,
      files: ['src/services/auth-service.ts', 'src/models/user-model.sql']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);

    setTimeout(() => {
      let responseText = "Grounded analysis across 147 AST nodes mapped:";
      let codeSnippet = "";
      let relatedFiles = ['src/gateway/router.ts', 'src/services/auth-service.ts'];

      if (userText.toLowerCase().includes('database') || userText.toLowerCase().includes('sql') || userText.toLowerCase().includes('postgres')) {
        responseText = "The PostgreSQL primary database maps relational models through the query executor. Detected 8 tables with 0 active schema mutations:";
        codeSnippet = `// Neon PostgreSQL Connector
import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL);
// Table 'users' verified with active JWT signature index`;
        relatedFiles = ['src/config/db.js', 'src/models/userModel.js'];
      } else if (userText.toLowerCase().includes('break') || userText.toLowerCase().includes('risk') || userText.toLowerCase().includes('change')) {
        responseText = "Impact forecast completed. Modifying authentication payloads creates 2 medium downstream risks in gateway router and requires updating the JWTMiddleware signature verification:";
        codeSnippet = `// Recommended non-breaking payload adapter
export interface TokenPayload {
  userId: string;
  email: string;
  version: number; // Backward-compatible schema tag
}`;
        relatedFiles = ['src/middleware/authMiddleware.js', 'src/routes/authRoutes.js'];
      } else {
        responseText = `Identified structural definitions for "${userText}". All imports and caller graphs are synchronized with zero circular dependency loops detected.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: responseText,
          code: codeSnippet || undefined,
          files: relatedFiles
        }
      ]);
    }, 600);
  };

  const runImpactSimulation = (file: string) => {
    setSimulatedFile(file);
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 500);
  };

  // Mock Graph Nodes
  const graphNodes = [
    { id: 'client', name: 'Web Client', type: 'Frontend (React/Next.js)', callers: 0, dependents: 3, risk: 'Low', path: 'apps/web/src/App.tsx' },
    { id: 'gateway', name: 'API Gateway', type: 'Node.js Express / Envoy', callers: 1, dependents: 4, risk: 'High', path: 'services/gateway/router.ts' },
    { id: 'auth', name: 'Auth Service', type: 'Go / JWT Engine', callers: 2, dependents: 3, risk: 'Critical', path: 'services/auth/auth-service.go' },
    { id: 'user', name: 'User Executor', type: 'Node.js / Express MVC', callers: 2, dependents: 2, risk: 'Medium', path: 'backend/src/controllers/authController.js' },
    { id: 'postgres', name: 'Neon Postgres DB', type: 'Database (Serverless Pool)', callers: 2, dependents: 0, risk: 'Safe', path: 'backend/src/config/db.js' },
    { id: 'redis', name: 'Token Cache', type: 'Redis KV Store', callers: 1, dependents: 0, risk: 'Safe', path: 'infra/cache/redis.conf' }
  ];

  const activeNodeData = graphNodes.find((n) => n.id === selectedGraphNode) || graphNodes[2];

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#09090C] text-neutral-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Command Center) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 h-14 bg-[#0D0D12]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Logo theme="dark" size={22} />
          </button>

          <div className="h-4 w-[1px] bg-white/[0.12] hidden sm:block" />

          {/* Repository Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRepoMenuOpen(!isRepoMenuOpen)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-white">{selectedRepo}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            <AnimatePresence>
              {isRepoMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 mt-1.5 w-64 rounded-xl bg-[#14141B] border border-white/[0.12] shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs font-mono"
                >
                  {['nexora/monorepo-core', 'nexora/auth-service', 'nexora/gateway-router', 'nexora/postgres-adapter'].map((repo) => (
                    <button
                      key={repo}
                      type="button"
                      onClick={() => {
                        setSelectedRepo(repo);
                        setIsRepoMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        selectedRepo === repo ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-neutral-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="truncate">{repo}</span>
                      {selectedRepo === repo && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Sync Status Indicator */}
          <div className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Neon DB Live Synced</span>
          </div>
        </div>

        {/* Center: Quick Search */}
        <div className="hidden lg:flex items-center relative max-w-sm w-full mx-4">
          <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search AST symbols, dependencies, services (⌘K)..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06] transition-all font-mono"
          />
        </div>

        {/* Right: User Menu & Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-xs font-sans text-neutral-300 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-neutral-400" />
            <span>Home</span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {getUserInitials(user?.name)}
              </div>
              <span className="hidden sm:inline font-medium text-neutral-200 max-w-[110px] truncate">
                {user?.name ? user.name.split(' ')[0] : 'Developer'}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-1.5 w-56 rounded-xl bg-[#14141B] border border-white/[0.12] shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs"
                >
                  <div className="px-3 py-2 border-b border-white/[0.08]">
                    <p className="font-semibold text-white truncate">{user?.name || 'Developer'}</p>
                    <p className="text-[11px] font-mono text-neutral-400 truncate">{user?.email || 'user@nexora.dev'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigateTo('home');
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-neutral-300 text-left cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Public Landing Page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-left cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="bg-[#0D0D12] border-b border-white/[0.08] px-4 sm:px-6 flex items-center gap-2 overflow-x-auto select-none">
        {[
          { id: 'overview', label: 'Intelligence Overview', icon: Layers },
          { id: 'graph', label: 'System Architecture Map', icon: Network },
          { id: 'sandbox', label: 'PR Blast Radius Sandbox', icon: ShieldCheck },
          { id: 'chat', label: 'Ask Codebase AI', icon: MessageSquare },
          { id: 'repos', label: 'Connected Repositories', icon: FolderGit2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 font-semibold bg-white/[0.02]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-white/[0.15]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT VIEWPORT */}
      {/* ========================================================================= */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        
        {/* ======================== TAB 1: OVERVIEW ======================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">AST Nodes Indexed</span>
                  <Code2 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-semibold font-mono text-white">1,248</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <span>✔ 100% synchronized</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Breaking Mutations</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-semibold font-mono text-emerald-400">0</div>
                <div className="text-[11px] text-neutral-400 font-mono mt-1">
                  Last PR blast radius: Safe
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Database Tables</span>
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-semibold font-mono text-white">8 Tables</div>
                <div className="text-[11px] text-purple-400 font-mono mt-1">
                  Neon PostgreSQL live schema
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Microservices Mapped</span>
                  <Cpu className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-semibold font-mono text-white">6 Services</div>
                <div className="text-[11px] text-neutral-400 font-mono mt-1">
                  API Gateway & Auth routes
                </div>
              </div>

            </div>

            {/* Main Architecture Preview & Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Live Graph Preview Card */}
              <div className="lg:col-span-8 p-5 rounded-2xl bg-[#121218] border border-white/[0.08] flex flex-col justify-between min-h-[380px]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">System Architecture Mesh</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('graph')}
                    className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Interactive Map</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Microservices Live Flow Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto py-4">
                  {graphNodes.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => {
                        setSelectedGraphNode(node.id);
                        setActiveTab('graph');
                      }}
                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-blue-600/10 border border-white/[0.06] hover:border-blue-500/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-neutral-200 group-hover:text-blue-300 font-mono">{node.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${node.risk === 'Critical' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                      </div>
                      <p className="text-[10px] text-neutral-400 font-sans truncate">{node.type}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] text-[9px] font-mono text-neutral-500">
                        <span>{node.dependents} downstream</span>
                        <span className="text-blue-400 font-semibold">{node.risk}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>Workspace: <strong className="text-white">{selectedRepo}</strong></span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>0 Circular Imports</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Live Event Stream */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#121218] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-4">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Live Intelligence Stream</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <span>Schema Synchronized</span>
                        <span className="text-neutral-500">Just now</span>
                      </div>
                      <p className="text-neutral-200 text-[11px]">users table verified on Neon DB serverless</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <span>AST Compiler</span>
                        <span className="text-neutral-500">2 min ago</span>
                      </div>
                      <p className="text-neutral-200 text-[11px]">Parsed authController.js exported symbols</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <span>PR Impact Check</span>
                        <span className="text-neutral-500">5 min ago</span>
                      </div>
                      <p className="text-neutral-200 text-[11px]">0 breaking dependencies detected</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('sandbox')}
                  className="w-full mt-4 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold font-sans tracking-wide transition-colors cursor-pointer text-center"
                >
                  Test PR Blast Radius
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ======================== TAB 2: SYSTEM ARCHITECTURE GRAPH ======================== */}
        {activeTab === 'graph' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Interactive Graph Canvas */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-[#121218] border border-white/[0.08] min-h-[500px] flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">System Dependency Graph</span>
                </div>
                <span className="text-xs font-mono text-neutral-400">Click a node to inspect dependencies</span>
              </div>

              {/* Node Layout Simulation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-auto py-8">
                {graphNodes.map((node) => {
                  const isSelected = selectedGraphNode === node.id;
                  return (
                    <motion.div
                      key={node.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedGraphNode(node.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_24px_rgba(37,99,235,0.3)]'
                          : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-white">{node.name}</span>
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400 animate-ping' : 'bg-neutral-500'}`} />
                      </div>
                      <p className="text-[11px] text-neutral-400 mb-3">{node.type}</p>
                      <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between border-t border-white/[0.06] pt-2">
                        <span>{node.callers} Callers</span>
                        <span className="text-blue-400 font-semibold">{node.dependents} Dependents</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-[11px] font-mono text-neutral-400 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                <span>Selected: <strong className="text-blue-400">{activeNodeData.name}</strong></span>
                <span>File: {activeNodeData.path}</span>
              </div>
            </div>

            {/* Node Inspector Drawer */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#121218] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="border-b border-white/[0.06] pb-3 mb-4">
                  <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block mb-1">Node Inspector</span>
                  <h3 className="text-base font-bold text-white">{activeNodeData.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">{activeNodeData.path}</p>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">Upstream Callers</span>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] font-mono text-neutral-300">
                      {activeNodeData.callers > 0 ? 'Gateway Router → /api/v1/auth' : 'Top Level Entrypoint'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">Downstream Dependencies</span>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] font-mono text-neutral-300 space-y-1">
                      <div>↳ Neon PostgreSQL Adapter (users table)</div>
                      <div>↳ Token Signature Verifier (JWT)</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">Downstream Blast Score</span>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <span className="font-semibold text-neutral-200">Risk Assessment</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[11px] border border-blue-500/30">
                        {activeNodeData.risk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  runImpactSimulation(activeNodeData.path);
                  setActiveTab('sandbox');
                }}
                className="w-full mt-6 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-sans tracking-wide transition-colors cursor-pointer text-center"
              >
                Simulate Changing This Service
              </button>
            </div>

          </div>
        )}

        {/* ======================== TAB 3: PR BLAST RADIUS SANDBOX ======================== */}
        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Target File & Simulation Controls */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#121218] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-4">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Target Mutation Selector</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-neutral-400 font-mono block mb-1.5">Select Target File to Modify:</label>
                    <select
                      value={simulatedFile}
                      onChange={(e) => runImpactSimulation(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="src/services/auth-service.ts" className="bg-[#14141B]">src/services/auth-service.ts</option>
                      <option value="src/models/user-model.sql" className="bg-[#14141B]">src/models/user-model.sql</option>
                      <option value="src/controllers/billing.ts" className="bg-[#14141B]">src/controllers/billing.ts</option>
                      <option value="src/gateway/router.ts" className="bg-[#14141B]">src/gateway/router.ts</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs font-mono">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Simulation Parameters</span>
                    <div className="text-neutral-300">Target: <span className="text-blue-400">{simulatedFile}</span></div>
                    <div className="text-neutral-300">AST Depth: <span className="text-white">Full Recursive Tree</span></div>
                    <div className="text-neutral-300">Database Schema Diff: <span className="text-emerald-400">0 Column Breaking</span></div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runImpactSimulation(simulatedFile)}
                disabled={isSimulating}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-sans tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculating Graph Blast Radius...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run PR Blast Radius Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulation Results Report */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121218] border border-white/[0.08] min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Impact Analysis Report</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">STATUS: READY TO MERGE</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <span className="text-[10px] text-neutral-400 font-mono uppercase block">Affected Files</span>
                      <span className="text-xl font-bold font-mono text-white">3</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <span className="text-[10px] text-neutral-400 font-mono uppercase block">High Risk</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">0</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <span className="text-[10px] text-neutral-400 font-mono uppercase block">Safe Calls</span>
                      <span className="text-xl font-bold font-mono text-blue-400">14</span>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Downstream Dependency Path:</span>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-neutral-300">src/gateway/router.ts</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Safe (Verified)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-neutral-300">src/controllers/authController.js</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Safe (Pass-through)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-neutral-300">src/config/db.js (Neon PostgreSQL)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Auto Migrated</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300 font-mono mt-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero breaking API contract regressions detected across pull request.</span>
              </div>
            </div>

          </div>
        )}

        {/* ======================== TAB 4: ASK CODEBASE AI ======================== */}
        {activeTab === 'chat' && (
          <div className="p-6 rounded-2xl bg-[#121218] border border-white/[0.08] min-h-[550px] flex flex-col justify-between max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">Repository-Grounded AI Assistant</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">Context: {selectedRepo} (147 Files Indexed)</span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed font-sans ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white/[0.04] border border-white/[0.08] text-neutral-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex flex-wrap gap-1.5 font-mono text-[10px]">
                        {msg.files.map((f) => (
                          <span key={f} className="px-2 py-0.5 rounded bg-black/40 text-blue-300 border border-white/[0.06]">
                            📄 {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {msg.code && (
                      <div className="mt-3 rounded-lg bg-black/60 p-3 font-mono text-[10.5px] text-neutral-300 overflow-x-auto border border-white/[0.06]">
                        <pre><code>{msg.code}</code></pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Starter Prompts */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                "Which services depend on auth-service?",
                "Are there any breaking database mutations?",
                "How does the JWT verification work?"
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInputQuery(prompt)}
                  className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Query Input Bar */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about architectural flows, dependencies, or impact radius..."
                className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-sans"
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center justify-center shadow-[0_0_16px_rgba(37,99,235,0.4)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* ======================== TAB 5: CONNECTED REPOSITORIES ======================== */}
        {activeTab === 'repos' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Connected Repositories</h2>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">Manage continuous GitHub synchronization and AST index queues</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Repository connector is live and watching branch main.')}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-sans tracking-wide transition-colors cursor-pointer"
              >
                + Connect New Repository
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'nexora/monorepo-core', branch: 'main', files: '142 files', status: 'Live Synced', lang: 'TypeScript / React' },
                { name: 'nexora/auth-service', branch: 'main', files: '38 files', status: 'Live Synced', lang: 'Go / gRPC' },
                { name: 'nexora/gateway-router', branch: 'production', files: '56 files', status: 'Live Synced', lang: 'Node.js / Express' },
                { name: 'nexora/postgres-adapter', branch: 'main', files: '22 files', status: 'Live Synced', lang: 'SQL / Neon Serverless' }
              ].map((repo) => (
                <div
                  key={repo.name}
                  className="p-4 rounded-xl bg-[#121218] border border-white/[0.08] flex items-center justify-between hover:border-white/[0.16] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderGit2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-white">{repo.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300">
                          {repo.branch}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-sans">{repo.lang} • {repo.files}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{repo.status}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRepo(repo.name)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-sans text-neutral-300 transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default DashboardPage;
