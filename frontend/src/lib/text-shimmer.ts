import type { CSSProperties } from 'react';

export const TEXT_SHIMMER_CLASS_NAME = "text-shimmer-effect";

export const TEXT_SHIMMER_KEYFRAMES = `
@keyframes text-shimmer-kf {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.text-shimmer-effect {
  background-size: 200% 100%;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  display: inline-block;
  animation: text-shimmer-kf var(--shimmer-duration, 2.5s) ease-in-out infinite;
}
`;

export function textShimmerStyle(
  duration = 2.5,
  baseColor?: string,
  highlightColor?: string
): CSSProperties {
  return {
    ['--shimmer-duration' as any]: `${duration}s`,
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    backgroundImage: `linear-gradient(
      110deg,
      ${baseColor || 'var(--text-shimmer-base, rgba(150, 150, 150, 0.4))'} 0%,
      ${baseColor || 'var(--text-shimmer-base, rgba(150, 150, 150, 0.4))'} 35%,
      ${highlightColor || 'var(--text-shimmer-highlight, #ffffff)'} 50%,
      ${baseColor || 'var(--text-shimmer-base, rgba(150, 150, 150, 0.4))'} 65%,
      ${baseColor || 'var(--text-shimmer-base, rgba(150, 150, 150, 0.4))'} 100%
    )`,
  };
}
