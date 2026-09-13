import { TypeScriptParser } from './typescript.parser.js';
import { JavaScriptParser } from './javascript.parser.js';
import { PythonParser } from './python.parser.js';
import { GenericCodeParser } from './generic.parser.js';

export class ParserRegistry {
  constructor() {
    this.parsers = [
      new TypeScriptParser(),
      new JavaScriptParser(),
      new PythonParser()
    ];
    this.fallbackParser = new GenericCodeParser();
  }

  /**
   * Get the best matching parser for a file
   * @param {Object} file - RepositoryFile record
   * @returns {BaseCodeParser}
   */
  getParserForFile(file) {
    const language = file.language || '';
    const extension = file.extension || '';

    for (const parser of this.parsers) {
      if (parser.supports(language, extension)) {
        return parser;
      }
    }

    return this.fallbackParser;
  }
}

export const parserRegistry = new ParserRegistry();
