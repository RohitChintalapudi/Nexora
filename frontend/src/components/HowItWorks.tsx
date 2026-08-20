import React from 'react';
import { motion } from 'framer-motion';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Connect',
      desc: 'Connect your GitHub repository and let NEXORA understand your project structure.',
    },
    {
      num: '02',
      title: 'Analyze',
      desc: 'NEXORA analyzes files, functions, components, APIs, services, imports, and dependencies.',
    },
    {
      num: '03',
      title: 'Map',
      desc: 'Your software is transformed into an interactive architecture and dependency graph.',
    },
    {
      num: '04',
      title: 'Ask',
      desc: 'Ask questions about your actual codebase and receive AI-powered answers grounded in your project.',
    },
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="howitworks">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12]">
            From repository to understanding.
          </h2>
        </div>

        {/* Steps Flow Wrapper */}
        <div className="relative">
          {/* Desktop Connection Line */}
          <div className="absolute top-[32%] left-[12%] right-[12%] h-[1px] bg-neutral-200 hidden md:block z-0">
            <motion.div 
              className="h-full bg-blue-500 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
                className="flex flex-col items-center md:items-start text-center md:text-left group"
              >
                {/* Step Circle Header */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-black/[0.04] shadow-sm flex items-center justify-center font-sans font-medium text-sm sm:text-base text-neutral-800 group-hover:border-blue-500 group-hover:text-blue-600 transition-all duration-300 mb-6 relative bg-white select-none">
                  {step.num}
                  {/* Subtle pulsing glow */}
                  <span className="absolute -inset-1 rounded-full border border-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-105" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-sans font-semibold text-neutral-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {step.title}
                </h3>
                
                <p className="text-neutral-500 text-sm leading-relaxed max-w-[280px] md:max-w-none">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
export default HowItWorks;
