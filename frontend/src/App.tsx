import { Navbar } from './components/Navbar';
import { ParticleNetwork } from './components/ParticleNetwork';
import { ArchitectureGraph } from './components/ArchitectureGraph';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { HowItWorks } from './components/HowItWorks';
import { ProductIntelligence } from './components/ProductIntelligence';
import { AskCodebase } from './components/AskCodebase';
import { ComplexSystems } from './components/ComplexSystems';
import { TechnicalFoundation } from './components/TechnicalFoundation';
import { CollaborationSection } from './components/CollaborationSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import './App.css';

function App() {
  return (
    <div className="relative min-h-screen bg-[#F7F7F5] overflow-hidden">
      
      <div className="bg-layer">
        <ParticleNetwork />
        <ArchitectureGraph />
      </div>

      <Navbar />

      <div className="relative z-20">
        
        <Hero />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <ProblemSection />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <HowItWorks />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <ProductIntelligence />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <AskCodebase />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <ComplexSystems />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <TechnicalFoundation />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <CollaborationSection />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <PricingSection />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <FAQSection />

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.035]" />

        <FinalCTA />

      </div>

      <footer className="relative z-20 py-16 border-t border-black/[0.035] bg-[#F7F7F5] font-sans text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 mb-12">
          
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4 font-semibold text-neutral-900 text-sm select-none">
              <img src="/favicon.png" alt="NEXORA Logo" className="w-5 h-5 object-contain" />
              <span>NEXORA</span>
            </div>
            <p className="text-neutral-400 max-w-xs leading-relaxed">
              Understand the system. Build the future.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider text-[10px]">Product</span>
              <a href="#product" className="text-neutral-400 hover:text-neutral-700 transition-colors">Intelligence</a>
              <a href="#architecture" className="text-neutral-400 hover:text-neutral-700 transition-colors">Architecture</a>
              <a href="#product" className="text-neutral-400 hover:text-neutral-700 transition-colors">Impact Analysis</a>
              <a href="#collaboration" className="text-neutral-400 hover:text-neutral-700 transition-colors">Collaboration</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider text-[10px]">Resources</span>
              <a href="#docs" className="text-neutral-400 hover:text-neutral-700 transition-colors">Documentation</a>
              <a href="#github" className="text-neutral-400 hover:text-neutral-700 transition-colors">GitHub</a>
              <a href="#blog" className="text-neutral-400 hover:text-neutral-700 transition-colors">Blog</a>
              <a href="#changelog" className="text-neutral-400 hover:text-neutral-700 transition-colors">Changelog</a>
            </div>

            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider text-[10px]">Company</span>
              <a href="#about" className="text-neutral-400 hover:text-neutral-700 transition-colors">About</a>
              <a href="#contact" className="text-neutral-400 hover:text-neutral-700 transition-colors">Contact</a>
              <a href="#privacy" className="text-neutral-400 hover:text-neutral-700 transition-colors">Privacy</a>
              <a href="#terms" className="text-neutral-400 hover:text-neutral-700 transition-colors">Terms</a>
            </div>

          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-black/[0.03] pt-6 flex items-center justify-between text-neutral-400 font-mono text-[10px]">
          <span>© 2026 NEXORA. All rights reserved.</span>
          <span>v1.0.0-beta</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
