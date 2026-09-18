import crypto from 'crypto';
import path from 'path';

export class CodeChunker {
  // Safety limits to guarantee fast, sub-second vector generation even for massive repos
  static MAX_GLOBAL_CHUNKS = parseInt(process.env.MAX_GLOBAL_CHUNKS || '75', 10);
  static MAX_CHUNKS_PER_FILE = 8;
  static MAX_CHUNK_CHARS = 1200;

  /**
   * Chunk all repository source and documentation files into structured, semantic chunks
   * @param {Object} params
   * @param {number|string} params.repositoryId
   * @param {Array<Object>} params.repositoryFiles - Ingested files with content
   * @param {Array<Object>} [params.symbols] - Extracted M6 symbols
   * @returns {Array<Object>} List of structured chunk objects ready for embedding
   */
  static chunkRepository({ repositoryId, repositoryFiles = [], symbols = [] }) {
    let rawChunks = [];
    let globalChunkIndex = 0;

    // Group symbols by fileId
    const symbolsByFileId = new Map();
    for (const sym of symbols) {
      if (!symbolsByFileId.has(sym.fileId)) {
        symbolsByFileId.set(sym.fileId, []);
      }
      symbolsByFileId.get(sym.fileId).push(sym);
    }

    for (const file of repositoryFiles) {
      if (file.isIgnored || file.isBinary || !file.content || typeof file.content !== 'string') {
        continue;
      }

      const fileSymbols = symbolsByFileId.get(file.id) || [];
      const extension = (file.extension || '').toLowerCase();
      const filename = path.basename(file.path).toLowerCase();

      // 1. Configuration files (package.json, pyproject.toml, go.mod, Cargo.toml) - Priority 100
      if (['package.json', 'pyproject.toml', 'requirements.txt', 'go.mod', 'cargo.toml', 'dockerfile'].includes(filename)) {
        const configChunk = this.chunkConfigFile({
          repositoryId,
          file,
          chunkIndex: globalChunkIndex++
        });
        if (configChunk) rawChunks.push({ ...configChunk, priorityWeight: 100 });
        continue;
      }

      // 2. Documentation files (README.md, docs/**/*.md) - Priority 90
      if (extension === '.md' || extension === '.mdx' || filename.startsWith('readme')) {
        const docChunks = this.chunkMarkdownFile({
          repositoryId,
          file,
          startIndex: globalChunkIndex
        });
        docChunks.forEach(c => rawChunks.push({ ...c, priorityWeight: 90 }));
        globalChunkIndex += docChunks.length;
        continue;
      }

      // 3. Source code with M6 symbols - Priority 80 (exported) / 60 (internal)
      if (fileSymbols.length > 0) {
        const symbolChunks = this.chunkBySymbols({
          repositoryId,
          file,
          symbols: fileSymbols,
          startIndex: globalChunkIndex
        });
        symbolChunks.forEach(c => {
          const isHighValue = c.metadata?.isExported || ['CLASS', 'INTERFACE', 'ROUTE', 'CONTROLLER'].includes(c.chunkType);
          rawChunks.push({ ...c, priorityWeight: isHighValue ? 80 : 60 });
        });
        globalChunkIndex += symbolChunks.length;
        continue;
      }

      // 4. Source code fallback (sliding line window) - Priority 40
      const fallbackChunks = this.chunkByLineWindow({
        repositoryId,
        file,
        startIndex: globalChunkIndex
      });
      fallbackChunks.forEach(c => rawChunks.push({ ...c, priorityWeight: 40 }));
      globalChunkIndex += fallbackChunks.length;
    }

    // Apply global chunk budget to prevent CPU embedding overload on massive codebases
    if (rawChunks.length > this.MAX_GLOBAL_CHUNKS) {
      // Sort by priority weight descending, then slice top budget
      rawChunks.sort((a, b) => (b.priorityWeight || 50) - (a.priorityWeight || 50));
      rawChunks = rawChunks.slice(0, this.MAX_GLOBAL_CHUNKS);
    }

    // Re-index sequentially
    return rawChunks.map((chunk, idx) => ({
      ...chunk,
      chunkIndex: idx
    }));
  }

  /**
   * Chunk source code file using M6 symbol boundaries with intelligent capping
   */
  static chunkBySymbols({ repositoryId, file, symbols = [], startIndex = 0 }) {
    const chunks = [];
    const lines = file.content.split('\n');
    let currentIndex = startIndex;

    // Filter meaningful top-level and method symbols, sorted by lineStart
    // Prioritize exported classes, functions, and interfaces
    const sortedSymbols = [...symbols]
      .filter(s => s.lineStart && s.lineEnd && s.lineEnd >= s.lineStart)
      .sort((a, b) => {
        if (a.isExported && !b.isExported) return -1;
        if (!a.isExported && b.isExported) return 1;
        return a.lineStart - b.lineStart;
      })
      .slice(0, this.MAX_CHUNKS_PER_FILE);

    for (const sym of sortedSymbols) {
      const startIdx = Math.max(0, sym.lineStart - 1);
      const endIdx = Math.min(lines.length, sym.lineEnd);
      const symbolLines = lines.slice(startIdx, endIdx);
      let symbolBody = symbolLines.join('\n').trim();

      if (!symbolBody) continue;

      // Truncate overly long single symbol body for fast inference
      if (symbolBody.length > this.MAX_CHUNK_CHARS) {
        symbolBody = symbolBody.substring(0, this.MAX_CHUNK_CHARS) + '\n// ... [truncated for embedding context]';
      }

      // Construct contextual header prefix
      const prefix = `// File: ${file.path} | Symbol: ${sym.name} | Type: ${sym.type}${sym.language ? ` | Lang: ${sym.language}` : ''}\n`;
      const fullContent = (prefix + symbolBody).substring(0, this.MAX_CHUNK_CHARS);
      const contentHash = this.computeHash(fullContent);

      chunks.push({
        repositoryId,
        fileId: file.id,
        symbolId: sym.id || null,
        chunkIndex: currentIndex++,
        content: fullContent,
        contentHash,
        chunkType: sym.type,
        language: file.language || sym.language,
        filePath: file.path,
        startLine: sym.lineStart,
        endLine: sym.lineEnd,
        metadata: {
          symbolName: sym.name,
          isExported: sym.isExported,
          chunkStrategy: 'SYMBOL_AST'
        }
      });
    }

    if (chunks.length === 0) {
      return this.chunkByLineWindow({ repositoryId, file, startIndex });
    }

    return chunks;
  }

  /**
   * Chunk Markdown documentation files by section headings
   */
  static chunkMarkdownFile({ repositoryId, file, startIndex = 0 }) {
    const chunks = [];
    const lines = file.content.split('\n');
    let currentIndex = startIndex;

    const sections = [];
    let currentHeading = 'Overview';
    let currentStartLine = 1;
    let currentLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);

      if (headingMatch && currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          startLine: currentStartLine,
          endLine: i,
          content: currentLines.join('\n').trim()
        });
        currentHeading = headingMatch[2].trim();
        currentStartLine = i + 1;
        currentLines = [line];
      } else {
        if (headingMatch) {
          currentHeading = headingMatch[2].trim();
          currentStartLine = i + 1;
        }
        currentLines.push(line);
      }
    }

    if (currentLines.length > 0) {
      sections.push({
        heading: currentHeading,
        startLine: currentStartLine,
        endLine: lines.length,
        content: currentLines.join('\n').trim()
      });
    }

    // Limit to top 4 sections per markdown document
    const cappedSections = sections.slice(0, 4);

    for (const sec of cappedSections) {
      if (!sec.content) continue;
      const truncatedBody = sec.content.length > this.MAX_CHUNK_CHARS 
        ? sec.content.substring(0, this.MAX_CHUNK_CHARS) 
        : sec.content;

      const prefix = `<!-- File: ${file.path} | Section: ${sec.heading} -->\n`;
      const fullContent = (prefix + truncatedBody).substring(0, this.MAX_CHUNK_CHARS);
      const contentHash = this.computeHash(fullContent);

      chunks.push({
        repositoryId,
        fileId: file.id,
        symbolId: null,
        chunkIndex: currentIndex++,
        content: fullContent,
        contentHash,
        chunkType: 'DOCUMENTATION',
        language: 'Markdown',
        filePath: file.path,
        startLine: sec.startLine,
        endLine: sec.endLine,
        metadata: {
          sectionHeading: sec.heading,
          chunkStrategy: 'HEADING_AWARE'
        }
      });
    }

    return chunks;
  }

  /**
   * Chunk configuration metadata files
   */
  static chunkConfigFile({ repositoryId, file, chunkIndex = 0 }) {
    const rawContent = file.content.trim();
    const truncatedBody = rawContent.length > this.MAX_CHUNK_CHARS 
      ? rawContent.substring(0, this.MAX_CHUNK_CHARS) 
      : rawContent;

    const prefix = `// File: ${file.path} | Config: ${path.basename(file.path)}\n`;
    const fullContent = (prefix + truncatedBody).substring(0, this.MAX_CHUNK_CHARS);
    const contentHash = this.computeHash(fullContent);

    return {
      repositoryId,
      fileId: file.id,
      symbolId: null,
      chunkIndex,
      content: fullContent,
      contentHash,
      chunkType: 'CONFIGURATION',
      language: file.language || 'Config',
      filePath: file.path,
      startLine: 1,
      endLine: file.content.split('\n').length,
      metadata: {
        configType: path.basename(file.path),
        chunkStrategy: 'CONFIGURATION'
      }
    };
  }

  /**
   * Fallback sliding-window line chunker
   */
  static chunkByLineWindow({ repositoryId, file, startIndex = 0, windowSize = 50, overlap = 10 }) {
    const chunks = [];
    const lines = file.content.split('\n');
    let currentIndex = startIndex;

    if (lines.length <= windowSize) {
      const rawContent = file.content.trim();
      const truncated = rawContent.length > this.MAX_CHUNK_CHARS 
        ? rawContent.substring(0, this.MAX_CHUNK_CHARS) 
        : rawContent;

      const prefix = `// File: ${file.path}\n`;
      const fullContent = (prefix + truncated).substring(0, this.MAX_CHUNK_CHARS);
      const contentHash = this.computeHash(fullContent);

      return [{
        repositoryId,
        fileId: file.id,
        symbolId: null,
        chunkIndex: currentIndex,
        content: fullContent,
        contentHash,
        chunkType: 'FILE',
        language: file.language,
        filePath: file.path,
        startLine: 1,
        endLine: lines.length,
        metadata: { chunkStrategy: 'FULL_FILE' }
      }];
    }

    // Limit sliding window to max 3 chunks per fallback file
    let windowCount = 0;
    for (let i = 0; i < lines.length && windowCount < 3; i += (windowSize - overlap)) {
      const chunkLines = lines.slice(i, i + windowSize);
      const startLine = i + 1;
      const endLine = Math.min(lines.length, i + windowSize);
      const chunkBody = chunkLines.join('\n').trim();

      if (!chunkBody) continue;

      const truncated = chunkBody.length > this.MAX_CHUNK_CHARS 
        ? chunkBody.substring(0, this.MAX_CHUNK_CHARS) 
        : chunkBody;

      const prefix = `// File: ${file.path} | Lines: ${startLine}-${endLine}\n`;
      const fullContent = (prefix + truncated).substring(0, this.MAX_CHUNK_CHARS);
      const contentHash = this.computeHash(fullContent);

      chunks.push({
        repositoryId,
        fileId: file.id,
        symbolId: null,
        chunkIndex: currentIndex++,
        content: fullContent,
        contentHash,
        chunkType: 'FILE',
        language: file.language,
        filePath: file.path,
        startLine,
        endLine,
        metadata: { chunkStrategy: 'SLIDING_WINDOW' }
      });

      windowCount++;
      if (endLine >= lines.length) break;
    }

    return chunks;
  }

  /**
   * Helper to chunk a single file
   */
  static chunkFile({ fileId, filePath, content, language, symbols = [], repositoryId = 1 }) {
    const mockFile = {
      id: fileId,
      path: filePath,
      content,
      language,
      extension: path.extname(filePath),
      isIgnored: false,
      isBinary: false
    };

    return this.chunkRepository({
      repositoryId,
      repositoryFiles: [mockFile],
      symbols: symbols.map(s => ({
        ...s,
        fileId,
        lineStart: s.startLine || s.lineStart,
        lineEnd: s.endLine || s.lineEnd,
        type: s.kind || s.type || 'SYMBOL'
      }))
    });
  }

  /**
   * Deterministic SHA-256 hash for chunk content
   */
  static computeHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

export { CodeChunker as codeChunker };
export default CodeChunker;
