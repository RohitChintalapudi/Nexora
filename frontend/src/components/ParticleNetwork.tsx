import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  glow: number;
}

export const ParticleNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Scale count based on device screen width
    const getParticleCount = () => {
      const width = window.innerWidth;
      if (width < 640) return 30; // Mobile
      if (width < 1024) return 65; // Tablet
      return 110; // Desktop
    };

    const dpr = window.devicePixelRatio || 1;
    
    const initCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Initialize particles
      particles = [];
      const count = getParticleCount();
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Slower particles for a calm, professional SaaS product
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          radius: Math.random() * 1.5 + 0.8,
          baseAlpha: Math.random() * 0.35 + 0.15,
          alpha: 0, // Fade in initially
          glow: 0,
        });
      }
    };

    initCanvas();

    const handleResize = () => {
      initCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = {
        x: -1000,
        y: -1000,
        active: false,
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const connectionDistance = 120;
    const mouseRadius = 160;
    const speedMultiplier = isReducedMotion ? 0.08 : 1;

    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Render faint grid reference points in the background
      ctx.fillStyle = 'rgba(17, 17, 17, 0.015)';
      const gridSpacing = 80;
      for (let x = 0; x < width; x += gridSpacing) {
        for (let y = 0; y < height; y += gridSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const mouse = mouseRef.current;

      // Update and Draw Particles
      particles.forEach((p) => {
        // Linear fade-in of particle opacity on load
        if (p.alpha < p.baseAlpha) {
          p.alpha += 0.005;
        }

        // Apply motion
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Boundary checks
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interactions (attraction / repulsion)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < mouseRadius && !isReducedMotion) {
          // Subtle attraction toward the cursor to represent "Connections" and "Intelligence"
          const force = (mouseRadius - dist) / mouseRadius;
          // Apply a gentle pull vector
          p.x += (dx / dist) * force * 0.45;
          p.y += (dy / dist) * force * 0.45;

          // Illuminate near the cursor
          p.glow = Math.min(p.glow + 0.05, 1);
        } else {
          p.glow = Math.max(p.glow - 0.02, 0);
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + (p.glow * 0.6), 0, Math.PI * 2);
        
        if (p.glow > 0) {
          // Interpolate to electric blue accent (#2563EB)
          ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha + p.glow * 0.45})`;
          // Draw subtle particle shadow/glow
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(37, 99, 235, 0.3)';
        } else {
          ctx.fillStyle = `rgba(17, 17, 17, ${p.alpha})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw Connections (fine lines)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alphaVal = (1 - dist / connectionDistance) * 0.11;
            
            // Check if connection is near the mouse to light it up
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const mDx = mouse.x - midX;
            const mDy = mouse.y - midY;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = 0.55;

            if (mouse.active && mDist < mouseRadius && !isReducedMotion) {
              const mouseHighlight = (1 - mDist / mouseRadius);
              ctx.strokeStyle = `rgba(37, 99, 235, ${alphaVal + mouseHighlight * 0.16})`;
              ctx.lineWidth = 0.75;
            } else {
              ctx.strokeStyle = `rgba(17, 17, 17, ${alphaVal})`;
            }
            ctx.stroke();
          }
        }
      }

      // Draw a very soft blue influence glow at cursor position
      if (mouse.active && !isReducedMotion) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseRadius);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.045)');
        gradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.015)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(mouse.x, mouse.y, mouseRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};
export default ParticleNetwork;
