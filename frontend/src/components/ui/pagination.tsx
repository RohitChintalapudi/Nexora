import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** Current active page (1-based). Controlled value. */
  page: number;
  /** Total number of pages available. */
  totalPages: number;
  /** Called with the requested page when the reader navigates. */
  onPageChange: (page: number) => void;
  /** How many page numbers to render on each side of the active page. Default 1. */
  siblingCount?: number;
  /** Disables every control, e.g. while the next page is loading. */
  disabled?: boolean;
  className?: string;
}

const ELLIPSIS_START = "ellipsis-start";
const ELLIPSIS_END = "ellipsis-end";

type PaginationItem = number | typeof ELLIPSIS_START | typeof ELLIPSIS_END;

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Builds the page list with smart ellipsis for large ranges.
 * Mirrors the familiar pagination pattern: first, last, the current page,
 * `siblingCount` neighbours on each side, and at most two ellipsis gaps.
 */
export function getPaginationRange(
  page: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] {
  // first + last + current + 2 * siblings + 2 ellipsis slots
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, 3 + siblingCount * 2);
    return [...leftRange, ELLIPSIS_END, totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(totalPages - (2 + siblingCount * 2), totalPages);
    return [1, ELLIPSIS_START, ...rightRange];
  }

  return [
    1,
    ELLIPSIS_START,
    ...range(leftSibling, rightSibling),
    ELLIPSIS_END,
    totalPages,
  ];
}

const controlClassName =
  "relative inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Accessible, controlled pagination with a spring-animated active indicator.
 * Respects `prefers-reduced-motion` by showing the indicator instantly.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  disabled = false,
  className,
}: PaginationProps) {
  const reduce = useReducedMotion() ?? false;
  const indicatorId = useId();

  if (totalPages <= 1) return null;

  const items = getPaginationRange(page, totalPages, siblingCount);
  const canGoPrev = page > 1 && !disabled;
  const canGoNext = page < totalPages && !disabled;

  const goTo = (next: number) => {
    if (disabled) return;
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (clamped !== page) onPageChange(clamped);
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1 sm:gap-1.5", className)}
    >
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={!canGoPrev}
        aria-label="Go to previous page"
        className={cn(
          controlClassName,
          "border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {items.map((item) => {
        if (typeof item !== "number") {
          return (
            <span
              key={item}
              aria-hidden="true"
              className="inline-flex h-9 w-9 select-none items-center justify-center text-xs font-bold text-slate-400"
            >
              &hellip;
            </span>
          );
        }

        const isActive = item === page;

        return (
          <button
            key={item}
            type="button"
            onClick={() => goTo(item)}
            disabled={disabled}
            aria-label={`Go to page ${item}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              controlClassName,
              isActive
                ? "text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {isActive ? (
              <motion.span
                aria-hidden="true"
                layoutId={`pagination-active-${indicatorId}`}
                className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_2px_10px_rgba(37,99,235,0.35)]"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34, mass: 0.6 }
                }
              />
            ) : null}
            <span className="relative z-10">{item}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={!canGoNext}
        aria-label="Go to next page"
        className={cn(
          controlClassName,
          "border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;
