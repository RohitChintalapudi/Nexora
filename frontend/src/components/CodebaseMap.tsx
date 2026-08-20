import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface NodeMapItem {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  details: string;
}

interface EdgeMapItem {
  from: string;
  to: string;
}

// SVG dimensions for coordinates mapping
const viewBoxWidth = 800;
const viewBoxHeight = 500;

const nodes: NodeMapItem[] = [
  { id: 'client', label: 'Frontend Client', type: 'React / Next.js', x: 400, y: 60, details: '12 components, 3 entry routes' },
  { id: 'gateway', label: 'API Gateway', type: 'Node.js / Express', x: 260, y: 190, details: '8 endpoints, rate limiting active' },
  { id: 'auth', label: 'Auth Engine', type: 'JWT / Redis', x: 540, y: 190, details: '2 auth methods, token validation' },
  { id: 'services', label: 'Core Services', type: 'Go / GRPC', x: 400, y: 320, details: '14 services, database executor' },
  { id: 'db', label: 'Postgres DB', type: 'Primary / Replica', x: 300, y: 440, details: '8 core tables, indexing active' },
  { id: 'external', label: 'External APIs', type: 'Stripe / Sendgrid', x: 500, y: 440, details: 'Webhooks connections enabled' }
];

const edges: EdgeMapItem[] = [
  { from: 'client', to: 'gateway' },
  { from: 'client', to: 'auth' },
  { from: 'gateway', to: 'auth' },
  { from: 'gateway', to: 'services' },
  { from: 'auth', to: 'services' },
  { from: 'services', to: 'db' },
  { from: 'services', to: 'external' }
];

export const CodebaseMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useMousePosition();
  const isReducedMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Independent floating offsets for each node to simulate a slow dynamic architecture map
  const [floatOffsets, setFloatOffsets] = useState<Record<string, { x: number; y: number }>>(() => ({
    client: { x: 0, y: 0 },
    gateway: { x: 0, y: 0 },
    auth: { x: 0, y: 0 },
    services: { x: 0, y: 0 },
    db: { x: 0, y: 0 },
    external: { x: 0, y: 0 }
  }));

  useEffect(() => {
    if (isReducedMotion) return;

    let animId: number;
    const startTime = Date.now();

    const updateFloat = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setFloatOffsets({
        client: { x: Math.sin(elapsed * 0.5) * 3, y: Math.cos(elapsed * 0.6) * 4 },
        gateway: { x: Math.cos(elapsed * 0.7) * 4, y: Math.sin(elapsed * 0.5) * 4 },
        auth: { x: Math.sin(elapsed * 0.6) * 4, y: Math.cos(elapsed * 0.5) * 4 },
        services: { x: Math.cos(elapsed * 0.5) * 3, y: Math.sin(elapsed * 0.7) * 4 },
        db: { x: Math.sin(elapsed * 0.4) * 2, y: Math.cos(elapsed * 0.5) * 3 },
        external: { x: Math.cos(elapsed * 0.5) * 2, y: Math.sin(elapsed * 0.4) * 3 }
      });
      animId = requestAnimationFrame(updateFloat);
    };

    updateFloat();
    return () => cancelAnimationFrame(animId);
  }, [isReducedMotion]);

  const getNodePosition = (node: NodeMapItem) => {
    const offset = floatOffsets[node.id] || { x: 0, y: 0 };
    return {
      x: node.x + offset.x,
      y: node.y + offset.y
    };
  };

  // State to track cursor proximity dynamically
  const [proximities, setProximities] = useState<Record<string, number>>(() => ({
    client: 0,
    gateway: 0,
    auth: 0,
    services: 0,
    db: 0,
    external: 0
  }));

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
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="architecture">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            Your Software, Mapped
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
            See the architecture behind the code.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            NEXORA turns complex repositories into understandable maps of relationships, dependencies, and system boundaries.
          </p>
        </div>

        {/* Large Centerpiece Map Container */}
        <div 
          ref={containerRef}
          className="relative max-w-5xl mx-auto bg-white border border-black/[0.045] rounded-3xl p-6 sm:p-10 shadow-[0_8px_36px_rgba(0,0,0,0.015)] aspect-[800/500] overflow-hidden"
        >
          {/* Service Boundary Boxes */}
          <div className="absolute top-[3%] left-[3%] p-2.5 rounded-lg border border-dashed border-black/[0.04] bg-neutral-50/50 text-[9px] font-mono text-neutral-400 select-none hidden sm:block">
            SYSTEM BOUNDARY: FRONTEND CORE
          </div>
          <div className="absolute top-[32%] left-[3%] p-2.5 rounded-lg border border-dashed border-black/[0.04] bg-neutral-50/50 text-[9px] font-mono text-neutral-400 select-none hidden sm:block">
            SYSTEM BOUNDARY: GATEWAY / SERVICES MESH
          </div>

          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible relative z-10"
          >
            {/* Edge Drawing */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const p1 = getNodePosition(fromNode);
              const p2 = getNodePosition(toNode);

              const proximityFrom = proximities[edge.from] || 0;
              const proximityTo = proximities[edge.to] || 0;
              const maxProximity = Math.max(proximityFrom, proximityTo);
              const isHovered = activeNode === edge.from || activeNode === edge.to;

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  {maxProximity > 0.1 && (
                    <motion.path
                      d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                      stroke="#3B82F6"
                      strokeWidth={1.5 + maxProximity * 2.5}
                      opacity={maxProximity * 0.35}
                      strokeLinecap="round"
                      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                  )}
                  <motion.path
                    d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                    stroke={isHovered ? '#2563EB' : maxProximity > 0 ? '#3B82F6' : 'rgba(17, 17, 17, 0.08)'}
                    strokeWidth={isHovered ? 1.5 : 1.1}
                    opacity={isHovered ? 1 : maxProximity > 0 ? 0.35 + maxProximity * 0.45 : 0.65}
                    strokeLinecap="round"
                    transition={{ duration: 0.3 }}
                  />
                </g>
              );
            })}

            {/* Node Mapping */}
            {nodes.map((node) => {
              const pos = getNodePosition(node);
              const proximity = proximities[node.id] || 0;
              const isFocused = activeNode === node.id || proximity > 0.4;
              const isBlue = isFocused;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                >
                  {/* Glowing halo ring */}
                  {proximity > 0.1 && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={18 + proximity * 12}
                      fill="none"
                      stroke={isBlue ? 'rgba(37, 99, 235, 0.22)' : 'rgba(17, 17, 17, 0.05)'}
                      strokeWidth={1 + proximity * 3}
                    />
                  )}

                  {/* Core Circle */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isFocused ? 9.5 : 7}
                    fill={isBlue ? '#2563EB' : '#FFFFFF'}
                    stroke={isBlue ? '#2563EB' : 'rgba(17, 17, 17, 0.28)'}
                    strokeWidth={2}
                    animate={{
                      scale: isFocused ? 1.25 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />

                  {/* Metadata Tag panel layout */}
                  <foreignObject
                    x={pos.x - 70}
                    y={pos.y + 14}
                    width={140}
                    height={55}
                    className="overflow-visible pointer-events-none select-none"
                  >
                    <div className="flex flex-col items-center justify-start text-center">
                      <span className={`text-[10px] md:text-[11px] font-sans font-semibold tracking-tight leading-none px-2 py-1 rounded transition-all duration-300 ${
                        isFocused
                          ? 'text-neutral-900 bg-neutral-100 shadow-sm border border-neutral-200/50'
                          : 'text-neutral-800 bg-transparent'
                      }`}>
                        {node.label}
                      </span>
                      <span className="text-[8px] md:text-[9px] font-sans text-neutral-400 mt-0.5 leading-none">
                        {node.type}
                      </span>
                      
                      {/* Detailed meta shown on hover */}
                      {isFocused && (
                        <motion.div
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100/50 text-[7.5px] font-mono text-blue-600 leading-none"
                        >
                          {node.details}
                        </motion.div>
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

        </div>

      </div>
    </section>
  );
};
export default CodebaseMap;
