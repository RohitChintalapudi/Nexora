import type { HTMLAttributes } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Enables the shimmer sweep. Defaults to true.
   * Set to false for a static, pulse-free fill.
   */
  shimmer?: boolean;
}

/**
 * Shape-agnostic loading placeholder. Size it with utility classes:
 * `<Skeleton className="h-4 w-32 rounded-full" />`.
 *
 * The element is always `aria-hidden`; the surrounding region should expose
 * the busy state (for example `aria-busy` on a live region).
 */
export function Skeleton({
  shimmer = true,
  className,
  ...props
}: SkeletonProps) {
  const reduce = useReducedMotion() ?? false;
  const animated = shimmer && !reduce;

  return (
    <div
      {...props}
      aria-hidden="true"
      data-slot="skeleton"
      data-shimmer={animated ? "true" : "false"}
      className={cn(
        "relative overflow-hidden rounded-md bg-slate-200/70",
        animated && "skeleton-shimmer",
        className,
      )}
    />
  );
}

export default Skeleton;
