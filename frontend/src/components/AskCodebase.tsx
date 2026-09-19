import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode2, Sparkles, ArrowRight } from 'lucide-react';
import { TextReveal } from './motion/text-reveal';

interface MockResponse {
  question: string;
  badge: string;
  files: { path: string; lines: string }[];
  explanation: string;
  code: string;
}

export const AskCodebase: React.FC = () => {
  const questions = [
    "Which files depend on PaymentService?",
    "Where is user authentication implemented?",
    "What could break if I modify the order schema?",
    "How does the webhook signature verify?"
  ];

  const mockData: Record<string, MockResponse> = {
    "Which files depend on PaymentService?": {
      question: "Which files depend on PaymentService?",
      badge: "AST Symbol Resolution",
      files: [
        { path: "src/services/PaymentService.ts", lines: "L12-L45" },
        { path: "src/controllers/BillingController.ts", lines: "L8-L24" },
        { path: "src/jobs/InvoiceJob.ts", lines: "L31-L50" }
      ],
      explanation: "PaymentService is referenced across 2 controllers and 1 async queue job. Updating PaymentService.processPayment requires updating the checkout pipeline in BillingController and retry handlers in InvoiceJob.",
      code: `// src/controllers/BillingController.ts
import { PaymentService } from '../services/PaymentService';

export const handleCheckout = async (req: Request, res: Response) => {
  const { amount, token } = req.body;
  const transaction = await PaymentService.processPayment({ amount, token });
  return res.json({ success: true, transactionId: transaction.id });
};`
    },
    "Where is user authentication implemented?": {
      question: "Where is user authentication implemented?",
      badge: "Middleware & JWT Tracing",
      files: [
        { path: "src/middleware/JWTMiddleware.ts", lines: "L1-L15" },
        { path: "src/controllers/AuthController.ts", lines: "L18-L62" },
        { path: "src/services/AuthService.ts", lines: "L40-L88" }
      ],
      explanation: "User authentication uses JSON Web Tokens (JWT). Inbound HTTP requests are intercepted by JWTMiddleware, which decrypts bearer tokens and validates user sessions before invoking controllers.",
      code: `// src/middleware/JWTMiddleware.ts
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  req.user = jwt.verify(token, process.env.JWT_SECRET!);
  next();
};`
    },
    "What could break if I modify the order schema?": {
      question: "What could break if I modify the order schema?",
      badge: "Schema Dependency Graph",
      files: [
        { path: "src/types/index.ts", lines: "L74-L82" },
        { path: "src/database/schema.sql", lines: "L104-L120" },
        { path: "src/controllers/OrderController.ts", lines: "L22-L55" }
      ],
      explanation: "Modifying the Order interface directly impacts SQL serialization in OrderController, TypeScript type checks across 4 endpoints, and outbound email receipt templates in NotificationService.",
      code: `// src/types/index.ts
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  status: 'pending' | 'completed' | 'failed'; // Modifying breaks downstream logic
}`
    },
    "How does the webhook signature verify?": {
      question: "How does the webhook signature verify?",
      badge: "Cryptographic Payload Trace",
      files: [
        { path: "src/controllers/WebhookController.ts", lines: "L14-L35" },
        { path: "src/services/StripeService.ts", lines: "L52-L78" }
      ],
      explanation: "Webhooks verify HMAC payload integrity using Stripe's raw request headers and a secret signing key. The raw request body buffer is preserved to prevent payload tampering and signature mismatch.",
      code: `// src/controllers/WebhookController.ts
import { StripeService } from '../services/StripeService';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const event = StripeService.constructEvent(req.rawBody, sig, process.env.STRIPE_SECRET!);
  return res.json({ received: true });
};`
    }
  };

  const [selectedQuestion, setSelectedQuestion] = useState<string>(questions[0]);
  const activeData = mockData[selectedQuestion];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] content-layer" id="intelligence">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-3">
            AI Codebase Intelligence
          </span>
          <TextReveal
            as="h2"
            text="Ask questions. Get answers from your actual code."
            delay={0.05}
            stagger={0.045}
            blur={6}
            yOffset="20%"
            className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-3"
          />
          <TextReveal
            as="p"
            text="NEXORA reads files, traces definitions, and tracks dependencies so that every answer is grounded in the structural context of your actual repository."
            delay={0.3}
            stagger={0.02}
            blur={5}
            yOffset="15%"
            className="text-neutral-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto"
          />
        </div>

        {/* AI Workspace Mockup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto items-stretch">
          
          {/* Left Panel: Selectable Questions */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block px-1 mb-0.5">
              Select an Inquiry
            </span>
            {questions.map((q) => {
              const isSelected = selectedQuestion === q;
              return (
                <button
                  key={q}
                  onClick={() => setSelectedQuestion(q)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-sans transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-blue-500/40 text-blue-600 shadow-[0_4px_16px_rgba(37,99,235,0.08)] font-semibold'
                      : 'bg-white/60 border-black/[0.05] text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  <span className="leading-snug">{q}</span>
                  {isSelected ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Panel: Code Workspace Response */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="code-panel-dark p-5 sm:p-6 rounded-2xl flex flex-col shadow-xl border border-white/[0.08] bg-[#0c0c0e] min-h-[410px] justify-between">
              
              {/* Question Label Header */}
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    <span className="text-[11px] font-mono text-white/40 ml-1.5">nexora-intelligence</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Grounded &bull; 240ms
                  </span>
                </div>

                {/* Animated Question Content with Fade Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedQuestion}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="space-y-3.5"
                  >
                    {/* Explanation text */}
                    <p className="text-xs sm:text-[13px] font-sans text-neutral-200 leading-relaxed font-normal">
                      {activeData.explanation}
                    </p>

                    {/* Grounded Files List */}
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-[10px] uppercase font-bold text-white/40 mr-1 select-none">
                        Grounded Files:
                      </span>
                      {activeData.files.map((file) => (
                        <span
                          key={file.path}
                          className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-blue-300 font-medium inline-flex items-center gap-1"
                        >
                          <FileCode2 className="w-3 h-3 text-blue-400" />
                          <span>{file.path.split('/').pop()}</span>
                          <span className="text-[9px] text-white/40">{file.lines}</span>
                        </span>
                      ))}
                    </div>

                    {/* Accurate Code Snippet Box with generous height and no cutoff */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#050507] p-3.5 sm:p-4 overflow-x-auto">
                      <pre className="font-mono text-xs sm:text-[12.5px] text-neutral-200 leading-relaxed m-0">
                        <code>{activeData.code}</code>
                      </pre>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Terminal Footer Status Bar */}
              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40 select-none">
                <span className="flex items-center gap-1.5 text-blue-400/90">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>{activeData.badge}</span>
                </span>
                <span>Synthesized via AST &amp; Vector Index</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AskCodebase;
