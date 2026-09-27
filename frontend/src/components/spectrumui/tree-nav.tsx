"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  AnchorHTMLAttributes,
  ComponentType,
  ElementType,
  MouseEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";

export interface TreeNavItem {
  label: string;
  href: string;
  /** Small pill after the label, e.g. "New". */
  badge?: string;
  /** Icon rendered before the label. */
  icon?: ElementType;
  /** Opens in a new tab. */
  external?: boolean;
}

type LinkComponent =
  | "a"
  | ComponentType<
      AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
    >;

export interface TreeNavProps {
  items: TreeNavItem[];
  /** href of the current page; the marker and background rest on this row. */
  activeHref?: string;
  /** Slide the marker and background to the hovered row and spring back on leave. */
  followHover?: boolean;
  /** Element used for links, e.g. Next's Link. Defaults to a plain anchor. */
  linkComponent?: LinkComponent;
  onSelect?: (item: TreeNavItem, event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

const MARKER = 7;
/** Horizontal centre of the rail inside the 24px gutter. */
const RAIL_X = 10;

// Critically damped (no overshoot) with a ~0.3s response: Apple's default for
// repositioning UI, tightened a little for a hover highlight. Springs re-target from the live value and carry velocity,
// so sweeping the pointer down the list never stutters or snaps.
const GLIDE = { type: "spring", visualDuration: 0.22, bounce: 0 } as const;
const FADE = { duration: 0.12, ease: "easeOut" } as const;

export function TreeNav({
  items,
  activeHref,
  followHover = true,
  linkComponent: Link = "a",
  onSelect,
  className,
}: TreeNavProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const centersRef = useRef<number[]>([]);
  const hoveredRef = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const activeIndex = items.findIndex((item) => item.href === activeHref);
  // Handlers and the measurer read these through refs so they never go stale
  // and never need to be re-created; the sync runs before the measure effect.
  const reducedRef = useRef(reduced);
  const activeRef = useRef(activeIndex);
  useLayoutEffect(() => {
    reducedRef.current = reduced;
    activeRef.current = activeIndex;
  });

  // Rail length is the only measurement that renders; everything that moves is
  // a motion value, so hovering never re-renders the list.
  const [end, setEnd] = useState(0);

  const centerY = useMotionValue(0);
  const visibility = useMotionValue(0);
  const markerY = useTransform(centerY, (v) => v - MARKER / 2);
  const accentScale = useTransform(centerY, (v) =>
    end > 0 ? Math.min(1, v / end) : 0,
  );

  const moveTo = useCallback(
    (index: number | null, immediate = false) => {
      const centers = centersRef.current;
      if (index === null || index < 0 || index >= centers.length) {
        animate(visibility, 0, FADE);
        return;
      }
      const target = centers[index];
      // Coming back from hidden: appear on the row instead of travelling from
      // wherever the marker was last parked.
      const jump = immediate || reducedRef.current || visibility.get() < 0.05;
      if (jump) centerY.jump(target);
      else animate(centerY, target, GLIDE);
      animate(visibility, 1, FADE);
    },
    [centerY, visibility],
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const next = rowRefs.current
        .slice(0, items.length)
        .map((el) => (el ? el.offsetTop + el.offsetHeight / 2 : 0));
      centersRef.current = next;
      setEnd(next.length > 0 ? next[next.length - 1] : 0);
      // A re-measure is a layout change, not motion: settle instantly.
      moveTo(hoveredRef.current ?? activeRef.current, true);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [items.length, moveTo]);

  // Route changes glide; a hover in progress keeps priority.
  useEffect(() => {
    if (hoveredRef.current === null) moveTo(activeIndex);
  }, [activeIndex, moveTo]);

  const enter = (index: number) => {
    if (!followHover) return;
    hoveredRef.current = index;
    moveTo(index);
  };
  const leave = () => {
    if (!followHover) return;
    hoveredRef.current = null;
    moveTo(activeRef.current);
  };

  return (
    <ul
      ref={listRef}
      className={cn("relative flex flex-col gap-0.5 ps-6", className)}
      onPointerLeave={leave}
    >
      {/* Tree rail with a dot terminal, an accent run that grows to the marked
          row, and the diamond marker. All motion is transform + opacity. */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-5">
        <span
          className="absolute top-0 w-px bg-slate-200 dark:bg-slate-800"
          style={{ insetInlineStart: RAIL_X - 0.5, height: end }}
        />
        <span
          className="absolute size-1 rounded-full bg-slate-200 dark:bg-slate-800"
          style={{ insetInlineStart: RAIL_X - 2, top: end - 2 }}
        />
        <motion.span
          className="absolute top-0 w-px origin-top bg-slate-900 will-change-transform dark:bg-slate-100"
          style={{
            insetInlineStart: RAIL_X - 0.5,
            height: end,
            scaleY: accentScale,
            opacity: visibility,
          }}
        />
        <motion.span
          className="absolute top-0 rounded-[1px] bg-slate-900 will-change-transform dark:bg-slate-100"
          style={{
            insetInlineStart: RAIL_X - MARKER / 2,
            width: MARKER,
            height: MARKER,
            y: markerY,
            rotate: 45,
            opacity: visibility,
          }}
        />
      </span>

      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const Icon = item.icon;
        return (
          <li
            key={item.href}
            ref={(el) => {
              rowRefs.current[index] = el;
            }}
            className="relative"
            onPointerEnter={() => enter(index)}
          >
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              aria-current={isActive ? "page" : undefined}
              onClick={onSelect ? (event) => onSelect(item, event) : undefined}
              onFocus={() => enter(index)}
              onBlur={leave}
              className={cn(
                "flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] leading-5 antialiased transition-colors duration-150 ease-out",
                // Hover paints the same solid black as the selected row, in pure
                // CSS, so it can never fall out of step with the rail above.
                isActive
                  ? "bg-slate-900 font-medium text-white shadow-[0_2px_8px_rgba(15,23,42,0.28)] dark:bg-slate-100 dark:text-slate-900"
                  : "font-normal text-slate-500 hover:bg-slate-900 hover:text-white hover:shadow-[0_2px_8px_rgba(15,23,42,0.28)] dark:text-slate-400 dark:hover:bg-slate-100 dark:hover:text-slate-900",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-150 ease-out",
                    isActive
                      ? "text-white dark:text-slate-900"
                      : "text-slate-400 hover:text-white dark:hover:text-slate-900",
                  )}
                />
              )}
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "inline-flex h-[18px] shrink-0 items-center rounded-[6px] px-[5px] text-xs font-medium leading-none transition-colors duration-150 ease-out",
                    isActive
                      ? "bg-white/15 text-white dark:bg-slate-900/10 dark:text-slate-900"
                      : "bg-slate-900/10 text-slate-700 hover:bg-white/15 hover:text-white dark:bg-slate-100/15 dark:text-slate-300 dark:hover:bg-slate-900/10 dark:hover:text-slate-900",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}