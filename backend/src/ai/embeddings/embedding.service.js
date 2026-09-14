import { embeddingProviderFactory } from './embedding.provider.factory.js';

export class EmbeddingService {
  /**
   * Generate vector embeddings for an array of code chunks in batches
   * @param {Array<Object>} chunks - List of chunk objects with .content property
   * @param {Object} [options]
   * @param {number} [options.batchSize=50] - Number of chunks per batch
   * @param {Function} [options.onProgress] - Progress callback (processedCount, totalCount)
   * @returns {Promise<Array<Object>>} Chunks enriched with .embedding vector
   */
  static async generateChunkEmbeddings(chunks = [], options = {}) {
    if (!chunks || chunks.length === 0) return [];

    const provider = embeddingProviderFactory.getProvider();
    const batchSize = options.batchSize || parseInt(process.env.EMBEDDING_BATCH_SIZE || '50', 10);
    const expectedDimension = provider.getDimension();

    console.log(`⚡ [EmbeddingService] Generating embeddings for ${chunks.length} chunks (Batch size: ${batchSize}, Provider: ${provider.getModelName()})...`);

    const enrichedChunks = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map(c => c.content);

      // Execute with retry & exponential backoff
      const embeddings = await this.executeWithRetry(async () => {
        return await provider.embedDocuments(texts);
      });

      for (let j = 0; j < batch.length; j++) {
        const vector = embeddings[j];
        if (!vector || vector.length !== expectedDimension) {
          throw new Error(
            `Embedding generation error: expected dimension ${expectedDimension}, received ${vector?.length || 0}`
          );
        }

        enrichedChunks.push({
          ...batch[j],
          embedding: vector
        });
      }

      if (typeof options.onProgress === 'function') {
        options.onProgress(enrichedChunks.length, chunks.length);
      }
    }

    console.log(`✅ [EmbeddingService] Successfully generated embeddings for ${enrichedChunks.length} chunks.`);
    return enrichedChunks;
  }

  /**
   * Generate a vector embedding for a single search query
   * @param {string} query
   * @returns {Promise<number[]>}
   */
  static async generateQueryEmbedding(query) {
    const provider = embeddingProviderFactory.getProvider();
    return await this.executeWithRetry(async () => {
      return await provider.embedQuery(query);
    });
  }

  /**
   * Generate raw embeddings for an array of text strings
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  static async generateEmbeddings(texts = []) {
    if (!texts || texts.length === 0) return [];
    const provider = embeddingProviderFactory.getProvider();
    return await this.executeWithRetry(async () => {
      return await provider.embedDocuments(texts);
    });
  }

  /**
   * Bounded retry helper with exponential backoff for rate limits / network hiccups
   */
  static async executeWithRetry(fn, maxRetries = 3, baseDelayMs = 500) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error(`❌ [EmbeddingService] Failed after ${maxRetries} attempts:`, err.message);
          throw err;
        }
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`⚠️ [EmbeddingService] Attempt ${attempt} failed (${err.message}). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
}

export { EmbeddingService as embeddingService };
export default EmbeddingService;
