import { EmbeddingService } from '../embeddings/embedding.service.js';

export class QueryEmbedder {
  /**
   * Preprocess query and generate a dense vector embedding
   * @param {string} rawQuery - The natural language or code search query
   * @returns {Promise<{ cleanQuery: string, embedding: number[] }>}
   */
  static async embedQuery(rawQuery) {
    if (typeof rawQuery !== 'string' || !rawQuery.trim()) {
      throw new Error('Search query must be a non-empty string.');
    }

    const cleanQuery = rawQuery.trim();

    // Prevent oversized query inputs from overwhelming embedding model
    const boundedQuery = cleanQuery.length > 2000 
      ? cleanQuery.substring(0, 2000) 
      : cleanQuery;

    try {
      const embedding = await EmbeddingService.generateQueryEmbedding(boundedQuery);

      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Embedding provider returned an empty vector.');
      }

      return {
        cleanQuery: boundedQuery,
        embedding
      };
    } catch (err) {
      console.error('❌ [QueryEmbedder] Failed to generate query embedding:', err.message);
      throw new Error(`Query embedding generation failed: ${err.message}`);
    }
  }
}

export const queryEmbedder = QueryEmbedder;
export default QueryEmbedder;
