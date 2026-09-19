import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCode2, 
  ExternalLink, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { TextShimmer } from '../../motion/text-shimmer';
import type { SourceFilePreview } from '../../../types/analysis';

interface SourceReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  startLine?: number;
  endLine?: number;
  symbolName?: string;
  repositoryHtmlUrl?: string;
  defaultBranch?: string;
  onFetchContent: (path: string) => Promise<SourceFilePreview | null>;
}

export const SourceReferenceModal: React.FC<SourceReferenceModalProps> = ({
  isOpen,
  onClose,
  filePath,
  startLine,
  endLine,
  symbolName,
  repositoryHtmlUrl,
  defaultBranch = 'main',
  onFetchContent
}) => {
  const [fileData, setFileData] = useState<SourceFilePreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !filePath) return;

    let isMounted = true;
    setIsLoading(true);

    onFetchContent(filePath)
      .then((data) => {
        if (isMounted) {
          setFileData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFileData(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, filePath, onFetchContent]);

  if (!isOpen) return null;

  const safeFilePath = typeof filePath === 'string' ? filePath : '';

  // Compute GitHub URL with line range anchor if available
  const githubUrl = repositoryHtmlUrl && safeFilePath
    ? `${repositoryHtmlUrl}/blob/${defaultBranch}/${safeFilePath.replace(/^\//, '')}${
        startLine ? (endLine ? `#L${startLine}-L${endLine}` : `#L${startLine}`) : ''
      }`
    : null;

  // Split lines and optionally highlight line range
  const lines = fileData?.content ? fileData.content.split('\n') : [];

  const handleCopy = () => {
    if (!fileData?.content) return;

    let textToCopy = fileData.content;
    if (startLine && endLine && startLine <= endLine) {
      textToCopy = lines.slice(Math.max(0, startLine - 1), endLine).join('\n');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <FileCode2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-900 truncate">
                  {filePath}
                </span>
                {startLine && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100/70 text-blue-800">
                    Lines {startLine}{endLine && endLine !== startLine ? `–${endLine}` : ''}
                  </span>
                )}
                {symbolName && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                    {symbolName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Source Reference Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
                title="Open on GitHub"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {fileData?.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Copy snippet"
              >
                {copied ? (
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
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono text-xs bg-slate-950 text-slate-200">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <TextShimmer
                duration={2}
                baseColor="rgba(148, 163, 184, 0.45)"
                highlightColor="#ffffff"
                className="text-xs font-sans"
              >
                Loading source file preview...
              </TextShimmer>
            </div>
          ) : !fileData || !fileData.content ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-sans text-slate-300">
                Source content is not directly cached in local index.
              </p>
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans text-white bg-blue-600 hover:bg-blue-500 transition-colors mt-2"
                >
                  <span>View "{filePath}" on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="table w-full select-text">
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = startLine && endLine 
                  ? lineNum >= startLine && lineNum <= endLine 
                  : startLine ? lineNum === startLine : false;

                return (
                  <div
                    key={lineNum}
                    className={`table-row transition-colors ${
                      isHighlighted 
                        ? 'bg-blue-950/70 text-blue-200 border-l-2 border-blue-400' 
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="table-cell pr-4 pl-2 py-0.5 text-right select-none text-slate-600 text-[11px] w-12 border-r border-slate-800">
                      {lineNum}
                    </span>
                    <span className="table-cell pl-4 py-0.5 whitespace-pre leading-relaxed font-mono">
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-sans">
          <span>
            {fileData ? `${fileData.linesCount} lines · ${fileData.language || 'Plain Text'}` : filePath}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
