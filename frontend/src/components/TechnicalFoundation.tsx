import React from 'react';
import { motion } from 'framer-motion';

export const TechnicalFoundation: React.FC = () => {
  const steps = ['Repository', 'Code Parsing', 'AST', 'Dependency Graph', 'Vector Search', 'RAG', 'AI'];

  const details = [
    {
      label: 'Code Intelligence',
      desc: 'Static compile-time analysis parses token symbols, declarations, parameters, and return types across modules.'
    },
    {
      label: 'Semantic Search',
      desc: 'Vectors represent functions and classes, enabling natural language indexing grounded in codebase meanings.'
    },
    {
      label: 'Dependency Graphs',
      desc: 'Constructs directed graph node relations maps directly from import declarations and service network payloads.'
    },
    {
      label: 'Repository RAG',
      desc: 'Supplements LLM prompts with exact contextual snippets, preventing hallucinated methods or missing definitions.'
    },
    {
      label: 'Architecture Mapping',
      desc: 'Recognizes system boundaries, separates third-party dependencies, and groups files into logical subsystems.'
    },
    {
      label: 'Impact Analysis',
      desc: 'Computes ripple effects of code modifications downstream, identifying potential compile break points.'
    }
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="foundation">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            Engineered for Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
            Built on the structure of your software.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Every query undergoes a structured analysis path, converting raw directories into an interconnected semantic system schema.
          </p>
        </div>

        {/* Technical Pipeline Visualization */}
        <div className="mb-20 overflow-x-auto select-none py-4">
          <div className="flex items-center justify-between min-w-[760px] max-w-4xl mx-auto px-6">
            {steps.map((step, idx) => (
              <React.Fragment key={step}>
                {/* Step Node */}
                <div className="flex flex-col items-center">
                  <div className="px-3.5 py-2 rounded-lg bg-white border border-black/[0.04] text-[10px] sm:text-xs font-mono text-neutral-700 shadow-sm shadow-black/[0.005]">
                    {step}
                  </div>
                </div>
                {/* Arrow Connector */}
                {idx < steps.length - 1 && (
                  <svg className="w-10 h-2" viewBox="0 0 40 8" fill="none">
                    <line x1="0" y1="4" x2="40" y2="4" stroke="rgba(17, 17, 17, 0.08)" strokeWidth="1" strokeDasharray="3, 3" />
                    <motion.line x1="0" y1="4" x2="40" y2="4" stroke="#2563EB" strokeWidth="1" strokeDasharray="5, 10" strokeDashoffset="0"
                      animate={{ strokeDashoffset: [-15, 15] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {details.map((item) => (
            <div
              key={item.label}
              className="p-6 rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.008)] hover:border-black/[0.07] transition-all duration-300"
            >
              <h3 className="font-serif font-semibold text-neutral-900 text-base sm:text-lg mb-2.5">
                {item.label}
              </h3>
              <p className="text-neutral-600 hover:text-neutral-700 text-sm sm:text-base leading-relaxed font-serif transition-colors duration-300">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
export default TechnicalFoundation;
