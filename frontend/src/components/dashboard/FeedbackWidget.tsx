"use client";
import {
  Angry,
  Check,
  Frown,
  Laugh,
  Loader2,
  MessageSquareHeart,
  Smile,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FEEDBACK_OPTIONS = [
  { happiness: 4, emoji: Laugh, color: "text-green-600", activeColor: "text-green-600", label: "Love it" },
  { happiness: 3, emoji: Smile, color: "text-green-400", activeColor: "text-green-500", label: "Pretty good" },
  { happiness: 2, emoji: Frown, color: "text-yellow-500", activeColor: "text-yellow-500", label: "Needs work" },
  { happiness: 1, emoji: Angry, color: "text-red-500", activeColor: "text-red-600", label: "Frustrated" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.04
    }
  },
  exit: { opacity: 0, y: 24, scale: 0.96, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export const FeedbackWidget: React.FC = () => {
  const { token } = useAuth();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [happiness, setHappiness] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!happiness && textRef.current) {
      textRef.current.value = "";
    }
  }, [happiness]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const resetWidget = () => {
    setHappiness(null);
    setSubmitted(false);
    setSubmitError(null);
    if (textRef.current) textRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!happiness) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const currentToken = token || localStorage.getItem('nexora_token');
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken || ''}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          happiness,
          feedback: textRef.current?.value || "",
          page: window.location.pathname.startsWith('/repositories') ? 'repositories' : 'dashboard'
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || `Request failed (HTTP ${res.status})`);
      }

      setSubmitted(true);
      window.setTimeout(() => {
        resetWidget();
        setIsOpen(false);
      }, 2400);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit feedback.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = FEEDBACK_OPTIONS.find((o) => o.happiness === happiness);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="feedback-panel"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-[340px] max-w-[calc(100vw-2.5rem)] origin-bottom-right"
          >
            <motion.div
              className="overflow-hidden border border-slate-200/90 rounded-3xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Love our service?
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {selectedOption?.label ? `You selected: ${selectedOption.label}` : 'Tap an emoji to get started'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close feedback"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4">
                {!submitted ? (
                  <>
                    {/* Emoji rating row */}
                    <div className="flex items-center justify-center gap-1">
                      {FEEDBACK_OPTIONS.map((option) => {
                        const EmojiIcon = option.emoji;
                        const isSelected = happiness === option.happiness;
                        return (
                          <button
                            key={option.happiness}
                            type="button"
                            onClick={() =>
                              setHappiness((prev) =>
                                option.happiness === prev ? null : option.happiness,
                              )
                            }
                            aria-label={option.label}
                            className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-full transition-all scale-100",
                              isSelected
                                ? option.activeColor
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                            )}
                          >
                            <EmojiIcon size={22} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Expandable textarea */}
                    <motion.div
                      aria-hidden={happiness ? false : true}
                      initial={{ height: 0, y: 12, opacity: 0 }}
                      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.28 }}
                      animate={happiness ? { height: "auto", y: 0, opacity: 1 } : {}}
                      className="px-1"
                    >
                      <textarea
                        ref={textRef}
                        placeholder="Tell us what we can improve..."
                        className="mt-3 min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />

                      {submitError && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
                          {submitError}
                        </div>
                      )}

                      <div className="mt-2 flex h-fit w-full items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!happiness || isSubmitting}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 rounded-lg border bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer disabled:cursor-not-allowed",
                            isSubmitting || !happiness
                              ? "bg-slate-300 border-slate-200 text-slate-500"
                              : "hover:bg-blue-700 active:scale-[0.98] shadow-[0_4px_14px_rgba(37,99,235,0.3)]",
                          )}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex h-full w-full flex-col items-center justify-start gap-2 py-6 text-sm font-normal"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full bg-blue-600"
                    >
                      <Check strokeWidth={2.5} size={18} className="stroke-white" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="font-bold text-slate-900">
                      Your feedback has been received!
                    </motion.div>
                    <motion.div variants={itemVariants} className="text-xs text-slate-500">
                      Thank you for helping improve NEXORA.
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating circular trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close feedback" : "Submit feedback"}
        className={cn(
          "group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
          isOpen
            ? "bg-slate-900 hover:bg-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.35)]"
            : "bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'heart'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            {isOpen ? (
              <X className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <MessageSquareHeart className="w-6 h-6" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
};