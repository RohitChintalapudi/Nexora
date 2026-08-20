import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface NodeItem {
  id: string;
  label: string;
  x: number; // Viewport coordinate relative to SVG viewBox (0-800, 0-500)
  y: number;
  isActive?: boolean;
}

interface EdgeItem {
  from: string;
  to: string;
}

// SVG dimensions for coordinates mapping
const viewBoxWidth = 800;
const viewBoxHeight = 500;

const nodes: NodeItem[] = [
  { id: 'frontend', label: 'Frontend App', x: 400, y: 70 },
  { id: 'api', label: 'Gateway API', x: 250, y: 220, isActive: true },
  { id: 'auth', label: 'Auth Service', x: 550, y: 220 },
  { id: 'services', label: 'Core Executor', x: 400, y: 350, isActive: true },
  { id: 'database', label: 'Replica DB', x: 400, y: 450 }
];

const edges: EdgeItem[] = [
  { from: 'frontend', to: 'api' },
  { from: 'frontend', to: 'auth' },
  { from: 'api', to: 'auth' },
  { from: 'api', to: 'services' },
  { from: 'auth', to: 'services' },
  { from: 'services', to: 'database' }
];

export const ArchitectureGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useMousePosition();
  const isReducedMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Track coordinates of nodes dynamically (including floating offset)
  const [floatOffsets, setFloatOffsets] = useState<Record<string, { x: number; y: number }>>(() => ({
    frontend: { x: 0, y: 0 },
    api: { x: 0, y: 0 },
    auth: { x: 0, y: 0 },
    services: { x: 0, y: 0 },
    database: { x: 0, y: 0 }
  }));

  // Track cursor proximity to each node safely in state
  const [proximities, setProximities] = useState<Record<string, number>>(() => ({
    frontend: 0,
    api: 0,
    auth: 0,
    services: 0,
    database: 0
  }));

  useEffect(() => {
    if (isReducedMotion) return;

    // Generate very slow independent floating intervals for each node
    let animId: number;
    const startTime = Date.now();

    const updateFloat = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setFloatOffsets({
        frontend: { x: Math.sin(elapsed * 0.75) * 4, y: Math.cos(elapsed * 0.9) * 6 },
        api: { x: Math.cos(elapsed * 0.85) * 5, y: Math.sin(elapsed * 0.6) * 5 },
        auth: { x: Math.sin(elapsed * 0.9) * 5, y: Math.cos(elapsed * 0.8) * 5 },
        services: { x: Math.cos(elapsed * 0.7) * 4, y: Math.sin(elapsed * 0.95) * 6 },
        database: { x: Math.sin(elapsed * 0.65) * 3, y: Math.cos(elapsed * 0.7) * 4 }
      });
      animId = requestAnimationFrame(updateFloat);
    };

    updateFloat();
    return () => cancelAnimationFrame(animId);
  }, [isReducedMotion]);

  // Compute node position with floating offset applied
  const getNodePosition = (node: NodeItem) => {
    const offset = floatOffsets[node.id] || { x: 0, y: 0 };
    return {
      x: node.x + offset.x,
      y: node.y + offset.y
    };
  };

  // Calculate proximities safely inside an effect after ref is populated
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / viewBoxWidth;
    const scaleY = rect.height / viewBoxHeight;
    const threshold = 180;

    const nextProximities: Record<string, number> = {};

    nodes.forEach(node => {
      const offset = floatOffsets[node.id] || { x: 0, y: 0 };
      const posX = node.x + offset.x;
      const posY = node.y + offset.y;

      const clientNodeX = rect.left + posX * scaleX;
      const clientNodeY = rect.top + posY * scaleY;

      const dx = mousePos.x - clientNodeX;
      const dy = mousePos.y - clientNodeY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < threshold) {
        nextProximities[node.id] = (threshold - dist) / threshold;
      } else {
        nextProximities[node.id] = 0;
      }
    });

    setProximities(nextProximities);
  }, [mousePos, floatOffsets]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
    >
      <div className="relative w-full max-w-[800px] aspect-[800/500] opacity-70 md:opacity-85">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Edges Definition */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const p1 = getNodePosition(fromNode);
            const p2 = getNodePosition(toNode);

            // Determine if the path should light up based on hovering either endpoint node
            const proximityFrom = proximities[edge.from] || 0;
            const proximityTo = proximities[edge.to] || 0;
            const maxProximity = Math.max(proximityFrom, proximityTo);
            const isHovered = activeNode === edge.from || activeNode === edge.to;

            return (
              <g key={`${edge.from}-${edge.to}-${idx}`}>
                {/* Underlay glow path */}
                {maxProximity > 0.1 && (
                  <motion.path
                    d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                    stroke="#3B82F6"
                    strokeWidth={1.5 + maxProximity * 2}
                    opacity={maxProximity * 0.4}
                    strokeLinecap="round"
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  />
                )}
                {/* Standard connection path */}
                <motion.path
                  d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                  stroke={isHovered ? '#2563EB' : maxProximity > 0 ? '#3B82F6' : 'rgba(17, 17, 17, 0.08)'}
                  strokeWidth={1.2}
                  opacity={isHovered ? 1 : maxProximity > 0 ? 0.3 + maxProximity * 0.4 : 0.65}
                  strokeLinecap="round"
                  transition={{ duration: 0.3 }}
                />
              </g>
            );
          })}

          {/* Nodes Definition */}
          {nodes.map((node) => {
            const pos = getNodePosition(node);
            const proximity = proximities[node.id] || 0;
            const isFocused = activeNode === node.id || proximity > 0.4;
            const isBlue = node.isActive || isFocused;

            return (
              <g 
                key={node.id} 
                className="cursor-pointer pointer-events-auto"
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
              >
                {/* Outer Glow Ring on Hover/Proximity */}
                {proximity > 0.1 && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={14 + proximity * 10}
                    fill="none"
                    stroke={isBlue ? 'rgba(37, 99, 235, 0.25)' : 'rgba(17, 17, 17, 0.06)'}
                    strokeWidth={1 + proximity * 3}
                    className="pointer-events-none"
                  />
                )}

                {/* Inner Core Circle */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isFocused ? 7.5 : 5.5}
                  fill={isBlue ? '#2563EB' : '#FFFFFF'}
                  stroke={isBlue ? '#2563EB' : 'rgba(17, 17, 17, 0.25)'}
                  strokeWidth={1.8}
                  animate={{
                    scale: isFocused ? 1.25 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />

                {/* Node Metadata Labels */}
                <foreignObject
                  x={pos.x - 65}
                  y={pos.y + 12}
                  width={130}
                  height={45}
                  className="overflow-visible pointer-events-none"
                >
                  <div className="flex flex-col items-center justify-start text-center">
                    <span 
                      className={`text-[10px] md:text-[11px] font-sans font-medium tracking-tight px-1.5 py-0.5 rounded transition-all duration-300 ${
                        isFocused 
                          ? 'text-neutral-900 bg-neutral-100 shadow-sm border border-neutral-200/50' 
                          : 'text-neutral-400 bg-transparent'
                      }`}
                    >
                      {node.label}
                    </span>
                    {/* Tiny status indicator dot under node label */}
                    {node.isActive && (
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-1 animate-pulse" />
                    )}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
export default ArchitectureGraph;
