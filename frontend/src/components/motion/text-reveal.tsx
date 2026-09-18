"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextRevealProps {
  as?: React.ElementType;
  text: string | string[];
  className?: string;
  delay?: number;
  stagger?: number;
  blur?: number | string;
  yOffset?: string | number;
  duration?: number;
  once?: boolean;
  viewportAmount?: number | "some" | "all";
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  as: Component = "p",
  text,
  className,
  delay = 0,
  stagger = 0.04,
  blur = 6,
  yOffset = "20%",
  duration = 0.55,
  once = true,
  viewportAmount = 0.15,
  style,
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const blurPx = typeof blur === "number" ? blur : parseFloat(blur) || 6;

  const lines = useMemo(() => {
    if (Array.isArray(text)) {
      return text;
    }
    if (typeof text === "string") {
      return [text];
    }
    return [];
  }, [text]);

  // If text is not provided but children is a string
  const effectiveLines = useMemo(() => {
    if (lines.length > 0) return lines;
    if (typeof children === "string") return [children];
    return [];
  }, [lines, children]);

  // Compute total words and global word indices for fluid stagger sequence
  const processedLines = useMemo(() => {
    let wordCounter = 0;
    return effectiveLines.map((line) => {
      const words = line.split(/\s+/).filter(Boolean);
      const mappedWords = words.map((word) => {
        const index = wordCounter++;
        return {
          word,
          index,
        };
      });
      return mappedWords;
    });
  }, [effectiveLines]);

  if (effectiveLines.length === 0 && children) {
    return (
      <Component className={className} style={style}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={cn("select-text", className)}
      style={{
        ...style,
        willChange: "opacity, transform, filter",
      }}
    >
      {processedLines.map((lineWords, lineIdx) => {
        const isMultiLine = processedLines.length > 1;

        return (
          <span
            key={`line-${lineIdx}`}
            className={isMultiLine ? "block" : "inline"}
          >
            {lineWords.map(({ word, index }, wIdx) => {
              const wordDelay = delay + index * stagger;

              return (
                <React.Fragment key={`w-${lineIdx}-${index}-${word}`}>
                  <motion.span
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1, filter: "blur(0px)", y: 0 }
                        : { opacity: 0, filter: `blur(${blurPx}px)`, y: yOffset }
                    }
                    whileInView={
                      shouldReduceMotion
                        ? { opacity: 1, filter: "blur(0px)", y: 0 }
                        : { opacity: 1, filter: "blur(0px)", y: 0 }
                    }
                    viewport={{ once, amount: viewportAmount }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : duration,
                      delay: shouldReduceMotion ? 0 : wordDelay,
                      ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    style={{
                      display: "inline-block",
                      willChange: "opacity, transform, filter",
                    }}
                  >
                    {word}
                  </motion.span>
                  {wIdx < lineWords.length - 1 && " "}
                </React.Fragment>
              );
            })}
          </span>
        );
      })}
    </Component>
  );
};

export function TextRevealPreview() {
  const [key, setKey] = React.useState(0);

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center p-8 bg-[#09090b] rounded-2xl border border-white/10 text-white">
      <div key={key} className="flex flex-col gap-2">
        <TextReveal
          as="h2"
          text={["Motion that feels", "considered."]}
          className="text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl font-serif"
        />
        <TextReveal
          text="Word by word, with a soft blur."
          delay={0.9}
          stagger={0.05}
          blur={6}
          yOffset="20%"
          className="text-sm text-neutral-400 font-serif"
        />
      </div>

      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="inline-flex h-9 items-center rounded-full border border-white/20 bg-white/10 px-4 text-xs font-medium text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        Replay
      </button>
    </div>
  );
}

export default TextReveal;
