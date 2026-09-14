import { GroqProvider } from './groq.provider.js';
import { MockAIProvider } from './mock.provider.js';

export class AIProviderFactory {
  constructor() {
    this.cachedProvider = null;
  }

  /**
   * Get the active AI provider (Groq or Mock fallback if no API key)
   * @param {string} [preferredType] - 'groq' | 'mock'
   * @returns {import('./ai-provider.interface.js').BaseAIProvider}
   */
  getProvider(preferredType = null) {
    if (this.cachedProvider && !preferredType) {
      return this.cachedProvider;
    }

    const type = preferredType || (process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : 'mock')).toLowerCase();

    if (type === 'groq' && process.env.GROQ_API_KEY) {
      this.cachedProvider = new GroqProvider();
    } else {
      if (type === 'groq' && !process.env.GROQ_API_KEY) {
        console.warn('⚠️ [AIProviderFactory] GROQ_API_KEY is not set. Falling back to deterministic MockAIProvider.');
      }
      this.cachedProvider = new MockAIProvider();
    }

    return this.cachedProvider;
  }
}

export const aiProviderFactory = new AIProviderFactory();
export function getAIProvider(preferredType = null) {
  return aiProviderFactory.getProvider(preferredType);
}
export default aiProviderFactory;
