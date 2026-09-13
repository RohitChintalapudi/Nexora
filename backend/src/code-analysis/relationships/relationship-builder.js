export class RelationshipBuilder {
  /**
   * Build normalized deterministic relationships between repository files
   * @param {Object} params
   * @param {Array<Object>} params.repositoryFiles
   * @param {Map<number, Object>} params.parsedFilesMap
   * @param {ImportResolver} params.importResolver
   * @returns {Array<Object>} List of relationship records
   */
  static build({ repositoryFiles = [], parsedFilesMap = new Map(), importResolver }) {
    const relationships = [];
    const relKeySet = new Set();

    const addRel = (rel) => {
      const key = `${rel.sourceFileId}:${rel.targetFileId || 'null'}:${rel.relationshipType}:${rel.metadata?.rawPath || ''}`;
      if (!relKeySet.has(key)) {
        relKeySet.add(key);
        relationships.push(rel);
      }
    };

    // Build symbol lookup map: symbol name -> array of { fileId, symbol }
    const symbolMap = new Map();
    for (const [fileId, parsed] of parsedFilesMap.entries()) {
      for (const sym of parsed.symbols || []) {
        if (!symbolMap.has(sym.name)) {
          symbolMap.set(sym.name, []);
        }
        symbolMap.get(sym.name).push({ fileId, symbol: sym });
      }
    }

    for (const file of repositoryFiles) {
      const parsed = parsedFilesMap.get(file.id);
      if (!parsed) continue;

      // 1. IMPORTS Relationships
      for (const imp of parsed.imports || []) {
        const resolved = importResolver.resolveImport({
          sourceFilePath: file.path,
          rawImportPath: imp.rawPath,
          language: file.language
        });

        addRel({
          sourceFileId: file.id,
          targetFileId: resolved.resolved && resolved.targetFile ? resolved.targetFile.id : null,
          relationshipType: 'IMPORTS',
          metadata: {
            rawPath: imp.rawPath,
            isExternal: resolved.isExternal,
            resolved: resolved.resolved,
            specifiers: imp.specifiers,
            lineStart: imp.lineStart
          }
        });
      }

      // 2. EXTENDS Relationships
      for (const ext of parsed.extendsList || []) {
        // Try to locate target file defining superClassName
        const candidates = symbolMap.get(ext.superClassName) || [];
        const targetCandidate = candidates.find(c => c.fileId !== file.id);

        addRel({
          sourceFileId: file.id,
          targetFileId: targetCandidate ? targetCandidate.fileId : null,
          relationshipType: 'EXTENDS',
          metadata: {
            className: ext.className,
            superClassName: ext.superClassName,
            lineStart: ext.lineStart
          }
        });
      }

      // 3. IMPLEMENTS Relationships
      for (const impl of parsed.implementsList || []) {
        const candidates = symbolMap.get(impl.interfaceName) || [];
        const targetCandidate = candidates.find(c => c.fileId !== file.id);

        addRel({
          sourceFileId: file.id,
          targetFileId: targetCandidate ? targetCandidate.fileId : null,
          relationshipType: 'IMPLEMENTS',
          metadata: {
            className: impl.className,
            interfaceName: impl.interfaceName,
            lineStart: impl.lineStart
          }
        });
      }

      // 4. ROUTES_TO Relationships (e.g. Route -> Handler/Controller)
      for (const route of parsed.routes || []) {
        if (route.handler && route.handler !== 'anonymousHandler') {
          // Check if handler is an imported symbol
          const importedMatch = parsed.imports?.find(i => 
            i.specifiers?.some(s => s.localName === route.handler || s.name === route.handler)
          );

          let targetFileId = null;
          if (importedMatch) {
            const resolved = importResolver.resolveImport({
              sourceFilePath: file.path,
              rawImportPath: importedMatch.rawPath,
              language: file.language
            });
            if (resolved.resolved && resolved.targetFile) {
              targetFileId = resolved.targetFile.id;
            }
          }

          addRel({
            sourceFileId: file.id,
            targetFileId,
            relationshipType: 'ROUTES_TO',
            metadata: {
              method: route.method,
              path: route.path,
              handler: route.handler,
              framework: route.framework,
              lineStart: route.lineStart
            }
          });
        }
      }
    }

    return relationships;
  }
}
