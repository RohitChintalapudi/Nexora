import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface CtaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  distToCenter: number;
}

export const FinalCTA: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: CtaParticle[] = [];
    const dpr = window.devicePixelRatio || 1;

    const initCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      particles = [];
      const count = 35;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(width, height) * (0.4 + Math.random() * 0.3);
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        
        particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.2 + 0.6,
          alpha: Math.random() * 0.4 + 0.1,
          distToCenter: radius
        });
      }
    };

    initCanvas();

    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);

    const speedMultiplier = isReducedMotion ? 0.05 : 1;

    const animate = () => {
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 25) {
          const angle = Math.random() * Math.PI * 2;
          const spawnRadius = Math.max(width, height) * 0.6;
          p.x = centerX + Math.cos(angle) * spawnRadius;
          p.y = centerY + Math.sin(angle) * spawnRadius;
          p.alpha = Math.random() * 0.4 + 0.1;
        } else {
          const speed = (0.2 + (dist / width) * 0.6) * speedMultiplier;
          p.x += (dx / dist) * speed;
          p.y += (dy / dist) * speed;
          
          if (dist < 70) {
            p.alpha = Math.max(p.alpha - 0.02, 0);
          } else if (p.alpha < 0.45) {
            p.alpha += 0.005;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha})`;
        ctx.fill();

        if (dist < 180 && dist > 40) {
          const lineAlpha = (1 - dist / 180) * 0.14;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(centerX, centerY);
          ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      });

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.45)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isReducedMotion]);

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="getstarted">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="relative bg-white border border-black/[0.045] rounded-3xl p-8 sm:p-16 text-center shadow-[0_8px_36px_rgba(0,0,0,0.015)] overflow-hidden">
          
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 select-none">
              <span className="text-blue-600 font-bold text-xs">N</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
              Your codebase is more than files.<br />
              <span className="text-neutral-400 font-light">Understand how it all connects.</span>
            </h2>

            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-10">
              Start exploring your software with NEXORA. Connect your repositories and understand your system structure in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <motion.a
                href="#getstarted"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm font-sans tracking-wide transition-colors text-center shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25"
              >
                Explore your codebase
              </motion.a>
              
              <motion.a
                href="#howitworks"
                whileHover={{ x: 3 }}
                className="w-full sm:w-auto px-6 py-3 text-neutral-500 hover:text-neutral-900 font-medium text-sm font-sans tracking-wide transition-all text-center flex items-center justify-center gap-1.5"
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
