import { RepositoryModel } from '../../models/repositoryModel.js';
import { CodeChunkModel } from '../../models/codeChunkModel.js';
import { QueryEmbedder } from './query-embedder.js';
import { Reranker } from './reranker.js';
import { RAGDefaults } from './types.js';

export class Retriever {
  /**
   * Perform repository-scoped retrieval with authorization, vector search, and metadata filtering
   * @param {Object} params
   * @param {number|string} params.repositoryId - Target repository ID
   * @param {number|string} params.userId - Authenticated user ID
   * @param {string} params.query - Search query
   * @param {number} [params.topK] - Number of chunks to retrieve
   * @param {number} [params.minSimilarity] - Cosine similarity threshold
   * @param {Object} [params.filters] - Metadata filters (language, chunkType, filePath, fileId)
   * @param {boolean} [params.includeNeighbors=false] - Whether to fetch adjacent chunks
   * @param {number} [params.maxNeighbors=1] - Max neighbors per chunk
   * @returns {Promise<{ repository: Object, rawCount: number, results: Array<Object> }>}
   */
  static async retrieve({
    repositoryId,
    userId,
    query,
    topK = RAGDefaults.TOP_K,
    minSimilarity = RAGDefaults.MIN_SIMILARITY,
    filters = {},
    includeNeighbors = false,
    maxNeighbors = RAGDefaults.MAX_NEIGHBORS
  }) {
    if (!repositoryId || !userId) {
      throw new Error('Repository ID and User ID are required for retrieval.');
    }

    // 1. Strict Multi-Tenant Authorization Check
    const repository = await RepositoryModel.findByIdAndUserId(repositoryId, userId);
    if (!repository) {
      throw new Error('Repository not found or access denied.');
    }

    // 2. Query Preprocessing & Vector Embedding
    const { cleanQuery, embedding } = await QueryEmbedder.embedQuery(query);

    // 3. PostgreSQL + pgvector Scoped Vector Search
    // Retrieve 2x topK candidate pool for deduplication and reranking
    const candidateLimit = Math.max(topK * 2, 16);
    const rawChunks = await CodeChunkModel.searchSimilar({
      repositoryId,
      userId,
      queryEmbedding: embedding,
      limit: candidateLimit,
      minSimilarity,
      filters
    });

    const normalizedChunks = rawChunks.map((row) => ({
      chunkId: row.id,
      repositoryId: row.repository_id,
      fileId: row.file_id,
      symbolId: row.symbol_id,
      chunkIndex: row.chunk_index,
      content: row.content,
      contentHash: row.content_hash,
      chunkType: row.chunk_type,
      language: row.language,
      filePath: row.file_path,
      startLine: row.start_line,
      endLine: row.end_line,
      score: parseFloat(Number(row.similarity).toFixed(4)),
      isNeighbor: false,
      metadata: row.metadata || {}
    }));

    // 4. Deduplicate and Rank Top-K Chunks
    const rankedChunks = Reranker.process(normalizedChunks, {
      topK,
      minSimilarity
    });

    // 5. Optional Bounded Neighboring Context Expansion
    let finalResults = rankedChunks;
    if (includeNeighbors && rankedChunks.length > 0) {
      finalResults = await this.expandNeighboringContext({
        repositoryId,
        userId,
        chunks: rankedChunks,
        maxNeighbors
      });
    }

    return {
      repository,
      cleanQuery,
      rawCount: normalizedChunks.length,
      results: finalResults
    };
  }

  /**
   * Fetch contiguous neighboring chunks from the same file without blowing up context
   * @param {Object} params
   * @param {number|string} params.repositoryId
   * @param {number|string} params.userId
   * @param {Array<Object>} params.chunks
   * @param {number} params.maxNeighbors
   * @returns {Promise<Array<Object>>}
   */
  static async expandNeighboringContext({ repositoryId, userId, chunks, maxNeighbors = 1 }) {
    const enriched = [];
    const seenChunkIds = new Set(chunks.map((c) => c.chunkId));

    for (const chunk of chunks) {
      enriched.push(chunk);

      if (typeof chunk.chunkIndex !== 'number' || !chunk.fileId) {
        continue;
      }

      // Collect neighbor chunk indices (chunk_index - 1, chunk_index + 1)
      const neighborIndices = [];
      for (let offset = 1; offset <= maxNeighbors; offset++) {
        if (chunk.chunkIndex - offset >= 0) neighborIndices.push(chunk.chunkIndex - offset);
        neighborIndices.push(chunk.chunkIndex + offset);
      }

      try {
        const neighbors = await CodeChunkModel.fetchNeighborChunks({
          repositoryId,
          userId,
          fileId: chunk.fileId,
          chunkIndices: neighborIndices
        });

        for (const n of neighbors) {
          if (!seenChunkIds.has(n.id)) {
            seenChunkIds.add(n.id);
            enriched.push({
              chunkId: n.id,
              repositoryId: n.repository_id,
              fileId: n.file_id,
              symbolId: n.symbol_id,
              chunkIndex: n.chunk_index,
              content: n.content,
              contentHash: n.content_hash,
              chunkType: n.chunk_type,
              language: n.language,
              filePath: n.file_path,
              startLine: n.start_line,
              endLine: n.end_line,
              score: chunk.score, // Inherit parent chunk's score
              isNeighbor: true,
              metadata: {
                ...(n.metadata || {}),
                neighborOfChunkId: chunk.chunkId
              }
            });
          }
        }
      } catch (err) {
        console.warn(`⚠️ [Retriever] Could not fetch neighbors for chunk #${chunk.chunkId}:`, err.message);
      }
    }

    return enriched;
  }
}

export const retriever = Retriever;
export default Retriever;
