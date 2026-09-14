import { RepositoryModel } from '../../../models/repositoryModel.js';
import { ProjectMetadataModel } from '../../../models/projectMetadataModel.js';
import { SymbolModel } from '../../../models/symbolModel.js';
import { RouteModel } from '../../../models/routeModel.js';
import { RelationshipModel } from '../../../models/relationshipModel.js';
import { RepositoryFileModel } from '../../../models/repositoryFileModel.js';

/**
 * Node 1: Load Repository Metadata & Deterministic M6 Codebase Intelligence
 */
export async function loadMetadataNode(state) {
  const { repositoryId, userId, jobId } = state;
  console.log(`📊 [LangGraph:loadMetadata] Loading deterministic codebase facts for repo #${repositoryId}`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'LOADING_CODEBASE_CONTEXT' });
    } catch (e) {
      // Non-fatal
    }
  }

  const repository = await RepositoryModel.findByIdAndUserId(repositoryId, userId);
  if (!repository) {
    throw new Error(`Repository #${repositoryId} not found or access denied for user #${userId}.`);
  }

  const [metadata, symbols, routes, relationships, files] = await Promise.all([
    ProjectMetadataModel.findByRepositoryId(repositoryId, userId),
    SymbolModel.findByRepositoryId(repositoryId, userId),
    RouteModel.findByRepositoryId(repositoryId, userId),
    RelationshipModel.findByRepositoryId(repositoryId, userId),
    RepositoryFileModel.findByRepositoryId(repositoryId, userId)
  ]);

  const fileIdMap = new Map((files || []).map(f => [f.id, f.path]));

  const codebaseFacts = {
    frameworks: metadata?.frameworks || [],
    languages: metadata?.languages || {},
    packageManager: metadata?.package_manager || 'npm',
    runtime: metadata?.runtime || 'Node.js',
    dependencies: metadata?.dependencies || {},
    entryPoints: metadata?.entry_points || [],
    databaseIndicators: metadata?.database_indicators || [],
    architecturalRoles: metadata?.architectural_roles || [],
    symbols: (symbols || []).map(s => ({
      name: s.name,
      type: s.type,
      language: s.language,
      isExported: s.is_exported,
      file: fileIdMap.get(s.file_id) || s.file_id
    })),
    routes: (routes || []).map(r => ({
      method: r.method,
      path: r.path,
      handler: r.handler,
      framework: r.framework,
      file: fileIdMap.get(r.file_id) || undefined
    })),
    relationships: (relationships || []).map(rel => ({
      from: fileIdMap.get(rel.source_file_id) || `File #${rel.source_file_id}`,
      to: fileIdMap.get(rel.target_file_id) || `File #${rel.target_file_id}`,
      type: rel.relationship_type,
      metadata: rel.metadata
    })),
    files: (files || []).map(f => ({
      id: f.id,
      path: f.path,
      language: f.language,
      isBinary: f.is_binary,
      isIgnored: f.is_ignored
    }))
  };

  return {
    repository,
    repositoryMetadata: codebaseFacts,
    codebaseFacts
  };
}
