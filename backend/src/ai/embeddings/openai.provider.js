import { BaseEmbeddingProvider } from './embedding.interface.js';

export class OpenAIEmbeddingProvider extends BaseEmbeddingProvider {
  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.modelName = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.dimension = parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10);
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  async embedDocuments(texts) {
    if (!texts || texts.length === 0) return [];
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in backend/.env.');
    }

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        input: texts
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Embeddings API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.data.map((item) => item.embedding);
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
