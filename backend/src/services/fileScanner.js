import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { INGESTION_CONFIG } from '../config/ingestionConfig.js';

// Language extension mapping table
const LANGUAGE_EXTENSIONS = {
  // TypeScript & JavaScript
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript React',
  '.mts': 'TypeScript',
  '.cts': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript React',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  
  // Web Core
  '.html': 'HTML',
  '.htm': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'Sass',
  '.less': 'Less',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  
  // Backend & Systems
  '.py': 'Python',
  '.java': 'Java',
  '.go': 'Go',
  '.rs': 'Rust',
  '.cpp': 'C++',
  '.cc': 'C++',
  '.cxx': 'C++',
  '.c': 'C',
  '.h': 'C/C++ Header',
  '.hpp': 'C++ Header',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  '.scala': 'Scala',
  '.swift': 'Swift',
  '.dart': 'Dart',
  '.ex': 'Elixir',
  '.exs': 'Elixir',
  '.erl': 'Erlang',
  '.lua': 'Lua',
  '.pl': 'Perl',
  '.pm': 'Perl',
  '.r': 'R',
  
  // Config & Data
  '.json': 'JSON',
  '.json5': 'JSON5',
  '.jsonc': 'JSON with Comments',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.xml': 'XML',
  '.graphql': 'GraphQL',
  '.gql': 'GraphQL',
  '.proto': 'Protocol Buffers',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.zsh': 'Shell',
  '.bat': 'Batch',
  '.ps1': 'PowerShell',
  '.md': 'Markdown',
  '.mdx': 'MDX',
  '.txt': 'Plain Text',
  '.env': 'Configuration',
  '.dockerignore': 'Configuration',
  '.gitignore': 'Configuration'
};

const FILENAME_LANGUAGE_MAP = {
  'dockerfile': 'Dockerfile',
  'containerfile': 'Dockerfile',
  'makefile': 'Makefile',
  'gemfile': 'Ruby',
  'rakefile': 'Ruby',
  'vagrantfile': 'Ruby',
  'cmakelists.txt': 'CMake',
  '.gitignore': 'Git Configuration',
  '.npmrc': 'npm Configuration',
  '.env.example': 'Configuration Example'
};

export class FileScanner {
  /**
   * Determine programming or markup language from file extension and filename
   * @param {string} filePath
   * @returns {string|null}
   */
  static detectLanguage(filePath) {
    const filename = path.basename(filePath).toLowerCase();
    if (FILENAME_LANGUAGE_MAP[filename]) {
      return FILENAME_LANGUAGE_MAP[filename];
    }

    const ext = path.extname(filePath).toLowerCase();
    return LANGUAGE_EXTENSIONS[ext] || null;
  }

  /**
   * Inspect file buffer to detect binary content (checking for null bytes)
   * @param {string} fullPath
   * @returns {boolean}
   */
  static isBinaryContent(fullPath) {
    try {
      const ext = path.extname(fullPath).toLowerCase();
      if (INGESTION_CONFIG.BINARY_EXTENSIONS.has(ext)) {
        return true;
      }

      // Read first 8KB to inspect for null bytes
      const fd = fs.openSync(fullPath, 'r');
      const buffer = Buffer.alloc(8192);
      const bytesRead = fs.readSync(fd, buffer, 0, 8192, 0);
      fs.closeSync(fd);

      for (let i = 0; i < bytesRead; i++) {
        if (buffer[i] === 0) {
          return true; // Null byte found -> binary
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if filename indicates a minified or generated bundle
   * @param {string} filePath
   * @returns {boolean}
   */
  static isGeneratedFile(filePath) {
    const lower = filePath.toLowerCase();
    for (const ext of INGESTION_CONFIG.GENERATED_EXTENSIONS) {
      if (lower.endsWith(ext)) return true;
    }
    return false;
  }

  /**
   * Check if a file contains sensitive keys/secrets
   * @param {string} filePath
   * @returns {boolean}
   */
  static isSensitiveFile(filePath) {
    const filename = path.basename(filePath);
    return INGESTION_CONFIG.SENSITIVE_PATTERNS.some(regex => regex.test(filename) || regex.test(filePath));
  }

  /**
   * Recursively scan an extracted repository workspace
   * @param {string} rootDir - Absolute path to extracted repository root
   * @returns {Promise<{ files: Array, stats: Object }>}
   */
  static async scanWorkspace(rootDir) {
    const canonicalRoot = path.resolve(rootDir);
    const ig = ignore();

    // Load .gitignore if present in the repository root
    const gitignorePath = path.join(canonicalRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      try {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        ig.add(gitignoreContent);
      } catch (err) {
        console.warn('⚠️ Could not parse .gitignore file:', err.message);
      }
    }

    const candidateFiles = [];
    let totalFilesCount = 0;
    let totalWorkspaceSizeBytes = 0;
    let cumulativeSourceSizeBytes = 0;

    /**
     * Recursive directory walker with symlink and path traversal protection
     */
    async function walk(currentDir) {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const entryFullPath = path.join(currentDir, entry.name);
        const resolvedPath = path.resolve(entryFullPath);

        // Security: Prevent symlinks or crafted archives from escaping root
        if (!resolvedPath.startsWith(canonicalRoot)) {
          console.warn(`⚠️ Path traversal attempt blocked: ${entryFullPath}`);
          continue;
        }

        // Relative POSIX path from repository root
        const relativePath = path.relative(canonicalRoot, resolvedPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          // Check if directory is in always-ignored list
          if (INGESTION_CONFIG.IGNORED_DIRECTORIES.has(entry.name)) {
            continue;
          }

          // Check if directory is ignored by .gitignore
          if (ig.ignores(`${relativePath}/`) || ig.ignores(relativePath)) {
            continue;
          }

          await walk(entryFullPath);
        } else if (entry.isFile()) {
          // Skip files ignored by .gitignore
          if (ig.ignores(relativePath)) {
            continue;
          }

          totalFilesCount++;

          if (totalFilesCount > INGESTION_CONFIG.MAX_REPOSITORY_FILES) {
            throw new Error(
              `Repository exceeds safety limit of ${INGESTION_CONFIG.MAX_REPOSITORY_FILES} files. Ingestion stopped for stability.`
            );
          }

          let fileStat;
          try {
            fileStat = await fs.promises.stat(entryFullPath);
          } catch {
            continue; // Skip inaccessible files
          }

          const fileSize = fileStat.size;
          totalWorkspaceSizeBytes += fileSize;

          if (totalWorkspaceSizeBytes > INGESTION_CONFIG.MAX_REPOSITORY_SIZE_BYTES) {
            throw new Error(
              `Repository exceeds maximum size limit of ${INGESTION_CONFIG.MAX_REPOSITORY_SIZE_MB}MB. Ingestion stopped for stability.`
            );
          }

          const filename = entry.name;
          const extension = path.extname(filename).toLowerCase();
          const language = FileScanner.detectLanguage(relativePath);
          const isBinary = FileScanner.isBinaryContent(entryFullPath);
          const isGenerated = FileScanner.isGeneratedFile(relativePath);
          const isLockFile = INGESTION_CONFIG.LOCK_FILES.has(filename.toLowerCase());
          const isIgnoredByGit = ig.ignores(relativePath);
          const isOversized = fileSize > INGESTION_CONFIG.MAX_FILE_SIZE_BYTES;
          const isSensitive = FileScanner.isSensitiveFile(relativePath);

          // Determine if file should be ignored from source analysis
          const isIgnored = isBinary || isGenerated || isLockFile || isIgnoredByGit || isOversized;

          let content = null;

          // Only read text content for non-ignored, non-binary source files within limits
          if (!isIgnored && !isBinary && fileSize <= INGESTION_CONFIG.MAX_FILE_SIZE_BYTES) {
            if (isSensitive) {
              content = '[REDACTED_SENSITIVE_CONFIGURATION]';
            } else if (cumulativeSourceSizeBytes + fileSize <= INGESTION_CONFIG.MAX_TOTAL_SOURCE_SIZE_BYTES) {
              try {
                content = await fs.promises.readFile(entryFullPath, 'utf8');
                cumulativeSourceSizeBytes += fileSize;
              } catch {
                content = null;
              }
            }
          }

          candidateFiles.push({
            path: relativePath,
            name: filename,
            extension,
            language,
            sizeBytes: fileSize,
            isBinary,
            isGenerated,
            isIgnored,
            content
          });
        }
      }
    }

    await walk(canonicalRoot);

    return {
      files: candidateFiles,
      stats: {
        totalFilesCount,
        sourceFilesCount: candidateFiles.filter(f => !f.isIgnored && !f.isBinary).length,
        ignoredFilesCount: candidateFiles.filter(f => f.isIgnored).length,
        binaryFilesCount: candidateFiles.filter(f => f.isBinary).length,
        totalSizeBytes: totalWorkspaceSizeBytes,
        totalSourceSizeBytes: cumulativeSourceSizeBytes
      }
    };
  }
}
