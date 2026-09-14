import { parserRegistry } from '../parsers/parser.registry.js';
import { ImportResolver } from '../imports/import-resolver.js';
import { RouteDetector } from '../routes/route-detector.js';
import { ProjectMetadataExtractor } from '../metadata/project-metadata.js';
import { ArchitecturalClassifier } from '../roles/architectural-classifier.js';
import { RelationshipBuilder } from '../relationships/relationship-builder.js';
import { SymbolModel } from '../../models/symbolModel.js';
import { RelationshipModel } from '../../models/relationshipModel.js';
import { RouteModel } from '../../models/routeModel.js';
import { ProjectMetadataModel } from '../../models/projectMetadataModel.js';
import { RepositoryFileModel } from '../../models/repositoryFileModel.js';

export class CodebaseIntelligenceService {
  /**
   * Run the deterministic M6 Codebase Intelligence extraction and persistence
   * @param {Object} params
   * @param {number|string} params.repositoryId
   * @param {number|string} params.userId
   * @param {Array<Object>} [params.files] - Ingested files (if already loaded in memory, else fetched from DB)
   * @param {Function} [params.onStageChange] - Callback to report stage progress
   * @returns {Promise<Object>} Summary of extracted intelligence
   */
  static async analyzeRepository({ repositoryId, userId, files = null, onStageChange = () => {} }) {
    console.log(`🧠 [CodebaseIntelligence] Starting intelligence extraction for repo #${repositoryId}, user #${userId}`);

    // 1. Load repository files from database if not passed or if content missing
    let repoFiles = files;
    if (!repoFiles || repoFiles.some(f => !f.isIgnored && !f.isBinary && f.content === undefined)) {
      repoFiles = await RepositoryFileModel.findByRepositoryId(repositoryId, userId, { includeContent: true });
    }

    const sourceFiles = repoFiles.filter(f => !f.isIgnored && !f.isBinary && f.content);
    console.log(`📄 [CodebaseIntelligence] ${sourceFiles.length} source files ready for parsing (out of ${repoFiles.length} total files)`);

    // 2. Stage: PARSING_FILES
    await onStageChange('PARSING_FILES');
    const parsedFilesMap = new Map();
    const allSymbols = [];
    const allRoutes = [];
    let parseErrorsCount = 0;

    // Parse with bounded concurrency (25 files in parallel)
    const CONCURRENCY = 25;
    for (let i = 0; i < sourceFiles.length; i += CONCURRENCY) {
      const chunk = sourceFiles.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async (file) => {
          try {
            const parser = parserRegistry.getParserForFile(file);
            const parsed = await parser.parse({
              file,
              content: file.content,
              allFiles: repoFiles
            });

            parsedFilesMap.set(file.id, parsed);

            if (parsed.status === 'PARSING_FAILED') {
              parseErrorsCount++;
              console.warn(`⚠️ [CodebaseIntelligence] Parsing failed for ${file.path}: ${parsed.error}`);
            }

            if (parsed.symbols && parsed.symbols.length > 0) {
              allSymbols.push(...parsed.symbols);
            }

            if (parsed.routes && parsed.routes.length > 0) {
              for (const r of parsed.routes) {
                allRoutes.push({
                  fileId: file.id,
                  method: r.method,
                  path: r.path,
                  handler: r.handler,
                  framework: r.framework,
                  lineStart: r.lineStart,
                  lineEnd: r.lineEnd
                });
              }
            }
          } catch (err) {
            parseErrorsCount++;
            console.warn(`⚠️ [CodebaseIntelligence] Unexpected exception parsing ${file.path}:`, err.message);
          }
        })
      );
    }

    console.log(`🔍 [CodebaseIntelligence] Parsed ${sourceFiles.length} files. Symbols extracted: ${allSymbols.length}. Parse failures: ${parseErrorsCount}`);

    // 3. Stage: EXTRACTING_SYMBOLS
    await onStageChange('EXTRACTING_SYMBOLS');

    // 4. Stage: EXTRACTING_IMPORTS & Import Resolution
    await onStageChange('EXTRACTING_IMPORTS');
    const importResolver = new ImportResolver(repoFiles);

    // 5. Stage: EXTRACTING_EXPORTS
    await onStageChange('EXTRACTING_EXPORTS');

    // 6. Stage: DETECTING_ROUTES
    await onStageChange('DETECTING_ROUTES');
    const conventionRoutes = RouteDetector.detectConventionRoutes(repoFiles, parsedFilesMap);
    allRoutes.push(...conventionRoutes);
    console.log(`🌐 [CodebaseIntelligence] Total routes detected: ${allRoutes.length}`);

    // 7. Stage: BUILDING_RELATIONSHIPS
    await onStageChange('BUILDING_RELATIONSHIPS');
    const relationships = RelationshipBuilder.build({
      repositoryFiles: repoFiles,
      parsedFilesMap,
      importResolver
    });
    console.log(`🔗 [CodebaseIntelligence] Total relationships built: ${relationships.length}`);

    // 8. Stage: EXTRACTING_PROJECT_METADATA & Architectural Roles
    await onStageChange('EXTRACTING_PROJECT_METADATA');
    const projectMetadata = ProjectMetadataExtractor.extract(repoFiles);
    const architecturalRoles = ArchitecturalClassifier.classify(repoFiles, parsedFilesMap);
    console.log(`🏷️ [CodebaseIntelligence] Classified ${architecturalRoles.length} file architectural roles. Frameworks detected:`, projectMetadata.frameworks.map(f => f.name));

    // 9. Persist deterministic intelligence model to PostgreSQL
    console.log(`💾 [CodebaseIntelligence] Persisting intelligence model for repo #${repositoryId}`);

    // Clean old data for idempotency
    await Promise.all([
      SymbolModel.deleteByRepositoryId(repositoryId, userId),
      RelationshipModel.deleteByRepositoryId(repositoryId, userId),
      RouteModel.deleteByRepositoryId(repositoryId, userId),
      ProjectMetadataModel.deleteByRepositoryId(repositoryId, userId)
    ]);

    // Batch Insert new intelligence records
    const [insertedSymbols, insertedRelationships, insertedRoutes] = await Promise.all([
      SymbolModel.batchInsert(repositoryId, userId, allSymbols),
      RelationshipModel.batchInsert(repositoryId, userId, relationships),
      RouteModel.batchInsert(repositoryId, userId, allRoutes),
      ProjectMetadataModel.upsert({
        repositoryId,
        userId,
        frameworks: projectMetadata.frameworks,
        languages: projectMetadata.languages,
        packageManager: projectMetadata.packageManager,
        runtime: projectMetadata.runtime,
        dependencies: projectMetadata.dependencies,
        scripts: projectMetadata.scripts,
        entryPoints: projectMetadata.entryPoints,
        databaseIndicators: projectMetadata.databaseIndicators,
        architecturalRoles
      })
    ]);

    console.log(`✨ [CodebaseIntelligence] Intelligence persistence complete: ${insertedSymbols} symbols, ${insertedRelationships} relationships, ${insertedRoutes} routes.`);

    return {
      symbolsCount: insertedSymbols,
      relationshipsCount: insertedRelationships,
      routesCount: insertedRoutes,
      frameworksCount: projectMetadata.frameworks.length,
      parseErrorsCount
    };
  }
}
