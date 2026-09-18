import * as babelParser from '@babel/parser';
import { BaseCodeParser } from './parser.interface.js';

export class TypeScriptParser extends BaseCodeParser {
  supports(language, extension) {
    const ext = (extension || '').toLowerCase();
    const lang = (language || '').toLowerCase();
    return (
      ext === '.ts' ||
      ext === '.tsx' ||
      ext === '.mts' ||
      ext === '.cts' ||
      lang.includes('typescript')
    );
  }

  async parse({ file, content, allFiles = [] }) {
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'TypeScript',
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
      const isTsx = (file.extension || '').toLowerCase() === '.tsx' || (file.path || '').endsWith('.tsx');
      
      // Safeguard against massive bundled/minified files (cap at 250KB for AST traversal)
      const parseContent = content.length > 250_000 ? content.substring(0, 250_000) : content;

      const ast = babelParser.parse(parseContent, {
        sourceType: 'module',
        plugins: [
          'typescript',
          isTsx ? 'jsx' : 'jsx', // Allow JSX even in .ts if used
          ['decorators', { decoratorsBeforeExport: true }],
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'asyncGenerators',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining',
          'topLevelAwait'
        ],
        errorRecovery: true
      });

      const symbols = [];
      const imports = [];
      const exports = [];
      const routes = [];
      const extendsList = [];
      const implementsList = [];

      // Check if AST has body statements
      const statements = ast.program ? ast.program.body : [];

      for (const node of statements) {
        this.extractNode({
          node,
          file,
          content,
          symbols,
          imports,
          exports,
          routes,
          extendsList,
          implementsList,
          isExportedContext: false
        });
      }

      return {
        fileId: file.id,
        filePath: file.path,
        language: file.language || 'TypeScript',
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
        language: file.language || 'TypeScript',
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

  extractNode({
    node,
    file,
    content,
    symbols,
    imports,
    exports,
    routes,
    extendsList,
    implementsList,
    isExportedContext
  }) {
    if (!node) return;

    // 1. Export Named Declaration
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        this.extractNode({
          node: node.declaration,
          file,
          content,
          symbols,
          imports,
          exports,
          routes,
          extendsList,
          implementsList,
          isExportedContext: true
        });
      }
      if (node.specifiers && node.specifiers.length > 0) {
        for (const spec of node.specifiers) {
          const exportName = spec.exported?.name || spec.exported?.value || 'unknown';
          const localName = spec.local?.name || exportName;
          exports.push({
            name: exportName,
            localName,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }
      }
      return;
    }

    // 2. Export Default Declaration
    if (node.type === 'ExportDefaultDeclaration') {
      let defaultName = 'default';
      if (node.declaration) {
        if (node.declaration.id && node.declaration.id.name) {
          defaultName = node.declaration.id.name;
        } else if (node.declaration.name) {
          defaultName = node.declaration.name;
        }

        this.extractNode({
          node: node.declaration,
          file,
          content,
          symbols,
          imports,
          exports,
          routes,
          extendsList,
          implementsList,
          isExportedContext: true
        });
      }

      exports.push({
        name: defaultName,
        localName: defaultName,
        isDefault: true,
        lineStart: node.loc?.start?.line,
        lineEnd: node.loc?.end?.line
      });
      return;
    }

    // 3. Import Declaration
    if (node.type === 'ImportDeclaration') {
      const sourcePath = node.source?.value;
      if (sourcePath) {
        const specifiers = (node.specifiers || []).map((spec) => {
          if (spec.type === 'ImportDefaultSpecifier') {
            return { name: spec.local?.name, type: 'DEFAULT' };
          }
          if (spec.type === 'ImportNamespaceSpecifier') {
            return { name: spec.local?.name, type: 'NAMESPACE' };
          }
          return {
            name: spec.imported?.name || spec.imported?.value || spec.local?.name,
            localName: spec.local?.name,
            type: 'NAMED'
          };
        });

        imports.push({
          rawPath: sourcePath,
          specifiers,
          isTypeOnly: node.importKind === 'type',
          lineStart: node.loc?.start?.line,
          lineEnd: node.loc?.end?.line
        });
      }
      return;
    }

    // 4. Function Declaration
    if (node.type === 'FunctionDeclaration') {
      const name = node.id?.name;
      if (name) {
        const isComponent = this.isReactComponent(name, node, file);
        symbols.push({
          fileId: file.id,
          name,
          type: isComponent ? 'COMPONENT' : 'FUNCTION',
          language: file.language || 'TypeScript',
          lineStart: node.loc?.start?.line,
          lineEnd: node.loc?.end?.line,
          isExported: isExportedContext
        });

        if (isExportedContext) {
          exports.push({
            name,
            localName: name,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }
      }
      return;
    }

    // 5. Class Declaration
    if (node.type === 'ClassDeclaration') {
      const name = node.id?.name;
      if (name) {
        symbols.push({
          fileId: file.id,
          name,
          type: 'CLASS',
          language: file.language || 'TypeScript',
          lineStart: node.loc?.start?.line,
          lineEnd: node.loc?.end?.line,
          isExported: isExportedContext
        });

        if (isExportedContext) {
          exports.push({
            name,
            localName: name,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }

        // Inheritance: extends
        if (node.superClass) {
          const superName = node.superClass.name || node.superClass.property?.name;
          if (superName) {
            extendsList.push({
              className: name,
              superClassName: superName,
              lineStart: node.loc?.start?.line
            });
          }
        }

        // Inheritance: implements
        if (node.implements && node.implements.length > 0) {
          for (const impl of node.implements) {
            const ifaceName = impl.id?.name || impl.expression?.name;
            if (ifaceName) {
              implementsList.push({
                className: name,
                interfaceName: ifaceName,
                lineStart: node.loc?.start?.line
              });
            }
          }
        }

        // Methods within class
        if (node.body && node.body.body) {
          for (const member of node.body.body) {
            if (member.type === 'ClassMethod' || member.type === 'ClassPrivateMethod') {
              const methodName = member.key?.name || member.key?.id?.name;
              if (methodName && methodName !== 'constructor') {
                symbols.push({
                  fileId: file.id,
                  name: `${name}.${methodName}`,
                  type: 'METHOD',
                  language: file.language || 'TypeScript',
                  lineStart: member.loc?.start?.line,
                  lineEnd: member.loc?.end?.line,
                  isExported: false
                });
              }
            }
          }
        }
      }
      return;
    }

    // 6. TS Interface Declaration
    if (node.type === 'TSInterfaceDeclaration') {
      const name = node.id?.name;
      if (name) {
        symbols.push({
          fileId: file.id,
          name,
          type: 'INTERFACE',
          language: file.language || 'TypeScript',
          lineStart: node.loc?.start?.line,
          lineEnd: node.loc?.end?.line,
          isExported: isExportedContext
        });

        if (isExportedContext) {
          exports.push({
            name,
            localName: name,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }

        if (node.extends && node.extends.length > 0) {
          for (const ext of node.extends) {
            const superName = ext.id?.name || ext.expression?.name;
            if (superName) {
              extendsList.push({
                className: name,
                superClassName: superName,
                lineStart: node.loc?.start?.line
              });
            }
          }
        }
      }
      return;
    }

    // 7. TS Type Alias Declaration
    if (node.type === 'TSTypeAliasDeclaration') {
      const name = node.id?.name;
      if (name) {
        symbols.push({
          fileId: file.id,
          name,
          type: 'TYPE',
          language: file.language || 'TypeScript',
          lineStart: node.loc?.start?.line,
          lineEnd: node.loc?.end?.line,
          isExported: isExportedContext
        });

        if (isExportedContext) {
          exports.push({
            name,
            localName: name,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }
      }
      return;
    }

    // 8. TS Enum Declaration
    if (node.type === 'TSEnumDeclaration') {
      const name = node.id?.name;
      if (name) {
        symbols.push({
          fileId: file.id,
          name,
          type: 'ENUM',
          language: file.language || 'TypeScript',
          lineStart: node.loc?.start?.line,
          lineEnd: node.loc?.end?.line,
          isExported: isExportedContext
        });

        if (isExportedContext) {
          exports.push({
            name,
            localName: name,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }
      }
      return;
    }

    // 9. Variable Declaration (Top-level arrow functions, components, constants)
    if (node.type === 'VariableDeclaration') {
      const kind = node.kind; // const, let, var
      for (const decl of node.declarations) {
        if (!decl.id || !decl.id.name) continue;
        const varName = decl.id.name;
        const init = decl.init;

        if (init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
          const isComponent = this.isReactComponent(varName, init, file);
          symbols.push({
            fileId: file.id,
            name: varName,
            type: isComponent ? 'COMPONENT' : 'FUNCTION',
            language: file.language || 'TypeScript',
            lineStart: decl.loc?.start?.line || node.loc?.start?.line,
            lineEnd: decl.loc?.end?.line || node.loc?.end?.line,
            isExported: isExportedContext
          });
        } else if (kind === 'const' && (isExportedContext || /^[A-Z0-9_]{3,}$/.test(varName))) {
          // Meaningful top-level constants
          symbols.push({
            fileId: file.id,
            name: varName,
            type: 'CONSTANT',
            language: file.language || 'TypeScript',
            lineStart: decl.loc?.start?.line || node.loc?.start?.line,
            lineEnd: decl.loc?.end?.line || node.loc?.end?.line,
            isExported: isExportedContext
          });
        }

        if (isExportedContext) {
          exports.push({
            name: varName,
            localName: varName,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }

        // Check for CommonJS require calls: const X = require('./path')
        if (init && init.type === 'CallExpression' && init.callee?.name === 'require') {
          const arg = init.arguments?.[0];
          if (arg && (arg.type === 'StringLiteral' || typeof arg.value === 'string')) {
            imports.push({
              rawPath: arg.value,
              specifiers: [{ name: varName, type: 'DEFAULT' }],
              isTypeOnly: false,
              lineStart: node.loc?.start?.line,
              lineEnd: node.loc?.end?.line
            });
          }
        }
      }
      return;
    }

    // 10. Expression Statements (CommonJS module.exports = ..., router.get(...), app.post(...))
    if (node.type === 'ExpressionStatement' && node.expression) {
      const expr = node.expression;

      // CommonJS module.exports = ...
      if (expr.type === 'AssignmentExpression') {
        const left = expr.left;
        if (
          left?.type === 'MemberExpression' &&
          left.object?.name === 'module' &&
          left.property?.name === 'exports'
        ) {
          const rightName = expr.right?.name || 'exports';
          exports.push({
            name: rightName,
            localName: rightName,
            isDefault: true,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        } else if (
          left?.type === 'MemberExpression' &&
          left.object?.name === 'exports'
        ) {
          const exportProp = left.property?.name || 'unknown';
          exports.push({
            name: exportProp,
            localName: exportProp,
            isDefault: false,
            lineStart: node.loc?.start?.line,
            lineEnd: node.loc?.end?.line
          });
        }
      }

      // Express / Router route call: app.get('/path', handler), router.post('/path', handler)
      if (expr.type === 'CallExpression' && expr.callee?.type === 'MemberExpression') {
        const callee = expr.callee;
        const objName = callee.object?.name;
        const methodName = callee.property?.name?.toLowerCase();
        const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'use', 'all'];

        if (
          (objName === 'app' || objName === 'router' || objName === 'server' || objName === 'api') &&
          httpMethods.includes(methodName)
        ) {
          const firstArg = expr.arguments?.[0];
          if (firstArg && (firstArg.type === 'StringLiteral' || typeof firstArg.value === 'string')) {
            const routePath = firstArg.value;
            const handlerArg = expr.arguments?.[1];
            let handlerName = 'anonymousHandler';
            if (handlerArg) {
              if (handlerArg.type === 'Identifier') handlerName = handlerArg.name;
              else if (handlerArg.type === 'MemberExpression') {
                handlerName = `${handlerArg.object?.name || ''}.${handlerArg.property?.name || ''}`;
              }
            }

            routes.push({
              method: methodName.toUpperCase(),
              path: routePath,
              handler: handlerName,
              framework: 'Express',
              lineStart: node.loc?.start?.line,
              lineEnd: node.loc?.end?.line
            });
          }
        }
      }
    }
  }

  isReactComponent(name, node, file) {
    if (!name || typeof name !== 'string') return false;
    // Rule 1: PascalCase naming convention
    const isPascalCase = /^[A-Z][a-zA-Z0-9]+$/.test(name);
    const isTsxOrJsx = (file.extension || '').toLowerCase() === '.tsx' || (file.extension || '').toLowerCase() === '.jsx';
    const isComponentPath = (file.path || '').toLowerCase().includes('components/') || (file.path || '').toLowerCase().includes('views/');

    if (isPascalCase && (isTsxOrJsx || isComponentPath)) {
      return true;
    }
    return false;
  }
}
