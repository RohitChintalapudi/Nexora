import { parser } from '@lezer/python';
import { BaseCodeParser } from './parser.interface.js';

export class PythonParser extends BaseCodeParser {
  supports(language, extension) {
    const ext = (extension || '').toLowerCase();
    const lang = (language || '').toLowerCase();
    return ext === '.py' || lang.includes('python');
  }

  async parse({ file, content, allFiles = [] }) {
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'Python',
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
      const lineOffsets = this.computeLineOffsets(content);
      const tree = parser.parse(content);
      
      const symbols = [];
      const imports = [];
      const exports = [];
      const routes = [];
      const extendsList = [];
      const implementsList = [];

      const cursor = tree.cursor();
      const nodeStack = [];

      do {
        const nodeType = cursor.name;
        const from = cursor.from;
        const to = cursor.to;
        const nodeText = content.slice(from, to);
        const lineStart = this.getLineNumber(from, lineOffsets);
        const lineEnd = this.getLineNumber(to, lineOffsets);

        // 1. Import Statements
        if (nodeType === 'ImportStatement') {
          this.parsePythonImport({
            nodeText,
            lineStart,
            lineEnd,
            imports
          });
        }

        // 2. Class Definitions
        if (nodeType === 'ClassDefinition') {
          const classMatch = nodeText.match(/class\s+([a-zA-Z0-9_]+)(?:\s*\(([^)]*)\))?/);
          if (classMatch) {
            const className = classMatch[1];
            const baseClasses = classMatch[2] ? classMatch[2].split(',').map(s => s.trim()).filter(Boolean) : [];
            const isExported = !className.startsWith('_');

            symbols.push({
              fileId: file.id,
              name: className,
              type: 'CLASS',
              language: file.language || 'Python',
              lineStart,
              lineEnd,
              isExported
            });

            if (isExported) {
              exports.push({
                name: className,
                localName: className,
                isDefault: false,
                lineStart,
                lineEnd
              });
            }

            for (const base of baseClasses) {
              extendsList.push({
                className,
                superClassName: base,
                lineStart
              });
            }
          }
        }

        // 3. Function Definitions (standalone or methods)
        if (nodeType === 'FunctionDefinition') {
          const funcMatch = nodeText.match(/(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(/);
          if (funcMatch) {
            const funcName = funcMatch[1];
            
            // Check if this function is inside a class definition
            const parentClass = this.findParentClass(from, to, symbols, lineOffsets);
            const isMethod = !!parentClass;
            const isExported = !funcName.startsWith('_');

            const fullName = isMethod ? `${parentClass.name}.${funcName}` : funcName;

            symbols.push({
              fileId: file.id,
              name: fullName,
              type: isMethod ? 'METHOD' : 'FUNCTION',
              language: file.language || 'Python',
              lineStart,
              lineEnd,
              isExported: isMethod ? false : isExported
            });

            if (!isMethod && isExported) {
              exports.push({
                name: funcName,
                localName: funcName,
                isDefault: false,
                lineStart,
                lineEnd
              });
            }

            // Inspect preceding decorators for route definitions
            this.detectPythonRoute({
              content,
              from,
              funcName,
              lineStart,
              lineEnd,
              routes
            });
          }
        }

      } while (cursor.next());

      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'Python',
        symbols,
        imports,
        exports,
        routes,
        extendsList,
        implementsList,
        status: 'PARSED',
        error: null
      };
    } catch (err) {
      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'Python',
        symbols: [],
        imports: [],
        exports: [],
        routes: [],
        extendsList: [],
        implementsList,
        status: 'PARSING_FAILED',
        error: err.message
      };
    }
  }

  computeLineOffsets(text) {
    const offsets = [0];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        offsets.push(i + 1);
      }
    }
    return offsets;
  }

  getLineNumber(offset, lineOffsets) {
    let low = 0;
    let high = lineOffsets.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] <= offset) {
        if (mid === lineOffsets.length - 1 || lineOffsets[mid + 1] > offset) {
          return mid + 1; // 1-indexed
        }
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return 1;
  }

  findParentClass(funcFrom, funcTo, symbols, lineOffsets) {
    const funcLineStart = this.getLineNumber(funcFrom, lineOffsets);
    const funcLineEnd = this.getLineNumber(funcTo, lineOffsets);
    return symbols.find(s => s.type === 'CLASS' && s.lineStart <= funcLineStart && s.lineEnd >= funcLineEnd) || null;
  }

  parsePythonImport({ nodeText, lineStart, lineEnd, imports }) {
    // 1. from <module> import <items>
    const fromMatch = nodeText.match(/from\s+([a-zA-Z0-9_.]+)\s+import\s+([\s\S]+)/);
    if (fromMatch) {
      const rawPath = fromMatch[1];
      const itemsStr = fromMatch[2].replace(/[()]/g, '').trim();
      const specifiers = itemsStr.split(',').map(item => {
        const parts = item.trim().split(/\s+as\s+/);
        return {
          name: parts[0].trim(),
          localName: (parts[1] || parts[0]).trim(),
          type: 'NAMED'
        };
      }).filter(s => s.name);

      imports.push({
        rawPath,
        specifiers,
        isTypeOnly: false,
        lineStart,
        lineEnd
      });
      return;
    }

    // 2. import <module> [as <alias>]
    const importMatch = nodeText.match(/import\s+([\s\S]+)/);
    if (importMatch) {
      const itemsStr = importMatch[1].trim();
      const items = itemsStr.split(',').map(item => item.trim()).filter(Boolean);
      for (const item of items) {
        const parts = item.split(/\s+as\s+/);
        const moduleName = parts[0].trim();
        const alias = (parts[1] || moduleName).trim();
        imports.push({
          rawPath: moduleName,
          specifiers: [{ name: moduleName, localName: alias, type: 'DEFAULT' }],
          isTypeOnly: false,
          lineStart,
          lineEnd
        });
      }
    }
  }

  detectPythonRoute({ content, from, funcName, lineStart, lineEnd, routes }) {
    // Inspect up to 300 characters preceding the function definition for decorators
    const lookbackStart = Math.max(0, from - 300);
    const lookbackText = content.slice(lookbackStart, from);

    // Look for FastAPI / Flask route decorator patterns:
    // @app.get('/path'), @router.post('/path'), @api.route('/path', methods=['GET', 'POST'])
    const routeRegex = /@(app|router|api|blueprint)\.(get|post|put|delete|patch|options|head|route)\s*\(\s*['"]([^'"]+)['"](?:[^)]*methods\s*=\s*\[([^\]]+)\])?/gi;
    let match;
    while ((match = routeRegex.exec(lookbackText)) !== null) {
      const objName = match[1];
      let method = match[2].toUpperCase();
      const path = match[3];
      const explicitMethods = match[4];

      const framework = (objName === 'app' && method !== 'ROUTE') ? 'FastAPI' : 'Flask';

      if (method === 'ROUTE' && explicitMethods) {
        const methods = explicitMethods.replace(/['"\s]/g, '').split(',').filter(Boolean);
        for (const m of methods) {
          routes.push({
            method: m.toUpperCase(),
            path,
            handler: funcName,
            framework: 'Flask',
            lineStart,
            lineEnd
          });
        }
      } else {
        routes.push({
          method: method === 'ROUTE' ? 'GET' : method,
          path,
          handler: funcName,
          framework,
          lineStart,
          lineEnd
        });
      }
    }
  }
}
