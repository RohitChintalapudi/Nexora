import path from 'path';

export class ImportResolver {
  /**
   * Build lookup structures and alias mapping from repository files
   * @param {Array<Object>} repositoryFiles
   */
  constructor(repositoryFiles = []) {
    this.files = repositoryFiles;
    this.filePathMap = new Map(); // normalized path -> file
    this.pathAliases = []; // array of { prefix, target }

    for (const f of repositoryFiles) {
      const norm = this.normalizePath(f.path);
      this.filePathMap.set(norm, f);
    }

    this.extractPathAliases();
  }

  normalizePath(p) {
    if (!p) return '';
    return p.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+/g, '/');
  }

  /**
   * Extract path aliases from tsconfig.json or jsconfig.json
   */
  extractPathAliases() {
    const configFiles = this.files.filter(f => 
      ['tsconfig.json', 'jsconfig.json', 'tsconfig.base.json'].includes(path.basename(f.path).toLowerCase())
    );

    for (const cf of configFiles) {
      if (!cf.content) continue;
      try {
        // Strip trailing commas/comments if any
        const cleaned = cf.content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1').replace(/,\s*([\]}])/g, '$1');
        const parsed = JSON.parse(cleaned);
        const compilerOptions = parsed.compilerOptions || {};
        const baseUrl = compilerOptions.baseUrl || '.';
        const paths = compilerOptions.paths || {};

        for (const [aliasPattern, targetList] of Object.entries(paths)) {
          if (Array.isArray(targetList) && targetList.length > 0) {
            const aliasPrefix = aliasPattern.replace(/\*$/, '');
            const targetPrefix = targetList[0].replace(/\*$/, '');
            const resolvedTarget = path.join(path.dirname(cf.path), baseUrl, targetPrefix);
            this.pathAliases.push({
              prefix: aliasPrefix,
              target: this.normalizePath(resolvedTarget)
            });
          }
        }
      } catch {
        // Ignore json parse error in malformed user tsconfig
      }
    }

    // Default alias convention if not specified: @/ -> src/
    if (this.pathAliases.length === 0) {
      const hasSrcDir = this.files.some(f => f.path.startsWith('src/'));
      if (hasSrcDir) {
        this.pathAliases.push({ prefix: '@/', target: 'src/' });
        this.pathAliases.push({ prefix: '~/', target: 'src/' });
      }
    }
  }

  /**
   * Resolve an import declaration to a target repository file
   * @param {Object} params
   * @param {string} params.sourceFilePath - File containing the import
   * @param {string} params.rawImportPath - The raw string in import statement
   * @param {string} params.language - Language of the source file
   * @returns {Object} { resolved: boolean, targetFile: Object|null, isExternal: boolean, rawPath: string }
   */
  resolveImport({ sourceFilePath, rawImportPath, language = 'JavaScript' }) {
    if (!rawImportPath || typeof rawImportPath !== 'string') {
      return { resolved: false, targetFile: null, isExternal: false, rawPath: rawImportPath };
    }

    const trimmed = rawImportPath.trim();
    const isRelative = trimmed.startsWith('./') || trimmed.startsWith('../');
    const matchingAlias = this.pathAliases.find(a => trimmed.startsWith(a.prefix));

    // 1. Resolve relative JS/TS or Python imports
    if (isRelative) {
      const sourceDir = path.dirname(sourceFilePath);
      const targetCandidate = path.join(sourceDir, trimmed);
      const targetFile = this.findMatchingFile(targetCandidate, language);
      if (targetFile) {
        return { resolved: true, targetFile, isExternal: false, rawPath: trimmed };
      }
      return { resolved: false, targetFile: null, isExternal: false, rawPath: trimmed };
    }

    // 2. Resolve alias imports (@/components/Button)
    if (matchingAlias) {
      const relativeToAlias = trimmed.slice(matchingAlias.prefix.length);
      const targetCandidate = path.join(matchingAlias.target, relativeToAlias);
      const targetFile = this.findMatchingFile(targetCandidate, language);
      if (targetFile) {
        return { resolved: true, targetFile, isExternal: false, rawPath: trimmed };
      }
      return { resolved: false, targetFile: null, isExternal: false, rawPath: trimmed };
    }

    // 3. Resolve Python module paths: from app.services.user import UserService -> app/services/user.py
    if (language === 'Python' || (sourceFilePath && sourceFilePath.endsWith('.py'))) {
      const pyCandidate = trimmed.replace(/\./g, '/');
      const targetFile = this.findMatchingFile(pyCandidate, 'Python');
      if (targetFile) {
        return { resolved: true, targetFile, isExternal: false, rawPath: trimmed };
      }
    }

    // 4. External packages (e.g. react, express, lodash, os, fastapi, torch)
    return {
      resolved: false,
      targetFile: null,
      isExternal: true,
      rawPath: trimmed
    };
  }

  /**
   * Search for a file path trying extensions and index variations
   * @param {string} candidatePath
   * @param {string} language
   * @returns {Object|null}
   */
  findMatchingFile(candidatePath, language) {
    const norm = this.normalizePath(candidatePath);

    // Direct match
    if (this.filePathMap.has(norm)) {
      return this.filePathMap.get(norm);
    }

    const extensions = [
      '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
      '.py', '.go', '.rs', '.java', '.json'
    ];

    // Try adding extension
    for (const ext of extensions) {
      const withExt = `${norm}${ext}`;
      if (this.filePathMap.has(withExt)) {
        return this.filePathMap.get(withExt);
      }
    }

    // Try index files
    const indexFiles = [
      `${norm}/index.ts`,
      `${norm}/index.tsx`,
      `${norm}/index.js`,
      `${norm}/index.jsx`,
      `${norm}/__init__.py`
    ];

    for (const idx of indexFiles) {
      if (this.filePathMap.has(idx)) {
        return this.filePathMap.get(idx);
      }
    }

    return null;
  }
}
