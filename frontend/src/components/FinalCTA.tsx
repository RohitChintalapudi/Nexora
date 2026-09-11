import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HaddybhaiyaShader } from './HaddybhaiyaShader';

export const FinalCTA: React.FC = () => {
  const [gpuFailed, setGpuFailed] = useState(false);

  return (
    <section className="relative py-16 md:py-24 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="getstarted">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="relative bg-[#07080d] border border-white/[0.08] rounded-3xl p-8 sm:p-16 md:p-20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden">
          
          {/* WebGPU Shader Background */}
          {!gpuFailed && (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
              <HaddybhaiyaShader
                theme="dark"
                background={{ dark: "#07080d", light: "#ffffff" }}
                className="w-full h-full object-cover"
                onError={() => setGpuFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080d]/60 via-transparent to-[#07080d]/40 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#07080d]/20 to-[#07080d]/70 pointer-events-none" />
            </div>
          )}

          {/* Fallback glow if WebGPU is unavailable */}
          {gpuFailed && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-indigo-500/20 blur-[80px] rounded-full" />
            </div>
          )}

          {/* Foreground Content */}
          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            
            <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md flex items-center justify-center mb-6 shadow-inner select-none">
              <span className="text-blue-400 font-bold text-sm tracking-wider">N</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-white leading-[1.14] mb-6">
              Your codebase is more than files.<br />
              <span className="text-neutral-400 font-light">Understand how it all connects.</span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-10 max-w-lg">
              Start exploring your software with NEXORA. Connect your repositories and understand your system structure in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <motion.a
                href="#getstarted"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm font-sans tracking-wide transition-all text-center shadow-[0_0_28px_rgba(37,99,235,0.4)] hover:shadow-[0_0_36px_rgba(37,99,235,0.6)]"
              >
                Explore your codebase
              </motion.a>
              
              <motion.a
                href="#howitworks"
                whileHover={{ x: 3 }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.2] text-neutral-300 hover:text-white font-medium text-sm font-sans tracking-wide transition-all backdrop-blur-md text-center flex items-center justify-center gap-2"
              >
                Learn more <span className="text-base">→</span>
              </motion.a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default FinalCTA;
