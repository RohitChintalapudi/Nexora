import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Trash2, 
  Bot, 
  User, 
  Copy, 
  Check, 
  FileCode2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { useRepositoryChat } from '../../../hooks/useRepositoryChat';

interface AIChatViewProps {
  repositoryId: number | string;
  repositoryName: string;
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void;
}

const SUGGESTED_PROMPTS = [
  'How does authentication and session handling work?',
  'Explain the overall architecture and data flow.',
  'Where is the database configured and what are the main models?',
  'What are the primary API routes and their handlers?',
  'Where are the main entry points and how does startup work?'
];

/**
 * Clean markdown formatter for AI chat responses
 */
const FormattedMessageContent: React.FC<{ 
  content: string; 
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void 
}> = ({ content, onOpenFileModal }) => {
  // Parse code blocks vs regular text
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-800">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
          const code = language ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={index} className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md my-2">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span>{language || 'code'}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy code"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-100 overflow-x-auto select-text leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Format normal markdown text (paragraphs, bullet lists, bold text, inline code)
        const paragraphs = part.split(/\n\n+/);

        return (
          <div key={index} className="space-y-2">
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split(/\n[-*]\s+/).filter(Boolean);
                return (
                  <ul key={pIdx} className="space-y-1.5 pl-4 list-disc text-slate-700">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="leading-relaxed">
                        {renderInlineMarkdown(item.replace(/^[-*]\s+/, ''), onOpenFileModal)}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Numbered lists
              if (/^\d+\.\s+/.test(trimmed)) {
                const items = trimmed.split(/\n\d+\.\s+/).filter(Boolean);
                return (
                  <ol key={pIdx} className="space-y-1.5 pl-4 list-decimal text-slate-700">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="leading-relaxed">
                        {renderInlineMarkdown(item.replace(/^\d+\.\s+/, ''), onOpenFileModal)}
                      </li>
                    ))}
                  </ol>
                );
              }

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-sm font-extrabold text-slate-900 pt-2 pb-0.5">
                    {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''), onOpenFileModal)}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-base font-extrabold text-slate-900 pt-3 pb-1 border-b border-slate-100">
                    {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''), onOpenFileModal)}
                  </h3>
                );
              }

              return (
                <p key={pIdx} className="leading-relaxed whitespace-pre-line text-slate-700">
                  {renderInlineMarkdown(trimmed, onOpenFileModal)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Parse inline bold, italics, and backtick inline code
 */
function renderInlineMarkdown(
  text: string, 
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void
): React.ReactNode {
  // Regex splitting by backticks and bold
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      const val = token.slice(1, -1);
      const isFile = (val.includes('/') || val.includes('\\') || /\.[a-zA-Z0-9]{1,8}(?::L?\d+(?:-\d+)?)?$/.test(val)) && !val.includes(' ');

      if (isFile && onOpenFileModal) {
        const lineMatch = val.match(/:L?(\d+)(?:-(\d+))?$/);
        const cleanPath = val.replace(/:L?\d+(?:-\d+)?$/, '');
        const start = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
        const end = lineMatch && lineMatch[2] ? parseInt(lineMatch[2], 10) : start;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onOpenFileModal(cleanPath, start, end)}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors mx-0.5 cursor-pointer align-baseline"
            title={`Inspect ${val}`}
          >
            <FileCode2 className="w-3 h-3 text-blue-500 shrink-0" />
            <span>{val}</span>
          </button>
        );
      }

      return (
        <code key={i} className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 mx-0.5">
          {val}
        </code>
      );
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }

    return token;
  });
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  repositoryId,
  repositoryName,
  onOpenFileModal
}) => {
  const { messages, isLoading, error, sendMessage, clearHistory } = useRepositoryChat(repositoryId);
  const [inputQuestion, setInputQuestion] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;

    const q = inputQuestion;
    setInputQuestion('');
    await sendMessage(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputQuestion('');
    sendMessage(prompt);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col divide-y divide-slate-100">
      
      {/* 1. Header Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AI Repository Assistant
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                RAG Grounded
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Ask anything about <strong className="text-slate-800">{repositoryName}</strong> architecture, code logic, database, or APIs.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full border border-slate-200 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
            title="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* 2. Message History Container */}
      <div className="p-5 sm:p-6 min-h-[280px] max-h-[540px] overflow-y-auto space-y-6 bg-slate-50/30">
        
        {messages.length === 0 ? (
          /* Empty State & Prompt Starters */
          <div className="py-8 text-center space-y-5 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <Bot className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-slate-900">
                What would you like to know about {repositoryName}?
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                NEXORA references your indexed vector embeddings, symbols, AST syntax trees, and architecture models to answer with pinpoint accuracy.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    className="text-xs font-medium text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3.5 py-2 rounded-2xl shadow-2xs transition-all text-left cursor-pointer active:scale-95"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Stream */
          messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-3xl p-4 sm:p-5 space-y-3 ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-600/10'
                      : 'bg-white border border-slate-200/80 rounded-tl-xs shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-sm font-medium whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>
                  ) : (
                    <>
                      <FormattedMessageContent 
                        content={msg.content} 
                        onOpenFileModal={onOpenFileModal} 
                      />

                      {/* Source Citations & Stats Footer */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        {msg.citations && msg.citations.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Referenced Files:
                            </span>
                            {msg.citations.slice(0, 4).map((cit, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => onOpenFileModal && onOpenFileModal(cit.filePath, cit.startLine, cit.endLine)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer"
                                title={`Inspect ${cit.filePath}`}
                              >
                                <FileCode2 className="w-3 h-3 text-slate-400" />
                                <span>{cit.filePath}</span>
                                {cit.startLine && (
                                  <span className="text-slate-400">L{cit.startLine}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-3 shrink-0">
                          {msg.stats && (
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{msg.stats.latencyMs || 0}ms</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Copy answer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Thinking Loader */}
        {isLoading && (
          <div className="flex gap-3.5 justify-start animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl rounded-tl-xs bg-white border border-slate-200/80 shadow-xs flex items-center gap-3 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Analyzing code chunks and synthesizing answer...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Question Input Bar */}
      <div className="p-4 sm:p-5 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask any question about ${repositoryName}... (Press Enter to send)`}
              disabled={isLoading}
              className="w-full resize-none p-3.5 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>

    </div>
  );
};
