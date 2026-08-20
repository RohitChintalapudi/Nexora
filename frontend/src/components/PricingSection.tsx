import React from 'react';
import { motion } from 'framer-motion';

export const PricingSection: React.FC = () => {
  const basicFeatures = [
    '1 repository connection',
    'Codebase exploration',
    'AI codebase questions',
    'Basic dependency visualization',
    'Limited AI queries (50/mo)',
    'Architecture overview',
    'Personal workspace',
  ];

  const premiumFeatures = [
    'Multiple repositories connection',
    'Unlimited codebase exploration',
    'Advanced AI analysis',
    'Advanced dependency graphs',
    'Impact analysis engine',
    'Deeper repository RAG model',
    'Architecture insights',
    'Priority AI processing queue',
    'Collaboration features (beta)',
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          
          {/* Basic Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex flex-col rounded-3xl bg-white border border-black/[0.045] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
          >
            <div className="mb-6">
              <h3 className="text-neutral-500 font-sans font-bold uppercase tracking-wider text-[11px] mb-2">Basic</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-sans font-semibold text-neutral-950">₹99</span>
                <span className="text-neutral-400 text-xs font-sans">/ month</span>
              </div>
              <p className="text-neutral-400 text-xs font-sans mt-3">
                For individual developers exploring their personal projects.
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-3.5 mb-8 flex-1 border-t border-black/[0.04] pt-6">
              {basicFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-xs font-sans text-neutral-600">
                  <span className="text-neutral-300">✔</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <motion.a
              href="#getstarted"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="block w-full py-3 rounded-xl border border-black/[0.08] hover:bg-neutral-50 text-neutral-700 font-medium text-xs font-sans tracking-wide text-center transition-colors shadow-sm"
            >
              Start with Basic
            </motion.a>
          </motion.div>

          {/* Premium Plan Card (Standing Out) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
            className="flex flex-col rounded-3xl bg-white border-2 border-blue-600/30 p-8 shadow-[0_12px_36px_rgba(37,99,235,0.035),_0_2px_6px_rgba(37,99,235,0.015)] relative"
          >
            {/* Tag Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-[9px] font-sans font-bold uppercase tracking-wider text-white select-none">
              Most Popular
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-sans font-bold uppercase tracking-wider text-[11px] mb-2">Premium</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-sans font-semibold text-neutral-950">₹150</span>
                <span className="text-neutral-400 text-xs font-sans">/ month</span>
              </div>
              <p className="text-neutral-400 text-xs font-sans mt-3">
                For developers who want deeper, enterprise-ready codebase intelligence.
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-3.5 mb-8 flex-1 border-t border-black/[0.04] pt-6">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-xs font-sans text-neutral-600">
                  <span className="text-blue-500 font-bold">✔</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <motion.a
              href="#getstarted"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs font-sans tracking-wide text-center transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              Get Premium
            </motion.a>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
export default PricingSection;
