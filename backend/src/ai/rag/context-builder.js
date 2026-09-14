import { RAGDefaults } from './types.js';

export class ContextBuilder {
  /**
   * Assemble retrieved chunks into a clean, bounded markdown context block for LLM consumption
   * @param {Object} params
   * @param {Object} params.repository - Repository metadata object
   * @param {Array<Object>} params.chunks - Ranked, deduplicated chunks
   * @param {number} [params.maxContextTokens=4000] - Token budget limit (~4 chars per token)
   * @returns {{ context: string, includedCount: number, approxTokens: number }}
   */
  static build({
    repository = {},
    chunks = [],
    maxContextTokens = RAGDefaults.MAX_CONTEXT_TOKENS
  }) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return {
        context: '',
        includedCount: 0,
        approxTokens: 0
      };
    }

    const maxChars = maxContextTokens * 4;
    const headerLines = [
      `### Repository Context`,
      `Repository: ${repository.name || 'Unknown'} (${repository.full_name || repository.fullName || 'Unknown'})`,
      repository.language ? `Primary Language: ${repository.language}` : null,
      `Retrieved Relevant Code Chunks:`,
      ''
    ].filter(Boolean);

    let accumulatedContext = headerLines.join('\n');
    let includedCount = 0;

    for (const chunk of chunks) {
      const language = chunk.language || 'text';
      const markdownLang = this.normalizeMarkdownLanguage(language);
      const symbolInfo = chunk.metadata?.symbolName || chunk.symbolName || null;
      const lineRange = chunk.startLine && chunk.endLine 
        ? `Lines: ${chunk.startLine}-${chunk.endLine}` 
        : null;
      const typeInfo = chunk.chunkType ? `Type: ${chunk.chunkType}` : null;
      const scoreInfo = typeof chunk.score === 'number' 
        ? `Relevance: ${(chunk.score * 100).toFixed(1)}%` 
        : null;

      const metadataParts = [
        `Language: ${language}`,
        symbolInfo ? `Symbol: ${symbolInfo}` : null,
        typeInfo,
        lineRange,
        scoreInfo,
        chunk.isNeighbor ? `(Neighboring Context)` : null
      ].filter(Boolean).join(' | ');

      const chunkBlock = [
        `--- File: ${chunk.filePath} ---`,
        metadataParts,
        '```' + markdownLang,
        chunk.content.trim(),
        '```',
        ''
      ].join('\n');

      // Check if adding this chunk exceeds the character budget
      if (accumulatedContext.length + chunkBlock.length > maxChars && includedCount > 0) {
        break;
      }

      accumulatedContext += '\n' + chunkBlock;
      includedCount++;
    }

    const approxTokens = Math.ceil(accumulatedContext.length / 4);

    return {
      context: accumulatedContext.trim(),
      includedCount,
      approxTokens
    };
  }

  /**
   * Map language name to markdown syntax highlighter tag
   */
  static normalizeMarkdownLanguage(lang) {
    if (!lang) return 'text';
    const lower = lang.toLowerCase();
    if (lower.includes('typescript') || lower.includes('tsx')) return 'typescript';
    if (lower.includes('javascript') || lower.includes('jsx')) return 'javascript';
    if (lower.includes('python')) return 'python';
    if (lower.includes('go')) return 'go';
    if (lower.includes('rust')) return 'rust';
    if (lower.includes('json')) return 'json';
    if (lower.includes('yaml') || lower.includes('yml')) return 'yaml';
    if (lower.includes('markdown') || lower.includes('md')) return 'markdown';
    if (lower.includes('sql')) return 'sql';
    if (lower.includes('html')) return 'html';
    if (lower.includes('css')) return 'css';
    return 'text';
  }
}

export const contextBuilder = ContextBuilder;
export default ContextBuilder;
