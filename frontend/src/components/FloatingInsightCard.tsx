import React from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { FloatingInsightProps } from '../types';

export const FloatingInsightCard: React.FC<FloatingInsightProps> = ({
  children,
  className = '',
  depth = 15,
  tiltMax = 8,
}) => {
  const mousePos = useMousePosition();
  const isReducedMotion = useReducedMotion();

  // Normalize mouse coordinates to [-0.5, 0.5] range
  const getNormalizedMouse = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const nx = mousePos.x / window.innerWidth - 0.5;
    const ny = mousePos.y / window.innerHeight - 0.5;
    return { x: nx, y: ny };
  };

  const norm = getNormalizedMouse();

  // If prefers-reduced-motion is active, disable mouse tilt/parallax
  const rotateX = isReducedMotion ? 0 : -norm.y * tiltMax;
  const rotateY = isReducedMotion ? 0 : norm.x * tiltMax;
  const translateX = isReducedMotion ? 0 : norm.x * depth;
  const translateY = isReducedMotion ? 0 : norm.y * depth;

  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
      animate={{
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 25,
        mass: 0.5,
      }}
      className={`bg-white border border-black/[0.045] rounded-xl p-4.5 shadow-[0_4px_24px_rgba(0,0,0,0.02),_0_1px_2px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.05),_0_2px_6px_rgba(0,0,0,0.02)] hover:border-black/[0.07] transition-shadow duration-500 select-none ${className}`}
    >
      {/* 3D Inner Content Shift */}
      <div 
        style={{ 
          transform: 'translateZ(12px)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }} 
        className="w-full h-full text-neutral-900 font-sans antialiased"
      >
        {children}
      </div>
    </motion.div>
  );
};
export default FloatingInsightCard;
