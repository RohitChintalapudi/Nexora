import React, { useState } from 'react';

interface MockResponse {
  question: string;
  logs: string[];
  files: string[];
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
      logs: [
        "Index mapping active: 147 files indexed",
        "AST search: identifying references to symbol 'PaymentService'",
        "Resolving static imports: found 3 direct mappings"
      ],
      files: [
        "src/services/PaymentService.ts",
        "src/controllers/BillingController.ts",
        "src/jobs/InvoiceJob.ts"
      ],
      explanation: "PaymentService is imported and initialized in two core files. It interfaces with the Stripe API client. If you update the signature of PaymentService.processPayment, you will need to refactor the caller methods in BillingController and the retry payload in InvoiceJob.",
      code: `// src/controllers/BillingController.ts
import { PaymentService } from '../services/PaymentService';

export const handleCheckout = async (req: Request, res: Response) => {
  const { amount, token } = req.body;
  const transaction = await PaymentService.processPayment({
    amount,
    token,
    currency: 'inr'
  });
  return res.json({ success: true, transactionId: transaction.id });
};`
    },
    "Where is user authentication implemented?": {
      question: "Where is user authentication implemented?",
      logs: [
        "Resolving routes map...",
        "Identifying security middleware...",
        "Found 2 auth decorators in controllers"
      ],
      files: [
        "src/controllers/AuthController.ts",
        "src/middleware/JWTMiddleware.ts",
        "src/services/AuthService.ts"
      ],
      explanation: "User authentication uses JSON Web Tokens (JWT). Routes are secured using the JWTMiddleware, which decrypts token headers and validates sessions against the database.",
      code: `// src/middleware/JWTMiddleware.ts
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  
  const verified = jwt.verify(token, process.env.JWT_SECRET!);
  req.user = verified;
  next();
};`
    },
    "What could break if I modify the order schema?": {
      question: "What could break if I modify the order schema?",
      logs: [
        "AST search: identifying usage of Interface 'Order'",
        "Trace path: Order model ➔ Database mapper ➔ OrderController",
        "Found 7 potential impact points"
      ],
      files: [
        "src/types/index.ts",
        "src/database/schema.sql",
        "src/controllers/OrderController.ts",
        "src/services/NotificationService.ts"
      ],
      explanation: "Modifying the order schema impacts Database bindings, JSON deserializers inside OrderController, and notification payloads inside NotificationService. Review the dependent files listed below.",
      code: `// src/types/index.ts
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  status: 'pending' | 'completed' | 'failed'; // Modifying status breaks schema
  createdAt: Date;
}`
    },
    "How does the webhook signature verify?": {
      question: "How does the webhook signature verify?",
      logs: [
        "Searching route patterns: /webhooks/*",
        "Locating crypto verification libraries...",
        "Grounded: signature checks mapped to Stripe Webhook API"
      ],
      files: [
        "src/controllers/WebhookController.ts",
        "src/services/StripeService.ts"
      ],
      explanation: "Webhooks verify payload integrity using Stripe's raw request headers and a secret signing token. The raw body is buffered to prevent verification failures.",
      code: `// src/controllers/WebhookController.ts
import { StripeService } from '../services/StripeService';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const event = StripeService.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  
  await handleEvent(event);
  return res.json({ received: true });
};`
    }
  };

  const [selectedQuestion, setSelectedQuestion] = useState<string>(questions[0]);
  const activeData = mockData[selectedQuestion];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="intelligence">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            AI Codebase Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
            Ask questions. Get answers from your actual code.
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            NEXORA reads files, traces definitions, and tracks dependencies so that every answer is grounded in the structural context of your actual repository.
          </p>
        </div>

        {/* AI Workspace Mockup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          
          {/* Left Panel: Selectable Questions */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 block px-1.5">
              Select an Inquiry
            </span>
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuestion(q)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-sans font-medium transition-all duration-300 cursor-pointer ${
                  selectedQuestion === q
                    ? 'bg-white border-blue-500/20 text-blue-600 shadow-[0_2px_12px_rgba(37,99,235,0.03)]'
                    : 'bg-white/40 border-black/[0.03] text-neutral-500 hover:text-neutral-800 hover:bg-white/80'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Right Panel: Code Workspace Response */}
          <div className="lg:col-span-8">
            <div className="code-panel-dark p-4 sm:p-6 rounded-2xl flex flex-col min-h-[380px] shadow-lg">
              
              {/* Question Label Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] font-mono text-white/40">workspace: nexora-ai-session</span>
              </div>

              {/* Console Logs */}
              <div className="font-mono text-[9px] text-emerald-500/80 space-y-1 bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg mb-4 select-none">
                {activeData.logs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-white/30">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              {/* Explanatory Content */}
              <div className="text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed mb-4">
                {activeData.explanation}
              </div>

              {/* Grounded Files List */}
              <div className="mb-4">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/30 block mb-2 select-none">
                  Grounded Context Files
                </span>
                <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                  {activeData.files.map((file) => (
                    <span
                      key={file}
                      className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      📄 {file.split('/').pop()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="flex-1 overflow-x-auto rounded-lg border border-white/[0.06] bg-black/40 p-4">
                <pre className="font-mono text-[10px] sm:text-xs text-neutral-300 leading-normal">
                  <code>{activeData.code}</code>
                </pre>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
export default AskCodebase;
