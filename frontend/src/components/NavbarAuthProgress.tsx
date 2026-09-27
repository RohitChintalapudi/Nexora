import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { getAuthStatusMessages } from "@/lib/auth-status-messages";
import { useRotatingStatus } from "@/lib/hooks/use-rotating-status";
import { TextShimmer } from "./motion/text-shimmer";
import type { AuthActionType } from "../context/AuthContext";

const ROTATE_MS = 2000;

const DOTS = [0, 160, 320];

interface NavbarAuthProgressProps {
  action: AuthActionType;
}

/**
 * Dynamic island auth state: an indeterminate ring, a sweeping progress rail
 * and a status line that keeps rotating until the request settles. Each text
 * swap crossfades with a slide + blur so the copy change reads as motion, not
 * as a flicker.
 */
export const NavbarAuthProgress: React.FC<NavbarAuthProgressProps> = ({ action }) => {
  const messages = useMemo(() => getAuthStatusMessages(action), [action]);
  const message = useRotatingStatus(messages, ROTATE_MS);

  return (
    <motion.div
      className="flex items-center justify-center gap-3 sm:gap-3.5"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={SPRING_LAYOUT}
    >
      {/* Indeterminate progress ring */}
      <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-6 w-6">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="3"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="16 78"
            style={{ originX: "50%", originY: "50%" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
          />
        </svg>
        <span className="absolute h-2 w-2 rounded-full bg-blue-400/60 animate-ping" />
      </div>

      {/* Rotating status line — fixed slot so the island never resizes on swap */}
      <div className="relative h-[22px] w-[186px] sm:w-[236px] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="absolute inset-0 flex items-center justify-center gap-1.5"
          >
            <TextShimmer
              duration={2.4}
              baseColor="rgba(212,212,216,0.45)"
              highlightColor="#ffffff"
              className="max-w-full truncate text-center text-sm font-medium sm:text-[15px]"
            >
              {message}
            </TextShimmer>
            <span className="inline-flex flex-shrink-0 items-center gap-1">
              {DOTS.map((delay) => (
                <motion.span
                  key={delay}
                  className="h-1 w-1 rounded-full bg-blue-400"
                  animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay / 1000,
                  }}
                />
              ))}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NavbarAuthProgress;
