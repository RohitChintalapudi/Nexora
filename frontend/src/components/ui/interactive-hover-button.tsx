import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  /**
   * `sweep` — the original ported behaviour: the label slides out while an
   *   arrow slides in, over a circle that wipes the fill across the button.
   * `fill`  — the background colour crossfades and nothing else moves. The
   *   label never translates, fades or swaps, so hovering reads as a colour
   *   change rather than a jitter.
   */
  variant?: "sweep" | "fill";
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    { text = "Button", className, variant = "sweep", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-36 cursor-pointer overflow-hidden rounded-full border p-2 text-center font-semibold select-none transition-colors duration-300",
          variant === "sweep" && "border-white/20 bg-white/10",
          className,
        )}
        {...props}
      >
        {variant === "sweep" ? (
          <>
            <span className="inline-block translate-x-2 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
              {text}
            </span>
            <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <span className="font-semibold">{text}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 transition-all duration-300 ease-out group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[2.5] group-hover:translate-y-0 group-hover:rounded-full group-hover:bg-blue-600"></div>
          </>
        ) : (
          <>
            <span className="relative z-10">{text}</span>
            {/* Positioned, not in flow: the arrow can never resize or recentre
                the label, and opacity-only keeps the layout byte-identical. */}
            <ArrowRight
              className="absolute right-3 top-1/2 z-10 w-3.5 h-3.5 -translate-y-1/2 -translate-x-1 text-current opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
              aria-hidden
            />
          </>
        )}
      </button>
    );
  },
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
