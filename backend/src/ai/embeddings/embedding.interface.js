/**
 * Abstract Base Embedding Provider Interface
 * All embedding providers (Transformers, OpenAI, Gemini, etc.) implement this contract.
 */
export class BaseEmbeddingProvider {
  /**
   * Generate vector embeddings for a list of document chunks
   * @param {string[]} texts - Array of chunk text strings
   * @returns {Promise<number[][]>} Array of embedding vector arrays
   */
  async embedDocuments(texts) {
    throw new Error('Method "embedDocuments" must be implemented.');
  }

  /**
   * Generate vector embedding for a search query
   * @param {string} text - Query text string
   * @returns {Promise<number[]>} Embedding vector array
   */
  async embedQuery(text) {
    throw new Error('Method "embedQuery" must be implemented.');
  }

  /**
   * Get vector dimension produced by this provider
   * @returns {number}
   */
  getDimension() {
    throw new Error('Method "getDimension" must be implemented.');
  }

  /**
   * Get name of the underlying model
   * @returns {string}
   */
  getModelName() {
    throw new Error('Method "getModelName" must be implemented.');
  }
}
