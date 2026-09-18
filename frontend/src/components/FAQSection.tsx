import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TextReveal } from './motion/text-reveal';
import { NumberTicker } from './motion/number-ticker';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: "01 — How long would it take you to understand a codebase you didn't build?",
      answer: "NEXORA gives you an instant structured starting point — mapping technologies, component connections, entry points, and request flows so you start with the system's mental model instead of reading files blindly.",
    },
    {
      question: "02 — Does NEXORA just throw my code into an AI model?",
      answer: "No. NEXORA first performs deterministic structural analysis — extracting AST symbols, routes, and dependency relationships — and retrieves verified context before asking AI to interpret it.",
    },
    {
      question: "03 — What happens when the codebase has thousands of files?",
      answer: "NEXORA filters noise, extracts structural patterns, and chunks meaningful semantic boundaries so you can understand large multi-service architectures without reading thousands of files.",
    },
    {
      question: "04 — Can I trust what NEXORA tells me about my code?",
      answer: "Deterministic facts come directly from the code's AST structure, while AI interpretations are grounded in retrieved source context. When evidence isn't strong enough, NEXORA surfaces that uncertainty directly.",
    },
    {
      question: "05 — What if I join a project tomorrow that I've never seen before?",
      answer: "Connect the repository and NEXORA immediately maps the architecture, APIs, data flows, entry points, and important files — giving you a clear onboarding roadmap from day one.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] content-layer" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            FAQ
          </span>
          <TextReveal
            as="h2"
            text="Frequently Asked Questions"
            delay={0.05}
            stagger={0.05}
            blur={6}
            yOffset="20%"
            className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12]"
          />
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.07,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="bg-white border border-black/[0.045] rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.005)]"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-serif font-semibold text-base sm:text-lg text-neutral-900 hover:text-neutral-950 transition-colors select-none cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-neutral-400 font-mono text-sm">
                      <NumberTicker value={idx + 1} pad={2} blur duration={0.9} />
                    </span>
                    <span className="text-neutral-300 font-mono text-sm">—</span>
                    <span>{faq.question.replace(/^\d+\s*—\s*/, '')}</span>
                  </span>
                  <span className={`text-sm text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
                    ▼
                  </span>
                </button>

                <div
                  className={`accordion-content border-t border-black/[0.02] px-5 sm:px-6 bg-neutral-50/30 ${
                    isOpen ? 'open py-5' : ''
                  }`}
                >
                  <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-serif whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
export default FAQSection;
