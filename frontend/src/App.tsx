import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScrollReveal } from './components/ui/ScrollReveal';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import './App.css';

function MainContent() {
  const { currentPage, navigateTo, isAuthenticated, isLoading } = useAuth();
  const isAuthPage = currentPage === 'signin' || currentPage === 'signup';
  const isLandingPage = currentPage === 'home' || (!isAuthPage && currentPage !== 'dashboard');

  useSmoothScroll(isLandingPage);

  if (currentPage === 'dashboard') {
    if (!isLoading && !isAuthenticated) {
      return (
        <div className="fixed inset-0 z-50 bg-[#F7F7F5] overflow-hidden">
          <SignInPage onNavigateHome={() => navigateTo('home')} />
        </div>
      );
    }
    return <DashboardPage />;
  }

  return (
    <div className="landing-page relative min-h-screen bg-[#F7F7F5] overflow-x-clip">
      <Navbar />
      <AuthModal />

      <div className="relative z-20">
        <Hero />
        
        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <ProblemSection />
        </ScrollReveal>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <ProductIntelligence />
        </ScrollReveal>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <AskCodebase />
        </ScrollReveal>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ComplexSystems />


        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <TechnicalFoundation />
        </ScrollReveal>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <CollaborationSection />
        </ScrollReveal>

        {/* Pricing Section - Hidden for now */}
        {/* 
        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <PricingSection />
        </ScrollReveal>
        */}

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <FAQSection />
        </ScrollReveal>

        <div className="max-w-6xl mx-auto h-[1px] bg-black/[0.08]" />
        <ScrollReveal>
          <FinalCTA />
        </ScrollReveal>
      </div>

      <ScrollReveal amount={0.05}>
        <footer className="relative z-20 py-10 md:py-12 border-t border-white/[0.08] bg-[#09090b] font-sans text-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 mb-8 md:mb-10">
            <div className="md:col-span-6 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-3 font-bold text-white text-lg sm:text-xl select-none">
                <img src="/favicon.svg" alt="NEXORA Logo" className="w-5 h-5 object-contain rounded-full border border-white/20" />
                <span className="tracking-wide">NEXORA</span>
              </div>
              <p className="text-neutral-300 text-sm sm:text-base max-w-sm leading-relaxed mb-3">
                Understand your entire software architecture, map dependencies, and explore code relationships with AI.
              </p>
              <span className="text-xs sm:text-sm font-mono text-neutral-400">
                Grounded AST Analysis & Repository Intelligence
              </span>
            </div>

            <div className="md:col-span-6 grid grid-cols-2 gap-8 sm:gap-12">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm mb-1">
                  Sections
                </span>
                <a href="#problem" className="text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors">
                  The Problem
                </a>
                <a href="#howitworks" className="text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors">
                  How It Works
                </a>
                <a href="#systems" className="text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors">
                  System Compatibility
                </a>
                <a href="#foundation" className="text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors">
                  Technical Foundation
                </a>
                <a href="#faq" className="text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors">
                  FAQ
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm mb-1">
                  Get Started
                </span>
                <button
                  onClick={() => navigateTo('signin')}
                  className="text-left text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigateTo('signup')}
                  className="text-left text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Create Account
                </button>
                <a
                  href="#getstarted"
                  className="text-sm sm:text-base text-neutral-300 hover:text-blue-400 transition-colors"
                >
                  Explore Codebase
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-400 text-xs sm:text-sm font-mono">
            <span>© 2026 NEXORA. All rights reserved.</span>
            <span>v1.0.0-beta</span>
          </div>
        </footer>
      </ScrollReveal>

      {/* Full-Screen GPU-Accelerated Dedicated Auth Overlay with 60 FPS transitions */}
      <AnimatePresence>
        {isAuthPage && (
          <motion.div
            key="auth-page-overlay"
            initial={{ opacity: 0, y: 16, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.995 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#F7F7F5] overflow-hidden"
          >
            {currentPage === 'signin' ? (
              <SignInPage onNavigateHome={() => navigateTo('home')} />
            ) : (
              <SignUpPage onNavigateHome={() => navigateTo('home')} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;

