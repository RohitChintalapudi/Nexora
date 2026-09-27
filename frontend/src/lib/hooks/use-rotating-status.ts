import { useEffect, useState } from "react";

/**
 * Cycles through `items` on an interval and never settles. The position resets
 * whenever the source list is replaced (a new auth action) so rotation always
 * restarts from the top.
 */
export function useRotatingStatus(
  items: string[],
  intervalMs = 2200,
  active = true
): string {
  const [cursor, setCursor] = useState({ index: 0, source: items });

  // Render-phase reset: cheaper and safer than an effect that calls setState.
  if (cursor.source !== items) {
    setCursor({ index: 0, source: items });
  }

  useEffect(() => {
    if (!active || items.length < 2) return;
    const id = window.setInterval(() => {
      setCursor((prev) => ({
        source: items,
        index: (prev.index + 1) % items.length,
      }));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items, intervalMs, active]);

  const index = cursor.source === items ? cursor.index : 0;
  return items[index] ?? items[0] ?? "";
}
