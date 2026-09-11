import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-36 cursor-pointer overflow-hidden rounded-full border border-white/20 bg-white/10 p-2 text-center font-semibold select-none transition-colors duration-300 hover:bg-blue-600 hover:border-blue-600",
        className,
      )}
      {...props}
    >
      <span className="inline-block translate-x-2 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span className="font-semibold">{text}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 transition-all duration-300 ease-out group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[2.5] group-hover:translate-y-0 group-hover:rounded-full group-hover:bg-blue-600"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
