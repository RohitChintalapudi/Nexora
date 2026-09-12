import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { FloatingInsightProps } from '../types';

export const FloatingInsightCard: React.FC<FloatingInsightProps> = ({
  children,
  className = '',
  depth = 15,
  tiltMax = 8,
}) => {
  const isReducedMotion = useReducedMotion();
  
  // High-performance Motion Values — 0 React component re-renders during mouse movement!
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const springConfig = { stiffness: 120, damping: 25, mass: 0.5 };
  const smoothX = useSpring(rawMouseX, springConfig);
  const smoothY = useSpring(rawMouseY, springConfig);

  const rotateX = useTransform(smoothY, (y) => (isReducedMotion ? 0 : -y * tiltMax));
  const rotateY = useTransform(smoothX, (x) => (isReducedMotion ? 0 : x * tiltMax));
  const translateX = useTransform(smoothX, (x) => (isReducedMotion ? 0 : x * depth));
  const translateY = useTransform(smoothY, (y) => (isReducedMotion ? 0 : y * depth));

  useEffect(() => {
    if (isReducedMotion) return;

    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        rawMouseX.set(nx);
        rawMouseY.set(ny);
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion, rawMouseX, rawMouseY]);

  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
      }}
      className={`bg-[#111218]/85 border border-white/[0.09] rounded-xl p-3.5 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-white/[0.16] transition-shadow duration-300 select-none ${className}`}
    >
      {/* 3D Inner Content Shift */}
      <div 
        style={{ 
          transform: 'translateZ(12px)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }} 
        className="w-full h-full text-white font-sans antialiased"
      >
        {children}
      </div>
    </motion.div>
  );
};
export default FloatingInsightCard;
