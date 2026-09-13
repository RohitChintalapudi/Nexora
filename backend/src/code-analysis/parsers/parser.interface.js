/**
 * Abstract Base Parser Interface for Codebase Intelligence
 * Every language parser implements this contract.
 */
export class BaseCodeParser {
  /**
   * Check if this parser supports the given language or file extension
   * @param {string} language - Detected language name
   * @param {string} extension - File extension (e.g. '.ts', '.py')
   * @returns {boolean}
   */
  supports(language, extension) {
    throw new Error('Method "supports" must be implemented.');
  }

  /**
   * Parse a repository source file into normalized deterministic facts
   * @param {Object} params
   * @param {Object} params.file - RepositoryFile record { id, path, name, extension, language }
   * @param {string} params.content - Raw text content of the file
   * @param {Array<Object>} [params.allFiles] - All repository files (for alias/relative resolution)
   * @returns {Promise<Object>} Normalized ParsedFile { symbols, imports, exports, routes, extends, implements, status, error }
   */
  async parse({ file, content, allFiles = [] }) {
    throw new Error('Method "parse" must be implemented.');
  }
}
