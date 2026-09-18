import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { HaddybhaiyaShader } from './HaddybhaiyaShader';
import { useAuth } from '../context/AuthContext';
import { TextReveal } from './motion/text-reveal';

export const FinalCTA: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gpuFailed, setGpuFailed] = useState(false);
  const { navigateTo } = useAuth();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.95', 'center 0.55']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001
  });

  // Dynamic transforms: starts at 100% full-width edge-to-edge, 0px radius -> shrinks to max-w-7xl, 28px rounded card
  const maxWidth = useTransform(smoothProgress, [0, 1], ['100%', '80rem']); // 80rem = 1280px (max-w-7xl)
  const borderRadius = useTransform(smoothProgress, [0, 1], ['0px', '28px']);
  const outerPaddingX = useTransform(smoothProgress, [0, 1], ['0px', '24px']);
  const outerPaddingY = useTransform(smoothProgress, [0, 1], ['0px', '48px']);
  const borderColor = useTransform(
    smoothProgress,
    [0, 1],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.09)']
  );
  const boxShadow = useTransform(
    smoothProgress,
    [0, 1],
    ['0 0px 0px rgba(0,0,0,0)', '0 20px 60px rgba(0,0,0,0.18)']
  );

  return (
    <section 
      ref={containerRef} 
      className="relative bg-[#F7F7F5] content-layer overflow-hidden w-full flex justify-center py-4 md:py-8" 
      id="getstarted"
    >
      {/* Dynamic Width Outer Wrapper */}
      <motion.div 
        style={{
          paddingLeft: outerPaddingX,
          paddingRight: outerPaddingX,
          paddingTop: outerPaddingY,
          paddingBottom: outerPaddingY,
          width: '100%',
          maxWidth: '100%'
        }}
        className="w-full flex justify-center items-center"
      >
        {/* Morphing CTA Card */}
        <motion.div 
          style={{
            maxWidth,
            borderRadius,
            borderColor,
            boxShadow
          }}
          className="relative w-full bg-[#07080d] border py-14 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 text-center overflow-hidden flex flex-col items-center justify-center"
        >
            
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] bg-indigo-500/20 blur-[80px] rounded-full" />
              </div>
            )}

            {/* Foreground Content */}
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              
              <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md flex items-center justify-center mb-5 sm:mb-6 shadow-inner select-none">
                <span className="text-blue-400 font-bold text-sm tracking-wider">N</span>
              </div>

              <TextReveal
                as="h2"
                text={["Your codebase is more than files.", "Understand how it all connects."]}
                delay={0.1}
                stagger={0.045}
                blur={7}
                yOffset="22%"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-normal tracking-tight text-white leading-[1.12] mb-5 sm:mb-6"
              />

              <TextReveal
                as="p"
                text="Start exploring your software with NEXORA. Connect your repositories and understand your system structure in minutes."
                delay={0.4}
                stagger={0.025}
                blur={5}
                yOffset="15%"
                className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-8 sm:mb-10 max-w-xl font-light"
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <motion.button
                  type="button"
                  onClick={() => navigateTo('signup')}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm font-sans tracking-wide transition-all text-center shadow-[0_0_28px_rgba(37,99,235,0.4)] hover:shadow-[0_0_36px_rgba(37,99,235,0.6)] cursor-pointer"
                >
                  Explore your codebase
                </motion.button>
                
                <motion.a
                  href="#howitworks"
                  whileHover={{ x: 3 }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.2] text-neutral-300 hover:text-white font-medium text-sm font-sans tracking-wide transition-all backdrop-blur-md text-center flex items-center justify-center gap-2"
                >
                  Learn more <span className="text-base">→</span>
                </motion.a>
              </div>

            </div>

          </motion.div>
        </motion.div>
    </section>
  );
};

export default FinalCTA;
