import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  amount?: number | 'some' | 'all';
  margin?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.55,
  yOffset = 22,
  direction = 'up',
  amount = 'some',
  margin = '0px 0px -40px 0px',
}) => {
  const shouldReduceMotion = useReducedMotion();

  let initialX = 0;
  let initialY = 0;

  if (!shouldReduceMotion) {
    if (direction === 'up') initialY = yOffset;
    if (direction === 'down') initialY = -yOffset;
    if (direction === 'left') initialX = yOffset;
    if (direction === 'right') initialX = -yOffset;
  }

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: initialX, y: initialY }
      }
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount, margin }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ willChange: 'opacity, transform' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
