import { Retriever } from './retriever.js';
import { ContextBuilder } from './context-builder.js';
import { RAGDefaults } from './types.js';

export class RAGService {
  /**
   * Retrieve and assemble LLM-ready context for an analysis question or task
   * @param {Object} params
   * @param {number|string} params.repositoryId - Target repository ID (required)
   * @param {number|string} params.userId - Authenticated user ID (required)
   * @param {string} params.query - Analysis query (required)
   * @param {number} [params.topK=8] - Number of top chunks to retrieve
   * @param {number} [params.minSimilarity=0.25] - Minimum cosine similarity threshold
   * @param {Object} [params.filters={}] - Optional metadata filters (language, chunkType, filePath)
   * @param {boolean} [params.includeNeighbors=false] - Whether to expand surrounding chunk context
   * @param {number} [params.maxContextTokens=4000] - Token budget for assembled context
   * @returns {Promise<import('./types.js').RAGContextResult>}
   */
  static async retrieveContext({
    repositoryId,
    userId,
    query,
    topK = RAGDefaults.TOP_K,
    minSimilarity = RAGDefaults.MIN_SIMILARITY,
    filters = {},
    includeNeighbors = false,
    maxContextTokens = RAGDefaults.MAX_CONTEXT_TOKENS
  }) {
    const startTime = Date.now();

    if (!repositoryId || !userId) {
      throw new Error('Repository ID and User ID are required for RAG context retrieval.');
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        query: query || '',
        repositoryId,
        repositoryName: '',
        results: [],
        context: '',
        message: 'Search query must be a non-empty string.',
        stats: {
          totalRetrieved: 0,
          finalCount: 0,
          approxTokens: 0,
          latencyMs: 0
        }
      };
    }

    try {
      // 1. Repository-scoped retrieval, vector search, and reranking
      const { repository, cleanQuery, rawCount, results } = await Retriever.retrieve({
        repositoryId,
        userId,
        query,
        topK,
        minSimilarity,
        filters,
        includeNeighbors
      });

      // 2. Handle empty or weak retrieval results gracefully (no hallucinations)
      if (results.length === 0) {
        const latencyMs = Date.now() - startTime;
        console.log(`ℹ️ [RAGService] Repo #${repositoryId}: Query "${cleanQuery.substring(0, 40)}" yielded 0 chunks above threshold ${minSimilarity} (${latencyMs}ms)`);

        return {
          query: cleanQuery,
          repositoryId: repository.id,
          repositoryName: repository.name,
          results: [],
          context: '',
          message: 'No sufficiently relevant repository context was found.',
          stats: {
            totalRetrieved: rawCount,
            finalCount: 0,
            approxTokens: 0,
            latencyMs
          }
        };
      }

      // 3. Assemble bounded markdown context block
      const { context, includedCount, approxTokens } = ContextBuilder.build({
        repository,
        chunks: results,
        maxContextTokens
      });

      const latencyMs = Date.now() - startTime;
      console.log(`🎯 [RAGService] Repo #${repositoryId} (${repository.name}): Retrieved ${results.length} chunks -> Context: ${approxTokens} tokens (${latencyMs}ms)`);

      return {
        query: cleanQuery,
        repositoryId: repository.id,
        repositoryName: repository.name,
        results: results.slice(0, includedCount),
        context,
        stats: {
          totalRetrieved: rawCount,
          finalCount: includedCount,
          approxTokens,
          latencyMs
        }
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      console.error(`❌ [RAGService] RAG retrieval error on repo #${repositoryId}:`, err.message);
      throw err;
    }
  }
}

export const ragService = RAGService;
export default RAGService;
