import { RAGService } from '../../rag/rag.service.js';

/**
 * Node 2: Target-specific RAG Context Retrieval
 * Retrieves relevant source code chunks for technologies, architecture, modules, and application flow.
 */
export async function retrieveContextNode(state) {
  const { repositoryId, userId, jobId } = state;
  console.log(`🔍 [LangGraph:retrieveContext] Executing multi-targeted RAG queries for repo #${repositoryId}`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'RETRIEVING_CONTEXT' });
    } catch (e) {
      // Non-fatal
    }
  }

  try {
    const [techRAG, archRAG, modulesRAG, flowRAG] = await Promise.all([
      RAGService.retrieveContext({
        repositoryId,
        userId,
        query: 'package dependencies frameworks database client build tools configuration setup',
        topK: 4,
        maxContextTokens: 800
      }),
      RAGService.retrieveContext({
        repositoryId,
        userId,
        query: 'main server entry point application structure routing layers controller database models architecture pattern',
        topK: 5,
        maxContextTokens: 1200
      }),
      RAGService.retrieveContext({
        repositoryId,
        userId,
        query: 'modules components services handlers repositories utilities api routes controllers schema',
        topK: 5,
        maxContextTokens: 1200
      }),
      RAGService.retrieveContext({
        repositoryId,
        userId,
        query: 'request flow data lifecycle user authentication api execution flow database queries processing pipelines',
        topK: 5,
        maxContextTokens: 1200
      })
    ]);

    const retrievedContext = {
      technologyContext: techRAG.context || '',
      architectureContext: archRAG.context || '',
      modulesContext: modulesRAG.context || '',
      flowContext: flowRAG.context || '',
      ragStats: {
        technologyTokens: techRAG.stats?.approxTokens || 0,
        architectureTokens: archRAG.stats?.approxTokens || 0,
        modulesTokens: modulesRAG.stats?.approxTokens || 0,
        flowTokens: flowRAG.stats?.approxTokens || 0
      }
    };

    return {
      retrievedContext
    };
  } catch (err) {
    console.warn(`⚠️ [LangGraph:retrieveContext] RAG retrieval encountered warning: ${err.message}. Proceeding with empty context.`);
    return {
      retrievedContext: {
        technologyContext: '',
        architectureContext: '',
        modulesContext: '',
        flowContext: '',
        ragStats: {}
      }
    };
  }
}
