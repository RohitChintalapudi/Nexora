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
 * Build and compile the NEXORA LangGraph Codebase Analysis Workflow
 */
export function buildAnalysisGraph() {
  const workflow = new StateGraph(AnalysisStateAnnotation)
    .addNode('loadMetadata', loadMetadataNode)
    .addNode('retrieveContext', retrieveContextNode)
    .addNode('analyzeTechnologies', analyzeTechnologiesNode)
    .addNode('analyzeArchitecture', analyzeArchitectureNode)
    .addNode('analyzeModules', analyzeModulesNode)
    .addNode('analyzeFlow', analyzeFlowNode)
    .addNode('generateSummary', generateSummaryNode)
    .addNode('persistAnalysis', persistAnalysisNode)
    .addEdge(START, 'loadMetadata')
    .addEdge('loadMetadata', 'retrieveContext')
    .addEdge('retrieveContext', 'analyzeTechnologies')
    .addEdge('analyzeTechnologies', 'analyzeArchitecture')
    .addEdge('analyzeArchitecture', 'analyzeModules')
    .addEdge('analyzeModules', 'analyzeFlow')
    .addEdge('analyzeFlow', 'generateSummary')
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
  console.log(`🚀 [runRepositoryAnalysis] Starting AI analysis workflow for repo #${repositoryId} (Job #${jobId || 'N/A'})`);

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
    // Run the graph
    const finalState = await analysisGraph.invoke(initialState);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [runRepositoryAnalysis] Completed analysis for repo #${repositoryId} in ${durationSec}s`);

    await notify('COMPLETED', 100, `Repository analysis completed in ${durationSec}s`);

    return finalState;
  } catch (err) {
    console.error(`❌ [runRepositoryAnalysis] Graph execution failed for repo #${repositoryId}:`, err);
    throw err;
  }
}
