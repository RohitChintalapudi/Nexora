import { StateGraph, START, END } from '@langchain/langgraph';
import { AnalysisStateAnnotation } from './analysis.state.js';
import {
  loadMetadataNode,
  retrieveContextNode,
  analyzeTechnologiesNode,
  analyzeArchitectureNode,
  analyzeModulesNode,
  analyzeFlowNode,
  generateSummaryNode,
  persistAnalysisNode
} from './nodes/index.js';

/**
 * Concurrent execution node that executes Technologies, Architecture, Modules, and Application Flow
 * simultaneously using Promise.all, reducing LLM wall-clock latency by ~75%.
 */
async function parallelDeepAnalysisNode(state) {
  console.log(`⚡ [LangGraph:parallelAnalysis] Executing 4 AI analysis nodes concurrently in parallel...`);

  const { jobId } = state;
  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'ANALYZING_TECHNOLOGIES'
      });
    } catch {
      // Non-fatal
    }
  }

  // Execute all 4 independent reasoning nodes simultaneously
  const [techResult, archResult, modulesResult, flowResult] = await Promise.all([
    analyzeTechnologiesNode(state).catch(err => ({
      technologies: null,
      errors: [`analyzeTechnologies: ${err.message}`]
    })),
    analyzeArchitectureNode(state).catch(err => ({
      architecture: null,
      errors: [`analyzeArchitecture: ${err.message}`]
    })),
    analyzeModulesNode(state).catch(err => ({
      modules: null,
      errors: [`analyzeModules: ${err.message}`]
    })),
    analyzeFlowNode(state).catch(err => ({
      applicationFlow: null,
      errors: [`analyzeFlow: ${err.message}`]
    }))
  ]);

  const allErrors = [
    ...(state.errors || []),
    ...(techResult.errors || []),
    ...(archResult.errors || []),
    ...(modulesResult.errors || []),
    ...(flowResult.errors || [])
  ];

  return {
    technologies: techResult.technologies,
    architecture: archResult.architecture,
    modules: modulesResult.modules,
    applicationFlow: flowResult.applicationFlow,
    errors: allErrors
  };
}

/**
 * Build and compile the optimized NEXORA LangGraph Codebase Analysis Workflow
 */
export function buildAnalysisGraph() {
  const workflow = new StateGraph(AnalysisStateAnnotation)
    .addNode('loadMetadata', loadMetadataNode)
    .addNode('retrieveContext', retrieveContextNode)
    .addNode('parallelDeepAnalysis', parallelDeepAnalysisNode)
    .addNode('generateSummary', generateSummaryNode)
    .addNode('persistAnalysis', persistAnalysisNode)
    .addEdge(START, 'loadMetadata')
    .addEdge('loadMetadata', 'retrieveContext')
    .addEdge('retrieveContext', 'parallelDeepAnalysis')
    .addEdge('parallelDeepAnalysis', 'generateSummary')
    .addEdge('generateSummary', 'persistAnalysis')
    .addEdge('persistAnalysis', END);

  return workflow.compile();
}

export const analysisGraph = buildAnalysisGraph();

/**
 * Execute the LangGraph analysis engine with progress notifications
 * @param {Object} params
 * @param {number|string} params.repositoryId
 * @param {number|string} params.userId
 * @param {number|string} [params.jobId]
 * @param {string} [params.commitSha]
 * @param {Function} [params.onProgress] - Optional callback (stage, progressPercentage, message)
 * @returns {Promise<Object>} Final state with persistedRecord
 */
export async function runRepositoryAnalysis({
  repositoryId,
  userId,
  jobId = null,
  commitSha = null,
  onProgress = null
}) {
  const notify = async (stage, pct, msg) => {
    if (typeof onProgress === 'function') {
      try {
        await onProgress(stage, pct, msg);
      } catch (e) {
        console.warn('⚠️ [runRepositoryAnalysis] onProgress callback error:', e.message);
      }
    }
  };

  const startTime = Date.now();
  console.log(`🚀 [runRepositoryAnalysis] Starting accelerated AI analysis workflow for repo #${repositoryId} (Job #${jobId || 'N/A'})`);

  await notify('LOADING_CODEBASE_CONTEXT', 10, 'Loading deterministic codebase facts and AST metadata...');

  const initialState = {
    repositoryId,
    userId,
    jobId,
    commitSha,
    repository: null,
    repositoryMetadata: null,
    codebaseFacts: null,
    retrievedContext: null,
    technologies: null,
    architecture: null,
    modules: null,
    applicationFlow: null,
    summary: null,
    persistedRecord: null,
    errors: []
  };

  try {
    const finalState = await analysisGraph.invoke(initialState);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⚡ [runRepositoryAnalysis] Completed accelerated analysis for repo #${repositoryId} in ${durationSec}s`);

    await notify('COMPLETED', 100, `Repository analysis completed in ${durationSec}s`);

    return finalState;
  } catch (err) {
    console.error(`❌ [runRepositoryAnalysis] Graph execution failed for repo #${repositoryId}:`, err);
    throw err;
  }
}
