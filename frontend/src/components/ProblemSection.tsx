import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export const ProblemSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const tools = [
    { name: 'CODE', icon: '💻', desc: 'Repositories', meta: '142 files indexed' },
    { name: 'DOCUMENTATION', icon: '📄', desc: 'Wiki & Readmes', meta: '18 sources connected' },
    { name: 'ARCHITECTURE', icon: '📐', desc: 'System Maps', meta: '12 services detected' },
    { name: 'ISSUES', icon: '🎫', desc: 'Tickets & Tasks', meta: '24 active issues' },
    { name: 'AI', icon: '🤖', desc: 'Contextual Intelligence', meta: 'Repository-aware answers' },
    { name: 'LOGS', icon: '📝', desc: 'Trace Outputs', meta: '3 environments monitored' }
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setMouseOffset({ x: x * 0.04, y: y * 0.04 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setHoveredIdx(null);
  };

  const paths = [
    { d: "M 180 120 Q 300 200 400 250", speed: 3.8 },
    { d: "M 130 250 Q 250 250 400 250", speed: 3.2 },
    { d: "M 180 380 Q 300 300 400 250", speed: 4.5 },
    { d: "M 620 120 Q 500 200 400 250", speed: 3.5 },
    { d: "M 670 250 Q 550 250 400 250", speed: 3.0 },
    { d: "M 620 380 Q 500 300 400 250", speed: 4.0 }
  ];

  const connectionPoints = [
    { cx: 336, cy: 218 },
    { cx: 328, cy: 250 },
    { cx: 336, cy: 282 },
    { cx: 464, cy: 218 },
    { cx: 472, cy: 250 },
    { cx: 464, cy: 282 }
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="problem">
      <div className="max-w-7xl mx-auto px-6">
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow-inward {
            0% {
              offset-distance: 0%;
              opacity: 0;
            }
            8% {
              opacity: 0.9;
            }
            92% {
              opacity: 0.9;
            }
            100% {
              offset-distance: 100%;
              opacity: 0;
            }
          }
          @keyframes flow-outward {
            0% {
              offset-distance: 100%;
              opacity: 0;
            }
            8% {
              opacity: 0.9;
            }
            92% {
              opacity: 0.9;
            }
            100% {
              offset-distance: 0%;
              opacity: 0;
            }
          }
          .particle-dot {
            transform-box: fill-box;
            transform-origin: center;
          }
        `}} />

        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
            Modern software is connected.<br />
            Your tools shouldn't be fragmented.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Developers constantly move between repositories, documentation, architecture diagrams, issue trackers, terminals, and AI tools just to understand how a system works. NEXORA brings that understanding into one intelligent workspace.
          </p>
        </div>

        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative max-w-4xl mx-auto h-[450px] md:h-[500px] flex items-center justify-center overflow-hidden"
        >
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 500">
            {paths.map((p, idx) => {
              const isPathHovered = hoveredIdx === idx;
              const isAnyHovered = hoveredIdx !== null;
              
              let baseOpacity = 0.095;
              let glowOpacity = 0.35;
              let lineSpeed = p.speed;

              if (isAnyHovered) {
                if (isPathHovered) {
                  baseOpacity = 0.28;
                  glowOpacity = 1.0;
                  lineSpeed = p.speed * 0.55;
                } else {
                  baseOpacity = 0.02;
                  glowOpacity = 0.04;
                }
              }

              const isOutward = idx === 1 || idx === 4;

              return (
                <g key={idx}>
                  <motion.path
                    d={p.d}
                    stroke="rgba(37, 99, 235, 0.45)"
                    strokeWidth="1.2"
                    strokeDasharray="4, 4"
                    fill="none"
                    animate={{ opacity: baseOpacity }}
                    transition={{ duration: 0.35 }}
                  />
                  <motion.path
                    d={p.d}
                    stroke="#2563EB"
                    strokeWidth={isPathHovered ? 2.5 : 1.6}
                    strokeDasharray="8, 25"
                    strokeDashoffset="0"
                    fill="none"
                    animate={{ 
                      strokeDashoffset: isPathHovered ? [0, -96] : [-100, 100],
                      opacity: glowOpacity
                    }}
                    transition={{ 
                      strokeDashoffset: { repeat: Infinity, duration: isPathHovered ? 1.2 : lineSpeed, ease: "linear" },
                      opacity: { duration: 0.3 }
                    }}
                  />

                  <circle
                    className="particle-dot"
                    r="2.2"
                    fill="#2563EB"
                    style={{
                      offsetPath: `path("${p.d}")`,
                      animation: `${isOutward ? 'flow-outward' : 'flow-inward'} ${isPathHovered ? lineSpeed * 0.55 : lineSpeed}s linear infinite`,
                      animationDelay: `${idx * 0.45}s`
                    } as React.CSSProperties}
                  />

                  <circle
                    className="particle-dot"
                    r="2.2"
                    fill="#2563EB"
                    style={{
                      offsetPath: `path("${p.d}")`,
                      animation: `${isOutward ? 'flow-outward' : 'flow-inward'} ${isPathHovered ? lineSpeed * 0.55 : lineSpeed}s linear infinite`,
                      animationDelay: `${idx * 0.45 + (isPathHovered ? lineSpeed * 0.275 : lineSpeed * 0.5)}s`
                    } as React.CSSProperties}
                  />
                </g>
              );
            })}

            {connectionPoints.map((pt, idx) => {
              const isPointHovered = hoveredIdx === idx;
              return (
                <motion.circle
                  key={idx}
                  cx={pt.cx}
                  cy={pt.cy}
                  animate={{
                    r: isPointHovered ? 4.5 : 2.5,
                    fill: isPointHovered ? '#2563EB' : '#A3A3A3',
                    opacity: isPointHovered ? 0.95 : 0.35
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                />
              );
            })}
          </svg>

          <motion.div 
            animate={{ 
              x: mouseOffset.x * 0.4, 
              y: mouseOffset.y * 0.4,
              scale: hoveredIdx !== null ? 1.025 : 1,
              boxShadow: hoveredIdx !== null 
                ? '0 12px 48px rgba(37, 99, 235, 0.12), 0 0 20px rgba(37, 99, 235, 0.08)' 
                : '0 8px 40px rgba(37,99,235,0.06)'
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute z-10 w-36 h-36 rounded-full bg-white flex flex-col items-center justify-center border border-blue-500/20 text-center p-3 select-none"
          >
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-blue-600 mb-0.5">
              NEXORA
            </span>
            <span className="text-[8.5px] font-semibold text-neutral-400 font-sans leading-tight">
              One context. Every signal.
            </span>
            <div className="absolute inset-0 rounded-full border border-blue-500/25 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -35, y: -25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
            className="absolute top-[8%] left-[2%] sm:left-[10%] xl:left-[15%] flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                x: mouseOffset.x * 0.8, 
                y: mouseOffset.y * 0.8 + (hoveredIdx === 0 ? -4 : 0),
                scale: hoveredIdx === 0 ? 1.03 : 1,
                boxShadow: hoveredIdx === 0 ? '0 12px 30px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.015)',
                borderColor: hoveredIdx === 0 ? 'rgba(37,99,235,0.22)' : 'rgba(0,0,0,0.045)'
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              onMouseEnter={() => setHoveredIdx(0)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-36 sm:w-44 p-3.5 rounded-xl bg-white border cursor-pointer flex flex-col items-start gap-1.5 transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl select-none">{tools[0].icon}</span>
                <div className="text-neutral-800 font-bold text-[10px] tracking-wider font-sans leading-none">{tools[0].name}</div>
              </div>
              <div className="w-full">
                <div className="text-neutral-500 text-[10px] font-sans font-medium">{tools[0].desc}</div>
                <div className="text-neutral-300 text-[8.5px] font-mono mt-0.5">{tools[0].meta}</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
            className="absolute top-[45%] left-[0%] sm:left-[4%] xl:left-[8%] flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                x: mouseOffset.x * 0.9, 
                y: mouseOffset.y * 0.9 + (hoveredIdx === 1 ? -4 : 0),
                scale: hoveredIdx === 1 ? 1.03 : 1,
                boxShadow: hoveredIdx === 1 ? '0 12px 30px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.015)',
                borderColor: hoveredIdx === 1 ? 'rgba(37,99,235,0.22)' : 'rgba(0,0,0,0.045)'
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              onMouseEnter={() => setHoveredIdx(1)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-36 sm:w-44 p-3.5 rounded-xl bg-white border cursor-pointer flex flex-col items-start gap-1.5 transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl select-none">{tools[1].icon}</span>
                <div className="text-neutral-800 font-bold text-[10px] tracking-wider font-sans leading-none">{tools[1].name}</div>
              </div>
              <div className="w-full">
                <div className="text-neutral-500 text-[10px] font-sans font-medium">{tools[1].desc}</div>
                <div className="text-neutral-300 text-[8.5px] font-mono mt-0.5">{tools[1].meta}</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -35, y: 25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }}
            className="absolute bottom-[8%] left-[2%] sm:left-[10%] xl:left-[15%] flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                x: mouseOffset.x * 0.8, 
                y: mouseOffset.y * 0.8 + (hoveredIdx === 2 ? -4 : 0),
                scale: hoveredIdx === 2 ? 1.03 : 1,
                boxShadow: hoveredIdx === 2 ? '0 12px 30px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.015)',
                borderColor: hoveredIdx === 2 ? 'rgba(37,99,235,0.22)' : 'rgba(0,0,0,0.045)'
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              onMouseEnter={() => setHoveredIdx(2)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-36 sm:w-44 p-3.5 rounded-xl bg-white border cursor-pointer flex flex-col items-start gap-1.5 transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl select-none">{tools[2].icon}</span>
                <div className="text-neutral-800 font-bold text-[10px] tracking-wider font-sans leading-none">{tools[2].name}</div>
              </div>
              <div className="w-full">
                <div className="text-neutral-500 text-[10px] font-sans font-medium">{tools[2].desc}</div>
                <div className="text-neutral-300 text-[8.5px] font-mono mt-0.5">{tools[2].meta}</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35, y: -25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.4 }}
            className="absolute top-[8%] right-[2%] sm:right-[10%] xl:right-[15%] flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                x: mouseOffset.x * 0.8, 
                y: mouseOffset.y * 0.8 + (hoveredIdx === 3 ? -4 : 0),
                scale: hoveredIdx === 3 ? 1.03 : 1,
                boxShadow: hoveredIdx === 3 ? '0 12px 30px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.015)',
                borderColor: hoveredIdx === 3 ? 'rgba(37,99,235,0.22)' : 'rgba(0,0,0,0.045)'
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              onMouseEnter={() => setHoveredIdx(3)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-36 sm:w-44 p-3.5 rounded-xl bg-white border cursor-pointer flex flex-col items-start gap-1.5 transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl select-none">{tools[3].icon}</span>
                <div className="text-neutral-800 font-bold text-[10px] tracking-wider font-sans leading-none">{tools[3].name}</div>
              </div>
              <div className="w-full">
                <div className="text-neutral-500 text-[10px] font-sans font-medium">{tools[3].desc}</div>
                <div className="text-neutral-300 text-[8.5px] font-mono mt-0.5">{tools[3].meta}</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.5 }}
            className="absolute top-[45%] right-[0%] sm:right-[4%] xl:right-[8%] flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                x: mouseOffset.x * 0.9, 
                y: mouseOffset.y * 0.9 + (hoveredIdx === 4 ? -4 : 0),
                scale: hoveredIdx === 4 ? 1.03 : 1,
                boxShadow: hoveredIdx === 4 ? '0 12px 30px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.015)',
                borderColor: hoveredIdx === 4 ? 'rgba(37,99,235,0.22)' : 'rgba(0,0,0,0.045)'
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              onMouseEnter={() => setHoveredIdx(4)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-36 sm:w-44 p-3.5 rounded-xl bg-white border cursor-pointer flex flex-col items-start gap-1.5 transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl select-none">{tools[4].icon}</span>
                <div className="text-neutral-800 font-bold text-[10px] tracking-wider font-sans leading-none">{tools[4].name}</div>
              </div>
              <div className="w-full">
                <div className="text-neutral-500 text-[10px] font-sans font-medium">{tools[4].desc}</div>
                <div className="text-neutral-300 text-[8.5px] font-mono mt-0.5">{tools[4].meta}</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35, y: 25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.6 }}
            className="absolute bottom-[8%] right-[2%] sm:right-[10%] xl:right-[15%] flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                x: mouseOffset.x * 0.8, 
                y: mouseOffset.y * 0.8 + (hoveredIdx === 5 ? -4 : 0),
                scale: hoveredIdx === 5 ? 1.03 : 1,
                boxShadow: hoveredIdx === 5 ? '0 12px 30px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.015)',
                borderColor: hoveredIdx === 5 ? 'rgba(37,99,235,0.22)' : 'rgba(0,0,0,0.045)'
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              onMouseEnter={() => setHoveredIdx(5)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-36 sm:w-44 p-3.5 rounded-xl bg-white border cursor-pointer flex flex-col items-start gap-1.5 transition-colors duration-300"
            >
              <span className="text-xl sm:text-2xl">{tools[5].icon}</span>
              <div>
                <div className="text-neutral-800 font-bold text-[10px] tracking-wider font-sans leading-none">{tools[5].name}</div>
                <div className="text-neutral-500 text-[10px] font-sans font-medium">{tools[5].desc}</div>
                <div className="text-neutral-300 text-[8.5px] font-mono mt-0.5">{tools[5].meta}</div>
              </div>
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
export default ProblemSection;
