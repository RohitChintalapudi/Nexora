import { TransformersEmbeddingProvider } from './transformers.provider.js';
import { OpenAIEmbeddingProvider } from './openai.provider.js';

class EmbeddingProviderFactory {
  constructor() {
    this.cachedProvider = null;
  }

  getProvider() {
    if (this.cachedProvider) return this.cachedProvider;

    const providerType = (process.env.EMBEDDING_PROVIDER || 'transformers').toLowerCase();

    if (providerType === 'openai') {
      this.cachedProvider = new OpenAIEmbeddingProvider();
    } else {
      this.cachedProvider = new TransformersEmbeddingProvider();
    }

    return this.cachedProvider;
  }
}

export { EmbeddingProviderFactory };
export const embeddingProviderFactory = new EmbeddingProviderFactory();
