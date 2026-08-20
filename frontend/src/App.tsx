import { Navbar } from './components/Navbar';
import { ParticleNetwork } from './components/ParticleNetwork';
import { ArchitectureGraph } from './components/ArchitectureGraph';
import { Hero } from './components/Hero';
import { ProductIntelligence } from './components/ProductIntelligence';
import './App.css';

function App() {
  return (
    <div className="relative min-h-screen bg-[#F7F7F5]">
      {/* Background Particle Network */}
      <ParticleNetwork />

      {/* Background Architecture Dependency Graph */}
      <ArchitectureGraph />

      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative">
        <Hero />
      </main>

      {/* Detailed Product Features Section */}
      <ProductIntelligence />

      {/* Minimal, Technical Footer */}
      <footer className="relative z-20 py-12 border-t border-black/[0.035] bg-[#F7F7F5] font-sans text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 tracking-tight">NEXORA</span>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-400">Understand the system. Build the future.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-neutral-700 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-neutral-700 transition-colors">Terms of Service</a>
            <span>© {new Date().getFullYear()} NEXORA. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
