/**
 * Blue neon glow for primary CTA labels and icons.
 *
 * Apply these to the *label/icon* elements, never to the button itself: the
 * buttons render a dark pill background, and a drop shadow on the button would
 * shadow that pill rather than the text. Pair with `group` on the button plus a
 * `hover:text-blue-*` colour so the whole row lights up from one hover.
 */

/** For labels sitting on a dark pill — light blue reads best on black. */
export const GLOW_BLUE =
  "group-hover:drop-shadow-[0_0_5px_rgba(96,165,250,0.95),0_0_14px_rgba(37,99,235,0.8)]";

/** For labels on a light surface — needs a deeper, tighter falloff to show. */
export const GLOW_BLUE_SOFT =
  "group-hover:drop-shadow-[0_0_4px_rgba(37,99,235,0.4),0_0_12px_rgba(37,99,235,0.25)]";

/** Shared transition so the glow ramps in instead of snapping. */
export const GLOW_TRANSITION = "transition-[color,filter] duration-300 ease-out";
