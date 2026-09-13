import { BaseCodeParser } from './parser.interface.js';

export class GenericCodeParser extends BaseCodeParser {
  supports(language, extension) {
    return true; // Fallback for all other text source files
  }

  async parse({ file, content, allFiles = [] }) {
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'Unknown',
        symbols: [],
        imports: [],
        exports: [],
        routes: [],
        extendsList: [],
        implementsList: [],
        status: 'EMPTY',
        error: null
      };
    }

    try {
      const symbols = [];
      const imports = [];
      const exports = [];
      const routes = [];
      const lines = content.split('\n');

      // Generic lightweight regex extraction for common constructs in Go, Rust, Java, C++, C#, PHP
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;

        // Go func / struct
        if (file.language === 'Go') {
          const funcMatch = line.match(/^func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)\s*\(/);
          if (funcMatch) {
            const name = funcMatch[1];
            symbols.push({
              fileId: file.id,
              name,
              type: 'FUNCTION',
              language: 'Go',
              lineStart: lineNum,
              lineEnd: lineNum,
              isExported: /^[A-Z]/.test(name)
            });
          }
          const typeMatch = line.match(/^type\s+([a-zA-Z0-9_]+)\s+(struct|interface)/);
          if (typeMatch) {
            const name = typeMatch[1];
            symbols.push({
              fileId: file.id,
              name,
              type: typeMatch[2] === 'interface' ? 'INTERFACE' : 'CLASS',
              language: 'Go',
              lineStart: lineNum,
              lineEnd: lineNum,
              isExported: /^[A-Z]/.test(name)
            });
          }
          const importMatch = line.match(/^import\s+["']([^"']+)["']/);
          if (importMatch) {
            imports.push({
              rawPath: importMatch[1],
              specifiers: [],
              isTypeOnly: false,
              lineStart: lineNum,
              lineEnd: lineNum
            });
          }
          continue;
        }

        // Rust fn / struct / enum / trait / use
        if (file.language === 'Rust') {
          const fnMatch = line.match(/^(?:pub\s+)?(?:async\s+)?fn\s+([a-zA-Z0-9_]+)\s*(?:<[^>]+>)?\s*\(/);
          if (fnMatch) {
            const name = fnMatch[1];
            symbols.push({
              fileId: file.id,
              name,
              type: 'FUNCTION',
              language: 'Rust',
              lineStart: lineNum,
              lineEnd: lineNum,
              isExported: line.startsWith('pub')
            });
          }
          const structMatch = line.match(/^(?:pub\s+)?(struct|enum|trait)\s+([a-zA-Z0-9_]+)/);
          if (structMatch) {
            const kind = structMatch[1];
            const name = structMatch[2];
            symbols.push({
              fileId: file.id,
              name,
              type: kind === 'trait' ? 'INTERFACE' : kind === 'enum' ? 'ENUM' : 'CLASS',
              language: 'Rust',
              lineStart: lineNum,
              lineEnd: lineNum,
              isExported: line.startsWith('pub')
            });
          }
          const useMatch = line.match(/^(?:pub\s+)?use\s+([^;]+);/);
          if (useMatch) {
            imports.push({
              rawPath: useMatch[1].trim(),
              specifiers: [],
              isTypeOnly: false,
              lineStart: lineNum,
              lineEnd: lineNum
            });
          }
          continue;
        }

        // Java / C# / PHP classes and methods
        if (['Java', 'C#', 'PHP'].includes(file.language)) {
          const classMatch = line.match(/(?:public|protected|private|final|abstract)?\s*class\s+([a-zA-Z0-9_]+)/);
          if (classMatch) {
            const name = classMatch[1];
            symbols.push({
              fileId: file.id,
              name,
              type: 'CLASS',
              language: file.language,
              lineStart: lineNum,
              lineEnd: lineNum,
              isExported: true
            });
          }
          const methodMatch = line.match(/(?:public|protected|private)\s+(?:static\s+)?[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{?/);
          if (methodMatch && !['class', 'if', 'while', 'for', 'switch'].includes(methodMatch[1])) {
            symbols.push({
              fileId: file.id,
              name: methodMatch[1],
              type: 'METHOD',
              language: file.language,
              lineStart: lineNum,
              lineEnd: lineNum,
              isExported: line.includes('public')
            });
          }
        }
      }

      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'Unknown',
        symbols,
        imports,
        exports,
        routes,
        extendsList: [],
        implementsList: [],
        status: symbols.length > 0 ? 'PARSED_GENERIC' : 'UNSUPPORTED',
        error: null
      };
    } catch (err) {
      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'Unknown',
        symbols: [],
        imports: [],
        exports: [],
        routes: [],
        extendsList: [],
        implementsList: [],
        status: 'PARSING_FAILED',
        error: err.message
      };
    }
  }
}
