import { RepositoryAnalysisModel } from '../../../models/repositoryAnalysisModel.js';

/**
 * Node 8: Persist Structured Repository Analysis to PostgreSQL
 */
export async function persistAnalysisNode(state) {
  const {
    repositoryId,
    userId,
    jobId,
    commitSha,
    summary,
    technologies,
    architecture,
    modules,
    applicationFlow,
    codebaseFacts
  } = state;

  console.log(`💾 [LangGraph:persistAnalysis] Persisting structured analysis record for repo #${repositoryId}`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'PERSISTING_ANALYSIS' });
    } catch (e) {
      // Non-fatal
    }
  }

  try {
    const rawDeps = codebaseFacts?.dependencies || {};
    const formattedDeps = Array.isArray(rawDeps)
      ? rawDeps
      : Object.entries(rawDeps).map(([name, version]) => ({ name, version: String(version) }));

    const entryPoints = (summary?.entryPoints && summary.entryPoints.length > 0)
      ? summary.entryPoints
      : (codebaseFacts?.entryPoints || []).map(ep => ({ path: ep, type: 'Server' }));

    const apiStructure = (codebaseFacts?.routes || []).map(r => ({
      method: r.method,
      path: r.path,
      handler: r.handler || null,
      framework: r.framework || null
    }));

    const persistedRecord = await RepositoryAnalysisModel.upsert({
      repositoryId,
      userId,
      jobId: jobId || null,
      commitSha: commitSha || null,
      overview: summary?.overview || 'No overview generated.',
      technologyStack: technologies?.technologyStack || [],
      architecture: architecture || {},
      modules: modules || [],
      applicationFlow: applicationFlow || [],
      entryPoints,
      importantFiles: summary?.importantFiles || [],
      dependencies: formattedDeps,
      database: technologies?.database || {},
      apiStructure,
      developerQuickStart: summary?.developerQuickStart || [],
      uncertainties: summary?.uncertainties || []
    });

    return {
      persistedRecord
    };
  } catch (err) {
    console.error(`❌ [LangGraph:persistAnalysis] Error persisting analysis to DB:`, err);
    throw err;
  }
}
