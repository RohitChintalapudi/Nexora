import Groq from 'groq-sdk';
import { BaseAIProvider } from './ai-provider.interface.js';

export class GroqProvider extends BaseAIProvider {
  constructor(apiKey = null, model = null) {
    super();
    this.apiKey = apiKey || process.env.GROQ_API_KEY;
    this.modelName = model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    this.defaultTemperature = parseFloat(process.env.GROQ_TEMPERATURE || '0.1');
    this.defaultMaxTokens = parseInt(process.env.GROQ_MAX_TOKENS || '1536', 10);
    this.client = null;

    if (this.apiKey) {
      this.client = new Groq({ apiKey: this.apiKey });
    }
  }

  getClient() {
    if (!this.client) {
      if (!this.apiKey && !process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured in backend/.env.');
      }
      this.apiKey = this.apiKey || process.env.GROQ_API_KEY;
      this.client = new Groq({ apiKey: this.apiKey });
    }
    return this.client;
  }

  getModelName() {
    return this.modelName;
  }

  /**
   * Execute structured inference with Groq and return parsed JSON
   * @param {Object} params
   * @param {string} params.prompt
   * @param {string} [params.systemPrompt]
   * @param {number} [params.temperature]
   * @param {number} [params.maxTokens]
   * @returns {Promise<Object>}
   */
  async generateStructured({
    prompt,
    systemPrompt = 'You are an expert software architecture analyst. Provide strictly valid JSON output based solely on the provided codebase facts and source evidence. Do not hallucinate or invent unproven services, databases, or components.',
    temperature = this.defaultTemperature,
    maxTokens = this.defaultMaxTokens
  }) {
    const client = this.getClient();

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: this.modelName,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' }
        });

        const rawContent = response.choices?.[0]?.message?.content;
        if (!rawContent) {
          throw new Error('Groq returned empty response content.');
        }

        const parsed = this.parseAndRepairJson(rawContent);
        return parsed;

      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [GroqProvider] Attempt ${attempt} failed: ${err.message}`);

        // Rate limits or transient 5xx errors -> exponential backoff
        if (attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw new Error(`Groq structured generation failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Execute chat / conversational completion with Groq and return markdown text response
   * @param {Object} params
   * @param {Array<{role: string, content: string}>} params.messages - Conversation messages
   * @param {string} [params.systemPrompt] - System instructions
   * @param {number} [params.temperature] - Sampling temperature
   * @param {number} [params.maxTokens] - Max tokens
   * @returns {Promise<string>}
   */
  async generateChat({
    messages = [],
    systemPrompt = 'You are NEXORA AI, an expert codebase intelligence assistant. Answer questions accurately based strictly on the provided repository facts, symbols, code chunks, and architecture. Cite exact file paths whenever referencing code.',
    temperature = 0.2,
    maxTokens = 2048
  }) {
    const client = this.getClient();

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: this.modelName,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens
        });

        const rawContent = response.choices?.[0]?.message?.content;
        if (!rawContent) {
          throw new Error('Groq returned empty chat content.');
        }

        return rawContent.trim();
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [GroqProvider:generateChat] Attempt ${attempt} failed: ${err.message}`);

        if (attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw new Error(`Groq chat completion failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Robust JSON parser with Markdown codeblock stripping and sanitization
   */
  parseAndRepairJson(rawText) {
    if (typeof rawText !== 'string') {
      throw new Error('Response content is not a string.');
    }

    let cleaned = rawText.trim();

    // Strip markdown codeblock backticks if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      return JSON.parse(cleaned);
    } catch (e1) {
      // Attempt bounded heuristic repair for common trailing commas or bracket balance
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          // Ignore secondary failure
        }
      }
      throw new Error(`Failed to parse Groq response as valid JSON: ${e1.message}`);
    }
  }
}

export const groqProvider = new GroqProvider();
export default GroqProvider;
