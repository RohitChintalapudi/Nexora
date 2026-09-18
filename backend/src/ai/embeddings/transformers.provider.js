import { pipeline } from '@xenova/transformers';
import { BaseEmbeddingProvider } from './embedding.interface.js';

export class TransformersEmbeddingProvider extends BaseEmbeddingProvider {
  constructor(modelName = 'Xenova/all-MiniLM-L6-v2') {
    super();
    this.modelName = process.env.EMBEDDING_MODEL || modelName;
    this.dimension = parseInt(process.env.EMBEDDING_DIMENSIONS || '384', 10);
    this.extractor = null;
    this.initPromise = null;
  }

  async getExtractor() {
    if (this.extractor) return this.extractor;

    if (!this.initPromise) {
      this.initPromise = (async () => {
        console.log(`🤖 [EmbeddingProvider] Loading local embedding model: ${this.modelName}...`);
        this.extractor = await pipeline('feature-extraction', this.modelName, {
          quantized: true
        });
        console.log(`✅ [EmbeddingProvider] Local embedding model loaded (${this.dimension} dimensions).`);
        return this.extractor;
      })();
    }

    return this.initPromise;
  }

  async embedDocuments(texts) {
    if (!texts || texts.length === 0) return [];
    const extractor = await this.getExtractor();

    const embeddings = new Array(texts.length);
    const BATCH_CONCURRENCY = 4;

    for (let i = 0; i < texts.length; i += BATCH_CONCURRENCY) {
      const batchIndices = [];
      const batchPromises = [];

      for (let j = 0; j < BATCH_CONCURRENCY && (i + j) < texts.length; j++) {
        const idx = i + j;
        const cleanText = (texts[idx] || '').trim().substring(0, 1000);
        batchIndices.push(idx);

        if (!cleanText) {
          batchPromises.push(Promise.resolve(new Array(this.dimension).fill(0)));
        } else {
          batchPromises.push(
            extractor(cleanText, { pooling: 'mean', normalize: true })
              .then(output => {
                const vector = Array.from(output.data);
                if (vector.length !== this.dimension) {
                  throw new Error(
                    `Embedding dimension mismatch: expected ${this.dimension}, received ${vector.length}`
                  );
                }
                return vector;
              })
          );
        }
      }

      const results = await Promise.all(batchPromises);
      for (let k = 0; k < results.length; k++) {
        embeddings[batchIndices[k]] = results[k];
      }
    }

    return embeddings;
  }

  async embedQuery(text) {
    const results = await this.embedDocuments([text]);
    return results[0] || new Array(this.dimension).fill(0);
  }

  getDimension() {
    return this.dimension;
  }

  getModelName() {
    return this.modelName;
  }
}
