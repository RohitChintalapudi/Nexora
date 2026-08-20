import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: 'What is NEXORA?',
      answer: 'NEXORA is an AI-powered workspace that helps developers understand their entire software project, instead of just behaving like a generic chatbot console.',
    },
    {
      question: 'Can NEXORA analyze my GitHub repository?',
      answer: 'Yes. Connecting your GitHub repositories and indexing codebase trees, logic structures, and dependency connections are core parts of the platform.',
    },
    {
      question: 'Is NEXORA another AI coding assistant?',
      answer: 'No. Traditional assistants help you write inline code snippets or answer generic syntax questions. NEXORA focuses on understanding code architecture, relationships, API boundaries, and database dependencies system-wide.',
    },
    {
      question: 'What can I ask NEXORA?',
      answer: 'You can ask questions about system architecture design, dependencies routes, token credentials paths, JWT structures, API connections, database queries, and impact forecasts before modifying files.',
    },
    {
      question: 'Can my team use NEXORA?',
      answer: 'Team collaboration is a major milestone on our roadmap. Shared workspace diagrams and synchronized codebase graphs will be introduced as collaboration features mature.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12]">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-black/[0.045] rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.005)]"
              >
                {/* Header Toggle Trigger */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-sans font-medium text-sm sm:text-base text-neutral-800 hover:text-neutral-950 transition-colors select-none"
                >
                  <span>{faq.question}</span>
                  <span className={`text-xs text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Answer Content Panel */}
                <div
                  className={`accordion-content border-t border-black/[0.02] px-5 bg-neutral-50/30 ${
                    isOpen ? 'open py-5' : ''
                  }`}
                >
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-sans">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
export default FAQSection;
