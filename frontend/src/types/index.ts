export interface MousePosition {
  x: number;
  y: number;
}

export interface FloatingInsightProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // Parallax intensity factor
  tiltMax?: number; // Maximum 3D rotation in degrees
}

export interface ParticleConfig {
  count: number;
  connectionDistance: number;
  repulsionRadius: number;
  repulsionForce: number;
  baseSpeed: number;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  isActive?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface ProductFeature {
  id: string;
  title: string;
  tagline: string;
  description: string;
}
