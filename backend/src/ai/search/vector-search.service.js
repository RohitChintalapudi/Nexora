import { EmbeddingService } from '../embeddings/embedding.service.js';
import { CodeChunkModel } from '../../models/codeChunkModel.js';
import { RepositoryModel } from '../../models/repositoryModel.js';

export class VectorSearchService {
  /**
   * Perform a semantic vector similarity search over code chunks strictly isolated to a repository and user
   * @param {Object} params
   * @param {number|string} params.repositoryId - Target repository ID
   * @param {number|string} params.userId - Authenticated user ID (strictly enforced)
   * @param {string} params.query - Natural language or code search query
   * @param {number} [params.limit=10] - Maximum chunks to return
   * @param {number} [params.minSimilarity=0.0] - Minimum cosine similarity threshold (0.0 to 1.0)
   * @returns {Promise<Array<Object>>} Ranked list of matching chunks with similarity score
   */
  static async search({
    repositoryId,
    userId,
    query,
    limit = 10,
    minSimilarity = 0.0
  }) {
    if (!repositoryId || !userId) {
      throw new Error('Repository ID and User ID are required for vector search.');
    }

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return [];
    }

    // 1. Verify user owns the target repository
    const repository = await RepositoryModel.findByIdAndUserId(repositoryId, userId);
    if (!repository) {
      throw new Error('Repository not found or access denied.');
    }

    // 2. Generate vector embedding for search query
    const queryEmbedding = await EmbeddingService.generateQueryEmbedding(query.trim());

    // 3. Query PostgreSQL with pgvector cosine distance
    const results = await CodeChunkModel.searchSimilar({
      repositoryId,
      userId,
      queryEmbedding,
      limit,
      minSimilarity
    });

    return results.map((row) => ({
      id: row.id,
      fileId: row.file_id,
      symbolId: row.symbol_id,
      chunkIndex: row.chunk_index,
      content: row.content,
      chunkType: row.chunk_type,
      language: row.language,
      filePath: row.file_path,
      startLine: row.start_line,
      endLine: row.end_line,
      similarity: parseFloat(Number(row.similarity).toFixed(4)),
      metadata: row.metadata || {}
    }));
  }

  /**
   * Alias for search
   */
  static async searchSimilar(params) {
    return this.search({
      ...params,
      query: params.query || params.queryText
    });
  }
}

export { VectorSearchService as vectorSearchService };
export default VectorSearchService;
