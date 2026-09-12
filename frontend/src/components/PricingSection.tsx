import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const PricingSection: React.FC = () => {
  const { navigateTo } = useAuth();

  const basicFeatures = [
    'Up to 3 GitHub Repositories',
    'Interactive dependency tree mapping',
    'Contextual code Q&A search',
    'Standard indexing queue'
  ];

  const premiumFeatures = [
    'Unlimited repositories sync',
    'Cross-repo service dependency maps',
    'Downstream risk impact sandbox preview',
    'AST structural parser index priorities',
    'Real-time shared team workspaces'
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
            Simple pricing. Powerful intelligence.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Start exploring your codebase without a complicated pricing structure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          
          <div className="flex flex-col rounded-3xl bg-white border border-black/[0.045] p-8 sm:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            <div className="mb-6">
              <h3 className="text-neutral-500 font-serif font-bold uppercase tracking-wider text-xs sm:text-sm mb-2">Basic</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-serif font-bold text-neutral-950">₹99</span>
                <span className="text-neutral-500 text-sm font-serif">/ month</span>
              </div>
              <p className="text-neutral-600 text-sm sm:text-base font-serif mt-3 leading-relaxed">
                For individual developers exploring their personal projects.
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-1 border-t border-black/[0.04] pt-6">
              {basicFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm sm:text-base font-serif text-neutral-700">
                  <span className="text-neutral-400 font-bold">✔</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <motion.button
              type="button"
              onClick={() => navigateTo('signup')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="block w-full py-3.5 rounded-xl border border-black/[0.08] hover:bg-neutral-50 text-neutral-900 font-semibold text-sm sm:text-base font-serif tracking-wide text-center transition-colors shadow-sm cursor-pointer"
            >
              Start with Basic
            </motion.button>
          </div>

          <div className="flex flex-col rounded-3xl bg-white border-2 border-blue-600/30 p-8 sm:p-9 shadow-[0_12px_36px_rgba(37,99,235,0.035),_0_2px_6px_rgba(37,99,235,0.015)] relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-blue-600 text-xs font-serif font-bold uppercase tracking-wider text-white select-none shadow-sm">
              Most Popular
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-serif font-bold uppercase tracking-wider text-xs sm:text-sm mb-2">Premium</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-serif font-bold text-neutral-950">₹150</span>
                <span className="text-neutral-500 text-sm font-serif">/ month</span>
              </div>
              <p className="text-neutral-600 text-sm sm:text-base font-serif mt-3 leading-relaxed">
                For developers who want deeper, enterprise-ready codebase intelligence.
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-1 border-t border-black/[0.04] pt-6">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm sm:text-base font-serif text-neutral-700">
                  <span className="text-blue-500 font-bold">✔</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <motion.button
              type="button"
              onClick={() => navigateTo('signup')}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              className="block w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base font-serif tracking-wide text-center transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
            >
              Start with Premium
            </motion.button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PricingSection;
