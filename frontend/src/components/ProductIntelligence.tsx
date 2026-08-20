import React from 'react';
import { motion } from 'framer-motion';
import { productFeatures } from '../data/productFeatures';

export const ProductIntelligence: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 border-t border-black/[0.04] bg-[#F7F7F5]" id="product">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Column: Sticky Editorial Header */}
        <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-32 h-fit">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
              Intelligence Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.15] mb-5">
              Your software has a story.<br />
              NEXORA helps you understand it.
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
              Engineered for complex architectures. Nexora connects to your repository, traces service boundaries, and maps dependency networks so your team stays aligned.
            </p>
            
            {/* Minimal aesthetic stats block */}
            <div className="mt-8 pt-8 border-t border-black/[0.06] flex items-center gap-10">
              <div>
                <div className="text-2xl font-sans font-medium text-neutral-900">10x</div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">Faster Onboarding</div>
              </div>
              <div>
                <div className="text-2xl font-sans font-medium text-neutral-900">0</div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">Broken Deployments</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Editorial Feature Stream */}
        <div className="lg:col-span-7 space-y-12">
          {productFeatures.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              whileHover={{ x: 6 }}
              className="group relative p-6 sm:p-8 rounded-2xl bg-white/40 hover:bg-white/80 border border-black/[0.02] hover:border-black/[0.05] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)]"
            >
              {/* Feature Sequence Indicator */}
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-sans font-extralight text-neutral-300 group-hover:text-blue-500 transition-colors duration-300 select-none">
                  {feature.id}
                </span>
                
                {/* Visual node design link */}
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-200 group-hover:bg-blue-500 transition-colors duration-300" />
                  <span className="w-6 h-[1px] bg-neutral-100 group-hover:bg-blue-100 transition-colors duration-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-200 group-hover:bg-blue-500 transition-colors duration-300" />
                </div>
              </div>

              {/* Title & Content */}
              <h3 className="text-xl font-sans font-medium text-neutral-900 mb-2">
                {feature.title}
              </h3>
              
              <div className="text-sm font-sans font-medium text-neutral-500 group-hover:text-blue-600 transition-colors duration-300 mb-3">
                {feature.tagline}
              </div>
              
              <p className="text-neutral-400 group-hover:text-neutral-500 text-sm leading-relaxed transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
export default ProductIntelligence;
