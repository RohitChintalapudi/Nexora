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
  Clock,
  Layers,
  Shield,
  Database,
  Route as RouteIcon,
  Compass
} from 'lucide-react';
import { useRepositoryChat } from '../../../hooks/useRepositoryChat';

interface AIChatViewProps {
  repositoryId: number | string;
  repositoryName: string;
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void;
}

interface QuickTopic {
  label: string;
  prompt: string;
  icon: React.ElementType;
}

const QUICK_TOPICS: QuickTopic[] = [
  { 
    label: 'Architecture Table', 
    prompt: 'Provide a structured markdown table breaking down the architectural layers, key responsibilities, and main files in this repository.',
    icon: Layers
  },
  { 
    label: 'Auth & Security', 
    prompt: 'Explain how authentication, authorization, token validation, and password security work in this codebase.',
    icon: Shield
  },
  { 
    label: 'Database Models', 
    prompt: 'List all database tables, models, ORM relationships, and configuration files in a clean markdown table.',
    icon: Database
  },
  { 
    label: 'API Endpoints', 
    prompt: 'Summarize the primary API routes, HTTP methods, controllers, and their file locations in a markdown table.',
    icon: RouteIcon
  },
  { 
    label: 'Lifecycle & Flow', 
    prompt: 'Explain the step-by-step application lifecycle flow from request ingestion through business services to database persistence.',
    icon: Compass
  }
];

/**
 * Clean markdown table renderer with cell formatting and file links
 */
const MarkdownTableRenderer: React.FC<{
  tableLines: string[];
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void;
}> = ({ tableLines, onOpenFileModal }) => {
  if (tableLines.length < 2) return null;

  // Split line into cells
  const parseRow = (line: string): string[] => {
    return line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(c => c.trim());
  };

  const headerCells = parseRow(tableLines[0]);
  
  // Find data rows (ignoring separator like |---|---|)
  const dataRows = tableLines.slice(1).filter(line => {
    const trimmed = line.trim();
    return trimmed && !/^\|?[\s-:]+\|?[\s-:]*\|?$/.test(trimmed);
  }).map(parseRow);

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] bg-white">
      <div className="overflow-x-auto select-text">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200">
              {headerCells.map((h, i) => (
                <th 
                  key={i} 
                  className="px-4 py-3 font-extrabold text-slate-800 uppercase tracking-wider text-[11px] whitespace-nowrap"
                >
                  {renderInlineMarkdown(h, onOpenFileModal)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
            {dataRows.map((row, rIdx) => (
              <tr 
                key={rIdx} 
                className="hover:bg-blue-50/30 transition-colors even:bg-slate-50/40"
              >
                {headerCells.map((_, cIdx) => (
                  <td 
                    key={cIdx} 
                    className="px-4 py-3 leading-relaxed align-top"
                  >
                    {renderInlineMarkdown(row[cIdx] || '', onOpenFileModal)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Full Markdown message formatter (Tables, Code Blocks, Lists, Blockquotes, Headings)
 */
const FormattedMessageContent: React.FC<{ 
  content: string; 
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void 
}> = ({ content, onOpenFileModal }) => {
  // 1. Separate code blocks first
  const codeParts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-slate-800">
      {codeParts.map((codePart, partIdx) => {
        // Code Block
        if (codePart.startsWith('```') && codePart.endsWith('```')) {
          const lines = codePart.slice(3, -3).trim().split('\n');
          const language = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
          const code = language ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={partIdx} className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md my-3">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="font-semibold text-slate-300 ml-2">{language || 'code'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy code"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-100 overflow-x-auto select-text leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // 2. Parse paragraphs, tables, lists, and callouts
        const blocks = codePart.split(/\n\n+/);

        return (
          <div key={partIdx} className="space-y-3">
            {blocks.map((block, bIdx) => {
              const trimmed = block.trim();
              if (!trimmed) return null;

              // Check if block is a Markdown Table
              const lines = trimmed.split('\n');
              const isTable = lines.length >= 2 && lines.every(l => l.trim().startsWith('|') || l.trim().includes('|'));
              if (isTable) {
                return (
                  <MarkdownTableRenderer 
                    key={bIdx} 
                    tableLines={lines} 
                    onOpenFileModal={onOpenFileModal} 
                  />
                );
              }

              // Blockquotes / Callout notes
              if (trimmed.startsWith('>')) {
                const quoteText = trimmed.replace(/^>\s?/gm, '');
                return (
                  <div key={bIdx} className="p-4 rounded-2xl bg-blue-50/50 border-l-4 border-blue-500 text-slate-800 my-2 space-y-1">
                    <p className="font-sans leading-relaxed">
                      {renderInlineMarkdown(quoteText, onOpenFileModal)}
                    </p>
                  </div>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split(/\n[-*]\s+/).filter(Boolean);
                return (
                  <ul key={bIdx} className="space-y-2 pl-4 list-disc text-slate-700">
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
                  <ol key={bIdx} className="space-y-2 pl-4 list-decimal text-slate-700">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="leading-relaxed">
                        {renderInlineMarkdown(item.replace(/^\d+\.\s+/, ''), onOpenFileModal)}
                      </li>
                    ))}
                  </ol>
                );
              }

              // Section Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={bIdx} className="text-sm sm:text-base font-extrabold text-slate-900 pt-3 pb-1 tracking-tight">
                    {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''), onOpenFileModal)}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={bIdx} className="text-base sm:text-lg font-extrabold text-slate-900 pt-4 pb-1.5 border-b border-slate-200/80 tracking-tight">
                    {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''), onOpenFileModal)}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={bIdx} className="text-lg sm:text-xl font-extrabold text-slate-900 pt-4 pb-2 border-b border-slate-200/80 tracking-tight">
                    {renderInlineMarkdown(trimmed.replace(/^#\s+/, ''), onOpenFileModal)}
                  </h2>
                );
              }

              // Standard text paragraph
              return (
                <p key={bIdx} className="leading-relaxed whitespace-pre-line text-slate-700">
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
 * Parse inline bold, italics, and backtick file citations
 */
function renderInlineMarkdown(
  text: string, 
  onOpenFileModal?: (filePath: string, startLine?: number, endLine?: number) => void
): React.ReactNode {
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
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 border border-blue-200 transition-colors mx-0.5 cursor-pointer align-baseline shadow-2xs"
            title={`Inspect ${val}`}
          >
            <FileCode2 className="w-3 h-3 text-blue-600 shrink-0" />
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
  
  // CONTAINER REF (Strictly scroll inside the chat box only, NEVER moving window scroll position)
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length, isLoading]);

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
    <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_4px_32px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col divide-y divide-slate-100">
      
      {/* 1. Header Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 ring-4 ring-blue-100">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AI Repository Assistant
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">
                RAG Vector Grounded
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Ask anything about <strong className="text-slate-900">{repositoryName}</strong> architecture, code logic, database, or APIs.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full border border-slate-200 transition-all cursor-pointer shrink-0 self-start sm:self-center shadow-2xs"
            title="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* 2. Quick Filter Mode Pills */}
      <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Quick Insights:
        </span>
        {QUICK_TOPICS.map((topic, idx) => {
          const Icon = topic.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handlePromptClick(topic.prompt)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-blue-600" />
              <span>{topic.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Message History Container */}
      <div 
        ref={chatContainerRef}
        className="p-5 sm:p-6 min-h-[300px] max-h-[580px] overflow-y-auto space-y-6 bg-slate-50/40"
      >
        {messages.length === 0 ? (
          /* Empty State & Prompt Starters */
          <div className="py-10 text-center space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <Bot className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                Explore {repositoryName} with AI
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                NEXORA references your indexed vector embeddings, symbols, AST syntax trees, and architecture models to answer with pinpoint accuracy and structured tables.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                Popular Questions
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_TOPICS.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(topic.prompt)}
                    className="text-xs font-medium text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-4 py-2.5 rounded-2xl shadow-2xs transition-all text-left cursor-pointer active:scale-95"
                  >
                    "{topic.prompt}"
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
                  className={`max-w-3xl rounded-3xl p-4 sm:p-6 space-y-3.5 ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-600/10'
                      : 'bg-white border border-slate-200/80 rounded-tl-xs shadow-[0_2px_16px_rgba(0,0,0,0.03)]'
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
                            {msg.citations.slice(0, 5).map((cit, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => onOpenFileModal && onOpenFileModal(cit.filePath, cit.startLine, cit.endLine)}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer shadow-2xs"
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

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
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
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
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
              <span>Analyzing code chunks, symbols, and synthesizing response...</span>
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
      </div>

      {/* 4. Question Input Bar */}
      <div className="p-4 sm:p-5 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask any question about ${repositoryName}... (Press Enter to send, Shift+Enter for new line)`}
              disabled={isLoading}
              className="w-full resize-none p-3.5 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-sans leading-normal"
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

export default AIChatView;
