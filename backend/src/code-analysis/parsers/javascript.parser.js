import { TypeScriptParser } from './typescript.parser.js';

export class JavaScriptParser extends TypeScriptParser {
  supports(language, extension) {
    const ext = (extension || '').toLowerCase();
    const lang = (language || '').toLowerCase();
    return (
      ext === '.js' ||
      ext === '.jsx' ||
      ext === '.mjs' ||
      ext === '.cjs' ||
      lang.includes('javascript')
    );
  }

  async parse({ file, content, allFiles = [] }) {
    const result = await super.parse({
      file: {
        ...file,
        language: file.language || (file.extension === '.jsx' ? 'JavaScript React' : 'JavaScript')
      },
      content,
      allFiles
    });
    return result;
  }
}
